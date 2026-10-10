// 共用數據層：有 Firebase 設定就用 Firebase 即時同步，冇就用本機 localStorage。
// 兩種模式都係用 path（例如 "trip/kitty/expenses"）讀寫。

const FB_VER = "10.12.2";
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
    onStatus(cb) { cb("local"); return () => {}; },
  };
}

/* ---------- Firebase 模式 ---------- */
function createFirebase(config) {
  const cache = readJSON(CACHE_KEY, {});
  const base = `https://www.gstatic.com/firebasejs/${FB_VER}`;
  const ready = Promise.all([
    import(/* @vite-ignore */ `${base}/firebase-app.js`),
    import(/* @vite-ignore */ `${base}/firebase-database.js`),
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
        off = m.onValue(m.ref(db, path), (snap) => {
          const v = snap.val();
          cache[path] = v;
          writeJSON(CACHE_KEY, cache);
          cb(v);
        });
      }).catch(() => { if (!(path in cache)) cb(null); });
      return () => { dead = true; if (off) off(); };
    },
    set(path, v) { return ready.then(({ db, m }) => m.set(m.ref(db, path), clean(v))); },
    update(map) {
      const c = {};
      Object.entries(map).forEach(([p, v]) => { c[p] = clean(v); });
      return ready.then(({ db, m }) => m.update(m.ref(db), c));
    },
    remove(path) { return ready.then(({ db, m }) => m.remove(m.ref(db, path))); },
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

export function createStore() {
  const cfg = typeof window !== "undefined" ? window.FIREBASE_CONFIG : null;
  if (cfg && cfg.apiKey && cfg.databaseURL && !String(cfg.apiKey).startsWith("PASTE")) return createFirebase(cfg);
  return createLocal();
}
