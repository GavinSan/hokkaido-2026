// ===== 所有行程資料都喺呢個檔，改呢度就得 =====

export const TRIP = {
  title: "北海道七日自駕遊",
  titleEn: "Hokkaido 7-Day Road Trip",
  sub: "楓葉・海鮮・溫泉",
  departISO: "2026-10-10T08:30:00+08:00", // HX690 香港出發
  startDate: "2026-10-10",
  endDate: "2026-10-16",
};

// 解鎖「編輯模式」（改行程、記公數袋）嘅 PIN
export const EDIT_PIN = "0303";

export const PEOPLE =["Gavin", "Athena", "Gionna", "Irene", "Hendy", "PoYan", "Choi"];

export const GROUPS = [
  { id: "A", name: "A組", members: ["Gavin", "Athena"], color: "#F2A497", dest: "去東京", en: { name: "Group A", dest: "to Tokyo" } },
  { id: "B", name: "B組", members: ["Gionna", "Irene", "Hendy"], color: "#A8D3E6", dest: "返香港", en: { name: "Group B", dest: "to Hong Kong" } },
  { id: "C", name: "C組", members: ["PoYan", "Choi"], color: "#B9DAA5", dest: "多留一晚", en: { name: "Group C", dest: "one more night" } },
];

export const FLIGHTS = [
  { id: "f1", no: "HX690", date: "10/10（六）", from: "HKG", fromName: "香港", dep: "08:30", to: "CTS", toName: "新千歲", arr: "14:55", who: "全部7人", color: "#F6D27A", en: { date: "Sat 10/10", fromName: "Hong Kong", toName: "New Chitose", who: "All 7" } },
  { id: "f2", no: "NH50", date: "10/16（五）", from: "CTS", fromName: "新千歲", dep: "07:30", to: "HND", toName: "羽田", arr: "09:05", who: "A組｜Gavin、Athena", color: "#F2A497", en: { date: "Fri 10/16", fromName: "New Chitose", toName: "Haneda", who: "Group A · Gavin, Athena" } },
  { id: "f3", no: "HX691", date: "10/16（五）", from: "CTS", fromName: "新千歲", dep: "15:55", to: "HKG", toName: "香港", arr: "—", who: "B組｜Gionna、Irene、Hendy", color: "#A8D3E6", note: "13:55 check-in", en: { date: "Fri 10/16", fromName: "New Chitose", toName: "Hong Kong", who: "Group B · Gionna, Irene, Hendy" } },
  { id: "f4", no: "待填", date: "10/17（六）", from: "CTS", fromName: "新千歲", dep: "早機", to: "—", toName: "", arr: "—", who: "C組｜PoYan、Choi", color: "#B9DAA5", en: { no: "TBC", dep: "Early", date: "Sat 10/17", fromName: "New Chitose", who: "Group C · PoYan, Choi" } },
];

export const STAY_NEAR = [
  { name: "Lawson 豊平1条店", addr: "豊平1条8丁目2-5", note: "最近便利店，行1分鐘", en: { note: "Nearest convenience store, 1 min walk" } },
];
// 住宿會寫入 Firebase，之後喺 app 改
export const STAYS_SEED = {
  s1: { order: 1, name: "札幌住宿（全程）", addr: "〒062-0901 北海道札幌市豊平区豊平1条7丁目2-7", dates: "10/10 → 10/16 10:00 退房", who: "全部7人",
        en: { name: "Sapporo apartment (whole trip)", dates: "10/10 → 10/16, check out 10:00", who: "All 7" } },
  s2: { order: 2, name: "C組第二間酒店", addr: "", dates: "10/16 → 10/17", who: "PoYan、Choi",
        en: { name: "Group C second hotel", dates: "10/16 → 10/17", who: "PoYan, Choi" } },
};

// move.t: car 自駕 / walk 步行 / plane 飛機 / taxi 的士
export const DAYS = [
  {
    d: "10/10", w: "六", title: "抵達＋百年花火", icon: "fireworks",
    intro: "落機過關攞車大約要2個鐘，17:00 出發。",
    stops: [
      { t: "14:55", name: "新千歲機場", move: { t: "plane", txt: "HX690" }, note: "過關＋攞車約2小時" },
      { t: "17:25", name: "苫小牧漁港西側廣場", q: "苫小牧港 西港区 漁港", move: { t: "car", min: 25 }, note: "早啲到霸位" },
      { t: "19:30", name: "苫小牧百年花火大會", q: "苫小牧港 漁港区", must: true, note: "約一萬發，免費" },
      { t: "21:45", name: "返住宿", q: "札幌市豊平区豊平1条7丁目2-7", move: { t: "car", min: 60 } },
    ],
  },
  {
    d: "10/11", w: "日", title: "札幌市內", icon: "clock",
    intro: "市中心景點之間大部分行路就到。",
    stops: [
      { t: "08:45", name: "POP/iN coffee", q: "POP/iN coffee 札幌 大通西18丁目", move: { t: "car", min: 15 }, note: "早餐｜大通西18丁目" },
      { t: "09:30", name: "北海道神宮・圓山公園", q: "北海道神宮", move: { t: "car", min: 10 }, must: true },
      { t: "11:00", name: "舊道廳赤磚廳舍", q: "北海道庁旧本庁舎", move: { t: "car", min: 10 } },
      { t: "12:30", name: "二条市場", q: "二条市場 札幌", move: { t: "walk", min: 15 }, must: true, dish: "海膽丼" },
      { t: "14:30", name: "狸小路", q: "狸小路商店街", move: { t: "walk", min: 5 } },
      { t: "18:30", name: "成吉思汗だるま本店", q: "だるま本店 札幌 南5条西4", move: { t: "walk", min: 10 }, must: true, note: "要排隊，6點前到" },
      { t: "20:30", name: "薄野散步", q: "すすきの交差点", move: { t: "walk", min: 5 } },
      { t: "21:15", name: "返住宿", q: "札幌市豊平区豊平1条7丁目2-7", move: { t: "car", min: 15 } },
    ],
  },
  {
    d: "10/12", w: "一", title: "小樽", icon: "canal",
    intro: "小樽泊堺町通商店街駐車場（港町7-7），一日最多 ¥1,000。",
    stops: [
      { t: "08:00", name: "Espresso D Works", q: "Espresso D Works COCONO SUSUKINO", move: { t: "car", min: 15 }, note: "COCONO SUSUKINO 1F" },
      { t: "09:45", name: "小樽運河", q: "小樽運河", move: { t: "car", min: 40 }, must: true, note: "泊堺町通商店街駐車場" },
      { t: "11:00", name: "北一硝子・音樂盒堂", q: "小樽オルゴール堂本館", move: { t: "walk", min: 10 } },
      { t: "12:30", name: "壽司屋通午餐", q: "小樽 寿司屋通り", move: { t: "walk", min: 10 }, dish: "海膽、蟹" },
      { t: "14:00", name: "LeTAO 本店", q: "小樽洋菓子舗ルタオ本店", move: { t: "walk", min: 10 }, must: true },
      { t: "15:00", name: "SNOOPY 茶屋", q: "スヌーピー茶屋 小樽店", move: { t: "walk", min: 5 } },
      { t: "18:30", name: "湯咖哩 GARAKU", q: "スープカレー GARAKU 札幌", move: { t: "car", min: 45 }, must: true, book: true },
      { t: "20:15", name: "返住宿", q: "札幌市豊平区豊平1条7丁目2-7", move: { t: "car", min: 15 } },
    ],
  },
  {
    d: "10/13", w: "二", title: "洞爺湖", icon: "lake",
    intro: "08:00 出發，經定山溪、中山峠睇紅葉。",
    stops: [
      { t: "09:00", name: "定山溪・中山峠", q: "中山峠 道の駅", move: { t: "car", min: 60 }, note: "睇紅葉＋食揚げいも" },
      { t: "10:30", name: "洞爺湖サイロ展望台", q: "サイロ展望台 洞爺湖", move: { t: "car", min: 60 }, must: true, note: "俯瞰全個湖" },
      { t: "11:30", name: "昭和新山＋有珠山纜車", q: "有珠山ロープウェイ", move: { t: "car", min: 20 }, must: true, note: "纜車收幾點出發前查" },
      { t: "13:00", name: "洞爺湖溫泉街午餐", q: "洞爺湖温泉", move: { t: "car", min: 15 } },
      { t: "14:30", name: "湖畔散步／遊覽船", q: "洞爺湖汽船", move: { t: "walk", min: 5 } },
      { t: "19:30", name: "根室花丸迴轉壽司", q: "回転寿司 根室花まる JRタワーステラプレイス店", move: { t: "car", min: 120 }, must: true, note: "唔訂得位，現場取票" },
      { t: "21:00", name: "返住宿", q: "札幌市豊平区豊平1条7丁目2-7", move: { t: "car", min: 15 } },
    ],
  },
  {
    d: "10/14", w: "三", title: "札幌美食日", icon: "crab",
    intro: "今日主要食：帝王蟹、白老牛、芭菲。",
    stops: [
      { t: "09:00", name: "白色戀人公園", q: "白い恋人パーク", move: { t: "car", min: 30 }, must: true },
      { t: "11:00", name: "場外市場", q: "札幌場外市場", move: { t: "car", min: 25 }, must: true, dish: "帝王蟹" },
      { t: "12:30", name: "Sapporo Factory", q: "サッポロファクトリー", move: { t: "car", min: 10 } },
      { t: "15:00", name: "藥妝＋Majisand", q: "まじさん 札幌", move: { t: "car", min: 10 }, dish: "水果三文治" },
      { t: "18:00", name: "焼肉徳寿 しんら亭", q: "焼肉徳寿 しんら亭 札幌 南3条西5丁目", move: { t: "walk", min: 10 }, must: true, book: true, dish: "白老牛", note: "南3西5 三条美松ビル2F" },
      { t: "19:45", name: "パフェテリア ミル", q: "パフェテリア ミル 札幌", move: { t: "walk", min: 1 }, dish: "芭菲", note: "同一棟 B1F" },
      { t: "20:45", name: "返住宿", q: "札幌市豊平区豊平1条7丁目2-7", move: { t: "car", min: 15 } },
    ],
  },
  {
    d: "10/15", w: "四", title: "登別溫泉", icon: "onsen",
    intro: "09:00 出發，車程約1小時15分。",
    stops: [
      { t: "10:30", name: "登別地獄谷", q: "登別地獄谷", move: { t: "car", min: 75 }, must: true },
      { t: "11:30", name: "大湯沼＋足湯", q: "大湯沼川天然足湯", move: { t: "walk", min: 15 } },
      { t: "13:00", name: "登別伊達時代村", q: "登別伊達時代村", move: { t: "car", min: 15 } },
      { t: "19:00", name: "Toriton 迴轉壽司", q: "トリトン 手稲店", move: { t: "car", min: 90 }, must: true, book: true, note: "打電話問7人位" },
      { t: "21:00", name: "返住宿", q: "札幌市豊平区豊平1条7丁目2-7", move: { t: "car", min: 30 } },
    ],
  },
  {
    d: "10/16", w: "五", title: "分3組返程", icon: "plane",
    intro: "B、C組 10:00 退房。",
    stops: [
      { t: "05:00", name: "的士去新千歲", q: "新千歳空港", move: { t: "taxi", min: 60 }, group: "A", note: "前一晚預約的士" },
      { t: "07:30", name: "NH50 → 羽田 09:05", q: "新千歳空港", move: { t: "plane", txt: "NH50" }, group: "A", must: true },
      { t: "10:00", name: "退房", q: "札幌市豊平区豊平1条7丁目2-7", group: "BC" },
      { t: "10:45", name: "千歲 Outlet Rera", q: "千歳アウトレットモール・レラ", move: { t: "car", min: 45 }, group: "B" },
      { t: "13:00", name: "機場附近還車（Toyota）", q: "トヨタレンタカー 新千歳空港ポプラ店", move: { t: "car", min: 10 }, group: "B", note: "搭接駁車去機場約9分鐘" },
      { t: "13:55", name: "機場 Check-in", q: "新千歳空港 国際線", group: "B" },
      { t: "15:55", name: "HX691 返香港", q: "新千歳空港 国際線", move: { t: "plane", txt: "HX691" }, group: "B", must: true },
      { t: "10:30", name: "札幌市內還車（ORIX）", q: "オリックスレンタカー 札幌", move: { t: "car", min: 15 }, group: "C", note: "之後去第二間酒店" },
    ],
  },
];

export const BACKUP = [
  { name: "かに王", addr: "白老町竹浦113-13", tel: "0144-87-4575", note: "主要係直銷店，去之前打電話", en: { name: "Kani-O", addr: "Takeura 113-13, Shiraoi", note: "Mainly a direct-sales shop — call first" } },
];

export const TODO_SEED = [
  { text: "訂位：湯咖哩 GARAKU（10/12）", cat: "訂位" },
  { text: "訂位：焼肉徳寿しんら亭（10/14）", cat: "訂位" },
  { text: "打電話：Toriton 7人位（10/15）", cat: "訂位" },
  { text: "ORIX 還車地點改札幌市內店", cat: "租車" },
  { text: "A組預約 10/16 05:00 的士", cat: "租車" },
  { text: "國際車牌＋香港車牌", cat: "證件" },
  { text: "護照、Visit Japan Web", cat: "證件" },
  { text: "日元現金（公數袋）", cat: "錢" },
  { text: "上網卡／eSIM", cat: "行李" },
  { text: "厚外套（札幌10月約 8–17°C）", cat: "行李" },
  { text: "叉電線、尿袋", cat: "行李" },
];

/* ===== 設定（會由 Firebase trip/config 覆蓋） ===== */
TRIP.nDays = 7;
export const PREF = { h12: false }; // 每部手機自己嘅顯示設定
export const GROUP_COLORS = ["#F2A497", "#A8D3E6", "#B9DAA5", "#F6D27A", "#D8C8EA", "#F7C9D6"];
const DEFAULT_GROUPS = GROUPS.map((g) => ({ ...g, members: [...g.members] }));
export const defaultConfig = () => ({
  start: TRIP.startDate,
  nDays: 7,
  groups: Object.fromEntries(DEFAULT_GROUPS.map((g, i) => [g.id, { name: g.name, en: g.en ? g.en.name : "", dest: g.dest || "", destEn: g.en ? g.en.dest : "", color: g.color, members: g.members, order: i }])),
});
// 將雲端設定套用落 TRIP／GROUPS／PEOPLE（原地改，咁其他 import 嘅地方都見到）
export function applyConfig(cfg) {
  const c = cfg || defaultConfig();
  if (c.start) TRIP.startDate = c.start;
  if (c.nDays) TRIP.nDays = Math.max(1, Math.min(30, Number(c.nDays) || 7));
  const groups = Object.entries(c.groups || {})
    .map(([id, g]) => ({ id, name: g.name || id, color: g.color || GROUP_COLORS[0], dest: g.dest || "", members: (Array.isArray(g.members) ? g.members : Object.values(g.members || {})).filter(Boolean), order: g.order || 0,
      en: { name: g.en || g.name || id, dest: g.destEn || "" } }))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  if (groups.length) GROUPS.splice(0, GROUPS.length, ...groups);
  PEOPLE.splice(0, PEOPLE.length, ...GROUPS.flatMap((g) => g.members));
}
// 由開始日期計返每日嘅 MM/DD 同星期
export function dayList() {
  const out = [];
  const [y, m, d] = TRIP.startDate.split("-").map(Number);
  for (let i = 0; i < TRIP.nDays; i += 1) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    out.push({ d: `${dt.getUTCMonth() + 1}/${String(dt.getUTCDate()).padStart(2, "0")}`, w: "日一二三四五六"[dt.getUTCDay()] });
  }
  return out;
}
// 時間顯示：24h 或 12h
export function fmtT(t) {
  if (!PREF.h12 || !/^\d{1,2}:\d{2}$/.test(String(t))) return t;
  const [h, m] = String(t).split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
}

/* ===== 私人東京行程（密碼先睇到）嘅預設 ===== */
export const VAULT_TRIP = { title: "東京三日兩夜", titleEn: "Tokyo 3D2N", departISO: "2026-10-16T07:30:00+09:00" };
export const VAULT_FLIGHTS = [
  { id: "v1", no: "NH50", date: "10/16（五）", from: "CTS", fromName: "新千歲", dep: "07:30", to: "HND", toName: "羽田", arr: "09:05", who: "Gavin、Athena", color: "#F2A497", en: { date: "Fri 10/16", fromName: "New Chitose", toName: "Haneda", who: "Gavin, Athena" } },
  { id: "v2", no: "待填", date: "10/18（日）", from: "TYO", fromName: "東京", dep: "—", to: "YYZ", toName: "多倫多", arr: "—", who: "Gavin、Athena", color: "#A8D3E6", en: { no: "TBC", date: "Sun 10/18", fromName: "Tokyo", toName: "Toronto", who: "Gavin, Athena" } },
];
export function vaultSeed(now) {
  return {
    "trip/meta": { seeded: now, v: 99, vault: true },
    "trip/config": {
      start: "2026-10-16", nDays: 3,
      groups: { A: { name: "我哋", en: "Us", color: "#F2A497", members: ["Gavin", "Athena"], order: 0 } },
    },
    "trip/days": [
      { d: "10/16", w: "五", icon: "plane", title: "札幌 → 東京", intro: "NH50 07:30 新千歲 → 09:05 羽田",
        en: { title: "Sapporo → Tokyo", intro: "NH50 07:30 New Chitose → 09:05 Haneda" },
        stops: [
          { t: "05:00", name: "的士去新千歲", q: "新千歳空港", move: { t: "taxi", min: 60 }, note: "前一晚預約", en: { name: "Taxi to New Chitose", note: "Book the night before" } },
          { t: "07:30", name: "NH50 → 羽田", q: "新千歳空港", move: { t: "plane", txt: "NH50" }, must: true, en: { name: "NH50 → Haneda" } },
          { t: "09:05", name: "抵達羽田", q: "羽田空港 第2ターミナル", en: { name: "Arrive Haneda" } },
        ] },
      { d: "10/17", w: "六", icon: "clock", title: "東京", intro: "解鎖（🔒）之後撳「＋ 加行程」自己加。", en: { title: "Tokyo", intro: "Unlock (🔒) and tap “＋ Add stop” to fill this in." }, stops: [] },
      { d: "10/18", w: "日", icon: "plane", title: "東京 → 多倫多", en: { title: "Tokyo → Toronto" },
        stops: [
          { t: "12:00", name: "飛多倫多（航班待填）", q: "羽田空港", move: { t: "plane", txt: "" }, must: true, note: "改返真正時間同航班", en: { name: "Fly to Toronto (flight TBC)", note: "Update the real time and flight" } },
        ] },
    ],
    "trip/stays": { s1: { order: 1, name: "東京酒店", addr: "", dates: "10/16 → 10/18", who: "Gavin、Athena", en: { name: "Tokyo hotel", dates: "10/16 → 10/18", who: "Gavin, Athena" } } },
    "trip/todo": {
      t0: { text: "訂東京酒店", cat: "訂位", done: false, ts: now, en: "Book Tokyo hotel" },
      t1: { text: "多倫多航班網上 check-in", cat: "證件", done: false, ts: now + 1, en: "Online check-in for Toronto flight" },
      t2: { text: "加拿大 eTA", cat: "證件", done: false, ts: now + 2, en: "Canada eTA" },
    },
    "trip/kitty/rate": 0.052,
  };
}
