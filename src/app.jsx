import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TRIP, PEOPLE, GROUPS, FLIGHTS, STAY_NEAR, STAYS_SEED, DAYS, BACKUP, TODO_SEED, EDIT_PIN, PREF, FEAT, GROUP_COLORS, DRIVE, defaultConfig, applyConfig, dayList, fmtT, VAULT_TRIP, VAULT_FLIGHTS, vaultSeed } from "./data.js";
import { HeroArt, DayArt, HouseArt, PurseArt, BagArt, PlaneMini, BookingArt, CarIcon, SCENES, seasonOf } from "./art.jsx";
import { createStore, newKey, KEY_STORE, IS_VAULT, TOKYO_LOCKED, vaultPath, lockTokyo, openTokyo, mainHref, tokyoHref } from "./store.js";
import { LangCtx, useLang, useT, tr, pick, WEEK_EN, EN_DAYS, EN_STOPS, EN_TODO, EN_CAT, withEn } from "./i18n.js";

const store = createStore();
// 私人東京行程：換標題同航班
if (IS_VAULT) {
  Object.assign(TRIP, VAULT_TRIP);
  FLIGHTS.splice(0, FLIGHTS.length, ...VAULT_FLIGHTS);
}
const PIN_OK = "hok-pin-ok";
const SCHEMA_V = 13;

// v7：登別併入 10/14 大圈；10/15 改做札幌 chill day
function loopDay(old) {
  const keep = (re) => asArray(old).find((s) => re.test(s.name || ""));
  const hanamaru = keep(/花丸/) || { name: "根室花丸迴轉壽司", q: "回転寿司 根室花まる JRタワーステラプレイス店", must: true, note: "唔訂得位，現場取票", en: { name: "Nemuro Hanamaru Conveyor Sushi", note: "No bookings — get a ticket on arrival" } };
  const home = keep(/返住宿/) || { name: "返住宿", q: "札幌市豊平区豊平1条7丁目2-7", en: { name: "Back to the apartment" } };
  return [
    { t: "09:50", name: "定山溪（二見吊橋・足湯）", q: "定山渓 二見吊橋", move: { t: "car", min: 50 }, note: "朝早有雨都OK，睇紅葉、浸足湯", en: { name: "Jozankei (Futami Bridge, foot bath)", note: "Fine even in morning rain — leaves and foot bath" } },
    { t: "10:50", name: "中山峠（揚げいも）", q: "道の駅 望羊中山", move: { t: "car", min: 30 }, note: "10分鐘小休", en: { name: "Nakayama Pass (age-imo)", note: "Quick 10-min stop" } },
    { t: "11:40", name: "輕食：Lake Hill Farm", q: "レークヒル・ファーム 洞爺湖", move: { t: "car", min: 45 }, must: true, dish: "牧場 gelato、輕食", note: "山丘上望住洞爺湖同羊蹄山；10月起 9:00–17:00", en: { name: "Light lunch: Lake Hill Farm", dish: "Farm gelato, light food", note: "Hilltop view of Lake Toya & Mt. Yotei; Oct hours 9:00–17:00" } },
    { t: "12:25", name: "洞爺湖サイロ展望台", q: "サイロ展望台 洞爺湖", move: { t: "car", min: 10 }, note: "影相10分鐘", en: { name: "Lake Toya Silo Observatory", note: "10-min photo stop" } },
    { t: "12:50", name: "入油（洞爺湖溫泉）", q: "ENEOS 洞爺湖SS", move: { t: "car", min: 15 }, note: "洞爺湖溫泉有 ENEOS／apollostation", en: { name: "Refuel (Toya Onsen)", note: "ENEOS / apollostation in Toya Onsen" } },
    { t: "13:05", name: "有珠山纜車＋昭和新山", q: "有珠山ロープウェイ", move: { t: "car", min: 10 }, must: true, note: "下晝轉好天；風大或會停", en: { name: "Mt. Usu Ropeway + Showa-Shinzan", note: "Clearing in the afternoon; may stop in strong wind" } },
    { t: "15:20", name: "室蘭 地球岬展望台（經白鳥大橋）", q: "地球岬展望台", move: { t: "car", min: 60 }, must: true, note: "打卡20分鐘；過白鳥大橋都影得", en: { name: "Muroran Chikyu Misaki Lookout (via Hakucho Bridge)", note: "20-min photo stop; the bridge is a sight too" } },
    { t: "16:15", name: "登別地獄谷＋大湯沼", q: "登別地獄谷", move: { t: "car", min: 35 }, must: true, note: "日落前後最靚；17:00 回札幌", en: { name: "Noboribetsu Hell Valley + Oyunuma", note: "Lovely around sunset; head back at 17:00" } },
    { ...hanamaru, t: "19:00", move: { t: "car", min: 80 } },
    { ...home, t: "21:00", move: { t: "car", min: 15 } },
  ];
}
function chillDay(old) {
  const keep = (re) => asArray(old).find((s) => re.test(s.name || ""));
  const toriton = keep(/Toriton|トリトン/i) || { name: "Toriton 迴轉壽司", q: "トリトン 手稲店", must: true, book: true, note: "打電話問7人位", en: { name: "Toriton Conveyor Sushi" } };
  const home = keep(/返住宿/) || { name: "返住宿", q: "札幌市豊平区豊平1条7丁目2-7", en: { name: "Back to the apartment" } };
  return [
    { t: "09:45", name: "ATELIER Morihiko（早餐）", q: "ATELIER Morihiko 札幌", move: { t: "car", min: 15 }, note: "09:30 出發；Morning set 8:00–11:00；店有4個車位", en: { name: "ATELIER Morihiko (breakfast)", note: "Leave 09:30; morning set 8:00–11:00; 4 parking spaces" } },
    { t: "11:00", name: "Costco 札幌倉庫店", q: "コストコ 札幌倉庫店", move: { t: "car", min: 25 }, must: true, note: "免費泊車；要會員卡；留意聽日行李重量", en: { name: "Costco Sapporo", note: "Free parking; membership card needed; mind tomorrow's luggage weight" } },
    { t: "12:00", name: "午餐：札幌鮭ラーメン 麺匠 赤松", q: "札幌鮭ラーメン麺匠 赤松", move: { t: "car", min: 5 }, must: true, dish: "鮭だし醤油／鮭だし味噌", note: "食べログ 3.53；11:30–14:45；只收現金。⚠️ 麺屋ふくじゅ 逢星期四休息", en: { name: "Lunch: Sapporo Salmon Ramen Akamatsu", dish: "Salmon-dashi shoyu / miso", note: "Tabelog 3.53; 11:30–14:45; cash only. ⚠️ Menya Fukuju is closed on Thursdays" } },
    { t: "13:15", name: "三井 Outlet Park 札幌北廣島", q: "三井アウトレットパーク 札幌北広島", move: { t: "car", min: 15 }, must: true, note: "10:00–20:00；Nike、adidas、Under Armour、ASICS、North Face；免費泊車", en: { name: "Mitsui Outlet Park Sapporo Kitahiroshima", note: "10:00–20:00; Nike, adidas, Under Armour, ASICS, North Face; free parking" } },
    { t: "16:30", name: "札幌站 JR Tower／Stellar Place／大丸", q: "札幌ステラプレイス", move: { t: "car", min: 40 }, note: "泊車：Stellar Place 買滿¥2,000 → 北口地下駐車場（2.2m）2小時免費；要封頂 → ヨドバシ NPC24H（2.3m，平日最多¥1,400）", en: { name: "Sapporo Station: JR Tower / Stellar Place / Daimaru", note: "Parking: spend ¥2,000 at Stellar Place → North Exit underground (2.2m) 2h free; for a cap → Yodobashi NPC24H (2.3m, weekday max ¥1,400)" } },
    { t: "17:45", name: "JR Tower 展望室 T38 夜景", q: "JRタワー展望室 T38", move: { t: "walk", min: 5 }, note: "38樓，10:00–22:00，成人 ¥740", en: { name: "JR Tower T38 night view", note: "38F, 10:00–22:00, adult ¥740" } },
    { ...toriton, t: "19:00", move: { t: "car", min: 30 } },
    { ...home, t: "21:00", move: { t: "car", min: 30 } },
  ];
}

// v5：10/12 小樽改為 Plan B（下晝天狗山睇日落）
function otaruPlanB(old) {
  const keep = (re) => asArray(old).find((s) => re.test(s.name || ""));
  const garaku = keep(/GARAKU/i) || { name: "湯咖哩 GARAKU", q: "スープカレー GARAKU 札幌", must: true, book: true, en: { name: "Soup Curry GARAKU" } };
  const espresso = keep(/Espresso/i);
  return [
    ...(espresso ? [espresso] : []),
    { t: "11:00", name: "小樽・堺町通商店街駐車場", q: "小樽 堺町 駐車場 港町7-7", move: { t: "car", min: 40 }, note: "一日最多 ¥1,000，泊一次行晒", en: { name: "Otaru – Sakaimachi parking", note: "Max ¥1,000/day; park once and walk" } },
    { t: "11:10", name: "北一硝子・音樂盒堂本館", q: "小樽オルゴール堂本館", move: { t: "walk", min: 5 }, en: { name: "Kitaichi Glass & Music Box Museum" } },
    { t: "12:00", name: "午餐（海鮮丼／壽司）", q: "小樽 寿司屋通り", move: { t: "walk", min: 5 }, dish: "海膽、蟹", note: "避開冇價錢牌／「時價」嘅蟹，落單前問總數", en: { name: "Lunch (seafood bowl / sushi)", dish: "Uni, crab", note: "Avoid unpriced menus and 'market price' crab — ask the total first" } },
    { t: "13:00", name: "LeTAO 本店＋SNOOPY 茶屋", q: "小樽洋菓子舗ルタオ本店", move: { t: "walk", min: 5 }, must: true, en: { name: "LeTAO Main Store + Snoopy Chaya" } },
    { t: "13:45", name: "小樽運河（淺草橋影相）", q: "浅草橋 小樽運河", move: { t: "walk", min: 10 }, must: true, note: "行一轉約15分鐘就夠", en: { name: "Otaru Canal (photos from Asakusa Bridge)", note: "A 15-minute stroll is enough" } },
    { t: "14:15", name: "自由時間：三角市場／咖啡店", q: "小樽 三角市場", move: { t: "walk", min: 10 }, note: "休息、買手信，16:00 返車", en: { name: "Free time: Sankaku Market / café", note: "Rest, souvenirs; back to the car by 16:00" } },
    { t: "16:20", name: "天狗山纜車・睇日落", q: "小樽天狗山ロープウエイ", move: { t: "car", min: 15 }, must: true, note: "纜車每12分鐘一班；16:40–17:20 睇日落（約17:00）", en: { name: "Tenguyama Ropeway – sunset", note: "Every 12 min; sunset around 17:00" } },
    { ...garaku, t: "18:30", move: { t: "car", min: 50 }, note: "17:30 由天狗山直接出發", en: { ...(garaku.en || {}), name: (garaku.en && garaku.en.name) || "Soup Curry GARAKU", note: "Leave Tenguyama at 17:30" } },
    { t: "20:15", name: "返住宿", q: "札幌市豊平区豊平1条7丁目2-7", move: { t: "car", min: 15 }, en: { name: "Back to the apartment" } },
  ];
}

/* ---------------- 小工具 ---------------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const yen = (n) => "¥" + Math.round(n || 0).toLocaleString("en-US");
const hkd = (n, rate) => "HK$" + Math.round((n || 0) * rate).toLocaleString("en-US");
const toList = (obj) => Object.entries(obj || {}).map(([id, v]) => ({ id, ...v }));
const asArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : v && typeof v === "object" ? Object.values(v).filter(Boolean) : []);
const toMin = (t) => { const [h, m] = String(t || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const fromMin = (n) => { const v = Math.max(0, Math.min(23 * 60 + 55, Math.round(n / 5) * 5)); return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`; };
const sortStops = (arr) => [...arr].sort((a, b) => String(a.t).localeCompare(String(b.t)));

function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
}
function usePersist(key, initial) {
  const [v, setV] = useState(() => load(key, initial));
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* ignore */ } }, [key, v]);
  return [v, setV];
}
function useShared(path) {
  const [v, setV] = useState(undefined);
  useEffect(() => store.subscribe(path, setV), [path]);
  return v;
}

const waUrl = (text) => "https://wa.me/?text=" + encodeURIComponent(text);
const mapsUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const navUrl = (q) => "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + encodeURIComponent(q);

// 而家時間（測試可以用 ?now=2026-10-14T11:30）
function jstNow() {
  try {
    const q = new URLSearchParams(window.location.search).get("now");
    if (q) { const d = new Date(q + "+09:00"); if (!isNaN(d)) return d; }
  } catch (e) { /* ignore */ }
  return new Date();
}
function tripDayIndex(now = jstNow()) {
  const jst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  const ymd = `${jst.getFullYear()}-${String(jst.getMonth() + 1).padStart(2, "0")}-${String(jst.getDate()).padStart(2, "0")}`;
  const diff = Math.round((new Date(ymd + "T00:00:00") - new Date(TRIP.startDate + "T00:00:00")) / 86400000);
  return diff >= 0 && diff < TRIP.nDays ? diff : -1;
}

const MOVE = {
  car: { k: "m_car", bg: "#F2A497" },
  walk: { k: "m_walk", bg: "#B9DAA5" },
  train: { k: "m_train", bg: "#A8D3E6" },
  plane: { k: "m_plane", bg: "#A8D3E6" },
  taxi: { k: "m_taxi", bg: "#F6D27A" },
};
const groupOf = (id) => GROUPS.find((g) => g.id === id);

/* ---------------- 我係邊個（每部手機自己記） ---------------- */
const MeCtx = createContext({ me: "", setMe: () => {}, myG: null });
const useMe = () => useContext(MeCtx);
const groupOfPerson = (name) => GROUPS.find((g) => g.members.includes(name)) || null;

/* ---------------- 人名／分組 ---------------- */
// 舊資料得 who 文字：由入面搵返啲人名
function peopleOf(x) {
  if (!x) return [];
  if (x.people) return asArray(x.people);
  const w = String(x.who || "");
  if (!w) return [];
  if (/全部|All|Everyone/i.test(w)) return [...PEOPLE];
  return PEOPLE.filter((p) => w.includes(p));
}
function whoLabel(lang, people) {
  const set = new Set(people);
  const L = lang === "en";
  const names = PEOPLE.filter((p) => set.has(p));
  if (!names.length) return "";
  if (names.length === PEOPLE.length) return L ? `All ${PEOPLE.length}` : `全部${PEOPLE.length}人`;
  const full = GROUPS.filter((g) => g.members.length && g.members.every((m) => set.has(m)));
  const sep = L ? ", " : "、";
  if (full.length && full.reduce((n, g) => n + g.members.length, 0) === names.length) {
    return `${full.map((g) => pick(lang, g, "name")).join(L ? " + " : "＋")}${L ? " · " : "｜"}${names.join(sep)}`;
  }
  return names.join(sep);
}
const whoText = (lang, x) => (x && x.people ? whoLabel(lang, asArray(x.people)) : pick(lang, x, "who"));
// 揀人：撳組名揀成組，撳名揀個別
function WhoPicker({ value, onChange }) {
  const t = useT();
  const lang = useLang();
  const set = new Set(value || []);
  const emit = (s2) => onChange(PEOPLE.filter((p) => s2.has(p)));
  const all = PEOPLE.length > 0 && PEOPLE.every((p) => set.has(p));
  const togGroup = (g) => {
    const s2 = new Set(set);
    const full = g.members.every((m) => s2.has(m));
    g.members.forEach((m) => (full ? s2.delete(m) : s2.add(m)));
    emit(s2);
  };
  const togPerson = (p) => { const s2 = new Set(set); if (s2.has(p)) s2.delete(p); else s2.add(p); emit(s2); };
  return (
    <div className="who-pick">
      <div className="chips">
        <button type="button" className={"chip small" + (all ? " on" : "")} aria-pressed={all} onClick={() => emit(all ? new Set() : new Set(PEOPLE))}>{t("everyone")}</button>
        {GROUPS.map((g) => {
          const n = g.members.filter((m) => set.has(m)).length;
          const st = n && n === g.members.length ? " on" : n ? " part" : "";
          return (
            <button type="button" key={g.id} className={"chip small grp-chip" + st} style={{ "--accent": g.color }} aria-pressed={!!st} onClick={() => togGroup(g)}>
              <span className="mini-dot" style={{ background: g.color }} />{pick(lang, g, "name")}
            </button>
          );
        })}
      </div>
      <div className="chips">
        {GROUPS.flatMap((g) => g.members.map((p) => (
          <button type="button" key={p} className={"chip small person-chip" + (set.has(p) ? " on" : "")} style={{ "--accent": g.color }} aria-pressed={set.has(p)} onClick={() => togPerson(p)}>{p}</button>
        )))}
      </div>
      <p className="hint">{t("pickWho")}</p>
    </div>
  );
}
// 顏色：預設 6 隻＋自訂
const hslHex = (h, sat, l) => {
  const a = sat * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h / 30) % 12; const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, "0"); };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};
const nthColor = (i, used = []) => GROUP_COLORS.find((c) => !used.includes(c)) || hslHex((i * 137.5) % 360, 0.62, 0.78);
function ColorPick({ value, onChange }) {
  const t = useT();
  const preset = GROUP_COLORS.includes(value);
  return (
    <div className="swatches" role="radiogroup" aria-label={t("color")}>
      {GROUP_COLORS.map((c) => <button key={c} type="button" role="radio" aria-checked={value === c} className={"swatch" + (value === c ? " on" : "")} style={{ background: c }} onClick={() => onChange(c)} aria-label={c} />)}
      <label className={"swatch custom" + (preset ? "" : " on")} style={preset ? null : { background: value }} title={t("customColor")}>
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || "") ? value : "#F2A497"} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={t("customColor")} />
      </label>
    </div>
  );
}

// 今日：而家做緊邊樣、下一站係邊
// gid：知道自己係邊組就只計自己組＋全部人嘅行程
function nowNext(days, now, gid) {
  const di = tripDayIndex(now);
  if (di < 0 || !days[di]) return null;
  const jst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  const m = jst.getHours() * 60 + jst.getMinutes();
  const stops = asArray(days[di].stops).map((s, i) => ({ ...s, _i: i })).filter((s) => !gid || !s.group || s.group.includes(gid)).sort((a, b) => String(a.t).localeCompare(String(b.t)));
  let cur = null, next = null;
  stops.forEach((s) => { if (toMin(s.t) <= m) cur = s; else if (!next) next = s; });
  return { di, m, cur, next, mins: next ? toMin(next.t) - m : 0 };
}
function fmtMins(lang, n) {
  if (n < 60) return lang === "en" ? `${n} min` : `${n} 分鐘`;
  const h = Math.floor(n / 60), r = n % 60;
  return lang === "en" ? `${h}h${r ? " " + r + "m" : ""}` : `${h} 小時${r ? " " + r + " 分" : ""}`;
}

// WhatsApp 分享文字：粗體＋emoji、地址、Google Maps
const SEASON_EMOJI = { spring: "🌸", summer: "☀️", autumn: "🍁", winter: "❄️" };
function stopText(lang, s) {
  const lines = [`📍 *${pick(lang, s, "name")}*`, `🕒 ${fmtT(s.t)}`];
  if (pick(lang, s, "dish")) lines.push(`🍽 ${tr(lang, "mustEat")}${pick(lang, s, "dish")}`);
  if (s.addr) lines.push(`🏠 ${s.addr}`);
  lines.push(`🗺 ${mapsUrl(s.q || s.addr || s.name)}`);
  return lines.join("\n");
}
function dayText(lang, day, idx) {
  const w = lang === "en" ? WEEK_EN[day.w] || day.w : day.w;
  const head = `${SEASON_EMOJI[seasonOf(TRIP.startDate)] || "📅"} *Day ${idx + 1}・${day.d}（${w}）*\n*${pick(lang, day, "title")}*`;
  const intro = pick(lang, day, "intro");
  const stops = sortStops(asArray(day.stops)).map((s) => {
    const g = s.group ? "【" + s.group.split("").map((id) => pick(lang, groupOf(id), "name")).join("、") + "】" : "";
    const lines = [`⏰ *${fmtT(s.t)}*　${g}${pick(lang, s, "name")}${s.must ? " ⭐" : ""}`];
    if (pick(lang, s, "dish")) lines.push(`🍽 ${pick(lang, s, "dish")}`);
    if (s.addr) lines.push(`🏠 ${s.addr}`);
    lines.push(`🗺 ${mapsUrl(s.q || s.addr || s.name)}`);
    return lines.join("\n");
  });
  return [head, ...(intro ? [`_${intro}_`] : []), "━━━━━━━━━━━━", stops.join("\n\n")].join("\n");
}
const weekday = (lang, w) => (lang === "en" ? WEEK_EN[w] || w : w);

/* ---------------- 東京私人行程：建議行程（v101） ---------------- */
const HOTEL_Q = "東京都墨田区太平4-13-4";
function tokyoPlan(days, stays) {
  const map = { "trip/meta/v": 101, "trip/config/features": { kitty: "off", todo: true, stays: true } };
  const s1 = stays && stays.s1;
  if (s1 && !s1.addr) map["trip/stays/s1/addr"] = "〒130-0012 東京都墨田区太平4丁目13-4";
  const W = (t, name, q, move, extra = {}) => ({ t, name, q, ...(move ? { move } : {}), ...extra });
  const d0 = days.findIndex((d) => d.d === "10/16");
  const d1 = days.findIndex((d) => d.d === "10/17");
  const d2 = days.findIndex((d) => d.d === "10/18");
  if (d0 >= 0) {
    const keep = asArray(days[d0].stops).filter((x) => /的士|NH50|抵達羽田/.test(x.name || ""));
    map[`trip/days/${d0}/stops`] = sortStops([...keep,
      W("10:30", "酒店放行李（錦糸町）", HOTEL_Q, { t: "train", min: 60 }, { note: "京急→都營淺草線（部分班次直通）去押上／本所吾妻橋，或者搭的士；最近錦糸町站", en: { name: "Drop bags at hotel (Kinshicho)", note: "Keikyu → Toei Asakusa Line (some trains run through) to Oshiage, or taxi; nearest is Kinshicho Stn" } }),
      W("11:30", "午餐（錦糸町 PARCO／Termina）", "錦糸町パルコ", { t: "walk", min: 10 }, { en: { name: "Lunch (Kinshicho PARCO / Termina)" } }),
      W("13:00", "銀座行街：Uniqlo／GU 旗艦、Dover Street Market、3COINS+plus 西銀座", "ユニクロ 銀座店", { t: "train", min: 20 }, { must: true, note: "3COINS+plus 喺西銀座デパート 2F，11:00–20:00", en: { name: "Ginza: Uniqlo / GU flagships, Dover Street Market, 3COINS+plus Nishi-Ginza", note: "3COINS+plus at Nishi-Ginza Dept. 2F, 11:00–20:00" } }),
      W("18:00", "3COINS+plus アルカキット錦糸町", "アルカキット錦糸町", { t: "train", min: 20 }, { note: "酒店附近，返去順路行（營業時間到時睇）", en: { name: "3COINS+plus Arcakit Kinshicho", note: "Near the hotel — check closing time" } }),
      W("19:00", "晚飯（錦糸町）", HOTEL_Q, { t: "walk", min: 5 }, { en: { name: "Dinner (Kinshicho)" } }),
    ]);
  }
  if (d1 >= 0) {
    map[`trip/days/${d1}/title`] = "Cafe＋3COINS＋波鞋買衫";
    map[`trip/days/${d1}/en`] = { title: "Café + 3COINS + sneakers & clothes", intro: "The Hanzomon Line runs direct from Kinshicho to Kiyosumi-Shirakawa and Omotesando." };
    map[`trip/days/${d1}/intro`] = "半藏門線由錦糸町直通清澄白河同表參道，唔使轉車。";
    map[`trip/days/${d1}/stops`] = [
      W("09:30", "清澄白河 coffee（Blue Bottle 清澄白河旗艦店）", "ブルーボトルコーヒー 清澄白河フラッグシップカフェ", { t: "train", min: 10 }, { note: "半藏門線兩個站；附近仲有好多 roaster", en: { name: "Kiyosumi-Shirakawa coffee (Blue Bottle flagship)", note: "Two stops on the Hanzomon Line; lots of roasters nearby" } }),
      W("11:00", "3COINS 原宿本店", "3COINS 原宿本店", { t: "train", min: 30 }, { must: true, note: "旗艦店，11:00–20:00；有原宿店限定貨；神宮前6-12-22", en: { name: "3COINS Harajuku flagship", note: "Flagship, 11:00–20:00; Harajuku-only items; Jingumae 6-12-22" } }),
      W("11:45", "原宿 Cat Street 波鞋（atmos、Nike 原宿、Onitsuka Tiger）", "キャットストリート 原宿", { t: "walk", min: 5 }, { must: true, note: "週六下晝好多人，早啲行", en: { name: "Harajuku Cat Street sneakers (atmos, Nike Harajuku, Onitsuka Tiger)", note: "Busy on Saturday afternoons — go early" } }),
      W("13:30", "午餐（表參道／原宿）", "表参道", { t: "walk", min: 5 }, { en: { name: "Lunch (Omotesando / Harajuku)" } }),
      W("15:00", "澀谷買衫（PARCO、MIYASHITA PARK）", "渋谷PARCO", { t: "walk", min: 15 }, { en: { name: "Shibuya clothes (PARCO, MIYASHITA PARK)" } }),
      W("18:30", "返錦糸町", HOTEL_Q, { t: "train", min: 30 }, { note: "澀谷搭半藏門線直達", en: { name: "Back to Kinshicho", note: "Hanzomon Line direct from Shibuya" } }),
    ];
  }
  if (d2 >= 0) {
    map[`trip/days/${d2}/title`] = "東京 → 多倫多（AC2）";
    map[`trip/days/${d2}/en`] = { title: "Tokyo → Toronto (AC2)" };
    map[`trip/days/${d2}/intro`] = "AC2 羽田 T3 18:05 → 多倫多 T1 17:00（同日）。15:00 前到機場。";
    map[`trip/days/${d2}/stops`] = [
      W("09:00", "慢慢食早餐／執行李", HOTEL_Q, null, { en: { name: "Slow breakfast / pack" } }),
      W("10:00", "晴空塔 Solamachi 最後買嘢", "東京ソラマチ", { t: "walk", min: 15 }, { en: { name: "Last shopping at Tokyo Skytree Solamachi" } }),
      W("12:30", "午餐（Solamachi）", "東京ソラマチ", { t: "walk", min: 2 }, { en: { name: "Lunch (Solamachi)" } }),
      W("13:45", "酒店攞行李 → 羽田", "羽田空港 第3ターミナル", { t: "train", min: 60 }, { note: "押上／本所吾妻橋搭京急直通，或者的士", en: { name: "Collect bags → Haneda", note: "Keikyu through-train from Oshiage, or taxi" } }),
      W("15:00", "羽田 T3 Check-in（Air Canada）", "羽田空港 第3ターミナル", { t: "walk", min: 5 }, { note: "國際線起飛前3小時到", en: { name: "Haneda T3 check-in (Air Canada)", note: "Arrive 3h before an international flight" } }),
      W("18:05", "AC2 羽田 → 多倫多", "羽田空港 第3ターミナル", { t: "plane", txt: "AC2" }, { must: true, note: "抵達多倫多 T1 當地時間 17:00；最近成日 delay，出發前睇航班狀態", en: { name: "AC2 Haneda → Toronto", note: "Arrives Toronto T1 17:00 local; often delayed lately — check status" } }),
    ];
  }
  return map;
}

/* ---------------- 首次開／升級：寫入預設資料 ---------------- */
function useSeedAndMigrate() {
  const meta = useShared("trip/meta");
  const days = useShared("trip/days");
  const todo = useShared("trip/todo");
  const stays = useShared("trip/stays");
  const kitty = useShared("trip/kitty");
  const done = useRef(false);

  useEffect(() => {
    if (done.current || meta === undefined) return;
    const now = Date.now();

    // 全新數據庫
    if (meta === null && IS_VAULT) {
      done.current = true;
      store.update(vaultSeed(now));
      return;
    }
    if (IS_VAULT) {
      const vv = (meta && meta.v) || 0;
      // v102：東京用城市插圖、唔揸車
      const v102 = { "trip/meta/v": 102, "trip/config/scene": "tokyo", "trip/config/drive": { on: false, cars: [] } };
      if (vv < 101) {
        if (days === undefined || stays === undefined) return;
        done.current = true;
        store.update({ ...tokyoPlan(asArray(days), stays), ...v102 });
      } else if (vv < 102) {
        done.current = true;
        store.update(v102);
      } else done.current = true;
      return;
    }
    if (meta === null) {
      done.current = true;
      const map = { "trip/meta": { seeded: now, v: SCHEMA_V }, "trip/days": withEn(DAYS), "trip/kitty/rate": 0.052, "trip/stays": STAYS_SEED };
      TODO_SEED.forEach((t, i) => { map[`trip/todo/t${i}`] = { text: t.text, en: EN_TODO[t.text] || null, cat: t.cat, done: false, ts: now + i }; });
      store.update(map);
      return;
    }

    // 舊版數據：加英文、加住宿
    if ((meta.v || 0) < SCHEMA_V) {
      if (days === undefined || todo === undefined || stays === undefined || kitty === undefined) return;
      done.current = true;
      const map = { "trip/meta/v": SCHEMA_V };
      const work = asArray(days).map((d) => ({ ...d }));
      if ((meta.v || 0) < 6) {
        // v6：10/13 同 10/14 成日行程對調（逐個欄位寫，避免同後面衝突）
        const a = work.findIndex((d) => d.d === "10/13");
        const b = work.findIndex((d) => d.d === "10/14");
        if (a >= 0 && b >= 0) {
          const A = work[a], B = work[b];
          const pick5 = (x) => ({ title: x.title || "", intro: x.intro || "", en: x.en || null, icon: x.icon || "clock", stops: asArray(x.stops) });
          const ca = pick5(A), cb = pick5(B);
          work[a] = { ...A, ...cb }; work[b] = { ...B, ...ca };
          ["title", "intro", "en", "icon", "stops"].forEach((k) => { map[`trip/days/${a}/${k}`] = cb[k]; map[`trip/days/${b}/${k}`] = ca[k]; });
        }
      }
      if ((meta.v || 0) < 12 && (meta.v || 0) >= 9) {
        // v12：10/15 用 Gavin 定嘅時間表
        const c12 = work.findIndex((d) => d.d === "10/15");
        if (c12 >= 0) map[`trip/days/${c12}/stops`] = chillDay(work[c12].stops);
      }
      if ((meta.v || 0) < 9 && (meta.v || 0) >= 8) {
        const b9 = work.findIndex((d) => d.d === "10/15");
        if (b9 >= 0) {
          map[`trip/days/${b9}/stops`] = chillDay(work[b9].stops);
          map[`trip/days/${b9}/title`] = "Cafe・Costco・Outlet";
          map[`trip/days/${b9}/intro`] = "朝早 cafe → Costco → 北廣島 Outlet → 札幌站／T38 夜景 → Toriton。";
          map[`trip/days/${b9}/en`] = { title: "Café · Costco · Outlet", intro: "Café → Costco → Kitahiroshima outlet → Sapporo Station / T38 night view → Toriton." };
        }
      }
      if ((meta.v || 0) < 8) {
        const arr = work;
        const a = arr.findIndex((d) => d.d === "10/14");
        const b = arr.findIndex((d) => d.d === "10/15");
        if (a >= 0) {
          map[`trip/days/${a}/stops`] = loopDay(arr[a].stops);
          map[`trip/days/${a}/title`] = "定山溪・洞爺湖・室蘭・登別";
          map[`trip/days/${a}/intro`] = "09:00 出發兜一個大圈：定山溪 → 洞爺湖 → 有珠山 → 室蘭地球岬 → 登別 → 札幌（車程約5小時）。朝早有雨，下晝轉好。";
          map[`trip/days/${a}/en`] = { title: "Jozankei · Toya · Muroran · Noboribetsu", intro: "Leave 09:00 for a loop: Jozankei → Lake Toya → Mt. Usu → Chikyu Misaki → Noboribetsu → Sapporo (~5h driving). Rain in the morning, clearing later." };
          map[`trip/days/${a}/icon`] = "lake";
        }
        if (b >= 0) {
          map[`trip/days/${b}/stops`] = chillDay(arr[b].stops);
          map[`trip/days/${b}/title`] = "Cafe・Costco・Outlet";
          map[`trip/days/${b}/intro`] = "朝早 cafe → Costco → 北廣島 Outlet → 札幌站／T38 夜景 → Toriton。";
          map[`trip/days/${b}/en`] = { title: "Café · Costco · Outlet", intro: "Café → Costco → Kitahiroshima outlet → Sapporo Station / T38 night view → Toriton." };
          map[`trip/days/${b}/icon`] = "clock";
        }
      }
      if ((meta.v || 0) < 5) {
        const oi = asArray(days).findIndex((d) => d.d === "10/12");
        if (oi >= 0) {
          map[`trip/days/${oi}/stops`] = otaruPlanB(asArray(days)[oi].stops);
          map[`trip/days/${oi}/intro`] = "11:00 到小樽，下晝天狗山睇日落，17:30 直接返札幌食 GARAKU。";
          map[`trip/days/${oi}/en/intro`] = "Otaru from 11:00, sunset on Tenguyama, then straight back to Sapporo for GARAKU.";
        }
      }
      if ((meta.v || 0) < 3) asArray(days).forEach((d, di) => {
        if (!d.en && EN_DAYS[d.title]) map[`trip/days/${di}/en`] = EN_DAYS[d.title];
        asArray(d.stops).forEach((s, si) => {
          if (!s.en && EN_STOPS[s.name]) map[`trip/days/${di}/stops/${si}/en`] = EN_STOPS[s.name];
        });
      });
      if ((meta.v || 0) < 3) Object.entries(todo || {}).forEach(([id, it]) => { if (!it.en && EN_TODO[it.text]) map[`trip/todo/${id}/en`] = EN_TODO[it.text]; });
      if (!stays) map["trip/stays"] = STAYS_SEED;
      if ((meta.v || 0) < 13) {
        // v13：「附近」變成每間住宿自己嘅資料（可以改）；A組嘅待辦標返 A組
        if (stays && stays.s1 && !stays.s1.near) map["trip/stays/s1/near"] = STAY_NEAR.map((n) => ({ name: n.name, note: n.note || "", q: `${n.name} ${n.addr || ""}`.trim(), ...(n.en ? { en: n.en } : {}) }));
        Object.entries(todo || {}).forEach(([id, it]) => { if (it && !it.for && /^A組/.test(it.text || "")) map[`trip/todo/${id}/for`] = "A"; });
      }
      // 公數袋 v2：舊「每人每輪」轉做「每組夾咗幾多現金」
      if (kitty && !kitty.cash && kitty.rounds) {
        GROUPS.forEach((g) => {
          const sum = Object.values(kitty.rounds).reduce((acc, r) => acc + g.members.filter((m) => r.paid && r.paid[m]).length * (Number(r.amount) || 0), 0);
          if (sum > 0) map[`trip/kitty/cash/old${g.id}`] = { g: g.id, amt: sum, note: "舊紀錄轉入", ts: now };
        });
      }
      store.update(map);
    } else {
      done.current = true;
    }
  }, [meta, days, todo, stays, kitty]);
}

/* ---------------- 頂部固定選單 ---------------- */
const TABS = ["home", "plan", "stay", "money", "todo"];
const GearIcon = () => (<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="3.4" fill="#F6D27A" stroke="#3E3A39" strokeWidth="2.4" /><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1" stroke="#3E3A39" strokeWidth="2.4" strokeLinecap="round" /></svg>);
const STATUS_C = { online: "#6DB35A", connecting: "#F6D27A", offline: "#F2A497", error: "#C4584A", local: "#BDB6B2" };

function TopNav({ tab, setTab, status }) {
  const t = useT();
  return (
    <header className="topnav">
      <nav className="topnav-inner" aria-label="menu" style={{ gridTemplateColumns: `repeat(${visibleTabs().length}, 1fr) 40px` }}>
        {visibleTabs().map((id) => (
          <button key={id} className={"nav-btn" + (tab === id ? " on" : "")} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
            {id === "money" && FEAT.kitty === "log" ? t("moneyLogNav") : t(id)}
          </button>
        ))}
        <button className={"lock-btn gear" + (tab === "settings" ? " on" : "")} onClick={() => setTab("settings")} aria-label={t("settings")} title={t("st_" + status)}>
          <GearIcon />
          <span className="sync-dot" style={{ background: STATUS_C[status] }} />
        </button>
      </nav>
    </header>
  );
}
const visibleTabs = () => TABS.filter((id) => (id === "money" ? FEAT.kitty !== "off" : id === "todo" ? FEAT.todo : id === "stay" ? FEAT.stays : true));
function LockIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d={open ? "M8 11 V7 a4 4 0 0 1 8 -1" : "M8 11 V7 a4 4 0 0 1 8 0 V11"} fill="none" stroke="#3E3A39" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="5" y="11" width="14" height="10" rx="3" fill={open ? "#F6D27A" : "#FFFCF6"} stroke="#3E3A39" strokeWidth="2.6" />
    </svg>
  );
}

/* ---------------- 編輯掣（自畫 SVG） ---------------- */
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
    <path d="M4 20 L5 15.5 L15.5 5 Q17 3.5 18.5 5 L19 5.5 Q20.5 7 19 8.5 L8.5 19 Z" fill="#F6D27A" stroke="#3E3A39" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M13.5 7 L17 10.5" stroke="#3E3A39" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M4 20 L8.5 19 L5 15.5 Z" fill="#F2A497" stroke="#3E3A39" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" fill="#B9DAA5" stroke="#3E3A39" strokeWidth="2.2" />
    <path d="M7.5 12.5 L10.8 15.6 L16.5 9" fill="none" stroke="#3E3A39" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CardIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <rect x="3" y="6" width="18" height="12.5" rx="2.5" fill="#FFFCF6" stroke="#3E3A39" strokeWidth="2" />
    <path d="M3 10 H21" stroke="#3E3A39" strokeWidth="2.6" />
    <path d="M6 15 H10" stroke="#3E3A39" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const TowerIcon = ({ size = 18, ink = "#3E3A39" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M12 2 V5 M12 5 L16.5 21 H7.5 Z" fill="#F2A497" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M9.6 13 H14.4 M10.6 9 H13.4" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
    <rect x="9" y="15.5" width="6" height="2" fill="#FFFCF6" stroke={ink} strokeWidth="1.4" />
  </svg>
);
const Chevron = ({ dir = "down", size = 14 }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} className={"chev-svg " + dir} aria-hidden="true">
    <path d="M3.5 6 L8 10.5 L12.5 6" fill="none" stroke="#3E3A39" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SmallPencil = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 20 L5 15.5 L15.5 5 Q17 3.5 18.5 5 L19 5.5 Q20.5 7 19 8.5 L8.5 19 Z" fill="#F6D27A" stroke="#3E3A39" strokeWidth="2.4" strokeLinejoin="round" /></svg>
);
// variant: "wide"（頁底成條）／"pill"（標題隔離細掣）
function EditToggle({ editing, onToggle, variant = "wide" }) {
  const t = useT();
  return (
    <button type="button" className={"edit-toggle et-" + variant + (editing ? " on" : "")} onClick={onToggle} aria-pressed={editing}>
      {editing ? <CheckIcon /> : <PencilIcon />}
      <span>{editing ? t("done") : t("editBtn")}</span>
    </button>
  );
}

/* ---------------- 底部彈出框 ---------------- */
function Sheet({ title, onClose, children }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet card" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head"><h2>{title}</h2><button className="x" onClick={onClose} aria-label={t("close")}>×</button></div>
        {children}
      </div>
    </div>
  );
}

/* ---------------- PIN 數字鍵盤 ---------------- */
const DelIcon = () => (
  <svg viewBox="0 0 34 24" width="38" height="27" aria-hidden="true"><path d="M11 2 H31 Q33 2 33 4 V20 Q33 22 31 22 H11 L2 12 Z" fill="#FFFCF6" stroke="#3E3A39" strokeWidth="2.6" strokeLinejoin="round" /><path d="M16 8 L24 16 M24 8 L16 16" stroke="#3E3A39" strokeWidth="2.8" strokeLinecap="round" /></svg>
);
// check(code) → "ok" | "bad" | "more"（可以係 Promise）
function PinPad({ maxLen, check }) {
  const t = useT();
  const [pin, setPin] = useState("");
  const [bad, setBad] = useState(false);
  const busy = useRef(false);
  const press = async (k) => {
    if (busy.current) return;
    if (k === "del") { setPin((p) => p.slice(0, -1)); return; }
    if (k === "clr") { setPin(""); return; }
    const next = (pin + k).slice(0, maxLen);
    setPin(next);
    setBad(false);
    busy.current = true;
    const r = await check(next);
    busy.current = false;
    if (r === "bad" || (r === "more" && next.length >= maxLen)) setTimeout(() => { setBad(true); setPin(""); }, 120);
  };
  useEffect(() => {
    const onKey = (e) => { if (/^\d$/.test(e.key)) press(e.key); else if (e.key === "Backspace") press("del"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <>
      <div className={"pin-dots" + (bad ? " shake" : "")} aria-live="polite">
        {Array.from({ length: maxLen }).map((_, i) => <span key={i} className={"pin-dot" + (i < pin.length ? " on" : "")} />)}
      </div>
      <div className="pin-msg">{bad ? t("pinWrong") : " "}</div>
      <div className="keypad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clr", "0", "del"].map((k) => (
          <button key={k} className={"key" + (k.length > 1 ? " fn" : "")} onClick={() => press(k)} aria-label={k === "del" ? "Delete" : k === "clr" ? t("clear") : k}>
            {k === "del" ? <DelIcon /> : k === "clr" ? t("clear") : k}
          </button>
        ))}
      </div>
    </>
  );
}

function PinSheet({ onOk, onClose, pin: PIN = EDIT_PIN }) {
  const t = useT();
  const check = async (code) => {
    if (code.length === 4 && !IS_VAULT) {
      const vp = await vaultPath(code);
      if (vp) { openTokyo(vp); return "ok"; }
    }
    if (code === PIN) { setTimeout(onOk, 120); return "ok"; }
    return code.length < PIN.length ? "more" : "bad";
  };
  return (
    <Sheet title={t("pinTitle")} onClose={onClose}>
      <PinPad maxLen={Math.max(4, PIN.length)} check={check} />
    </Sheet>
  );
}

// 東京網址未解鎖時嘅畫面
export function TokyoLock() {
  const [lang] = usePersist("hok-lang", "zh");
  const check = async (code) => {
    const vp = await vaultPath(code);
    if (vp) { openTokyo(vp); return "ok"; }
    return code.length < 4 ? "more" : "bad";
  };
  return (
    <LangCtx.Provider value={lang}>
      <div className="app tokyo-lock">
        <main>
          <div className="page">
            <div className="lock-hero card"><PlaneMini color="#F2A497" /><TowerIcon size={58} /></div>
            <h1 className="title">{tr(lang, "tokyoLockTitle")}</h1>
            <p className="subtitle">{tr(lang, "tokyoLockSub")}</p>
            <div className="card plain"><PinPad maxLen={4} check={check} /></div>
            <a className="link-btn center-link" href={mainHref()}>{tr(lang, "toHokkaido")}</a>
          </div>
        </main>
      </div>
    </LangCtx.Provider>
  );
}

/* ---------------- 首頁 ---------------- */
function useNow(ms = 1000) {
  const [now, setNow] = useState(() => jstNow());
  useEffect(() => { const id = setInterval(() => setNow(jstNow()), ms); return () => clearInterval(id); }, [ms]);
  return now;
}

function NowNext({ nn, days, onOpen }) {
  const t = useT();
  const lang = useLang();
  if (!nn) return null;
  const gtag = (s) => (s && s.group ? " · " + s.group.split("").map((id) => pick(lang, groupOf(id), "name")).join("/") : "");
  return (
    <div className="card nownext">
      <div className="nn-day">{t("dayN", { n: nn.di + 1 })}・{pick(lang, days[nn.di], "title")}</div>
      <button className="nn-row now" onClick={onOpen} disabled={!onOpen}>
        <span className="nn-label"><span className="pulse-dot" />{t("nowDoing")}</span>
        <span className="nn-main">
          {nn.cur ? <><b>{pick(lang, nn.cur, "name")}</b><small>{fmtT(nn.cur.t)}{gtag(nn.cur)}</small></> : <small>{nn.next ? t("startsAt", { x: fmtT(nn.next.t) }) : ""}</small>}
        </span>
      </button>
      {nn.next ? (
        <div className="nn-row next">
          <span className="nn-label">{t("upNext")}</span>
          <span className="nn-main"><b>{pick(lang, nn.next, "name")}</b><small>{fmtT(nn.next.t)}・{t("inMin", { x: fmtMins(lang, nn.mins) })}{gtag(nn.next)}</small></span>
          <a className="nn-go" href={navUrl(nn.next.q || nn.next.addr || nn.next.name)} target="_blank" rel="noreferrer">{t("goNow")}</a>
        </div>
      ) : <div className="nn-row done"><span className="nn-main"><small>{t("dayDone")}</small></span></div>}
    </div>
  );
}

function departLine(lang) {
  const f = FLIGHTS[0];
  if (!f) return "";
  const p = (k) => pick(lang, f, k);
  return `${p("date")} ${fmtT(p("dep"))} ${p("no")} ${p("fromName")} → ${p("toName")}`;
}

function Countdown({ goPlan, days }) {
  const t = useT();
  const lang = useLang();
  const { myG } = useMe();
  const myGid = myG ? myG.id : null;
  const now = useNow(1000);
  const diff = new Date(TRIP.departISO) - now;
  const di = tripDayIndex(now);
  if (diff > 0) {
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    return (
      <div className="card countdown">
        <div className="cd-label">{t("countdown")}</div>
        <div className="cd-row">
          {[[d, "d"], [h, "h"], [m, "m"], [s, "s"]].map(([v, u]) => (
            <div key={u} className="cd-cell"><div className="cd-num">{String(v).padStart(2, "0")}</div><div className="cd-unit">{t(u)}</div></div>
          ))}
        </div>
        <div className="cd-foot">{departLine(lang)}</div>
      </div>
    );
  }
  if (di >= 0) {
    return <NowNext nn={nowNext(days, now, myGid)} days={days} onOpen={() => goPlan(di)} />;
  }
  if (false) {
    return (
      <button className="card countdown today" onClick={() => goPlan(di)}>
        <div className="cd-label">{t("onTrip")}</div>
        <div className="cd-big">{t("dayN", { n: di + 1 })}・{days[di] ? pick(lang, days[di], "title") : ""}</div>
        <div className="cd-foot">{t("seeToday")}</div>
      </button>
    );
  }
  return (<div className="card countdown"><div className="cd-big">{t("tripDone")}</div><div className="cd-foot">{t("tripDoneSub")}</div></div>);
}

function FlightCard({ f, onEdit }) {
  const lang = useLang();
  const t = useT();
  const { me } = useMe();
  const mine = !!me && peopleOf(f).includes(me);
  const p = (k) => pick(lang, f, k);
  return (
    <div className={"card flight" + (mine ? " mine" : "")} style={{ "--accent": f.color }}>
      <div className="flight-top"><span className="flight-no">{p("no")}{mine ? <span className="tag you-tag">{t("yourFlight")}</span> : null}</span><span className="flight-date">{p("date")}</span></div>
      <div className="flight-route">
        <div className="apt"><div className="apt-code">{f.from}</div><div className="apt-name">{p("fromName")}</div><div className="apt-time">{fmtT(p("dep"))}</div></div>
        <div className="fly-path" aria-hidden="true"><span className="fly-plane"><PlaneMini color={f.color} /></span></div>
        <div className="apt right"><div className="apt-code">{f.to}</div><div className="apt-name">{p("toName")}</div><div className="apt-time">{fmtT(f.arr)}</div></div>
      </div>
      <div className="flight-who"><span>{whoText(lang, f)}{p("note") ? <span className="muted">・{p("note")}</span> : null}</span>{onEdit ? <button className="edit-btn small" onClick={onEdit}>{t("edit")}</button> : null}</div>
    </div>
  );
}

function LangSwitch({ lang, setLang }) {
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button className={lang === "zh" ? "on" : ""} aria-pressed={lang === "zh"} onClick={() => setLang("zh")}>中文</button>
      <button className={lang === "en" ? "on" : ""} aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

const sceneNow = () => (SCENES.includes(TRIP.scene) ? TRIP.scene : IS_VAULT ? "tokyo" : "hokkaido");
function MePrompt() {
  const t = useT();
  const { me, setMe } = useMe();
  const [later, setLater] = usePersist("hok-me-later", false);
  if ((me && PEOPLE.includes(me)) || later || !PEOPLE.length) return null;
  return (
    <div className="card plain me-card">
      <div className="me-q"><b>{t("meQ")}</b><button className="link-btn" onClick={() => setLater(true)}>{t("later")}</button></div>
      <div className="chips">
        {GROUPS.flatMap((g) => g.members.map((p) => <button key={p} type="button" className="chip person-chip" style={{ "--accent": g.color }} onClick={() => setMe(p)}>{p}</button>))}
      </div>
      <p className="hint">{t("meHint")}</p>
    </div>
  );
}

function Home({ goPlan, setTab, days, status }) {
  const t = useT();
  const lang = useLang();
  const { myG } = useMe();
  const now = useNow(30000);
  const di = tripDayIndex(now);
  const showDay = di >= 0 ? di : new Date(TRIP.departISO) > now ? 0 : -1;
  const nn = nowNext(days, now, myG ? myG.id : null);
  const today = showDay >= 0 ? days[showDay] : null;
  const idx = today ? asArray(today.stops).map((s, i) => ({ ...s, _i: i })).filter((s) => !myG || !s.group || s.group.includes(myG.id)).sort((a, b) => String(a.t).localeCompare(String(b.t))) : [];
  return (
    <div className="page">
      <div className="hero card"><HeroArt scene={sceneNow()} season={seasonOf(TRIP.startDate)} drive={DRIVE.on} cars={DRIVE.cars} /></div>
      <h1 className="title">{lang === "en" ? TRIP.titleEn : TRIP.title}</h1>
      <p className="subtitle">{(lang === "en" ? TRIP.subtitleEn : TRIP.subtitle) || (IS_VAULT ? t("vaultSub") : `${t("subtitle")}${lang === "en" ? " · " : "・"}${DRIVE.on && DRIVE.cars.length ? t("nPeopleCars", { p: PEOPLE.length, c: DRIVE.cars.length }) : t("nPeople", { p: PEOPLE.length })}`)}</p>
      <MePrompt />
      {di < 0 ? <Countdown goPlan={goPlan} days={days} /> : null}

      {today ? (
        <>
          <div className="sec-row">
            <h2 className="sec">{di >= 0 ? t("todayPlan") : t("firstDay")}</h2>
            <button className="link-btn" onClick={() => goPlan(showDay)}>{t("allDays")}</button>
          </div>
          <div className="card day-head slim">
            <DayArt kind={today.icon} size={48} />
            <div className="dh-body">
              <div className="dh-date">Day {showDay + 1}・{today.d}（{weekday(lang, today.w)}）</div>
              <div className="dh-title">{pick(lang, today, "title")}</div>
            </div>
          </div>
          {di >= 0 ? <NowNext nn={nn} days={days} /> : null}
          <Timeline stops={idx} editing={false} showGroup onEdit={() => {}} onReorder={() => {}} nowI={di >= 0 && nn && nn.cur ? nn.cur._i : null} nextI={di >= 0 && nn && nn.next ? nn.next._i : null} />
        </>
      ) : null}

      <h2 className="sec">{t("overview")}</h2>
      <div className="overview">
        {days.map((day, i) => (
          <button key={day.d + i} className={"card ov-item" + (i === di ? " today" : "")} onClick={() => goPlan(i)}>
            <DayArt kind={day.icon} size={48} />
            <div><div className="ov-date">{day.d}（{weekday(lang, day.w)}）</div><div className="ov-title">{pick(lang, day, "title")}</div></div>
          </button>
        ))}
      </div>

      <div className="quick">
        {FEAT.stays ? <button className="btn" onClick={() => setTab("stay")}>{t("stayInfo")}</button> : null}
        {FEAT.kitty !== "off" ? <button className="btn yellow" onClick={() => setTab("money")}>{FEAT.kitty === "log" ? t("moneyLog") : t("kitty")}</button> : null}
      </div>
      {FEAT.stays ? null : <FlightsDrawer />}
      <p className="sync-line"><span className="sync-dot inline" style={{ background: STATUS_C[status] }} />{t("st_" + status)}{status === "online" ? t("everyoneSame") : ""}</p>
    </div>
  );
}

function FlightsDrawer() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const toggle = () => {
    setOpen(!open);
    if (!open) setTimeout(() => { if (ref.current && ref.current.scrollIntoView) ref.current.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
  };
  return (
    <div className="flights-drawer" ref={ref}>
      <button className={"card flights-btn" + (open ? " open" : "")} onClick={toggle} aria-expanded={open}>
        <span className="fb-sky" aria-hidden="true">
          <span className="fb-cloud c1" /><span className="fb-cloud c2" />
          <span className="fb-plane"><PlaneMini color="#F2A497" /></span>
        </span>
        <span className="fb-label">{t("flights")}<small>{t("flightsN", { n: FLIGHTS.length })}</small></span>
        <span className="chev" aria-hidden="true"><Chevron dir={open ? "up" : "down"} /></span>
      </button>
      {open ? (
        <div className="flights drop-in">
          {FLIGHTS.map((f, i) => <div key={f.id} className="drop-item" style={{ animationDelay: `${i * 70}ms` }}><FlightCard f={f} /></div>)}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- 行程 ---------------- */
function MoveTag({ move }) {
  const t = useT();
  if (!move || !MOVE[move.t]) return null;
  let txt = move.txt || "";
  if (!txt && move.min) {
    const m = Number(move.min);
    txt = m >= 60 ? `${Math.floor(m / 60)}${t("hr")}${m % 60 ? (m % 60) + t("min") : ""}` : `${m}${t("min")}`;
  }
  return <span className="tag" style={{ background: MOVE[move.t].bg }}>{t(MOVE[move.t].k)}{txt ? " " + txt : ""}</span>;
}
function GroupTag({ g }) {
  const lang = useLang();
  if (!g) return null;
  return g.split("").map((id) => {
    const grp = groupOf(id);
    return grp ? <span key={id} className="tag group" style={{ background: grp.color }}>{pick(lang, grp, "name")}</span> : null;
  });
}

// 可以拖嘅時間軸（用 pointer events，iPhone 都得）
function Timeline({ stops, editing, showGroup, onEdit, onReorder, nowI, nextI }) {
  const t = useT();
  const lang = useLang();
  const listRef = useRef(null);
  const dragRef = useRef(null);
  const [drag, setDrag] = useState(null);

  const start = (e, i) => {
    e.preventDefault();
    const lis = [...listRef.current.children];
    const rects = lis.map((li) => { const r = li.getBoundingClientRect(); return { top: r.top + window.scrollY, h: r.height }; });
    const st = { from: i, to: i, y0: e.clientY + window.scrollY, dy: 0, rects, h: rects[i].h + 12 };
    dragRef.current = st;
    setDrag({ ...st });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  };
  const move = (e) => {
    const st = dragRef.current;
    if (!st) return;
    if (e.clientY < 120) window.scrollBy(0, -10);
    else if (e.clientY > window.innerHeight - 70) window.scrollBy(0, 10);
    st.dy = e.clientY + window.scrollY - st.y0;
    const center = st.rects[st.from].top + st.rects[st.from].h / 2 + st.dy;
    let to = 0;
    st.rects.forEach((r, j) => { if (j !== st.from && center > r.top + r.h / 2) to += 1; });
    st.to = to;
    setDrag({ ...st });
  };
  const end = () => {
    const st = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (st && st.to !== st.from) onReorder(st.from, st.to);
  };
  const shiftOf = (j) => {
    if (!drag || j === drag.from) return 0;
    if (drag.from < drag.to && j > drag.from && j <= drag.to) return -drag.h;
    if (drag.to < drag.from && j >= drag.to && j < drag.from) return drag.h;
    return 0;
  };

  return (
    <ol className={"timeline" + (drag ? " dragging" : "")} ref={listRef}>
      {stops.map((s, i) => {
        const isDrag = drag && drag.from === i;
        const style = isDrag
          ? { transform: `translateY(${drag.dy}px) scale(1.02)`, zIndex: 20, transition: "none", animation: "none" }
          : drag ? { transform: `translateY(${shiftOf(i)}px)`, animation: "none" } : { animationDelay: `${i * 45}ms` };
        const name = pick(lang, s, "name");
        const note = pick(lang, s, "note");
        const dish = pick(lang, s, "dish");
        return (
          <li key={s._i + "-" + s.t + s.name} className={"tl-item" + (isDrag ? " lifted" : "") + (s._i === nowI ? " is-now" : "") + (s._i === nextI ? " is-next" : "")} style={style}>
            <div className="tl-time">{fmtT(s.t)}</div>
            <div className="tl-dot" style={{ background: s.must ? "#F6D27A" : "#FFFCF6" }} />
            <div className={"card tl-card" + (s.must ? " must" : "")}>
              <div className="tl-tags">
                {s._i === nowI ? <span className="tag now-tag"><span className="pulse-dot" />{t("nowDoing")}</span> : null}
                {s._i === nextI ? <span className="tag next-tag">{t("upNext")}</span> : null}
                <MoveTag move={s.move} />
                {s.must ? <span className="tag must-tag">{t("must")}</span> : null}
                {s.book ? <span className={"tag book-tag" + (s.booked ? " ok" : "")}>{s.booked ? t("booked") : t("needBook")}</span> : null}
                {showGroup ? <GroupTag g={s.group} /> : null}
              </div>
              <div className="tl-name">{name}</div>
              {dish ? <div className="tl-dish">{t("mustEat")}{dish}</div> : null}
              {note ? <div className="tl-note">{note}</div> : null}
              <div className="tl-links">
                <a href={mapsUrl(s.q || s.addr || s.name)} target="_blank" rel="noreferrer">{t("map")}</a>
                <a href={navUrl(s.q || s.addr || s.name)} target="_blank" rel="noreferrer" className="go">{t("nav")}</a>
                <a href={waUrl(stopText(lang, s))} target="_blank" rel="noreferrer" className="wa">{t("share")}</a>
                {editing ? <button className="edit-btn small" onClick={() => onEdit(s._i)}>{t("edit")}</button> : null}
              </div>
              {editing ? (
                <span className="drag-handle" role="button" tabIndex={-1} aria-label={t("dragHint")}
                  onPointerDown={(e) => start(e, i)} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
                  <svg viewBox="0 0 20 14" width="20" height="14" aria-hidden="true"><path d="M2 2 H18 M2 7 H18 M2 12 H18" stroke="#3E3A39" strokeWidth="2.6" strokeLinecap="round" /></svg>
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StopEditor({ stop, dayIdx, days, onSave, onDelete, onClose }) {
  const t = useT();
  const lang = useLang();
  const [s, setS] = useState(() => ({ t: "12:00", name: "", q: "", addr: "", must: false, book: false, booked: false, dish: "", note: "", group: "", ...stop, move: stop && stop.move ? { ...stop.move } : null }));
  const [nameEn, setNameEn] = useState(stop && stop.en ? stop.en.name || "" : "");
  const [noteEn, setNoteEn] = useState(stop && stop.en ? stop.en.note || "" : "");
  const [target, setTarget] = useState(dayIdx);
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const setMove = (k) => setS((x) => ({ ...x, move: k ? { ...(x.move || {}), t: k } : null }));
  const toggleGroup = (id) => set("group", (s.group || "").includes(id) ? s.group.replace(id, "") : ((s.group || "") + id).split("").sort().join(""));
  const save = (e) => {
    e.preventDefault();
    if (!s.name.trim()) return;
    const out = { ...s, name: s.name.trim() };
    Object.keys(out).forEach((k) => { if (out[k] === "" || out[k] === false || out[k] == null) delete out[k]; });
    if (out.move && out.move.t !== "plane") delete out.move.txt;
    if (out.move && out.move.t === "plane") delete out.move.min;
    const en = {};
    if (nameEn.trim()) en.name = nameEn.trim();
    if (noteEn.trim()) en.note = noteEn.trim();
    if (stop && stop.en && stop.en.dish && stop.dish === out.dish) en.dish = stop.en.dish;
    if (Object.keys(en).length) out.en = en; else delete out.en;
    onSave(out, target);
  };
  return (
    <Sheet title={stop ? t("editStop") : t("newStop")} onClose={onClose}>
      <form className="form" onSubmit={save}>
        <div className="form-row">
          <label className="fld narrow"><span>{t("time")}</span><input className="input time" type="time" value={s.t} onChange={(e) => set("t", e.target.value)} required /></label>
          <label className="fld"><span>{t("place")}</span><input className="input" value={s.name} onChange={(e) => set("name", e.target.value)} placeholder={t("placeEg")} required /></label>
        </div>
        <label className="fld"><span>{t("placeEn")}</span><input className="input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} /></label>
        <label className="fld"><span>{t("addrOpt")}</span><input className="input" value={s.addr || ""} onChange={(e) => set("addr", e.target.value)} placeholder={t("stayAddrEg")} /></label>
        <label className="fld"><span>{t("mapQ")}</span><input className="input" value={s.q || ""} onChange={(e) => set("q", e.target.value)} placeholder={t("mapQEg")} /></label>
        <div className="fld"><span>{t("whichDay")}</span>
          <div className="chips">
            {days.map((d, i) => <button type="button" key={d.d} className={"chip small" + (target === i ? " on" : "")} onClick={() => setTarget(i)}>D{i + 1}</button>)}
          </div>
        </div>
        <div className="fld"><span>{t("how")}</span>
          <div className="chips">
            <button type="button" className={"chip" + (!s.move ? " on" : "")} onClick={() => setMove(null)}>{t("noTag")}</button>
            {Object.entries(MOVE).map(([k, m]) => (
              <button type="button" key={k} className={"chip" + (s.move && s.move.t === k ? " on" : "")} onClick={() => setMove(k)}>{t(m.k)}</button>
            ))}
          </div>
        </div>
        {s.move ? (
          s.move.t === "plane" ? (
            <label className="fld"><span>{t("flightNo")}</span><input className="input" value={s.move.txt || ""} onChange={(e) => setS((x) => ({ ...x, move: { ...x.move, txt: e.target.value } }))} placeholder="NH50" /></label>
          ) : (
            <label className="fld"><span>{t("howLong")}</span><input className="input" inputMode="numeric" pattern="[0-9]*" value={s.move.min || ""} onChange={(e) => setS((x) => ({ ...x, move: { ...x.move, min: Number(e.target.value.replace(/\D/g, "")) || "" } }))} /></label>
          )
        ) : null}
        <div className="chips">
          <button type="button" className={"chip" + (s.must ? " on" : "")} onClick={() => set("must", !s.must)}>{t("must")}</button>
          <button type="button" className={"chip" + (s.book ? " on" : "")} onClick={() => set("book", !s.book)}>{t("needBook")}</button>
          {s.book ? <button type="button" className={"chip" + (s.booked ? " on" : "")} onClick={() => set("booked", !s.booked)}>{t("bookedOk")}</button> : null}
        </div>
        <label className="fld"><span>{t("dish")}</span><input className="input" value={s.dish || ""} onChange={(e) => set("dish", e.target.value)} /></label>
        <label className="fld"><span>{t("note")}</span><input className="input" value={s.note || ""} onChange={(e) => set("note", e.target.value)} /></label>
        <label className="fld"><span>{t("noteEn")}</span><input className="input" value={noteEn} onChange={(e) => setNoteEn(e.target.value)} /></label>
        <div className="fld"><span>{t("groupsOnly")}</span>
          <div className="chips">
            {GROUPS.map((g) => (
              <button type="button" key={g.id} className={"chip" + ((s.group || "").includes(g.id) ? " on" : "")} onClick={() => toggleGroup(g.id)}>{pick(lang, g, "name")}</button>
            ))}
          </div>
        </div>
        <button className="btn full" type="submit">{t("save")}</button>
        {stop ? <button type="button" className="btn full ghost danger-btn" onClick={() => { if (window.confirm(t("confirmDel", { x: stop.name }))) onDelete(); }}>{t("delStop")}</button> : null}
      </form>
    </Sheet>
  );
}

function TimeAsk({ ask, onOk, onClose }) {
  const t = useT();
  const lang = useLang();
  const [v, setV] = useState(ask.suggest);
  return (
    <Sheet title={t("newTime")} onClose={onClose}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onOk(v); }}>
        <p className="ask-q">{t("newTimeQ", { x: pick(lang, ask.stop, "name") })}<br />
          <span className="muted">{ask.a && ask.b ? t("between", { a: fmtT(ask.a), b: fmtT(ask.b) }) : ""}</span></p>
        <input className="input time big" type="time" value={v} onChange={(e) => setV(e.target.value)} required aria-label={t("time")} />
        <div className="row2">
          <button type="button" className="btn ghost" onClick={onClose}>{t("cancel")}</button>
          <button className="btn" type="submit">{t("ok")}</button>
        </div>
      </form>
    </Sheet>
  );
}

function DayEditor({ day, dayIdx, days, onSave, onSwap, onClose }) {
  const t = useT();
  const lang = useLang();
  const [swapWith, setSwapWith] = useState(null);
  const [f, setF] = useState({ title: day.title || "", intro: day.intro || "", titleEn: (day.en && day.en.title) || "", introEn: (day.en && day.en.intro) || "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Sheet title={t("editDay")} onClose={onClose}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
        <label className="fld"><span>{t("dayTitle")}</span><input className="input" value={f.title} onChange={set("title")} /></label>
        <label className="fld"><span>{t("dayIntro")}</span><textarea className="input" rows={2} value={f.intro} onChange={set("intro")} /></label>
        <label className="fld"><span>{t("titleEn")}</span><input className="input" value={f.titleEn} onChange={set("titleEn")} /></label>
        <label className="fld"><span>{t("introEn")}</span><textarea className="input" rows={2} value={f.introEn} onChange={set("introEn")} /></label>
        <button className="btn full" type="submit">{t("save")}</button>
      </form>
      <div className="swap-box">
        <h3 className="set-sub">{t("swapDay")}</h3>
        <p className="hint">{t("swapHint")}</p>
        <div className="swap-grid">
          {days.map((d, i) => i === dayIdx ? null : (
            <button key={i} type="button" className={"swap-day" + (swapWith === i ? " on" : "")} onClick={() => setSwapWith(i)}>
              <b>D{i + 1}・{d.d}（{weekday(lang, d.w)}）</b>
              <small>{pick(lang, d, "title")}</small>
            </button>
          ))}
        </div>
        {swapWith != null ? (
          <button type="button" className="btn full yellow" onClick={() => onSwap(swapWith)}>
            {t("swapGo", { a: `D${dayIdx + 1}`, b: `D${swapWith + 1}` })}
          </button>
        ) : null}
      </div>
    </Sheet>
  );
}

function Plan({ days, day, setDay, editing, onToggleEdit }) {
  const t = useT();
  const lang = useLang();
  const di = tripDayIndex();
  const data = days[day] || days[0];
  const stops = asArray(data.stops);
  const railRef = useRef(null);
  const [editor, setEditor] = useState(null); // {idx} | "day"
  const [ask, setAsk] = useState(null);
  const now = useNow(30000);
  const { myG } = useMe();
  const myGid = myG ? myG.id : null;
  const nn = nowNext(days, now, myGid);
  const isToday = nn && nn.di === day;
  const nowI = isToday && nn.cur ? nn.cur._i : null;
  const nextI = isToday && nn.next ? nn.next._i : null;
  const [dir, setDir] = useState("");
  const first = useRef(true);
  // 入嚟／轉日：今日就即刻跳去「而家」嗰個（唔郁動畫），其他日就返頂
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = isToday ? document.querySelector(".tl-item.is-now") || document.querySelector(".tl-item.is-next") : null;
      if (el) {
        let y = 0;
        for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
        window.scrollTo(0, Math.max(0, y - window.innerHeight / 2 + el.offsetHeight / 2));
      } else if (!first.current) window.scrollTo(0, 0);
      first.current = false;
    });
    return () => cancelAnimationFrame(raf);
  }, [day]); // eslint-disable-line react-hooks/exhaustive-deps

  // 左右掃轉日子
  const swipeRef = useRef(null);
  const tch = useRef(null);
  const goDay = (d) => { if (d < 0 || d >= days.length || d === day) return; setDir(d > day ? "next" : "prev"); setDay(d); };
  const onTS = (e) => {
    if (e.touches.length !== 1 || (e.target.closest && e.target.closest(".drag-handle, input, textarea, select"))) { tch.current = null; return; }
    const p = e.touches[0];
    tch.current = { x: p.clientX, y: p.clientY, lock: null, dx: 0 };
  };
  const onTM = (e) => {
    const st = tch.current;
    if (!st || e.touches.length !== 1) return;
    const p = e.touches[0];
    const dx = p.clientX - st.x, dy = p.clientY - st.y;
    if (!st.lock && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) st.lock = Math.abs(dx) > Math.abs(dy) * 1.4 ? "x" : "y";
    if (st.lock !== "x") return;
    st.dx = dx;
    const el = swipeRef.current;
    if (el) {
      const edge = (dx > 0 && day === 0) || (dx < 0 && day === days.length - 1);
      el.style.transition = "none";
      el.style.transform = `translateX(${dx * (edge ? 0.12 : 0.4)}px)`;
    }
  };
  const onTE = () => {
    const st = tch.current;
    tch.current = null;
    const el = swipeRef.current;
    if (el) { el.style.transition = "transform .2s ease"; el.style.transform = ""; }
    if (st && st.lock === "x" && Math.abs(st.dx) > 70) goDay(day + (st.dx < 0 ? 1 : -1));
  };

  useEffect(() => {
    const rail = railRef.current;
    const el = rail && rail.children[day];
    if (el && rail.scrollTo) rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [day]);

  const indexed = stops.map((s, idx) => ({ ...s, _i: idx }));
  const hasGroups = indexed.some((s) => s.group);
  const sections = useMemo(() => {
    if (!hasGroups) return [{ key: "all", stops: indexed }];
    const out = [];
    const common = indexed.filter((s) => !s.group);
    if (common.length) out.push({ key: "all", stops: common });
    GROUPS.forEach((g) => {
      const st = indexed.filter((s) => s.group && s.group.includes(g.id));
      if (st.length) out.push({ key: g.id, g, stops: st });
    });
    return out;
  }, [stops]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveStops = (arr) => store.set(`trip/days/${day}/stops`, sortStops(arr));

  const onSave = (s, target) => {
    if (target === day) {
      const arr = [...stops];
      if (editor.idx == null) arr.push(s); else arr[editor.idx] = s;
      saveStops(arr);
    } else {
      const cur = editor.idx == null ? stops : stops.filter((_, i) => i !== editor.idx);
      const other = asArray(days[target].stops);
      store.update({ [`trip/days/${day}/stops`]: sortStops(cur), [`trip/days/${target}/stops`]: sortStops([...other, s]) });
    }
    setEditor(null);
  };
  const onDelete = () => { saveStops(stops.filter((_, i) => i !== editor.idx)); setEditor(null); };

  // 拖完：計前後兩個行程，建議中間時間再問
  const onReorder = (secStops) => (from, to) => {
    const order = [...secStops];
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    const prev = order[to - 1];
    const next = order[to + 1];
    let suggest;
    if (prev && next) suggest = fromMin((toMin(prev.t) + toMin(next.t)) / 2);
    else if (prev) suggest = fromMin(toMin(prev.t) + 30);
    else suggest = fromMin(toMin(next.t) - 30);
    setAsk({ idx: moved._i, stop: moved, suggest, a: prev && prev.t, b: next && next.t });
  };
  const applyTime = (v) => {
    const arr = stops.map((s, i) => (i === ask.idx ? { ...s, t: v } : s));
    saveStops(arr);
    setAsk(null);
  };

  return (
    <div className="page">
      <div className="day-rail" ref={railRef} role="tablist" aria-label={t("pickDate")}>
        {days.map((d, i) => (
          <button key={d.d} role="tab" aria-selected={i === day} className={"day-pill" + (i === day ? " on" : "")} onClick={() => goDay(i)}>
            <span className="dp-n">Day {i + 1}</span><span className="dp-d">{d.d}</span><span className="dp-w">{weekday(lang, d.w)}{i === di ? "・" + t("today") : ""}</span>
          </button>
        ))}
      </div>

      <div className="swipe-zone" ref={swipeRef} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE} onTouchCancel={onTE}>
      <div key={day} className={dir === "next" ? "slide-next" : dir === "prev" ? "slide-prev" : "bounce-in"}>
        <div className="card day-head">
          <DayArt kind={data.icon} size={64} />
          <div className="dh-body">
            <div className="dh-date">Day {day + 1}・{data.d}（{weekday(lang, data.w)}）</div>
            <div className="dh-title">{pick(lang, data, "title")}</div>
            {pick(lang, data, "intro") ? <div className="dh-intro">{pick(lang, data, "intro")}</div> : null}
          </div>
          <div className="dh-btns">
            <a className="share-btn" href={waUrl(dayText(lang, data, day))} target="_blank" rel="noreferrer">{t("shareDay")}</a>
            {editing ? <button className="edit-btn" onClick={() => setEditor("day")}>{t("edit")}</button> : null}
          </div>
        </div>
        {isToday ? <NowNext nn={nn} days={days} /> : null}

        {sections.map((sec) => (
          <div key={sec.key} className="tl-section">
            {sec.g ? <div className={"grp-head" + (myGid === sec.g.id ? " mine" : "")} style={{ background: sec.g.color }}>{pick(lang, sec.g, "name")}・{sec.g.members.join(lang === "en" ? ", " : "、")}{pick(lang, sec.g, "dest") ? "・" + pick(lang, sec.g, "dest") : ""}{myGid === sec.g.id ? <span className="you-dot">{t("you")}</span> : null}</div> : null}
            <Timeline stops={sec.stops} editing={editing} showGroup={sec.key === "all"} onEdit={(idx) => setEditor({ idx })} onReorder={onReorder(sec.stops)} nowI={nowI} nextI={nextI} />
          </div>
        ))}
        {editing ? <button className="btn full ghost" onClick={() => setEditor({ idx: null })}>{t("addStop")}</button> : null}
        <div className="day-nav">
          {day > 0 ? (
            <button type="button" className="dn-btn prev" onClick={() => goDay(day - 1)}><Chevron dir="left" size={16} /><span><small>Day {day}</small>{days[day - 1].d}</span></button>
          ) : <span />}
          {day < days.length - 1 ? (
            <button type="button" className="dn-btn next" onClick={() => goDay(day + 1)}><span><small>Day {day + 2}</small>{days[day + 1].d}</span><Chevron dir="right" size={16} /></button>
          ) : <span />}
        </div>
        <p className="hint center swipe-hint">{t("swipeHint")}</p>
      </div>
      </div>

      {IS_VAULT ? null : <h2 className="sec">{t("backup")}</h2>}
      {(IS_VAULT ? [] : BACKUP).map((b) => (
        <div key={b.name} className="card plain">
          <div className="tl-name">{pick(lang, b, "name")}</div>
          <div className="tl-note">{pick(lang, b, "addr")}・<a href={"tel:" + b.tel}>{b.tel}</a></div>
          <div className="tl-note">{pick(lang, b, "note")}</div>
        </div>
      ))}

      {editor === "day" ? (
        <DayEditor day={data} dayIdx={day} days={days} onClose={() => setEditor(null)} onSwap={(j) => {
          // 對調兩日嘅內容（日期唔變）
          const a = days[day], b = days[j];
          const content = (x) => ({ title: x.title || "", intro: x.intro || "", en: x.en || null, icon: x.icon || "clock", stops: asArray(x.stops) });
          const ca = content(a), cb = content(b);
          store.update({ [`trip/days/${day}`]: { ...a, ...cb, d: a.d, w: a.w }, [`trip/days/${j}`]: { ...b, ...ca, d: b.d, w: b.w } });
          setEditor(null);
          setDay(j);
        }} onSave={(v) => {
          const en = {};
          if (v.titleEn.trim()) en.title = v.titleEn.trim();
          if (v.introEn.trim()) en.intro = v.introEn.trim();
          store.update({ [`trip/days/${day}/title`]: v.title.trim() || data.title, [`trip/days/${day}/intro`]: v.intro.trim(), [`trip/days/${day}/en`]: Object.keys(en).length ? en : null });
          setEditor(null);
        }} />
      ) : editor ? (
        <StopEditor stop={editor.idx == null ? null : stops[editor.idx]} dayIdx={day} days={days} onSave={onSave} onDelete={onDelete} onClose={() => setEditor(null)} />
      ) : null}
      {ask ? <TimeAsk ask={ask} onOk={applyTime} onClose={() => setAsk(null)} /> : null}
      <EditToggle editing={editing} onToggle={onToggleEdit} />
    </div>
  );
}

/* ---------------- 待辦清單 ---------------- */
const TODO_CATS = [
  { id: "訂位", color: "#F2A497" }, { id: "租車", color: "#F6D27A" }, { id: "證件", color: "#A8D3E6" },
  { id: "錢", color: "#B9DAA5" }, { id: "行李", color: "#D8C8EA" }, { id: "買嘢", color: "#F7C9D6" }, { id: "其他", color: "#E6DFD7" },
];
const catColor = (c) => (TODO_CATS.find((x) => x.id === c) || TODO_CATS[TODO_CATS.length - 1]).color;
// 俾邊組：""＝全部人；"AB"＝A組同B組
function ForPicker({ value, onChange }) {
  const t = useT();
  const lang = useLang();
  const v = value || "";
  const tog = (id) => onChange((v.includes(id) ? v.replace(id, "") : v + id).split("").sort().join(""));
  return (
    <div className="chips">
      <button type="button" className={"chip small" + (!v ? " on" : "")} aria-pressed={!v} onClick={() => onChange("")}>{t("everyone")}</button>
      {GROUPS.map((g) => (
        <button type="button" key={g.id} className={"chip small grp-chip" + (v.includes(g.id) ? " on" : "")} style={{ "--accent": g.color }} aria-pressed={v.includes(g.id)} onClick={() => tog(g.id)}>
          <span className="mini-dot" style={{ background: g.color }} />{pick(lang, g, "name")}
        </button>
      ))}
    </div>
  );
}
const catLabel = (lang, c) => (lang === "en" ? EN_CAT[c] || c : c);
function TodoSheet({ item, onClose }) {
  const t = useT();
  const lang = useLang();
  const [text, setText] = useState(item.text || "");
  const [cat, setCat] = useState(item.cat || "其他");
  const [forG, setForG] = useState(item.for || "");
  const save = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    const patch = { text: v, cat, for: forG || null };
    if (v !== item.text) patch.en = null;
    store.update(Object.fromEntries(Object.entries(patch).map(([k, x]) => [`trip/todo/${item.id}/${k}`, x])));
    onClose();
  };
  return (
    <Sheet title={t("editTodo")} onClose={onClose}>
      <form className="form" onSubmit={save}>
        <label className="fld"><span>{t("todoText")}</span><input className="input" value={text} onChange={(e) => setText(e.target.value)} required /></label>
        <div className="fld"><span>{t("category")}</span>
          <div className="chips">
            {TODO_CATS.map((c) => (
              <button type="button" key={c.id} className={"chip small" + (cat === c.id ? " on-cat" : "")} style={cat === c.id ? { background: c.color } : null} onClick={() => setCat(c.id)}>
                <span className="mini-dot" style={{ background: c.color }} />{catLabel(lang, c.id)}
              </button>
            ))}
          </div>
        </div>
        <div className="fld"><span>{t("forWho")}</span><ForPicker value={forG} onChange={setForG} /></div>
        <button className="btn full" type="submit">{t("save")}</button>
        <button type="button" className="btn full ghost danger-btn" onClick={() => { if (window.confirm(t("confirmDel", { x: item.text }))) { store.remove(`trip/todo/${item.id}`); onClose(); } }}>{t("del")}</button>
      </form>
    </Sheet>
  );
}
function Todo() {
  const t = useT();
  const lang = useLang();
  const { myG } = useMe();
  const raw = useShared("trip/todo");
  const all = toList(raw).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const [view, setView] = usePersist("hok-todo-view", "all");
  const mineView = view === "mine" && myG;
  const items = mineView ? all.filter((i) => !i.for || i.for.includes(myG.id)) : all;
  const [text, setText] = useState("");
  const [newCat, setNewCat] = useState("其他");
  const [newFor, setNewFor] = useState("");
  const [ed, setEd] = useState(null);
  const done = items.filter((i) => i.done).length;
  const used = new Set(items.map((i) => i.cat || "其他"));
  const cats = [...TODO_CATS.map((c) => c.id).filter((c) => used.has(c)), ...[...used].filter((c) => !TODO_CATS.some((x) => x.id === c))];
  const label = (it) => (lang === "en" && it.en ? it.en : it.text);

  const add = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    store.set(`trip/todo/${uid()}`, { text: v, cat: newCat, done: false, ts: Date.now(), ...(newFor ? { for: newFor } : {}) });
    setText("");
  };

  return (
    <div className="page">
      <div className="page-head">
        <BagArt />
        <div><h1 className="title left">{t("todoTitle")}</h1><p className="subtitle left">{t("doneOf", { a: done, b: items.length })}</p></div>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} /></div>
      {myG ? (
        <Seg full label={t("forWho")} value={mineView ? "mine" : "all"} onChange={setView}
          options={[["all", t("all")], ["mine", <span key="m" className="seg-mine"><span className="mini-dot" style={{ background: myG.color }} />{pick(lang, myG, "name")}</span>]]} />
      ) : null}
      <form className="add-row" onSubmit={add}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("addItem")} aria-label={t("addItem")} />
        <button className="btn" type="submit">{t("add")}</button>
      </form>
      <div className="chips cat-pick" role="group" aria-label={t("category")}>
        {TODO_CATS.map((c) => (
          <button type="button" key={c.id} className={"chip small" + (newCat === c.id ? " on-cat" : "")} style={newCat === c.id ? { background: c.color } : null} onClick={() => setNewCat(c.id)}>
            <span className="mini-dot" style={{ background: c.color }} />{catLabel(lang, c.id)}
          </button>
        ))}
      </div>
      <div className="for-row"><span className="tools-label">{t("forWho")}</span><ForPicker value={newFor} onChange={setNewFor} /></div>
      {raw === undefined ? <div className="card plain empty">{t("loading")}</div> : null}
      {cats.map((c) => (
        <div key={c}>
          <h2 className="cat-head" style={{ background: catColor(c) }}>{catLabel(lang, c)}</h2>
          <ul className="todo-list">
            {items.filter((i) => (i.cat || "其他") === c).map((it) => {
              const mine = myG && it.for && it.for.includes(myG.id);
              return (
                <li key={it.id} className={"card todo" + (it.done ? " done" : "") + (mine ? " mine" : "")} style={{ borderLeftColor: catColor(c) }}>
                  <label className="todo-label">
                    <input type="checkbox" checked={!!it.done} onChange={() => store.set(`trip/todo/${it.id}/done`, !it.done)} />
                    <span className="check" aria-hidden="true" />
                    <span className="todo-text">{label(it)}
                      {it.for ? <span className="todo-for">{it.for.split("").map((id) => groupOf(id)).filter(Boolean).map((g) => <span key={g.id} className="tag tiny" style={{ background: g.color }}>{pick(lang, g, "name")}</span>)}</span> : null}
                    </span>
                  </label>
                  <button type="button" className="todo-edit" aria-label={t("editTodo") + " " + label(it)} onClick={() => setEd(it)}><SmallPencil /></button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p className="hint">{t("todoHint")}</p>
      {ed ? <TodoSheet item={ed} onClose={() => setEd(null)} /> : null}
    </div>
  );
}

/* ---------------- 預訂：航班＋租車＋住宿 ---------------- */
function StayEditor({ stay, onSave, onDelete, onClose }) {
  const t = useT();
  const [f, setF] = useState({ name: "", addr: "", dates: "", note: "", ...stay });
  const [ppl, setPpl] = useState(() => peopleOf(stay));
  const [near, setNear] = useState(() => asArray(stay && stay.near).map((n) => ({ name: n.name || "", note: n.note || "", q: n.q || "", en: n.en || null, _n: n.name || "", _o: n.note || "" })));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setN = (i, k, v) => setNear(near.map((n, j) => (j === i ? { ...n, [k]: v } : n)));
  const save = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    const out = { name: f.name.trim(), addr: f.addr.trim(), dates: f.dates.trim(), who: whoLabel("zh", ppl), people: ppl, note: (f.note || "").trim(), order: f.order || Date.now() };
    out.near = near.filter((n) => n.name.trim()).map((n) => {
      const keepName = n.name.trim() === n._n;
      const o = { name: n.name.trim(), note: n.note.trim(), q: keepName && n.q ? n.q : n.name.trim() };
      if (n.en && keepName && n.note === n._o) o.en = n.en;
      return o;
    });
    // 中文改咗就唔再用舊英文
    const en = {};
    if (stay && stay.en) Object.entries(stay.en).forEach(([k, v]) => { if (k !== "who" && stay[k] === out[k]) en[k] = v; });
    if (ppl.length) en.who = whoLabel("en", ppl);
    if (Object.keys(en).length) out.en = en;
    onSave(out);
  };
  return (
    <Sheet title={stay ? t("editStay") : t("newStay")} onClose={onClose}>
      <form className="form" onSubmit={save}>
        <label className="fld"><span>{t("stayName")}</span><input className="input" value={f.name} onChange={set("name")} required /></label>
        <label className="fld"><span>{t("stayAddr")}</span><textarea className="input" rows={2} value={f.addr} onChange={set("addr")} placeholder={t("stayAddrEg")} /></label>
        <label className="fld"><span>{t("stayDates")}</span><input className="input" value={f.dates} onChange={set("dates")} placeholder="10/16 → 10/17" /></label>
        <div className="fld"><span>{t("stayWho")}</span><WhoPicker value={ppl} onChange={setPpl} /></div>
        <label className="fld"><span>{t("note")}</span><input className="input" value={f.note || ""} onChange={set("note")} /></label>
        <div className="fld"><span>{t("nearby")}</span>
          {near.map((n, i) => (
            <div key={i} className="near-edit">
              <input className="input" value={n.name} onChange={(e) => setN(i, "name", e.target.value)} placeholder={t("nearName")} aria-label={t("nearName")} />
              <input className="input" value={n.note} onChange={(e) => setN(i, "note", e.target.value)} placeholder={t("nearNote")} aria-label={t("nearNote")} />
              <button type="button" className="x small" aria-label={t("del")} onClick={() => setNear(near.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="chip small dashed add-near" onClick={() => setNear([...near, { name: "", note: "", q: "", en: null, _n: "", _o: "" }])}>{t("addNear")}</button>
        </div>
        <button className="btn full" type="submit">{t("save")}</button>
        {stay ? <button type="button" className="btn full ghost danger-btn" onClick={() => { if (window.confirm(t("confirmDel", { x: stay.name }))) onDelete(); }}>{t("del")}</button> : null}
      </form>
    </Sheet>
  );
}

function StayCard({ s, editing, onEdit }) {
  const t = useT();
  const lang = useLang();
  const { me } = useMe();
  const [copied, setCopied] = useState(false);
  const mine = !!me && peopleOf(s).includes(me);
  const near = asArray(s.near);
  const copy = async () => {
    try { await navigator.clipboard.writeText(s.addr); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) { /* ignore */ }
  };
  return (
    <div className={"card plain stay" + (mine ? " mine" : "")}>
      <div className="stay-top">
        <div className="tl-name">{pick(lang, s, "name")}{mine ? <span className="tag you-tag">{t("you")}</span> : null}</div>
        {editing ? <button className="edit-btn" onClick={onEdit}>{t("edit")}</button> : null}
      </div>
      <div className="tl-note">{[pick(lang, s, "dates"), whoText(lang, s)].filter(Boolean).join("・")}</div>
      {s.addr ? <div className="addr">{s.addr}</div> : <div className="addr muted">{t("noAddr")}</div>}
      {s.note ? <div className="tl-note">{s.note}</div> : null}
      {s.addr ? (
        <div className="tl-links">
          <button className="link-btn" onClick={copy}>{copied ? t("copied") : t("copyAddr")}</button>
          <a href={mapsUrl(s.addr)} target="_blank" rel="noreferrer">{t("map")}</a>
          <a href={navUrl(s.addr)} target="_blank" rel="noreferrer" className="go">{t("navBack")}</a>
        </div>
      ) : null}
      {near.length ? (
        <div className="near-list">
          <div className="near-title">{t("nearby")}</div>
          {near.map((n, i) => (
            <div key={i} className="near-row">
              <span className="near-txt"><b>{pick(lang, n, "name")}</b>{pick(lang, n, "note") ? <small>{pick(lang, n, "note")}</small> : null}</span>
              <a className="near-map" href={mapsUrl(n.q || n.name)} target="_blank" rel="noreferrer">{t("map")}</a>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const FLIGHT_FIELDS = [["no", "flNo"], ["date", "flDate"], ["from", "flFrom"], ["fromName", "flFromName"], ["dep", "flDep"], ["to", "flTo"], ["toName", "flToName"], ["arr", "flArr"], ["note", "note"]];
function FlightSheet({ flight, onSave, onDelete, onClose }) {
  const t = useT();
  const [f, setF] = useState(() => ({ no: "", date: "", from: "", fromName: "", dep: "", to: "", toName: "", arr: "", note: "", color: GROUP_COLORS[0], ...flight }));
  const [ppl, setPpl] = useState(() => peopleOf(flight));
  const save = (e) => {
    e.preventDefault();
    if (!String(f.no).trim()) return;
    const out = { ...f, id: f.id || uid(), people: ppl, who: whoLabel("zh", ppl) };
    const en = {};
    if (flight && flight.en) Object.entries(flight.en).forEach(([k, v]) => { if (k !== "who" && flight[k] === out[k]) en[k] = v; });
    if (ppl.length) en.who = whoLabel("en", ppl);
    out.en = Object.keys(en).length ? en : null;
    onSave(out);
  };
  // 揀咗啱啱一組：顏色跟嗰組
  const onPeople = (v) => {
    setPpl(v);
    const g = GROUPS.find((x) => x.members.length === v.length && x.members.every((m) => v.includes(m)));
    if (g) setF((o) => ({ ...o, color: g.color }));
  };
  return (
    <Sheet title={flight ? t("editFlight") : t("addFlight")} onClose={onClose}>
      <form className="form" onSubmit={save}>
        <div className="fl-grid">
          {FLIGHT_FIELDS.map(([k, label]) => (
            <label key={k} className={"fld" + (["note", "date"].includes(k) ? " wide" : "")}><span>{t(label)}</span>
              <input className="input" value={f[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} required={k === "no"} />
            </label>
          ))}
        </div>
        <div className="fld"><span>{t("flWho")}</span><WhoPicker value={ppl} onChange={onPeople} /></div>
        <div className="fld"><span>{t("color")}</span><ColorPick value={f.color} onChange={(c) => setF({ ...f, color: c })} /></div>
        <button className="btn full" type="submit">{t("save")}</button>
        {flight ? <button type="button" className="btn full ghost danger-btn" onClick={() => { if (window.confirm(t("confirmDel", { x: flight.no }))) onDelete(); }}>{t("del")}</button> : null}
      </form>
    </Sheet>
  );
}

const driveOut = (on, cars) => ({ on, cars: cars.map((c) => ({ id: c.id, name: c.name || "", color: c.color, people: c.people || [] })) });
function CarSheet({ car, idx, onSave, onDelete, onClose }) {
  const t = useT();
  const [name, setName] = useState(car ? car.name : "");
  const [color, setColor] = useState(car ? car.color : nthColor(idx, DRIVE.cars.map((c) => c.color)));
  const [ppl, setPpl] = useState(car ? car.people : []);
  return (
    <Sheet title={car ? t("editCar") : t("newCar")} onClose={onClose}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onSave({ id: car ? car.id : uid(), name: name.trim(), color, people: ppl }); }}>
        <div className="car-preview"><CarIcon color={color} size={64} /><b>{t("carN", { n: idx + 1 })}</b></div>
        <label className="fld"><span>{t("carName")}</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <div className="fld"><span>{t("color")}</span><ColorPick value={color} onChange={setColor} /></div>
        <div className="fld"><span>{t("whoInCar")}</span><WhoPicker value={ppl} onChange={setPpl} /></div>
        <button className="btn full" type="submit">{t("save")}</button>
        {car ? <button type="button" className="btn full ghost danger-btn" onClick={() => { if (window.confirm(t("confirmDel", { x: t("carN", { n: idx + 1 }) }))) onDelete(); }}>{t("del")}</button> : null}
      </form>
    </Sheet>
  );
}
function CarList({ editing }) {
  const t = useT();
  const lang = useLang();
  const { me } = useMe();
  const [ed, setEd] = useState(null); // {i}
  const cars = DRIVE.cars;
  const taken = new Set(cars.flatMap((c) => c.people));
  const free = PEOPLE.filter((p) => !taken.has(p));
  const write = (list) => store.set("trip/config/drive", driveOut(true, list));
  return (
    <>
      <div className="car-list">
        {cars.map((c, i) => {
          const mine = !!me && c.people.includes(me);
          return (
            <div key={c.id} className={"card plain car-card" + (mine ? " mine" : "")} style={{ "--accent": c.color }}>
              <CarIcon color={c.color} size={50} />
              <div className="car-body">
                <div className="car-name">{t("carN", { n: i + 1 })}{c.name ? "・" + c.name : ""}{mine ? <span className="tag you-tag">{t("yourCar")}</span> : null}</div>
                <div className="tl-note">{c.people.length ? whoLabel(lang, c.people) : t("noOne")}</div>
              </div>
              {editing ? <button className="edit-btn" onClick={() => setEd({ i })}>{t("edit")}</button> : null}
            </div>
          );
        })}
      </div>
      {free.length && cars.length ? <p className="hint">{t("unassigned", { x: free.join(lang === "en" ? ", " : "、") })}</p> : null}
      {editing ? <button className="btn ghost full" onClick={() => setEd({ i: null })}>{t("addCar")}</button> : null}
      {ed ? (
        <CarSheet car={ed.i == null ? null : cars[ed.i]} idx={ed.i == null ? cars.length : ed.i} onClose={() => setEd(null)}
          onSave={(car) => {
            // 一個人只可以坐一架車
            const others = cars.map((c) => (c.id === car.id ? c : { ...c, people: c.people.filter((p) => !car.people.includes(p)) }));
            write(ed.i == null ? [...others, car] : others.map((c) => (c.id === car.id ? car : c)));
            setEd(null);
          }}
          onDelete={() => { write(cars.filter((_, j) => j !== ed.i)); setEd(null); }} />
      ) : null}
    </>
  );
}

function Stay({ editing, onToggleEdit }) {
  const t = useT();
  const raw = useShared("trip/stays");
  const stays = toList(raw === undefined || raw === null ? STAYS_SEED : raw).sort((a, b) => (a.order || 0) - (b.order || 0));
  const [ed, setEd] = useState(null); // {id} | {id:null}
  const [fed, setFed] = useState(null); // {i} | {i:null}
  const cur = ed && ed.id ? stays.find((x) => x.id === ed.id) : null;
  const flights = FLIGHTS.map((f, i) => ({ ...f, id: f.id || "f" + i }));
  const writeFlights = (arr) => store.set("trip/config/flights", arr);

  return (
    <div className="page">
      <div className="page-head">
        <BookingArt />
        <div><h1 className="title left">{t("bookTitle")}</h1><p className="subtitle left">{[t("flights"), DRIVE.on ? t("cars") : null, t("stayTitle")].filter(Boolean).join("・")}</p></div>
      </div>

      <h2 className="sec">{t("flights")}</h2>
      <div className="flights">
        {flights.map((f, i) => <FlightCard key={f.id} f={f} onEdit={editing ? () => setFed({ i }) : null} />)}
      </div>
      {editing ? <button className="btn full ghost" onClick={() => setFed({ i: null })}>{t("addFlightBtn")}</button> : null}

      {DRIVE.on ? (
        <>
          <h2 className="sec">{t("cars")}</h2>
          <CarList editing={editing} />
        </>
      ) : null}

      <h2 className="sec">{t("stayTitle")}</h2>
      {stays.map((s) => <StayCard key={s.id} s={s} editing={editing} onEdit={() => setEd({ id: s.id })} />)}
      {editing ? <button className="btn full ghost" onClick={() => setEd({ id: null })}>{t("addStay")}</button> : null}

      {ed ? (
        <StayEditor
          stay={cur}
          onClose={() => setEd(null)}
          onSave={(v) => { store.set(`trip/stays/${ed.id || uid()}`, v); setEd(null); }}
          onDelete={() => { store.remove(`trip/stays/${ed.id}`); setEd(null); }}
        />
      ) : null}
      {fed ? (
        <FlightSheet flight={fed.i == null ? null : flights[fed.i]} onClose={() => setFed(null)}
          onSave={(f) => { const arr = [...flights]; if (fed.i == null) arr.push(f); else arr[fed.i] = f; writeFlights(arr); setFed(null); }}
          onDelete={() => { writeFlights(flights.filter((_, j) => j !== fed.i)); setFed(null); }} />
      ) : null}
      <EditToggle editing={editing} onToggle={onToggleEdit} />
    </div>
  );
}

/* ---------------- 公數袋 v2：每組夾現金＋有人碌卡，按份數攤分 ---------------- */
// 分類（顏色已用 validator 檢查；「其他」刻意用中性灰）
const CATS = [["食", "c_food"], ["油／泊車", "c_car"], ["住宿", "c_stay"], ["門票", "c_ticket"], ["交通", "c_transport"], ["超市", "c_super"], ["其他", "c_other"]];
const CAT_COLOR = { 食: "#E07A66", "油／泊車": "#4C9FD0", 住宿: "#C76FA6", 門票: "#D9A22E", 交通: "#9878CF", 超市: "#7DB866", 其他: "#857E78" };
const CUSTOM_COLORS = ["#3E9E92", "#B0835A", "#6C7FD1", "#D46A8C", "#8FA14A"];
const allSplit = () => GROUPS.map((g) => g.id).join("");
const sharesOf = (id) => (groupOf(id) ? groupOf(id).members.length : 0);
const pctOf = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

// 全部分類（內置＋自訂）
function useCats() {
  const raw = useShared("trip/kitty/cats");
  const custom = toList(raw).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const list = [
    ...CATS.slice(0, -1).map(([zh, key]) => ({ id: zh, key, color: CAT_COLOR[zh] })),
    ...custom.map((c, i) => ({ id: c.name, custom: c.id, color: CUSTOM_COLORS[i % CUSTOM_COLORS.length] })),
    { id: "其他", key: "c_other", color: CAT_COLOR["其他"] },
  ];
  return list;
}
const catInfo = (cats, c) => cats.find((x) => x.id === c) || cats[cats.length - 1];
const catName = (lang, cats, c) => { const x = cats.find((y) => y.id === c); return x && x.key ? tr(lang, x.key) : c || tr(lang, "c_other"); };

// 計數：每組應付份額、已俾、結餘，同埋點樣找數
function computeKitty(cashList, expenses) {
  const rows = {};
  GROUPS.forEach((g) => { rows[g.id] = { g, shares: g.members.length, cash: 0, card: 0, owe: 0 }; });
  cashList.forEach((c) => { if (rows[c.g]) rows[c.g].cash += Number(c.amt) || 0; });
  let cashSpent = 0, cardSpent = 0;
  expenses.forEach((e) => {
    const amt = Number(e.amt) || 0;
    const payer = e.payer || "kitty";
    if (payer === "kitty") cashSpent += amt; else { cardSpent += amt; if (rows[payer]) rows[payer].card += amt; }
    const split = (e.split || allSplit()).split("").filter((id) => rows[id]);
    const tot = split.reduce((s, id) => s + rows[id].shares, 0) || 1;
    split.forEach((id) => { rows[id].owe += (amt * rows[id].shares) / tot; });
  });
  const cashIn = Object.values(rows).reduce((s, r) => s + r.cash, 0);
  const left = cashIn - cashSpent;
  const list = Object.values(rows).map((r) => ({ ...r, bal: r.cash + r.card - r.owe }));
  const debt = [];
  const cred = [];
  if (left > 0.5) debt.push({ who: "kitty", amt: left });
  list.forEach((r) => { if (r.bal < -0.5) debt.push({ who: r.g.id, amt: -r.bal }); else if (r.bal > 0.5) cred.push({ who: r.g.id, amt: r.bal }); });
  const moves = [];
  let i = 0, j = 0;
  while (i < debt.length && j < cred.length) {
    const x = Math.min(debt[i].amt, cred[j].amt);
    if (x >= 1) moves.push({ from: debt[i].who, to: cred[j].who, amt: Math.round(x) });
    debt[i].amt -= x; cred[j].amt -= x;
    if (debt[i].amt < 0.5) i += 1;
    if (cred[j].amt < 0.5) j += 1;
  }
  return { rows: list, cashIn, cashSpent, cardSpent, spent: cashSpent + cardSpent, left, moves };
}
const whoName = (lang, id) => (id === "kitty" ? tr(lang, "kittyCash") : pick(lang, groupOf(id), "name"));
// WhatsApp 用：分類 emoji、組別顏色波波
const CAT_EMOJI = { 食: "🍜", "油／泊車": "⛽", 住宿: "🏨", 門票: "🎟️", 交通: "🚃", 超市: "🛒", 其他: "📦" };
function colorDot(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "⚪";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
  if (d < 0.08) return mx > 0.6 ? "⚪" : "⚫";
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return h < 18 || h >= 335 ? "🔴" : h < 42 ? "🟠" : h < 70 ? "🟡" : h < 170 ? "🟢" : h < 255 ? "🔵" : "🟣";
}

// ¥ 下面細字 HK$
function Yen({ v, rate, cls = "", sign = false }) {
  const n = Number(v) || 0;
  const s = sign ? (n >= 0 ? "+" : "−") : "";
  return (
    <span className={"yen " + cls}>
      <span className="yen-main">{s}{yen(Math.abs(n))}</span>
      <span className="yen-hk">≈ {s}{hkd(Math.abs(n), rate)}</span>
    </span>
  );
}

// 金額輸入：¥ 一直喺度
function YenInput({ value, onChange, label, big }) {
  return (
    <label className={"yen-input" + (big ? " big" : "")}>
      <span className="yen-sym" aria-hidden="true">¥</span>
      <input inputMode="numeric" pattern="[0-9]*" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))} aria-label={label} placeholder="0" />
    </label>
  );
}

function Seg({ value, options, onChange, label, full }) {
  return (
    <div className={"seg" + (full ? " full" : "")} role="group" aria-label={label}>
      {options.map(([v, txt]) => (
        <button key={v} type="button" className={value === v ? "on" : ""} aria-pressed={value === v} onClick={() => onChange(v)}>{txt}</button>
      ))}
    </div>
  );
}

// 邊個俾：2×2 大格
function PayerPicker({ value, onChange }) {
  const t = useT();
  const lang = useLang();
  const opts = [{ id: "kitty", title: t("kittyCash"), sub: t("kittyCashSub"), color: "#F6D27A", icon: "¥" }, ...GROUPS.map((g) => ({ id: g.id, title: t("cardOf", { g: pick(lang, g, "name") }), sub: g.members.join(lang === "en" ? ", " : "、"), color: g.color, icon: <CardIcon /> }))];
  return (
    <div className="payer-grid" role="radiogroup" aria-label={t("whoPaid")}>
      {opts.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={"payer" + (value === o.id ? " on" : "")} style={{ "--accent": o.color }} onClick={() => onChange(o.id)}>
          <span className="payer-icon">{o.icon}</span>
          <span className="payer-txt"><b>{o.title}</b><small>{o.sub}</small></span>
        </button>
      ))}
    </div>
  );
}

function SplitPicker({ value, onChange }) {
  const t = useT();
  const lang = useLang();
  const tot = value.split("").reduce((s, id) => s + sharesOf(id), 0);
  const toggle = (id) => {
    const next = value.includes(id) ? value.replace(id, "") : (value + id).split("").sort().join("");
    if (next) onChange(next);
  };
  return (
    <div className="split-grid">
      {GROUPS.map((g) => {
        const on = value.includes(g.id);
        return (
          <button key={g.id} type="button" aria-pressed={on} className={"split" + (on ? " on" : "")} style={{ "--accent": g.color }} onClick={() => toggle(g.id)}>
            <span className="split-check">{on ? "✓" : ""}</span>
            <b>{pick(lang, g, "name")}</b>
            <small>{on ? `${g.members.length}/${tot}` : t("notIncl")}</small>
          </button>
        );
      })}
    </div>
  );
}

function CatPicker({ value, onChange, cats, canAdd }) {
  const t = useT();
  const lang = useLang();
  const addCat = () => {
    const name = (window.prompt(t("newCatQ")) || "").trim();
    if (!name) return;
    if (!cats.some((c) => c.id === name)) store.set(`trip/kitty/cats/${uid()}`, { name, ts: Date.now() });
    onChange(name);
  };
  return (
    <div className="chips">
      {cats.map((c) => (
        <button type="button" key={c.id} className={"chip small" + (value === c.id ? " on" : "")} onClick={() => onChange(c.id)}>
          <span className="key-dot" style={{ background: c.color }} />{c.key ? t(c.key) : c.id}
        </button>
      ))}
      {canAdd ? <button type="button" className="chip small dashed" onClick={addCat}>{t("addCat")}</button> : null}
    </div>
  );
}

// 支出欄位（新增同修改共用）
function ExpenseFields({ v, set, cats, simple }) {
  const t = useT();
  return (
    <>
      <div className="add-row">
        <YenInput value={v.amt} onChange={(x) => set("amt", x)} label={t("amount")} big />
        <input className="input" placeholder={t("item")} value={v.what} onChange={(e) => set("what", e.target.value)} aria-label={t("item")} />
      </div>
      {simple ? null : <div className="fld"><span>{t("whoPaid")}</span><PayerPicker value={v.payer} onChange={(x) => set("payer", x)} /></div>}
      {simple ? null : <div className="fld"><span>{t("splitAmong")}</span><SplitPicker value={v.split} onChange={(x) => set("split", x)} /></div>}
      <div className="fld"><span>{t("category")}</span><CatPicker value={v.cat} onChange={(x) => set("cat", x)} cats={cats} canAdd /></div>
      <div className="fld"><span>{t("whichDay")}</span>
        <div className="chips">{dayList().map((d, i) => <button type="button" key={d.d} className={"chip small" + (v.day === i ? " on" : "")} onClick={() => set("day", i)}>D{i + 1}</button>)}</div>
      </div>
    </>
  );
}
const blankExpense = () => ({ amt: "", what: "", cat: "食", day: Math.max(0, tripDayIndex()), payer: "kitty", split: allSplit() });
function expenseOut(v) {
  const n = Number(String(v.amt).replace(/[^\d]/g, ""));
  if (!n) return null;
  return { amt: n, what: (v.what || "").trim() || v.cat, cat: v.cat, day: v.day, payer: v.payer, split: v.split };
}

function ExpenseSheet({ exp, cats, simple, onClose }) {
  const t = useT();
  const [v, setV] = useState(() => ({ ...blankExpense(), ...exp, amt: String(exp.amt || ""), what: exp.what === exp.cat ? "" : exp.what || "", payer: exp.payer || "kitty", split: exp.split || allSplit(), day: Number(exp.day) || 0 }));
  const set = (k, x) => setV((o) => ({ ...o, [k]: x }));
  return (
    <Sheet title={t("editExp")} onClose={onClose}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); const out = expenseOut(v); if (!out) return; store.set(`trip/kitty/expenses/${exp.id}`, { ...out, ts: exp.ts || Date.now() }); onClose(); }}>
        <ExpenseFields v={v} set={set} cats={cats} simple={simple} />
        <button className="btn full" type="submit">{t("save")}</button>
        <button type="button" className="btn full ghost danger-btn" onClick={() => { if (window.confirm(t("delExp", { x: `${exp.what} ${yen(exp.amt)}` }))) { store.remove(`trip/kitty/expenses/${exp.id}`); onClose(); } }}>{t("del")}</button>
      </form>
    </Sheet>
  );
}

function CashSheet({ g, entry, onClose }) {
  const t = useT();
  const lang = useLang();
  const [amt, setAmt] = useState(entry ? String(entry.amt) : "");
  const [note, setNote] = useState(entry ? entry.note || "" : "");
  const save = (e) => {
    e.preventDefault();
    const n = Number(amt);
    if (!n) return;
    store.set(`trip/kitty/cash/${entry ? entry.id : uid()}`, { g: g.id, amt: n, note: note.trim(), ts: entry ? entry.ts || Date.now() : Date.now() });
    onClose();
  };
  return (
    <Sheet title={t(entry ? "editCashFor" : "addCashFor", { g: pick(lang, g, "name") })} onClose={onClose}>
      <form className="form" onSubmit={save}>
        <div className="fld"><span>{t("cashAmt")}</span><YenInput value={amt} onChange={setAmt} label={t("cashAmt")} big /></div>
        <label className="fld"><span>{t("note")}</span><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("cashNoteEg")} /></label>
        <button className="btn full" type="submit">{t("save")}</button>
        {entry ? <button type="button" className="btn full ghost danger-btn" onClick={() => { if (window.confirm(t("delExp", { x: yen(entry.amt) }))) { store.remove(`trip/kitty/cash/${entry.id}`); onClose(); } }}>{t("del")}</button> : null}
      </form>
    </Sheet>
  );
}

// 支出分佈：撳開／收埋
function SpendChart({ expenses, cats, rate }) {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = usePersist("hok-chart-open", false);
  const [by, setBy] = usePersist("hok-chart-by", "cat");
  const total = expenses.reduce((s, e) => s + (Number(e.amt) || 0), 0);

  const catRows = cats.map((c) => ({ key: c.id, label: catName(lang, cats, c.id), color: c.color, amt: 0 }));
  expenses.forEach((e) => { const r = catRows.find((x) => x.key === e.cat) || catRows[catRows.length - 1]; r.amt += Number(e.amt) || 0; });
  const cr = catRows.filter((r) => r.amt > 0).sort((a, b) => (a.key === "其他") - (b.key === "其他") || b.amt - a.amt);
  const dayRows = dayList().map((d, i) => ({ key: i, label: `D${i + 1}・${d.d}`, color: "#4C9FD0", amt: 0 }));
  expenses.forEach((e) => { const r = dayRows[Number(e.day) || 0]; if (r) r.amt += Number(e.amt) || 0; });
  const rows = by === "cat" ? cr : dayRows;
  const max = Math.max(1, ...rows.map((r) => r.amt));

  return (
    <div className={"card plain chart" + (open ? " open" : "")}>
      <button className="chart-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>
          <span className="ks-l">{t("whereMoney")}</span>
          <Yen v={total} rate={rate} cls="chart-total" />
        </span>
        <span className="chev" aria-hidden="true"><Chevron dir={open ? "up" : "down"} /></span>
      </button>
      {total > 0 ? (
        <div className="stack" role="img" aria-label={cr.map((r) => `${r.label} ${pctOf(r.amt, total)}%`).join(", ")} onClick={() => setOpen(!open)}>
          {cr.map((r) => <span key={r.key} className="stack-seg" style={{ flexGrow: r.amt, background: r.color }} title={`${r.label} ${yen(r.amt)} (${pctOf(r.amt, total)}%)`} />)}
        </div>
      ) : <div className="empty">{t("noExp")}</div>}
      {!open && total > 0 ? (
        <div className="legend">
          {cr.slice(0, 4).map((r) => <span key={r.key}><span className="key-dot" style={{ background: r.color }} />{r.label} {pctOf(r.amt, total)}%</span>)}
        </div>
      ) : null}
      {open && total > 0 ? (
        <>
          <Seg full label={t("viewBy")} value={by} onChange={setBy} options={[["cat", t("byCat")], ["day", t("byDay")]]} />
          <ul className="chart-rows">
            {rows.map((r) => (
              <li key={r.key}>
                <span className="cr-label">{by === "cat" ? <span className="key-dot" style={{ background: r.color }} /> : null}{r.label}</span>
                <span className="cr-track"><span className="cr-fill" style={{ width: `${(r.amt / max) * 100}%`, background: r.color }} /></span>
                <span className="cr-amt">{yen(r.amt)}</span>
                <span className="cr-pct">{r.amt ? pctOf(r.amt, total) + "%" : "–"}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function SettleCards({ R, rate }) {
  const t = useT();
  const lang = useLang();
  return (
    <div className="settle-cards">
      {R.rows.map((r) => (
        <div key={r.g.id} className="card plain settle-card" style={{ "--accent": r.g.color }}>
          <div className="sc-head">
            <span className="grp-dot" style={{ background: r.g.color }}>{r.g.id}</span>
            <span className="cash-who">{r.g.members.join(lang === "en" ? ", " : "、")}</span>
            <span className="muted small">{t("sharesN", { n: r.shares })}</span>
          </div>
          <div className="sc-grid">
            <div><span className="ks-l">{t("paidTotal")}</span><Yen v={r.cash + r.card} rate={rate} /><small className="muted">{t("cashInS")} {yen(r.cash)} + {t("cardS")} {yen(r.card)}</small></div>
            <div><span className="ks-l">{t("oweS")}</span><Yen v={r.owe} rate={rate} /></div>
          </div>
          <div className={"sc-bal " + (r.bal >= 0 ? "pos" : "neg")}>
            <span>{r.bal >= 0 ? t("getBack") : t("payMore")}</span>
            <Yen v={Math.abs(r.bal)} rate={rate} cls="right" />
          </div>
        </div>
      ))}
    </div>
  );
}

const CalIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <rect x="2.5" y="4" width="15" height="13.5" rx="3" fill="#fff" stroke="#3E3A39" strokeWidth="2" />
    <path d="M2.5 8.5 H17.5" stroke="#3E3A39" strokeWidth="2" />
    <path d="M6.5 2.2 V5.6 M13.5 2.2 V5.6" stroke="#3E3A39" strokeWidth="2" strokeLinecap="round" />
    <rect x="5.5" y="11" width="3.2" height="3" rx=".8" fill="#F2A497" />
  </svg>
);
const YenIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <circle cx="10" cy="10" r="8" fill="#F6D27A" stroke="#3E3A39" strokeWidth="2" />
    <path d="M6.6 5.4 L10 9.6 L13.4 5.4 M10 9.6 V15 M7 10.8 H13 M7 13.2 H13" fill="none" stroke="#3E3A39" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SortArrow = ({ up, on }) => (
  <svg viewBox="0 0 12 18" width="10" height="16" className={"sort-arrow" + (up ? " up" : "") + (on ? "" : " off")} aria-hidden="true">
    <path d="M6 2 V15 M2 11 L6 15 L10 11" fill="none" stroke="#3E3A39" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const FoldIcon = ({ open }) => (
  <svg viewBox="0 0 16 18" width="16" height="18" aria-hidden="true">
    <path d={open ? "M3.5 2.5 L8 6.5 L12.5 2.5 M3.5 15.5 L8 11.5 L12.5 15.5" : "M3.5 6.5 L8 2.5 L12.5 6.5 M3.5 11.5 L8 15.5 L12.5 11.5"} fill="none" stroke="#3E3A39" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SORTS = { new: ["date", "desc"], old: ["date", "asc"], high: ["amt", "desc"], low: ["amt", "asc"] };

// 支出紀錄：按日／按分類／全部，最新喺最頂
function ExpenseList({ expenses, editing, cats, rate, onEdit, simple }) {
  const t = useT();
  const lang = useLang();
  const [gb, setGb] = usePersist("hok-exp-group", "day");
  const [sortBy, setSortBy] = usePersist("hok-exp-sort", "new");
  const [closed, setClosed] = usePersist("hok-exp-closed", {});
  const sum = (items) => items.reduce((s, e) => s + (Number(e.amt) || 0), 0);
  const latest = (items) => Math.max(0, ...items.map((e) => e.ts || 0));
  const itemCmp = {
    new: (x, y) => (y.ts || 0) - (x.ts || 0),
    old: (x, y) => (x.ts || 0) - (y.ts || 0),
    high: (x, y) => (Number(y.amt) || 0) - (Number(x.amt) || 0),
    low: (x, y) => (Number(x.amt) || 0) - (Number(y.amt) || 0),
  }[sortBy] || ((x, y) => (y.ts || 0) - (x.ts || 0));

  let groups;
  if (gb === "all") groups = [{ key: "all", title: t("allExp"), items: expenses }];
  else if (gb === "day") {
    groups = dayList().map((d, i) => ({ key: i, order: i, title: `Day ${i + 1}・${d.d}（${weekday(lang, d.w)}）`, items: expenses.filter((e) => (Number(e.day) || 0) === i) }))
      .filter((g) => g.items.length);
  } else if (gb === "payer" && !simple) {
    groups = [{ id: "kitty", color: "#F6D27A" }, ...GROUPS.map((g) => ({ id: g.id, color: g.color }))]
      .map((o) => ({ key: o.id, title: o.id === "kitty" ? t("kittyCash") : t("cardOf", { g: pick(lang, groupOf(o.id), "name") }), color: o.color, items: expenses.filter((e) => (e.payer || "kitty") === o.id) }))
      .filter((g) => g.items.length);
  } else {
    groups = cats.map((c) => ({ key: c.id, title: catName(lang, cats, c.id), color: c.color, items: expenses.filter((e) => (catInfo(cats, e.cat).id) === c.id) }))
      .filter((g) => g.items.length);
  }
  // 組嘅次序跟排序方式
  groups.forEach((g) => g.items.sort(itemCmp));
  groups.sort((x, y) => {
    if (sortBy === "high") return sum(y.items) - sum(x.items);
    if (sortBy === "low") return sum(x.items) - sum(y.items);
    if (gb === "day") return sortBy === "old" ? x.order - y.order : y.order - x.order;
    return sortBy === "old" ? latest(x.items) - latest(y.items) : latest(y.items) - latest(x.items);
  });

  const ck = (key) => `${gb}:${key}`;
  const isClosed = (key) => !!closed[ck(key)];
  const toggle = (key) => setClosed({ ...closed, [ck(key)]: !isClosed(key) });
  const allClosed = groups.length > 0 && groups.every((g) => isClosed(g.key));
  const setAll = (v) => { const next = { ...closed }; groups.forEach((g) => { next[ck(g.key)] = v; }); setClosed(next); };

  // 排序：撳日期／金額；再撳一下就倒轉。字唔郁，只係箭咀轉方向
  const [sKey, sDir] = SORTS[sortBy] || SORTS.new;
  const [tip, setTip] = useState("");
  const tipT = useRef(null);
  useEffect(() => () => clearTimeout(tipT.current), []);
  const sortTap = (k) => {
    const next = k === "date" ? (sKey === "date" && sortBy === "new" ? "old" : "new") : (sKey === "amt" && sortBy === "high" ? "low" : "high");
    setSortBy(next);
    setTip(t("tip_" + next));
    clearTimeout(tipT.current);
    tipT.current = setTimeout(() => setTip(""), 1400);
  };

  return (
    <div className="exp-wrap">
      <div className="exp-head">
        <h2 className="sec">{t("expenses", { n: expenses.length })}</h2>
        <div className="sort-btns">
          {tip ? <span key={tip} className="sort-tip" role="status">{tip}</span> : null}
          <button type="button" className={"sort-btn" + (sKey === "date" ? " on" : "")} onClick={() => sortTap("date")} aria-label={t("sortDate") + (sKey === "date" ? "：" + t("tip_" + sortBy) : "")} title={t("sortDate")}>
            <CalIcon /><SortArrow up={sKey === "date" && sDir === "asc"} on={sKey === "date"} />
          </button>
          <button type="button" className={"sort-btn" + (sKey === "amt" ? " on" : "")} onClick={() => sortTap("amt")} aria-label={t("sortAmt") + (sKey === "amt" ? "：" + t("tip_" + sortBy) : "")} title={t("sortAmt")}>
            <YenIcon /><SortArrow up={sKey === "amt" && sDir === "asc"} on={sKey === "amt"} />
          </button>
          <button type="button" className="sort-btn fold" disabled={groups.length < 2} onClick={() => setAll(!allClosed)} aria-label={allClosed ? t("expandAll") : t("collapseAll")} title={allClosed ? t("expandAll") : t("collapseAll")}>
            <FoldIcon open={!allClosed} />
          </button>
        </div>
      </div>
      <Seg full label={t("groupBy")} value={gb} onChange={setGb} options={simple ? [["day", t("byDay")], ["cat", t("byCat")], ["all", t("all")]] : [["day", t("byDay")], ["cat", t("byCat")], ["payer", t("byPayer")], ["all", t("all")]]} />
      {expenses.length === 0 ? <div className="card plain empty">{t("noExp")}</div> : null}
      {groups.map((grp) => {
        const shut = isClosed(grp.key);
        return (
          <div key={grp.key} className={"exp-group" + (shut ? " shut" : "")}>
            <button type="button" className="exp-ghead" onClick={() => toggle(grp.key)} aria-expanded={!shut}>
              <span className="gh-left"><Chevron dir={shut ? "right" : "down"} size={15} />{grp.color ? <span className="key-dot" style={{ background: grp.color }} /> : null}{grp.title}</span>
              <span className="muted">{grp.items.length}・<b>{yen(sum(grp.items))}</b></span>
            </button>
            {shut ? null : (
              <ul className="exp-list fold-in">
                {grp.items.map((e) => {
                  const p = e.payer || "kitty";
                  const g = groupOf(p);
                  const sp = e.split || allSplit();
                  const ci = catInfo(cats, e.cat);
                  const Tag = editing ? "button" : "div";
                  return (
                    <li key={e.id}>
                      <Tag className={"card exp" + (editing ? " tappable" : "")} onClick={editing ? () => onEdit(e) : undefined} type={editing ? "button" : undefined}>
                        <span className="key-dot big" style={{ background: ci.color }} aria-hidden="true" />
                        <span className="exp-main">
                          <span className="exp-what">{e.what === e.cat ? catName(lang, cats, e.cat) : e.what}</span>
                          <span className="exp-meta">
                            {gb !== "day" ? <span className="tag tiny" style={{ background: "#F4EFE8" }}>D{(Number(e.day) || 0) + 1}</span> : null}
                            {gb !== "cat" ? <span className="tag tiny" style={{ background: "#F4EFE8" }}>{catName(lang, cats, e.cat)}</span> : null}
                            {gb === "payer" || simple ? null : <span className="tag tiny" style={{ background: g ? g.color : "#F6D27A" }}>{p === "kitty" ? t("kittyCash") : t("cardOf", { g: pick(lang, g, "name") })}</span>}
                            {sp !== allSplit() && !simple ? <span className="tag tiny ghost-tag">{t("onlyFor", { g: sp.split("").join("+") })}</span> : null}
                          </span>
                        </span>
                        <Yen v={e.amt} rate={rate} cls="exp-amt right" />
                        {editing ? <span className="exp-edit" aria-hidden="true">›</span> : null}
                      </Tag>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
      {editing && expenses.length ? <p className="hint center">{t("tapToEdit")}</p> : null}
    </div>
  );
}

function Money({ editing, askUnlock, goSettings, onToggleEdit }) {
  const t = useT();
  const lang = useLang();
  const kitty = useShared("trip/kitty");
  const k = kitty || {};
  const rate = k.rate || 0.052;
  const cats = useCats();
  const cashList = toList(k.cash).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const expenses = toList(k.expenses).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const R = computeKitty(cashList, expenses);

  const [nv, setNv] = useState(blankExpense);
  const [editExp, setEditExp] = useState(null);
  const [cashSheet, setCashSheet] = useState(null); // {g, entry}
  const [msg, setMsg] = useState("");
  const [rateDraft, setRateDraft] = useState(null);
  const fileRef = useRef(null);
  const P = "trip/kitty";
  const flash = (x) => { setMsg(x); setTimeout(() => setMsg(""), 1800); };
  const setN = (key, x) => setNv((o) => ({ ...o, [key]: x }));

  const addExpense = (e) => {
    e.preventDefault();
    const out = expenseOut(nv);
    if (!out) return;
    store.set(`${P}/expenses/${uid()}`, { ...out, ts: Date.now() });
    setNv((o) => ({ ...o, amt: "", what: "" }));
    flash(t("logged", { x: yen(out.amt) }));
  };

  const simple = FEAT.kitty === "log";
  const summary = () => {
    const nm = (id) => whoName(lang, id);
    const L = lang === "en";
    const title = L ? TRIP.titleEn : TRIP.title;
    const jst = new Date(Date.now() + (new Date().getTimezoneOffset() + 540) * 60000);
    const stamp = `🕒 ${L ? "As of" : "截至"} ${jst.getMonth() + 1}/${jst.getDate()} ${String(jst.getHours()).padStart(2, "0")}:${String(jst.getMinutes()).padStart(2, "0")}`;
    const line = "━━━━━━━━━━━━";
    const byCat = {};
    expenses.forEach((e) => { const c = catInfo(cats, e.cat).id; byCat[c] = (byCat[c] || 0) + (Number(e.amt) || 0); });
    const catLines = Object.entries(byCat).sort((a2, b2) => b2[1] - a2[1]).map(([c, v]) => `${CAT_EMOJI[c] || "🏷️"} ${catName(lang, cats, c)}　*${yen(v)}*（${pctOf(v, R.spent)}%）`);
    if (simple) {
      const byDay = dayList().map((d, i) => [d, i, expenses.filter((e) => (Number(e.day) || 0) === i).reduce((n, e) => n + (Number(e.amt) || 0), 0)]).filter((x) => x[2] > 0);
      return [`💴 *${title}・${t("moneyLog")}*`, stamp, line,
        `🧾 ${t("spentAll")}：*${yen(R.spent)}*（≈ ${hkd(R.spent, rate)}）・${t("nPayments", { n: expenses.length })}`, "",
        `📊 *${t("whereMoney")}*`, ...catLines, "",
        `📅 *${t("byDay")}*`, ...byDay.map(([d, i, v]) => `D${i + 1} ${d.d}：*${yen(v)}*`)].join("\n");
    }
    return [
      `💰 *${title}・${t("kitty")}*`, stamp, line,
      `💴 ${t("cashLeft")}：*${yen(R.left)}*（≈ ${hkd(R.left, rate)}）`,
      `🧾 ${t("spentAll")}：*${yen(R.spent)}*（≈ ${hkd(R.spent, rate)}）`,
      `　💵 ${t("byCash")} ${yen(R.cashSpent)}・💳 ${t("byCard")} ${yen(R.cardSpent)}`,
      ...(catLines.length ? ["", `📊 *${t("whereMoney")}*`, ...catLines] : []),
      "", `👥 *${L ? "By group" : "各組"}*`,
      ...R.rows.flatMap((r) => [
        `${colorDot(r.g.color)} *${pick(lang, r.g, "name")}*（${t("sharesN", { n: r.shares })}）`,
        `　${t("cashInS")} ${yen(r.cash)}・${t("cardS")} ${yen(r.card)}・${t("oweS")} ${yen(r.owe)}`,
        `　${r.bal >= 0 ? "✅ " + t("getBack") : "⚠️ " + t("payMore")} *${yen(Math.abs(r.bal))}*`,
      ]),
      ...(R.moves.length ? ["", `🔁 *${t("howSettle")}*`, ...R.moves.map((m) => `• ${nm(m.from)} → ${nm(m.to)}：*${yen(m.amt)}*`)] : ["", `🎉 ${t("allEven")}`]),
    ].join("\n");
  };
  const copySummary = async () => {
    try { await navigator.clipboard.writeText(summary()); flash(t("copiedWA")); }
    catch (e) { window.prompt("", summary()); }
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(k, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hokkaido-kitty.json";
    a.click();
  };
  const importJson = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d.expenses) throw new Error("bad");
        if (window.confirm(t("importQ"))) { store.set(P, d); flash(t("imported")); }
      } catch (err) { flash(t("badFile")); }
    };
    r.readAsText(f);
    e.target.value = "";
  };
  const usedPct = R.cashIn ? Math.min(100, (R.cashSpent / R.cashIn) * 100) : 0;

  return (
    <div className="page">
      <div className="page-head">
        <PurseArt />
        <div className="ph-body">
          <div className="ph-row"><h1 className="title left">{simple ? t("moneyLog") : t("kitty")}</h1><EditToggle editing={editing} onToggle={onToggleEdit} variant="pill" /></div>
          <p className="subtitle left">{simple ? t("logSub") : (
            <>{lang === "en" ? "Split by shares: " : "按份數攤分："}{GROUPS.map((g, i) => (
              <span key={g.id} className="nowrap">{i ? (lang === "en" ? " · " : "・") : ""}{pick(lang, g, "name")}{lang === "en" ? ` ×${g.members.length}` : `${g.members.length}份`}</span>
            ))}</>
          )}</p>
        </div>
      </div>

      {simple ? (
        <div className="card kitty-sum">
          <div className="ks-big">
            <div className="ks-l">{t("spentAll")}</div>
            <Yen v={R.spent} rate={rate} cls="big" />
            <div className="ks-l">{t("nPayments", { n: expenses.length })}</div>
          </div>
        </div>
      ) : (
      <div className="card kitty-sum">
        <div className="ks-big">
          <div className="ks-l">{t("cashLeft")}</div>
          <Yen v={R.left} rate={rate} cls={"big" + (R.left < 0 ? " neg" : "")} />
        </div>
        <div className="ks-row">
          <div><div className="ks-l">{t("cashIn")}</div><Yen v={R.cashIn} rate={rate} /></div>
          <div><div className="ks-l">{t("byCash")}</div><Yen v={R.cashSpent} rate={rate} /></div>
          <div><div className="ks-l">{t("byCard")}</div><Yen v={R.cardSpent} rate={rate} /></div>
        </div>
        <div className="bar" aria-label={`${Math.round(usedPct)}%`}><div className="bar-fill coral" style={{ width: usedPct + "%" }} /></div>
        {R.left < 0 ? <div className="ks-foot warn">{t("short")}</div> : null}
      </div>
      )}

      <SpendChart expenses={expenses} cats={cats} rate={rate} />

      {editing ? (
        <form className="card plain exp-form" onSubmit={addExpense}>
          <h2 className="form-title">{t("addExp")}</h2>
          <ExpenseFields v={nv} set={setN} cats={cats} simple={simple} />
          <button className="btn full" type="submit">{t("logIt")}</button>
          {msg ? <div className="toast" role="status">{msg}</div> : null}
        </form>
      ) : null}

      {kitty === undefined ? <div className="card plain empty">{t("loading")}</div> : (
        <ExpenseList expenses={expenses} editing={editing} cats={cats} rate={rate} onEdit={setEditExp} simple={simple} />
      )}

      {simple ? null : (<>
      <h2 className="sec">{t("cashInTitle")}</h2>
      <div className="cash-grid">
        {GROUPS.map((g) => {
          const mine = cashList.filter((c) => c.g === g.id);
          const sum = mine.reduce((s, c) => s + (Number(c.amt) || 0), 0);
          return (
            <div key={g.id} className="card plain cash-card" style={{ "--accent": g.color }}>
              <div className="cash-head">
                <span className="grp-dot" style={{ background: g.color }}>{g.id}</span>
                <span className="cash-who">{g.members.join(lang === "en" ? ", " : "、")}</span>
                <Yen v={sum} rate={rate} cls="cash-sum right" />
              </div>
              {mine.length ? (
                <ul className="cash-list">
                  {mine.map((c) => (
                    <li key={c.id}>
                      {editing ? (
                        <button className="cash-item" onClick={() => setCashSheet({ g, entry: c })}>
                          <span>{yen(c.amt)}{c.note ? <span className="muted">・{c.note}</span> : null}</span><span className="exp-edit">›</span>
                        </button>
                      ) : <span className="cash-item">{yen(c.amt)}{c.note ? <span className="muted">・{c.note}</span> : null}</span>}
                    </li>
                  ))}
                </ul>
              ) : null}
              {editing ? <button className="link-btn" onClick={() => setCashSheet({ g, entry: null })}>{t("addCash")}</button> : null}
            </div>
          );
        })}
      </div>

      <h2 className="sec">{t("settle")}</h2>
      <SettleCards R={R} rate={rate} />
      <p className="hint">{t("settleHint")}</p>

      <h2 className="sec">{t("howSettle")}</h2>
      <div className="card plain">
        {R.moves.length === 0 ? <div className="empty">{t("allEven")}</div> : (
          <ul className="moves">
            {R.moves.map((m, i) => (
              <li key={i}>
                <span className="mv-who">{whoName(lang, m.from)}</span>
                <span className="mv-arrow">→</span>
                <span className="mv-who">{whoName(lang, m.to)}</span>
                <Yen v={m.amt} rate={rate} cls="mv-amt right" />
              </li>
            ))}
          </ul>
        )}
        <div className="hint">{t("settleNow")}</div>
      </div>
      </>)}

      <h2 className="sec">{t("shareBackup")}</h2>
      <div className="card plain">
        <button className="btn full" onClick={copySummary}>{t("copySum")}</button>
        {!editing && msg ? <div className="toast" role="status">{msg}</div> : null}
        <button className="btn ghost full mt8" onClick={goSettings}>{t("exportMore")}</button>
        <label className="rate">
          {t("rate")}
          {editing ? (
            <input className="input tiny" inputMode="decimal" value={rateDraft ?? rate} onChange={(e) => setRateDraft(e.target.value)}
              onBlur={() => { const v = Number(rateDraft); if (v > 0) store.set(`${P}/rate`, v); setRateDraft(null); }} aria-label={t("rate")} />
          ) : <b>{rate}</b>}
          {t("hkd")}
        </label>
      </div>

      {editExp ? <ExpenseSheet exp={editExp} cats={cats} simple={simple} onClose={() => setEditExp(null)} /> : null}
      {cashSheet ? <CashSheet g={cashSheet.g} entry={cashSheet.entry} onClose={() => setCashSheet(null)} /> : null}
    </div>
  );
}

/* ---------------- 設定 ---------------- */
const DAY_ICONS = ["fireworks", "clock", "canal", "lake", "crab", "onsen", "plane"];
const PARTS = [["days", "p_days"], ["kitty", "p_kitty"], ["todo", "p_todo"], ["stays", "p_stays"], ["config", "p_config"]];

function download(name, text, type) {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const csvCell = (v) => { const s = String(v == null ? "" : v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

function SetCard({ title, children, locked, askUnlock }) {
  const t = useT();
  return (
    <section className="card plain set-card">
      <h2 className="set-title">{title}</h2>
      {children}
      {locked ? <button className="lock-note inline" onClick={askUnlock}><LockIcon open={false} /> {t("unlockToEdit")}</button> : null}
    </section>
  );
}

function GroupsEditor({ cfg, editing }) {
  const t = useT();
  const lang = useLang();
  const fromCfg = () => Object.entries((cfg && cfg.groups) || defaultConfig().groups)
    .map(([id, g]) => ({ id, name: g.name || id, en: g.en || "", dest: g.dest || "", destEn: g.destEn || "", color: g.color || GROUP_COLORS[0], members: (Array.isArray(g.members) ? g.members : Object.values(g.members || {})).filter(Boolean), order: g.order || 0 }))
    .sort((a, b) => a.order - b.order);
  const [draft, setDraft] = useState(fromCfg);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (!dirty) setDraft(fromCfg()); }, [cfg]); // eslint-disable-line react-hooks/exhaustive-deps

  const upd = (i, patch) => { setDraft(draft.map((g, j) => (j === i ? { ...g, ...patch } : g))); setDirty(true); setErr(""); };
  const addGroup = () => {
    const used = new Set(draft.map((g) => g.id));
    const id = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").find((c) => !used.has(c));
    if (!id) return;
    setDraft([...draft, { id, name: `${id}組`, en: `Group ${id}`, dest: "", destEn: "", color: nthColor(draft.length, draft.map((g) => g.color)), members: [""], order: draft.length }]);
    setDirty(true);
  };
  const save = () => {
    const names = draft.flatMap((g) => g.members.map((m) => m.trim()).filter(Boolean));
    if (draft.some((g) => !g.members.some((m) => m.trim()))) { setErr(t("errEmptyGroup")); return; }
    if (new Set(names).size !== names.length) { setErr(t("errDupName")); return; }
    const out = {};
    draft.forEach((g, i) => { out[g.id] = { name: g.name.trim() || g.id, en: g.en.trim(), dest: g.dest, destEn: g.destEn, color: g.color, members: g.members.map((m) => m.trim()).filter(Boolean), order: i }; });
    store.set("trip/config/groups", out);
    setDirty(false);
  };
  const total = draft.reduce((s, g) => s + g.members.filter((m) => m.trim()).length, 0);

  return (
    <>
      <p className="hint">{t("groupsHint", { n: total })}</p>
      {draft.map((g, i) => (
        <div key={g.id} className="grp-edit" style={{ "--accent": g.color }}>
          <div className="ge-head">
            <span className="grp-dot" style={{ background: g.color }}>{g.id}</span>
            {editing ? (
              <>
                <input className="input" value={g.name} onChange={(e) => upd(i, { name: e.target.value })} aria-label={t("groupName")} />
                <input className="input" value={g.en} onChange={(e) => upd(i, { en: e.target.value })} placeholder="English" aria-label={t("groupNameEn")} />
              </>
            ) : <b>{pick(lang, { name: g.name, en: { name: g.en } }, "name")}</b>}
            <span className="muted small nowrap">{t("sharesN", { n: g.members.filter((m) => m.trim()).length })}</span>
          </div>
          {editing ? <ColorPick value={g.color} onChange={(c) => upd(i, { color: c })} /> : null}
          <div className="members">
            {g.members.map((m, j) => (
              editing ? (
                <span key={j} className="member-edit">
                  <input className="input tiny-name" value={m} onChange={(e) => upd(i, { members: g.members.map((x, k) => (k === j ? e.target.value : x)) })} aria-label={t("personName")} placeholder={t("personName")} />
                  <button type="button" className="x small" aria-label={t("del")} onClick={() => upd(i, { members: g.members.filter((_, k) => k !== j) })}>×</button>
                </span>
              ) : <span key={j} className="person paid">{m}</span>
            ))}
            {editing ? <button type="button" className="chip small dashed" onClick={() => upd(i, { members: [...g.members, ""] })}>{t("addPerson")}</button> : null}
          </div>
          {editing && draft.length > 1 ? (
            <button type="button" className="link-btn danger" onClick={() => { if (window.confirm(t("delGroupQ", { g: g.name }))) { setDraft(draft.filter((_, k) => k !== i)); setDirty(true); } }}>{t("delGroup")}</button>
          ) : null}
        </div>
      ))}
      {editing ? (
        <>
          <button type="button" className="btn ghost full" onClick={addGroup}>{t("addGroup")}</button>
          {err ? <div className="warn center">{err}</div> : null}
          <button type="button" className="btn full" disabled={!dirty} onClick={save}>{dirty ? t("saveGroups") : t("saved")}</button>
        </>
      ) : null}
    </>
  );
}

function TripDates({ cfg, days, editing }) {
  const t = useT();
  const [start, setStart] = useState(TRIP.startDate);
  const [n, setN] = useState(TRIP.nDays);
  useEffect(() => { setStart(TRIP.startDate); setN(TRIP.nDays); }, [cfg]);
  const changed = start !== TRIP.startDate || n !== TRIP.nDays;
  const apply = () => {
    const lost = days.slice(n).filter((d) => asArray(d.stops).length).length;
    if (lost && !window.confirm(t("cutDaysQ", { n: lost }))) return;
    const old = TRIP.startDate, oldN = TRIP.nDays;
    TRIP.startDate = start; TRIP.nDays = n;
    const labels = dayList();
    TRIP.startDate = old; TRIP.nDays = oldN;
    const arr = labels.map((lab, i) => ({ ...(days[i] || { title: `Day ${i + 1}`, icon: DAY_ICONS[i % DAY_ICONS.length], stops: [] }), d: lab.d, w: lab.w }));
    store.update({ "trip/config/start": start, "trip/config/nDays": n, "trip/days": arr });
  };
  return (
    <>
      <div className="date-grid">
        <label className="fld"><span>{t("startDate")}</span><input className="input date" type="date" value={start} disabled={!editing} onChange={(e) => e.target.value && setStart(e.target.value)} /></label>
        <div className="fld"><span>{t("nDays")}</span>
          <div className="stepper">
            <button type="button" disabled={!editing || n <= 1} onClick={() => setN(n - 1)} aria-label="−">−</button>
            <b>{n}</b>
            <button type="button" disabled={!editing || n >= 30} onClick={() => setN(n + 1)} aria-label="+">＋</button>
          </div>
        </div>
      </div>
      {editing && changed ? <button className="btn full" onClick={apply}>{t("applyDates")}</button> : null}
    </>
  );
}

function PinEditor({ editing }) {
  const t = useT();
  const [v, setV] = useState("");
  const [ok, setOk] = useState(false);
  if (!editing) return <p className="hint">{t("pinHint")}</p>;
  return (
    <form className="add-row" onSubmit={(e) => { e.preventDefault(); if (/^\d{4,6}$/.test(v)) { store.set("trip/config/pin", v); setV(""); setOk(true); setTimeout(() => setOk(false), 1800); } }}>
      <input className="input" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ""))} placeholder={t("newPin")} aria-label={t("newPin")} />
      <button className="btn" type="submit" disabled={!/^\d{4,6}$/.test(v)}>{ok ? "✓" : t("save")}</button>
    </form>
  );
}

function PrivateLink({ editing }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  let key = "";
  try { key = localStorage.getItem(KEY_STORE) || ""; } catch (e) { /* ignore */ }
  const isPrivate = String(store.base || "").startsWith("trips/");
  const link = key ? `${window.location.origin}${window.location.pathname}#k=${key}` : "";

  const create = async () => {
    if (!window.confirm(t("makeLinkQ"))) return;
    setBusy(true);
    try {
      const data = await store.once("trip");
      const k = newKey();
      await store.rawSet(`trips/${k}`, data || {});
      localStorage.setItem(KEY_STORE, k);
      window.location.replace(`${window.location.pathname}#k=${k}`);
      window.location.reload();
    } catch (e) { setMsg(t("linkFail")); setBusy(false); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(link); setMsg(t("copied")); setTimeout(() => setMsg(""), 1500); } catch (e) { window.prompt("", link); } };

  if (isPrivate) {
    return (
      <>
        <p className="ok-line">🔒 {t("privateOn")}</p>
        <div className="link-box">{link}</div>
        <div className="row2">
          <button className="btn ghost" onClick={copy}>{t("copyLink")}</button>
          <a className="btn wa-btn" href={"https://wa.me/?text=" + encodeURIComponent(t("linkMsg") + "\n" + link)} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
        {msg ? <div className="toast">{msg}</div> : null}
        <p className="hint">{t("privateHint")}</p>
      </>
    );
  }
  return (
    <>
      <p className="warn-line">⚠️ {t("publicNow")}</p>
      {editing ? <button className="btn full" disabled={busy} onClick={create}>{busy ? "…" : t("makeLink")}</button> : null}
      {msg ? <div className="warn center">{msg}</div> : null}
    </>
  );
}

function ExportBox({ editing }) {
  const t = useT();
  const lang = useLang();
  const all = useShared("trip");
  const [sel, setSel] = useState(() => Object.fromEntries(PARTS.map(([k]) => [k, true])));
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const flash = (x) => { setMsg(x); setTimeout(() => setMsg(""), 2000); };
  const chosen = PARTS.filter(([k]) => sel[k]).map(([k]) => k);
  const stamp = new Date().toISOString().slice(0, 10);

  const exportJson = () => {
    const out = { app: "hokkaido-trip", exported: new Date().toISOString() };
    chosen.forEach((k) => { out[k] = (all || {})[k] || null; });
    download(`hokkaido-${chosen.length === PARTS.length ? "all" : chosen.join("-")}-${stamp}.json`, JSON.stringify(out, null, 2), "application/json");
  };
  const exportCsv = () => {
    const k = (all && all.kitty) || {};
    const cats = toList(k.cats);
    const rows = toList(k.expenses).sort((a, b) => (Number(a.day) || 0) - (Number(b.day) || 0) || (a.ts || 0) - (b.ts || 0));
    const head = lang === "en" ? ["Day", "Date", "Item", "Category", "Amount (JPY)", "Paid by", "Split between"] : ["日", "日期", "項目", "分類", "金額（日元）", "邊個俾", "邊幾組分"];
    const dl = dayList();
    const lines = [head, ...rows.map((e) => {
      const p = e.payer || "kitty";
      const catDisp = CATS.find(([zh]) => zh === e.cat) ? tr(lang, CATS.find(([zh]) => zh === e.cat)[1]) : (cats.find((c) => c.name === e.cat) || {}).name || e.cat;
      return [`D${(Number(e.day) || 0) + 1}`, (dl[Number(e.day) || 0] || {}).d || "", e.what, catDisp, e.amt, whoName(lang, p), (e.split || allSplit()).split("").join("+")];
    })];
    download(`hokkaido-expenses-${stamp}.csv`, "﻿" + lines.map((r) => r.map(csvCell).join(",")).join("\n"), "text/csv");
  };
  const importJson = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        let d = JSON.parse(r.result);
        if (d.expenses && !d.kitty) d = { kitty: d }; // 舊版公數袋備份
        const parts = chosen.filter((k) => d[k] != null);
        if (!parts.length) { flash(t("nothingToImport")); return; }
        if (!window.confirm(t("importPartsQ", { x: parts.map((k) => t(PARTS.find(([p]) => p === k)[1])).join("、") }))) return;
        const map = {};
        parts.forEach((k) => { map[`trip/${k}`] = d[k]; });
        store.update(map);
        flash(t("imported"));
      } catch (err) { flash(t("badFile")); }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  return (
    <>
      <div className="chips">
        {PARTS.map(([k, label]) => (
          <button key={k} type="button" className={"chip small" + (sel[k] ? " on" : "")} aria-pressed={!!sel[k]} onClick={() => setSel({ ...sel, [k]: !sel[k] })}>{sel[k] ? "✓ " : ""}{t(label)}</button>
        ))}
      </div>
      <div className="row2">
        <button className="btn" disabled={!chosen.length || !all} onClick={exportJson}>{t("exportJson")}</button>
        <button className="btn ghost" disabled={!all} onClick={exportCsv}>{t("exportCsv")}</button>
      </div>
      {editing ? (
        <>
          <button className="btn ghost full mt8" disabled={!chosen.length} onClick={() => fileRef.current && fileRef.current.click()}>{t("importJson")}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
        </>
      ) : null}
      {msg ? <div className="toast" role="status">{msg}</div> : null}
      <p className="hint">{t("exportHint")}</p>
    </>
  );
}

/* ---------- 設定：旅程資料／航班／功能 ---------- */
function TripInfoEditor({ cfg, editing }) {
  const t = useT();
  const init = () => ({ title: TRIP.title || "", titleEn: TRIP.titleEn || "", subtitle: TRIP.subtitle || "", subtitleEn: TRIP.subtitleEn || "",
    depart: (() => { try { const d = new Date(TRIP.departISO); const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 16); } catch (e) { return ""; } })() });
  const [f, setF] = useState(init);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (!dirty) setF(init()); }, [cfg]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setDirty(true); };
  const save = () => {
    const map = { "trip/config/title": f.title.trim() || null, "trip/config/titleEn": f.titleEn.trim() || null, "trip/config/subtitle": f.subtitle.trim() || null, "trip/config/subtitleEn": f.subtitleEn.trim() || null };
    if (f.depart) { const d = new Date(f.depart); if (!isNaN(d)) map["trip/config/depart"] = d.toISOString(); }
    store.update(map);
    setDirty(false);
  };
  return (
    <div className="form">
      <label className="fld"><span>{t("tripTitle")}</span><input className="input" value={f.title} onChange={set("title")} disabled={!editing} /></label>
      <label className="fld"><span>{t("tripTitleEn")}</span><input className="input" value={f.titleEn} onChange={set("titleEn")} disabled={!editing} /></label>
      <label className="fld"><span>{t("tripSub")}</span><input className="input" value={f.subtitle} onChange={set("subtitle")} disabled={!editing} placeholder={t("subtitle")} /></label>
      <label className="fld"><span>{t("tripSubEn")}</span><input className="input" value={f.subtitleEn} onChange={set("subtitleEn")} disabled={!editing} /></label>
      <label className="fld"><span>{t("departAt")}</span><input className="input date" type="datetime-local" value={f.depart} onChange={set("depart")} disabled={!editing} /></label>
      {editing ? <button className="btn full" disabled={!dirty} onClick={save}>{dirty ? t("save") : t("saved")}</button> : null}
    </div>
  );
}

function FeaturesEditor({ editing }) {
  const t = useT();
  const setF = (k, v) => store.set(`trip/config/features/${k}`, v);
  return (
    <>
      <div className="set-row col"><span>{t("featKitty")}</span>
        <Seg full value={FEAT.kitty} onChange={(v) => editing && setF("kitty", v)} label={t("featKitty")} options={[["full", t("kFull")], ["log", t("kLog")], ["off", t("kOff")]]} />
      </div>
      <p className="hint">{t("featKittyHint")}</p>
      <div className="set-row"><span>{t("bookTitle")}</span><Seg value={FEAT.stays ? "on" : "off"} onChange={(v) => editing && setF("stays", v === "on")} label={t("bookTitle")} options={[["on", t("on")], ["off", t("off")]]} /></div>
      <div className="set-row"><span>{t("todo")}</span><Seg value={FEAT.todo ? "on" : "off"} onChange={(v) => editing && setF("todo", v === "on")} label={t("todo")} options={[["on", t("on")], ["off", t("off")]]} /></div>
    </>
  );
}

function ScenePicker() {
  const t = useT();
  const cur = sceneNow();
  const season = seasonOf(TRIP.startDate);
  return (
    <>
      <div className="scene-grid">
        {SCENES.map((sc) => (
          <button key={sc} type="button" className={"scene-opt" + (cur === sc ? " on" : "")} aria-pressed={cur === sc} onClick={() => store.set("trip/config/scene", sc)}>
            <HeroArt scene={sc} season={season} drive={DRIVE.on} cars={DRIVE.cars.slice(0, 3)} still />
            <span>{t("sc_" + sc)}</span>
          </button>
        ))}
      </div>
      <p className="hint">{t("seasonAuto", { s: t("se_" + season) })}</p>
    </>
  );
}
function DriveEditor({ editing }) {
  const t = useT();
  return (
    <>
      <div className="set-row"><span>{t("selfDriveQ")}</span>
        <Seg value={DRIVE.on ? "on" : "off"} onChange={(v) => store.set("trip/config/drive", driveOut(v === "on", DRIVE.cars))} label={t("selfDrive")} options={[["on", t("yes")], ["off", t("no")]]} />
      </div>
      {DRIVE.on ? <CarList editing={editing} /> : null}
      <p className="hint">{DRIVE.on ? t("driveHint") : t("noDriveHint")}</p>
    </>
  );
}
function MePicker() {
  const { me, setMe } = useMe();
  return (
    <div className="chips">
      {GROUPS.flatMap((g) => g.members.map((p) => (
        <button key={p} type="button" className={"chip small person-chip" + (me === p ? " on" : "")} style={{ "--accent": g.color }} aria-pressed={me === p} onClick={() => setMe(me === p ? "" : p)}>{p}</button>
      )))}
    </div>
  );
}

function Settings({ editing, setEditing, askUnlock, lang, setLang, h12, setH12, cfg, days, pin }) {
  const t = useT();
  const forget = () => { try { localStorage.removeItem(PIN_OK); } catch (e) { /* ignore */ } setEditing(false); };
  return (
    <div className="page">
      <h1 className="title left">{t("settings")}</h1>

      <section className={"card plain edit-row" + (editing ? " on" : "")}>
        <div>
          <b>{editing ? t("editOn") : t("editOff")}</b>
          <p className="hint">{editing ? t("editOnHint") : t("editOffHint")}</p>
        </div>
        <EditToggle editing={editing} onToggle={() => (editing ? setEditing(false) : askUnlock())} variant="pill" />
      </section>

      <SetCard title={t("display")}>
        <div className="set-row"><span>{t("language")}</span><Seg value={lang} onChange={setLang} label={t("language")} options={[["zh", "中文"], ["en", "English"]]} /></div>
        <div className="set-row"><span>{t("timeFmt")}</span><Seg value={h12 ? "12" : "24"} onChange={(v) => setH12(v === "12")} label={t("timeFmt")} options={[["24", "24h"], ["12", "12h"]]} /></div>
        <div className="set-row col"><span>{t("meTitle")}</span><MePicker /></div>
        <p className="hint">{t("meHint")}</p>
      </SetCard>

      {editing ? (
        <>
          <SetCard title={t("tripInfo")}>
            <TripInfoEditor cfg={cfg} editing={editing} />
          </SetCard>

          <SetCard title={t("sceneTitle")}>
            <ScenePicker />
          </SetCard>

          <SetCard title={t("tripDates")}>
            <TripDates cfg={cfg} days={days} editing={editing} />
          </SetCard>

          <SetCard title={t("selfDrive")}>
            <DriveEditor editing={editing} />
          </SetCard>

          <SetCard title={t("features")}>
            <FeaturesEditor editing={editing} />
          </SetCard>

          <SetCard title={t("groupsPeople")}>
            <GroupsEditor cfg={cfg} editing={editing} />
          </SetCard>

          <SetCard title={t("security")}>
            {IS_VAULT ? <p className="hint">{t("vaultHint")}</p> : <PrivateLink editing={editing} />}
            {IS_VAULT ? null : (
              <>
                <h3 className="set-sub">{t("pinTitle2")}</h3>
                <PinEditor editing={editing} />
                <button className="link-btn" onClick={forget}>{t("forgetPin")}</button>
              </>
            )}
          </SetCard>
        </>
      ) : (
        <button type="button" className="card plain locked-card" onClick={askUnlock}>
          <LockIcon open={false} />
          <span>{t("lockedSettings")}</span>
        </button>
      )}

      <SetCard title={t("exportImport")}>
        <ExportBox editing={editing} />
      </SetCard>
    </div>
  );
}

function DeniedScreen() {
  const t = useT();
  const [v, setV] = useState("");
  const go = () => {
    const m = v.match(/k=([A-Za-z0-9_-]{20,})/) || v.trim().match(/^([A-Za-z0-9_-]{20,})$/);
    if (!m) return;
    try { localStorage.setItem(KEY_STORE, m[1]); } catch (e) { /* ignore */ }
    window.location.reload();
  };
  return (
    <div className="page denied">
      <div className="hero card"><HeroArt /></div>
      <h1 className="title">{t("needLink")}</h1>
      <p className="subtitle">{t("needLinkSub")}</p>
      <div className="add-row">
        <input className="input" value={v} onChange={(e) => setV(e.target.value)} placeholder="https://…#k=…" aria-label={t("pasteLink")} />
        <button className="btn" onClick={go}>OK</button>
      </div>
    </div>
  );
}

/* ---------------- App ---------------- */
export default function Root() {
  return TOKYO_LOCKED ? <TokyoLock /> : <App />;
}

function App() {
  const [lang, setLang] = usePersist("hok-lang", "zh");
  const [tab, setTab] = usePersist(IS_VAULT ? "hok-tab-tokyo" : "hok-tab", "home");
  const [day, setDay] = useState(() => Math.max(0, tripDayIndex()));
  const [editing, setEditing] = usePersist(IS_VAULT ? "hok-edit-vault" : "hok-edit2", false);
  const [pinOpen, setPinOpen] = useState(false);
  const [status, setStatus] = useState(store.mode === "local" ? "local" : "connecting");
  const [h12, setH12] = usePersist("hok-h12", false);
  const [denied, setDenied] = useState(false);
  const cfg = useShared("trip/config");
  const [me, setMe] = usePersist("hok-me", "");
  PREF.h12 = h12;
  applyConfig(cfg || defaultConfig());
  if (IS_VAULT && !(cfg && cfg.drive)) { DRIVE.on = false; DRIVE.cars = []; }
  const myG = groupOfPerson(me);
  const meVal = useMemo(() => ({ me: myG ? me : "", setMe, myG }), [me, myG && myG.id, myG && myG.color, myG && myG.members.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => store.onDenied(() => setDenied(true)), []);
  const remoteDays = useShared("trip/days");
  const days = asArray(remoteDays).length ? asArray(remoteDays) : withEn(DAYS);
  const pin = (cfg && cfg.pin) || EDIT_PIN;

  useSeedAndMigrate();
  useEffect(() => store.onStatus(setStatus), []);
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);
  useEffect(() => { if (tab !== "settings" && !visibleTabs().includes(tab)) setTab("home"); });
  useEffect(() => { document.documentElement.lang = lang === "en" ? "en" : "zh-Hant"; document.title = lang === "en" ? TRIP.titleEn : TRIP.title; }, [lang, cfg]);

  // 編輯：呢部手機入過一次 PIN 就記住，之後撳「編輯／完成」切換
  const remembered = () => { try { return localStorage.getItem(PIN_OK) === pin; } catch (e) { return false; } };
  const startEdit = () => { if (IS_VAULT || remembered()) setEditing(true); else setPinOpen(true); };
  const askUnlock = startEdit;
  const pinOk = () => { try { localStorage.setItem(PIN_OK, pin); } catch (e) { /* ignore */ } setEditing(true); setPinOpen(false); };
  const goPlan = (i) => { setDay(i); setTab("plan"); };
  const toggleEdit = () => (editing ? setEditing(false) : startEdit());

  return (
    <LangCtx.Provider value={lang}>
      <MeCtx.Provider value={meVal}>
      <div className={"app" + (lang === "en" ? " en" : "")}>
        <TopNav tab={tab} setTab={setTab} status={status} />
        {IS_VAULT ? <button className="vault-banner" onClick={lockTokyo}><TowerIcon size={19} ink="#FFFCF6" /> {tr(lang, "vaultOn")}・<u>{tr(lang, "vaultLock")}</u></button> : null}
        <main className={IS_VAULT ? "with-vault" : ""}>
          {denied ? <DeniedScreen /> : null}
          {!denied && tab === "home" && <Home goPlan={goPlan} setTab={setTab} days={days} status={status} />}
          {!denied && tab === "plan" && <Plan days={days} day={day < days.length ? day : 0} setDay={setDay} editing={editing} onToggleEdit={toggleEdit} />}
          {!denied && tab === "todo" && <Todo />}
          {!denied && tab === "stay" && <Stay editing={editing} onToggleEdit={toggleEdit} />}
          {!denied && tab === "money" && <Money editing={editing} askUnlock={askUnlock} goSettings={() => setTab("settings")} onToggleEdit={toggleEdit} />}
          {!denied && tab === "settings" && <Settings editing={editing} setEditing={setEditing} askUnlock={askUnlock} lang={lang} setLang={setLang} h12={h12} setH12={setH12} cfg={cfg} days={days} pin={pin} />}
        </main>

        {pinOpen ? <PinSheet pin={pin} onOk={pinOk} onClose={() => setPinOpen(false)} /> : null}
      </div>
      </MeCtx.Provider>
    </LangCtx.Provider>
  );
}
