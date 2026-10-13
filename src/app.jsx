import React, { useEffect, useMemo, useRef, useState } from "react";
import { TRIP, PEOPLE, GROUPS, FLIGHTS, STAY_NEAR, STAYS_SEED, DAYS, BACKUP, TODO_SEED, EDIT_PIN, PREF, GROUP_COLORS, defaultConfig, applyConfig, dayList, fmtT, VAULT_TRIP, VAULT_FLIGHTS, vaultSeed } from "./data.js";
import { HeroArt, DayArt, HouseArt, PurseArt, BagArt, PlaneMini } from "./art.jsx";
import { createStore, newKey, KEY_STORE, IS_VAULT, vaultPath, VAULT_STORE } from "./store.js";
import { LangCtx, useLang, useT, tr, pick, WEEK_EN, EN_DAYS, EN_STOPS, EN_TODO, EN_CAT, withEn } from "./i18n.js";

const store = createStore();
// 私人東京行程：換標題同航班
if (IS_VAULT) {
  Object.assign(TRIP, VAULT_TRIP);
  FLIGHTS.splice(0, FLIGHTS.length, ...VAULT_FLIGHTS);
}
const exitVault = () => { try { sessionStorage.removeItem(VAULT_STORE); } catch (e) { /* ignore */ } window.location.reload(); };
const SCHEMA_V = 8;

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
    { t: "09:30", name: "ATELIER Morihiko（早餐）", q: "ATELIER Morihiko 札幌", move: { t: "car", min: 15 }, note: "Morning set 8:00–11:00；或者 10:00 去森彦本店（舊木屋）", en: { name: "ATELIER Morihiko (breakfast)", note: "Morning set 8:00–11:00; or Morihiko main (old wooden house) from 10:00" } },
    { t: "11:00", name: "Costco 札幌倉庫店", q: "コストコ 札幌倉庫店", move: { t: "car", min: 25 }, note: "約 10:00–20:00；要會員卡；food court 食 lunch。聽日搭機，留意行李重量", en: { name: "Costco Sapporo", note: "About 10:00–20:00; membership card needed; lunch at the food court. Mind luggage weight for tomorrow's flights" } },
    { t: "14:00", name: "札幌站買手信（Stellar Place／大丸）", q: "札幌ステラプレイス", move: { t: "car", min: 30 }, note: "聽日分組走，今日買定手信", en: { name: "Souvenirs at Sapporo Station (Stellar Place / Daimaru)", note: "Groups split tomorrow — shop today" } },
    { t: "16:30", name: "返住宿休息／執行李", q: "札幌市豊平区豊平1条7丁目2-7", move: { t: "car", min: 15 }, en: { name: "Rest & pack at the apartment" } },
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

// 今日：而家做緊邊樣、下一站係邊
function nowNext(days, now) {
  const di = tripDayIndex(now);
  if (di < 0 || !days[di]) return null;
  const jst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  const m = jst.getHours() * 60 + jst.getMinutes();
  const stops = asArray(days[di].stops).map((s, i) => ({ ...s, _i: i })).sort((a, b) => String(a.t).localeCompare(String(b.t)));
  let cur = null, next = null;
  stops.forEach((s) => { if (toMin(s.t) <= m) cur = s; else if (!next) next = s; });
  return { di, m, cur, next, mins: next ? toMin(next.t) - m : 0 };
}
function fmtMins(lang, n) {
  if (n < 60) return lang === "en" ? `${n} min` : `${n} 分鐘`;
  const h = Math.floor(n / 60), r = n % 60;
  return lang === "en" ? `${h}h${r ? " " + r + "m" : ""}` : `${h} 小時${r ? " " + r + " 分" : ""}`;
}

// WhatsApp 分享文字：名、地址、Google Maps
function stopText(lang, s) {
  const lines = [`${fmtT(s.t)} ${pick(lang, s, "name")}`];
  if (s.addr) lines.push(`📍 ${s.addr}`);
  lines.push(`🗺 ${mapsUrl(s.q || s.addr || s.name)}`);
  return lines.join("\n");
}
function dayText(lang, day, idx) {
  const w = lang === "en" ? WEEK_EN[day.w] || day.w : day.w;
  const head = `🍁 *Day ${idx + 1}・${day.d}（${w}）${pick(lang, day, "title")}*`;
  const stops = sortStops(asArray(day.stops)).map((s) => {
    const g = s.group ? "【" + s.group.split("").map((id) => pick(lang, groupOf(id), "name")).join("、") + "】" : "";
    return g + stopText(lang, s);
  });
  return [head, "", stops.join("\n\n")].join("\n");
}
const weekday = (lang, w) => (lang === "en" ? WEEK_EN[w] || w : w);

/* ---------------- 東京私人行程：加入建議（只會做一次） ---------------- */
const HOTEL_Q = "東京都墨田区太平4-13-4";
function tokyoPlan(days, stays) {
  const map = { "trip/meta/v": 100 };
  const s1 = stays && stays.s1;
  if (s1 && !s1.addr) map["trip/stays/s1/addr"] = "〒130-0012 東京都墨田区太平4丁目13-4";
  const W = (t, name, q, move, extra = {}) => ({ t, name, q, ...(move ? { move } : {}), ...extra });
  const d0 = days.findIndex((d) => d.d === "10/16");
  const d1 = days.findIndex((d) => d.d === "10/17");
  const d2 = days.findIndex((d) => d.d === "10/18");
  if (d0 >= 0 && asArray(days[d0].stops).length <= 3) {
    map[`trip/days/${d0}/stops`] = sortStops([...asArray(days[d0].stops),
      W("10:30", "酒店放行李（錦糸町）", HOTEL_Q, { t: "train", min: 60 }, { note: "京急直通都營淺草線去押上／本所吾妻橋，或者搭的士；最近錦糸町站", en: { name: "Drop bags at hotel (Kinshicho)", note: "Keikyu through-train on the Toei Asakusa Line to Oshiage, or taxi; nearest is Kinshicho Stn" } }),
      W("11:30", "根室花丸 KITTE丸の内（攞飛）", "根室花まる KITTE丸の内店", { t: "train", min: 15 }, { must: true, note: "錦糸町搭 JR 總武快速 8 分鐘到東京站；KITTE 5F 機攞飛，掃 QR 用 LINE 等通知", en: { name: "Nemuro Hanamaru, KITTE Marunouchi (get a ticket)", note: "JR Sobu Rapid Kinshicho → Tokyo 8 min; ticket machine on KITTE 5F, LINE alerts via QR" } }),
      W("12:00", "等位：KITTE 天台花園／丸之內散步", "KITTE ガーデン", { t: "walk", min: 2 }, { en: { name: "While waiting: KITTE rooftop garden / Marunouchi stroll" } }),
      W("13:30", "根室花丸 食壽司", "根室花まる KITTE丸の内店", { t: "walk", min: 2 }, { dish: "壽司", en: { name: "Sushi at Nemuro Hanamaru", dish: "Sushi" } }),
      W("15:00", "銀座行街（Uniqlo／GU 旗艦、Dover Street Market）", "ユニクロ 銀座店", { t: "walk", min: 15 }, { en: { name: "Ginza shopping (Uniqlo / GU flagships, Dover Street Market)" } }),
      W("18:30", "返錦糸町 晚飯／休息", HOTEL_Q, { t: "train", min: 20 }, { note: "晴空塔就喺附近，想睇夜景可以行過去", en: { name: "Back to Kinshicho for dinner / rest", note: "Tokyo Skytree is nearby for a night view" } }),
    ]);
  }
  if (d1 >= 0 && asArray(days[d1].stops).length === 0) {
    map[`trip/days/${d1}/title`] = "Cafe＋買波鞋買衫";
    map[`trip/days/${d1}/en`] = { title: "Cafés + sneakers & clothes", intro: "The Hanzomon Line runs direct from Kinshicho to Kiyosumi-Shirakawa and Omotesando." };
    map[`trip/days/${d1}/intro`] = "半藏門線由錦糸町直通清澄白河同表參道，唔使轉車。";
    map[`trip/days/${d1}/stops`] = [
      W("09:30", "清澄白河 coffee（Blue Bottle 清澄白河旗艦店）", "ブルーボトルコーヒー 清澄白河フラッグシップカフェ", { t: "train", min: 10 }, { note: "半藏門線兩個站；附近仲有好多 roaster", en: { name: "Kiyosumi-Shirakawa coffee (Blue Bottle flagship)", note: "Two stops on the Hanzomon Line; lots of roasters nearby" } }),
      W("11:30", "原宿 Cat Street 波鞋（atmos、Nike 原宿、Onitsuka Tiger）", "キャットストリート 原宿", { t: "train", min: 30 }, { must: true, note: "半藏門線直達表參道；週六下晝好多人，早啲去", en: { name: "Harajuku Cat Street sneakers (atmos, Nike Harajuku, Onitsuka Tiger)", note: "Hanzomon Line direct to Omotesando; go early before Saturday crowds" } }),
      W("13:30", "午餐（表參道／原宿）", "表参道", { t: "walk", min: 5 }, { en: { name: "Lunch (Omotesando / Harajuku)" } }),
      W("15:00", "澀谷買衫（PARCO、MIYASHITA PARK）", "渋谷PARCO", { t: "walk", min: 15 }, { en: { name: "Shibuya clothes (PARCO, MIYASHITA PARK)" } }),
      W("18:30", "返錦糸町", HOTEL_Q, { t: "train", min: 30 }, { note: "澀谷搭半藏門線直達", en: { name: "Back to Kinshicho", note: "Hanzomon Line direct from Shibuya" } }),
    ];
  }
  if (d2 >= 0 && asArray(days[d2].stops).length <= 1) {
    map[`trip/days/${d2}/stops`] = sortStops([...asArray(days[d2].stops),
      W("09:00", "慢慢食早餐／執行李", HOTEL_Q, null, { note: "睇航班時間，最遲起飛前3小時到機場", en: { name: "Slow breakfast / pack", note: "Be at the airport 3h before departure" } }),
      W("10:00", "晴空塔 Solamachi 最後買嘢", "東京ソラマチ", { t: "walk", min: 15 }, { en: { name: "Last shopping at Tokyo Skytree Solamachi" } }),
    ]);
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
      if (meta && (meta.v || 0) < 100) {
        if (days === undefined || stays === undefined) return;
        done.current = true;
        store.update(tokyoPlan(asArray(days), stays));
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
          map[`trip/days/${b}/title`] = "札幌 chill day";
          map[`trip/days/${b}/intro`] = "朝早 cafe，Costco，下晝買手信，夜晚 Toriton。";
          map[`trip/days/${b}/en`] = { title: "Easy day in Sapporo", intro: "Café morning, Costco, souvenirs in the afternoon, Toriton for dinner." };
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

function TopNav({ tab, setTab, editing, toggleEdit, status }) {
  const t = useT();
  return (
    <header className="topnav">
      <nav className="topnav-inner" aria-label="menu">
        {TABS.map((id) => (
          <button key={id} className={"nav-btn" + (tab === id ? " on" : "")} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
            {t(id)}
          </button>
        ))}
        <button className={"lock-btn gear" + (tab === "settings" ? " on" : "")} onClick={() => setTab("settings")} aria-label={t("settings")}><GearIcon /></button>
        <button className={"lock-btn" + (editing ? " on" : "")} onClick={toggleEdit} aria-label={editing ? t("lockIt") : t("unlock")} title={t("st_" + status)}>
          <LockIcon open={editing} />
          <span className="sync-dot" style={{ background: STATUS_C[status] }} />
        </button>
      </nav>
    </header>
  );
}
function LockIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d={open ? "M8 11 V7 a4 4 0 0 1 8 -1" : "M8 11 V7 a4 4 0 0 1 8 0 V11"} fill="none" stroke="#3E3A39" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="5" y="11" width="14" height="10" rx="3" fill={open ? "#F6D27A" : "#FFFCF6"} stroke="#3E3A39" strokeWidth="2.6" />
    </svg>
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
function PinSheet({ onOk, onClose, pin: PIN = EDIT_PIN }) {
  const t = useT();
  const [pin, setPin] = useState("");
  const [bad, setBad] = useState(false);
  const press = (k) => {
    if (k === "del") { setPin((p) => p.slice(0, -1)); return; }
    if (k === "clr") { setPin(""); return; }
    const next = (pin + k).slice(0, PIN.length);
    setPin(next);
    setBad(false);
    if (next.length === 4 && !IS_VAULT) {
      vaultPath(next).then((vp) => {
        if (vp) { try { sessionStorage.setItem(VAULT_STORE, vp); } catch (e) { /* ignore */ } window.location.reload(); }
        else if (PIN.length === 4) { if (next === PIN) onOk(); else { setBad(true); setPin(""); } }
      });
      if (PIN.length === 4) return;
    }
    if (next.length === PIN.length) {
      if (next === PIN) setTimeout(onOk, 120);
      else setTimeout(() => { setBad(true); setPin(""); }, 150);
    }
  };
  useEffect(() => {
    const onKey = (e) => { if (/^\d$/.test(e.key)) press(e.key); else if (e.key === "Backspace") press("del"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <Sheet title={t("pinTitle")} onClose={onClose}>
      <div className={"pin-dots" + (bad ? " shake" : "")} aria-live="polite">
        {Array.from({ length: PIN.length }).map((_, i) => <span key={i} className={"pin-dot" + (i < pin.length ? " on" : "")} />)}
      </div>
      <div className="pin-msg">{bad ? t("pinWrong") : " "}</div>
      <div className="keypad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clr", "0", "del"].map((k) => (
          <button key={k} className={"key" + (k.length > 1 ? " fn" : "")} onClick={() => press(k)} aria-label={k === "del" ? <svg viewBox="0 0 34 24" width="38" height="27" aria-hidden="true"><path d="M11 2 H31 Q33 2 33 4 V20 Q33 22 31 22 H11 L2 12 Z" fill="#FFFCF6" stroke="#3E3A39" strokeWidth="2.6" strokeLinejoin="round" /><path d="M16 8 L24 16 M24 8 L16 16" stroke="#3E3A39" strokeWidth="2.8" strokeLinecap="round" /></svg> : k === "clr" ? t("clear") : k}>
            {k === "del" ? <svg viewBox="0 0 34 24" width="38" height="27" aria-hidden="true"><path d="M11 2 H31 Q33 2 33 4 V20 Q33 22 31 22 H11 L2 12 Z" fill="#FFFCF6" stroke="#3E3A39" strokeWidth="2.6" strokeLinejoin="round" /><path d="M16 8 L24 16 M24 8 L16 16" stroke="#3E3A39" strokeWidth="2.8" strokeLinecap="round" /></svg> : k === "clr" ? t("clear") : k}
          </button>
        ))}
      </div>
    </Sheet>
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

function Countdown({ goPlan, days }) {
  const t = useT();
  const lang = useLang();
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
        <div className="cd-foot">{IS_VAULT ? t("vaultDepart") : t("departLine")}</div>
      </div>
    );
  }
  if (di >= 0) {
    return <NowNext nn={nowNext(days, now)} days={days} onOpen={() => goPlan(di)} />;
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

function FlightCard({ f }) {
  const lang = useLang();
  const p = (k) => pick(lang, f, k);
  return (
    <div className="card flight" style={{ "--accent": f.color }}>
      <div className="flight-top"><span className="flight-no">{p("no")}</span><span className="flight-date">{p("date")}</span></div>
      <div className="flight-route">
        <div className="apt"><div className="apt-code">{f.from}</div><div className="apt-name">{p("fromName")}</div><div className="apt-time">{fmtT(p("dep"))}</div></div>
        <div className="fly-path" aria-hidden="true"><span className="fly-plane"><PlaneMini color={f.color} /></span></div>
        <div className="apt right"><div className="apt-code">{f.to}</div><div className="apt-name">{p("toName")}</div><div className="apt-time">{fmtT(f.arr)}</div></div>
      </div>
      <div className="flight-who">{p("who")}{f.note ? <span className="muted">・{f.note}</span> : null}</div>
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

function Home({ goPlan, setTab, days, status }) {
  const t = useT();
  const lang = useLang();
  const now = useNow(30000);
  const di = tripDayIndex(now);
  const showDay = di >= 0 ? di : new Date(TRIP.departISO) > now ? 0 : -1;
  const nn = nowNext(days, now);
  const today = showDay >= 0 ? days[showDay] : null;
  const idx = today ? asArray(today.stops).map((s, i) => ({ ...s, _i: i })).sort((a, b) => String(a.t).localeCompare(String(b.t))) : [];
  return (
    <div className="page">
      <div className="hero card"><HeroArt /></div>
      <h1 className="title">{lang === "en" ? TRIP.titleEn : TRIP.title}</h1>
      <p className="subtitle">{IS_VAULT ? t("vaultSub") : t("subtitle")}</p>
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
        <button className="btn" onClick={() => setTab("stay")}>{t("stayInfo")}</button>
        <button className="btn yellow" onClick={() => setTab("money")}>{t("kitty")}</button>
      </div>
      <FlightsDrawer />
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
        <span className="chev" aria-hidden="true">{open ? "▲" : "▼"}</span>
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

function Plan({ days, day, setDay, editing }) {
  const t = useT();
  const lang = useLang();
  const di = tripDayIndex();
  const data = days[day] || days[0];
  const stops = asArray(data.stops);
  const railRef = useRef(null);
  const [editor, setEditor] = useState(null); // {idx} | "day"
  const [ask, setAsk] = useState(null);
  const now = useNow(30000);
  const nn = nowNext(days, now);
  const isToday = nn && nn.di === day;
  const nowI = isToday && nn.cur ? nn.cur._i : null;
  const nextI = isToday && nn.next ? nn.next._i : null;
  useEffect(() => {
    if (!isToday) return;
    const id = setTimeout(() => {
      const el = document.querySelector(".tl-item.is-now") || document.querySelector(".tl-item.is-next");
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 650);
    return () => clearTimeout(id);
  }, [day]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <button key={d.d} role="tab" aria-selected={i === day} className={"day-pill" + (i === day ? " on" : "")} onClick={() => setDay(i)}>
            <span className="dp-n">Day {i + 1}</span><span className="dp-d">{d.d}</span><span className="dp-w">{weekday(lang, d.w)}{i === di ? "・" + t("today") : ""}</span>
          </button>
        ))}
      </div>

      <div key={day} className="bounce-in">
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
        {editing ? <p className="hint center">{t("dragHint")}</p> : null}

        {sections.map((sec) => (
          <div key={sec.key} className="tl-section">
            {sec.g ? <div className="grp-head" style={{ background: sec.g.color }}>{pick(lang, sec.g, "name")}・{sec.g.members.join(lang === "en" ? ", " : "、")}・{pick(lang, sec.g, "dest")}</div> : null}
            <Timeline stops={sec.stops} editing={editing} showGroup={sec.key === "all"} onEdit={(idx) => setEditor({ idx })} onReorder={onReorder(sec.stops)} nowI={nowI} nextI={nextI} />
          </div>
        ))}
        {editing ? <button className="btn full ghost" onClick={() => setEditor({ idx: null })}>{t("addStop")}</button> : null}
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
    </div>
  );
}

/* ---------------- 待辦清單 ---------------- */
const TODO_CATS = [
  { id: "訂位", color: "#F2A497" }, { id: "租車", color: "#F6D27A" }, { id: "證件", color: "#A8D3E6" },
  { id: "錢", color: "#B9DAA5" }, { id: "行李", color: "#D8C8EA" }, { id: "買嘢", color: "#F7C9D6" }, { id: "其他", color: "#E6DFD7" },
];
const catColor = (c) => (TODO_CATS.find((x) => x.id === c) || TODO_CATS[TODO_CATS.length - 1]).color;
function Todo() {
  const t = useT();
  const lang = useLang();
  const raw = useShared("trip/todo");
  const items = toList(raw).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const [text, setText] = useState("");
  const [newCat, setNewCat] = useState("其他");
  const done = items.filter((i) => i.done).length;
  const used = new Set(items.map((i) => i.cat || "其他"));
  const cats = [...TODO_CATS.map((c) => c.id).filter((c) => used.has(c)), ...[...used].filter((c) => !TODO_CATS.some((x) => x.id === c))];
  const label = (it) => (lang === "en" && it.en ? it.en : it.text);

  const add = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    store.set(`trip/todo/${uid()}`, { text: v, cat: newCat, done: false, ts: Date.now() });
    setText("");
  };

  return (
    <div className="page">
      <div className="page-head">
        <BagArt />
        <div><h1 className="title left">{t("todoTitle")}</h1><p className="subtitle left">{t("doneOf", { a: done, b: items.length })}</p></div>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} /></div>
      <form className="add-row" onSubmit={add}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("addItem")} aria-label={t("addItem")} />
        <button className="btn" type="submit">{t("add")}</button>
      </form>
      <div className="chips cat-pick" role="group" aria-label={t("category")}>
        {TODO_CATS.map((c) => (
          <button type="button" key={c.id} className={"chip small" + (newCat === c.id ? " on-cat" : "")} style={newCat === c.id ? { background: c.color } : null} onClick={() => setNewCat(c.id)}>
            <span className="mini-dot" style={{ background: c.color }} />{lang === "en" ? EN_CAT[c.id] || c.id : c.id}
          </button>
        ))}
      </div>
      {raw === undefined ? <div className="card plain empty">{t("loading")}</div> : null}
      {cats.map((c) => (
        <div key={c}>
          <h2 className="cat-head" style={{ background: catColor(c) }}>{lang === "en" ? EN_CAT[c] || c : c}</h2>
          <ul className="todo-list">
            {items.filter((i) => (i.cat || "其他") === c).map((it) => (
              <li key={it.id} className={"card todo" + (it.done ? " done" : "")} style={{ borderLeftColor: catColor(c) }}>
                <label className="todo-label">
                  <input type="checkbox" checked={!!it.done} onChange={() => store.set(`trip/todo/${it.id}/done`, !it.done)} />
                  <span className="check" aria-hidden="true" />
                  <span className="todo-text">{label(it)}</span>
                </label>
                <button className="x" aria-label={t("del") + " " + label(it)} onClick={() => { if (window.confirm(t("confirmDel", { x: label(it) }))) store.remove(`trip/todo/${it.id}`); }}>×</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="hint">{t("todoHint")}</p>
    </div>
  );
}

/* ---------------- 住宿（可以改） ---------------- */
function StayEditor({ stay, onSave, onDelete, onClose }) {
  const t = useT();
  const [f, setF] = useState({ name: "", addr: "", dates: "", who: "", note: "", ...stay });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    const out = { name: f.name.trim(), addr: f.addr.trim(), dates: f.dates.trim(), who: f.who.trim(), note: (f.note || "").trim(), order: f.order || Date.now() };
    // 中文改咗就唔再用舊英文
    if (stay && stay.en) {
      const en = {};
      Object.entries(stay.en).forEach(([k, v]) => { if (stay[k] === out[k]) en[k] = v; });
      if (Object.keys(en).length) out.en = en;
    }
    onSave(out);
  };
  return (
    <Sheet title={stay ? t("editStay") : t("newStay")} onClose={onClose}>
      <form className="form" onSubmit={save}>
        <label className="fld"><span>{t("stayName")}</span><input className="input" value={f.name} onChange={set("name")} required /></label>
        <label className="fld"><span>{t("stayAddr")}</span><textarea className="input" rows={2} value={f.addr} onChange={set("addr")} placeholder={t("stayAddrEg")} /></label>
        <label className="fld"><span>{t("stayDates")}</span><input className="input" value={f.dates} onChange={set("dates")} placeholder="10/16 → 10/17" /></label>
        <label className="fld"><span>{t("stayWho")}</span><input className="input" value={f.who} onChange={set("who")} /></label>
        <label className="fld"><span>{t("note")}</span><input className="input" value={f.note || ""} onChange={set("note")} /></label>
        <button className="btn full" type="submit">{t("save")}</button>
        {stay ? <button type="button" className="btn full ghost danger-btn" onClick={() => { if (window.confirm(t("confirmDel", { x: stay.name }))) onDelete(); }}>{t("del")}</button> : null}
      </form>
    </Sheet>
  );
}

function StayCard({ s, editing, onEdit }) {
  const t = useT();
  const lang = useLang();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(s.addr); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) { /* ignore */ }
  };
  return (
    <div className="card plain stay">
      <div className="stay-top">
        <div className="tl-name">{pick(lang, s, "name")}</div>
        {editing ? <button className="edit-btn" onClick={onEdit}>{t("edit")}</button> : null}
      </div>
      <div className="tl-note">{[pick(lang, s, "dates"), pick(lang, s, "who")].filter(Boolean).join("・")}</div>
      {s.addr ? <div className="addr">{s.addr}</div> : <div className="addr muted">{t("noAddr")}</div>}
      {s.note ? <div className="tl-note">{s.note}</div> : null}
      {s.addr ? (
        <div className="tl-links">
          <button className="link-btn" onClick={copy}>{copied ? t("copied") : t("copyAddr")}</button>
          <a href={mapsUrl(s.addr)} target="_blank" rel="noreferrer">{t("map")}</a>
          <a href={navUrl(s.addr)} target="_blank" rel="noreferrer" className="go">{t("navBack")}</a>
        </div>
      ) : null}
    </div>
  );
}

function Stay({ editing }) {
  const t = useT();
  const lang = useLang();
  const raw = useShared("trip/stays");
  const stays = toList(raw === undefined || raw === null ? STAYS_SEED : raw).sort((a, b) => (a.order || 0) - (b.order || 0));
  const [ed, setEd] = useState(null); // {id} | {id:null}
  const cur = ed && ed.id ? stays.find((x) => x.id === ed.id) : null;

  return (
    <div className="page">
      <div className="page-head">
        <HouseArt />
        <div><h1 className="title left">{t("stayTitle")}</h1><p className="subtitle left">{stays.length > 0 ? pick(lang, stays[0], "dates") : ""}</p></div>
      </div>
      {stays.map((s) => <StayCard key={s.id} s={s} editing={editing} onEdit={() => setEd({ id: s.id })} />)}
      {editing ? <button className="btn full ghost" onClick={() => setEd({ id: null })}>{t("addStay")}</button> : null}

      <h2 className="sec">{t("nearby")}</h2>
      {STAY_NEAR.map((n) => (
        <div key={n.name} className="card plain">
          <div className="tl-name">{n.name}</div>
          <div className="tl-note">{n.addr}・{pick(lang, n, "note")}</div>
          <div className="tl-links"><a href={mapsUrl(n.name + " " + n.addr)} target="_blank" rel="noreferrer">{t("map")}</a></div>
        </div>
      ))}

      {ed ? (
        <StayEditor
          stay={cur}
          onClose={() => setEd(null)}
          onSave={(v) => { store.set(`trip/stays/${ed.id || uid()}`, v); setEd(null); }}
          onDelete={() => { store.remove(`trip/stays/${ed.id}`); setEd(null); }}
        />
      ) : null}
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
  const opts = [{ id: "kitty", title: t("kittyCash"), sub: t("kittyCashSub"), color: "#F6D27A", icon: "¥" }, ...GROUPS.map((g) => ({ id: g.id, title: t("cardOf", { g: pick(lang, g, "name") }), sub: g.members.join(lang === "en" ? ", " : "、"), color: g.color, icon: "💳" }))];
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
function ExpenseFields({ v, set, cats }) {
  const t = useT();
  return (
    <>
      <div className="add-row">
        <YenInput value={v.amt} onChange={(x) => set("amt", x)} label={t("amount")} big />
        <input className="input" placeholder={t("item")} value={v.what} onChange={(e) => set("what", e.target.value)} aria-label={t("item")} />
      </div>
      <div className="fld"><span>{t("whoPaid")}</span><PayerPicker value={v.payer} onChange={(x) => set("payer", x)} /></div>
      <div className="fld"><span>{t("splitAmong")}</span><SplitPicker value={v.split} onChange={(x) => set("split", x)} /></div>
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

function ExpenseSheet({ exp, cats, onClose }) {
  const t = useT();
  const [v, setV] = useState(() => ({ ...blankExpense(), ...exp, amt: String(exp.amt || ""), what: exp.what === exp.cat ? "" : exp.what || "", payer: exp.payer || "kitty", split: exp.split || allSplit(), day: Number(exp.day) || 0 }));
  const set = (k, x) => setV((o) => ({ ...o, [k]: x }));
  return (
    <Sheet title={t("editExp")} onClose={onClose}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); const out = expenseOut(v); if (!out) return; store.set(`trip/kitty/expenses/${exp.id}`, { ...out, ts: exp.ts || Date.now() }); onClose(); }}>
        <ExpenseFields v={v} set={set} cats={cats} />
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
        <span className="chev" aria-hidden="true">{open ? "▲" : "▼"}</span>
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

// 支出紀錄：按日／按分類／全部，最新喺最頂
function ExpenseList({ expenses, editing, cats, rate, onEdit }) {
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
  } else if (gb === "payer") {
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

  return (
    <div className="exp-wrap">
      <Seg full label={t("groupBy")} value={gb} onChange={setGb} options={[["day", t("byDay")], ["cat", t("byCat")], ["payer", t("byPayer")], ["all", t("all")]]} />
      <div className="exp-tools">
        <span className="tools-label">{t("sortBy")}</span>
        <Seg label={t("sortBy")} value={sortBy} onChange={setSortBy} options={[["new", t("s_new")], ["old", t("s_old")], ["high", t("s_high")], ["low", t("s_low")]]} />
      </div>
      {groups.length > 1 ? (
        <button type="button" className="link-btn fold-all" onClick={() => setAll(!allClosed)}>{allClosed ? t("expandAll") : t("collapseAll")}</button>
      ) : null}
      {expenses.length === 0 ? <div className="card plain empty">{t("noExp")}</div> : null}
      {groups.map((grp) => {
        const shut = isClosed(grp.key);
        return (
          <div key={grp.key} className={"exp-group" + (shut ? " shut" : "")}>
            <button type="button" className="exp-ghead" onClick={() => toggle(grp.key)} aria-expanded={!shut}>
              <span className="gh-left"><span className={"fold-chev" + (shut ? "" : " open")} aria-hidden="true">▸</span>{grp.color ? <span className="key-dot" style={{ background: grp.color }} /> : null}{grp.title}</span>
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
                            {gb === "payer" ? null : <span className="tag tiny" style={{ background: g ? g.color : "#F6D27A" }}>{p === "kitty" ? t("kittyCash") : t("cardOf", { g: pick(lang, g, "name") })}</span>}
                            {sp !== allSplit() ? <span className="tag tiny ghost-tag">{t("onlyFor", { g: sp.split("").join("+") })}</span> : null}
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

function Money({ editing, askUnlock, goSettings }) {
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

  const summary = () => {
    const nm = (id) => whoName(lang, id);
    const L = lang === "en";
    return [
      L ? "💰 *Hokkaido Kitty*" : "💰 *北海道公數袋*",
      `${t("cashLeft")}：${yen(R.left)}（≈ ${hkd(R.left, rate)}）`,
      `${t("spentAll")}：${yen(R.spent)}（${t("byCash")} ${yen(R.cashSpent)}・${t("byCard")} ${yen(R.cardSpent)}）`,
      "",
      L ? "*By group*" : "*各組*",
      ...R.rows.map((r) => `${pick(lang, r.g, "name")}（${r.shares}${L ? " shares" : "份"}）${t("cashInS")} ${yen(r.cash)}・${t("cardS")} ${yen(r.card)}・${t("oweS")} ${yen(r.owe)}・${r.bal >= 0 ? t("getBack") : t("payMore")} ${yen(Math.abs(r.bal))}`),
      ...(R.moves.length ? ["", L ? "*To settle*" : "*點樣找數*", ...R.moves.map((m) => `${nm(m.from)} → ${nm(m.to)}：${yen(m.amt)}`)] : []),
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
        <div><h1 className="title left">{t("kitty")}</h1><p className="subtitle left">{t("kittySub")}</p></div>
      </div>

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

      <SpendChart expenses={expenses} cats={cats} rate={rate} />

      {editing ? (
        <form className="card plain exp-form" onSubmit={addExpense}>
          <h2 className="form-title">{t("addExp")}</h2>
          <ExpenseFields v={nv} set={setN} cats={cats} />
          <button className="btn full" type="submit">{t("logIt")}</button>
          {msg ? <div className="toast" role="status">{msg}</div> : null}
        </form>
      ) : (
        <button className="card plain lock-note" onClick={askUnlock}><LockIcon open={false} /> {t("unlockToLog")}</button>
      )}

      <h2 className="sec">{t("expenses", { n: expenses.length })}</h2>
      {kitty === undefined ? <div className="card plain empty">{t("loading")}</div> : (
        <ExpenseList expenses={expenses} editing={editing} cats={cats} rate={rate} onEdit={setEditExp} />
      )}

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

      {editExp ? <ExpenseSheet exp={editExp} cats={cats} onClose={() => setEditExp(null)} /> : null}
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
    setDraft([...draft, { id, name: `${id}組`, en: `Group ${id}`, dest: "", destEn: "", color: GROUP_COLORS[draft.length % GROUP_COLORS.length], members: [""], order: draft.length }]);
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
          {editing ? (
            <div className="swatches" role="radiogroup" aria-label={t("color")}>
              {GROUP_COLORS.map((c) => <button key={c} type="button" role="radio" aria-checked={g.color === c} className={"swatch" + (g.color === c ? " on" : "")} style={{ background: c }} onClick={() => upd(i, { color: c })} aria-label={c} />)}
            </div>
          ) : null}
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

function Settings({ editing, askUnlock, lang, setLang, h12, setH12, cfg, days }) {
  const t = useT();
  return (
    <div className="page">
      <h1 className="title left">{t("settings")}</h1>

      <SetCard title={t("display")}>
        <div className="set-row"><span>{t("language")}</span><Seg value={lang} onChange={setLang} label={t("language")} options={[["zh", "中文"], ["en", "English"]]} /></div>
        <div className="set-row"><span>{t("timeFmt")}</span><Seg value={h12 ? "12" : "24"} onChange={(v) => setH12(v === "12")} label={t("timeFmt")} options={[["24", "24h"], ["12", "12h"]]} /></div>
        <p className="hint">{t("displayHint")}</p>
      </SetCard>

      <SetCard title={t("tripDates")} locked={!editing} askUnlock={askUnlock}>
        <TripDates cfg={cfg} days={days} editing={editing} />
      </SetCard>

      <SetCard title={t("groupsPeople")} locked={!editing} askUnlock={askUnlock}>
        <GroupsEditor cfg={cfg} editing={editing} />
      </SetCard>

      <SetCard title={t("security")} locked={!editing} askUnlock={askUnlock}>
        {IS_VAULT ? <p className="hint">{t("vaultHint")}</p> : <PrivateLink editing={editing} />}
        <h3 className="set-sub">{t("pinTitle2")}</h3>
        <PinEditor editing={editing} />
      </SetCard>

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
export default function App() {
  const [lang, setLang] = usePersist("hok-lang", "zh");
  const [tab, setTab] = usePersist("hok-tab", "home");
  const [day, setDay] = useState(() => Math.max(0, tripDayIndex()));
  const [editing, setEditing] = usePersist(IS_VAULT ? "hok-edit-vault" : "hok-edit2", IS_VAULT);
  const [pinOpen, setPinOpen] = useState(false);
  const [status, setStatus] = useState(store.mode === "local" ? "local" : "connecting");
  const [h12, setH12] = usePersist("hok-h12", false);
  const [denied, setDenied] = useState(false);
  const cfg = useShared("trip/config");
  PREF.h12 = h12;
  applyConfig(cfg || defaultConfig());
  useEffect(() => store.onDenied(() => setDenied(true)), []);
  const remoteDays = useShared("trip/days");
  const days = asArray(remoteDays).length ? asArray(remoteDays) : withEn(DAYS);

  useSeedAndMigrate();
  useEffect(() => store.onStatus(setStatus), []);
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);
  useEffect(() => { document.documentElement.lang = lang === "en" ? "en" : "zh-Hant"; document.title = lang === "en" ? TRIP.titleEn : TRIP.title; }, [lang]);

  const askUnlock = () => setPinOpen(true);
  const toggleEdit = () => {
    if (editing) { if (window.confirm(tr(lang, "lockConfirm"))) setEditing(false); }
    else askUnlock();
  };
  const goPlan = (i) => { setDay(i); setTab("plan"); };

  return (
    <LangCtx.Provider value={lang}>
      <div className={"app" + (lang === "en" ? " en" : "")}>
        <TopNav tab={tab} setTab={setTab} editing={editing} toggleEdit={toggleEdit} status={status} />
        {editing && !IS_VAULT ? <div className="edit-banner">{tr(lang, "editBanner")}</div> : null}
        {IS_VAULT ? <button className="vault-banner" onClick={exitVault}>🔒 {tr(lang, "vaultOn")}・<u>{tr(lang, "vaultExit")}</u></button> : null}
        <main className={IS_VAULT ? "with-vault" : editing ? "with-banner" : ""}>
          {denied ? <DeniedScreen /> : null}
          {!denied && tab === "home" && <Home goPlan={goPlan} setTab={setTab} days={days} status={status} />}
          {!denied && tab === "plan" && <Plan days={days} day={day < days.length ? day : 0} setDay={setDay} editing={editing} />}
          {!denied && tab === "todo" && <Todo />}
          {!denied && tab === "stay" && <Stay editing={editing} />}
          {!denied && tab === "money" && <Money editing={editing} askUnlock={askUnlock} goSettings={() => setTab("settings")} />}
          {!denied && tab === "settings" && <Settings editing={editing} askUnlock={askUnlock} lang={lang} setLang={setLang} h12={h12} setH12={setH12} cfg={cfg} days={days} />}
        </main>
        {pinOpen ? <PinSheet pin={(cfg && cfg.pin) || EDIT_PIN} onOk={() => { setEditing(true); setPinOpen(false); }} onClose={() => setPinOpen(false)} /> : null}
      </div>
    </LangCtx.Provider>
  );
}
