// 共用數據層：有 Firebase 設定就用 Firebase 即時同步，冇就用本機 localStorage。
// 兩種模式都係用 path（例如 "trip/kitty/expenses"）讀寫。

const FB_VER = "10.12.2";

/* ---------- 私人連結：數據放喺 trips/<key>，key 唔喺 GitHub ---------- */
export const KEY_STORE = "hok-key";
export function currentKey() {
  try {
    const m = window.location.hash.match(/k=([A-Za-z0-9_-]{20,})/);
    if (m) {
      localStorage.setItem(KEY_STORE, m[1]);
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return m[1];
    }
    return localStorage.getItem(KEY_STORE) || "";
  } catch (e) { return ""; }
}
export function newKey() {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 57]).join("");
}
const CACHE_KEY = "hok-cache-v1";
const LOCAL_KEY = "hok-local-tree-v1";

const clean = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
const split = (p) => p.split("/").filter(Boolean);

function getAt(tree, path) {
  let cur = tree;
  for (const k of split(path)) {
    if (cur == null || typeof cur !== "object") return null;
    cur = cur[k];
  }
  return cur === undefined ? null : cur;
}
function setAt(tree, path, value) {
  const keys = split(path);
  if (!keys.length) return value;
  const root = tree && typeof tree === "object" ? tree : {};
  let cur = root;
  keys.slice(0, -1).forEach((k) => {
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  });
  const last = keys[keys.length - 1];
  if (value === null) delete cur[last];
  else cur[last] = value;
  return root;
}

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; } catch (e) { return fb; }
}
function writeJSON(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* ignore */ }
}

/* ---------- 本機模式 ---------- */
function createLocal() {
  let tree = readJSON(LOCAL_KEY, {});
  const subs = new Set();
  const emit = () => { writeJSON(LOCAL_KEY, tree); subs.forEach((s) => s.cb(clean(getAt(tree, s.path)))); };
  return {
    mode: "local",
    subscribe(path, cb) {
      const s = { path, cb };
      subs.add(s);
      setTimeout(() => cb(clean(getAt(tree, path))), 0);
      return () => subs.delete(s);
    },
    set(path, v) { tree = setAt(tree, path, clean(v)); emit(); return Promise.resolve(); },
    update(map) { Object.entries(map).forEach(([p, v]) => { tree = setAt(tree, p, clean(v)); }); emit(); return Promise.resolve(); },
    remove(path) { tree = setAt(tree, path, null); emit(); return Promise.resolve(); },
    rawSet(path, v) { tree = setAt(tree, path, clean(v)); emit(); return Promise.resolve(); },
    once(path) { return Promise.resolve(clean(getAt(tree, path))); },
    onDenied() { return () => {}; },
    base: "trip",
    onStatus(cb) { cb("local"); return () => {}; },
  };
}

/* ---------- Firebase 模式 ---------- */
function createFirebase(config, base) {
  const P = (path) => (path === "trip" || path.startsWith("trip/") ? base + path.slice(4) : path);
  const cacheKey = CACHE_KEY + ":" + base;
  const cache = readJSON(cacheKey, {});
  const deniedSubs = new Set();
  let denied = false;
  const onErr = (err) => { if (String(err && (err.code || err.message)).toLowerCase().includes("permission")) { denied = true; deniedSubs.forEach((f) => f()); } };
  const cdn = `https://www.gstatic.com/firebasejs/${FB_VER}`;
  const ready = Promise.all([
    import(/* @vite-ignore */ `${cdn}/firebase-app.js`),
    import(/* @vite-ignore */ `${cdn}/firebase-database.js`),
  ]).then(([app, dbm]) => {
    const fbApp = app.initializeApp(config);
    return { db: dbm.getDatabase(fbApp), m: dbm };
  });
  let failed = false;
  ready.catch(() => { failed = true; });

  return {
    mode: "firebase",
    subscribe(path, cb) {
      // 先俾上次見過嘅數（冇訊號都睇到），再等 Firebase 即時更新
      if (path in cache) setTimeout(() => cb(cache[path]), 0);
      let off = null;
      let dead = false;
      ready.then(({ db, m }) => {
        if (dead) return;
        off = m.onValue(m.ref(db, P(path)), (snap) => {
          const v = snap.val();
          cache[path] = v;
          writeJSON(cacheKey, cache);
          cb(v);
        }, onErr);
      }).catch(() => { if (!(path in cache)) cb(null); });
      return () => { dead = true; if (off) off(); };
    },
    base,
    set(path, v) { return ready.then(({ db, m }) => m.set(m.ref(db, P(path)), clean(v))).catch(onErr); },
    update(map) {
      const c = {};
      Object.entries(map).forEach(([p, v]) => { c[P(p)] = clean(v); });
      return ready.then(({ db, m }) => m.update(m.ref(db), c)).catch(onErr);
    },
    remove(path) { return ready.then(({ db, m }) => m.remove(m.ref(db, P(path)))).catch(onErr); },
    // 唔經 prefix，用嚟搬去私人路徑
    rawSet(path, v) { return ready.then(({ db, m }) => m.set(m.ref(db, path), clean(v))); },
    once(path) { return ready.then(({ db, m }) => m.get(m.ref(db, P(path))).then((s) => s.val())); },
    onDenied(f) { deniedSubs.add(f); if (denied) f(); return () => deniedSubs.delete(f); },
    onStatus(cb) {
      cb("connecting");
      let off = null;
      ready.then(({ db, m }) => {
        off = m.onValue(m.ref(db, ".info/connected"), (s) => cb(s.val() ? "online" : "offline"));
      }).catch(() => cb(failed ? "error" : "offline"));
      return () => off && off();
    },
  };
}

/* ---------- 私人（東京）行程：用密碼計出嚟嘅路徑，唔喺 code 入面 ---------- */
export const VAULT_STORE = "hok-vault";
const VAULT_SALT = "hok-vault-v1:";
const VAULT_CHECK = "beeb2b3bb2c8b7453a4635f489c70fd4e89803df4fdd64968cc1d55e28fe509c";
async function sha256(txt) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
// 啱密碼就返回私人路徑，唔啱返回 null
export async function vaultPath(code) {
  try {
    if ((await sha256(VAULT_SALT + "check:" + code)) !== VAULT_CHECK) return null;
    return await sha256(VAULT_SALT + "path:" + code);
  } catch (e) { return null; }
}
export function currentVault() {
  try { return sessionStorage.getItem(VAULT_STORE) || ""; } catch (e) { return ""; }
}
export const IS_VAULT = typeof window !== "undefined" && !!currentVault();

export function createStore() {
  const cfg = typeof window !== "undefined" ? window.FIREBASE_CONFIG : null;
  const vault = typeof window !== "undefined" ? currentVault() : "";
  if (vault && cfg && cfg.apiKey) return createFirebase(cfg, `trips/${vault}`);
  const key = typeof window !== "undefined" ? currentKey() : "";
  if (cfg && cfg.apiKey && cfg.databaseURL && !String(cfg.apiKey).startsWith("PASTE")) return createFirebase(cfg, key ? `trips/${key}` : "trip");
  return createLocal();
}
