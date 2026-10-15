// ===== 中英對照 =====
import React, { createContext, useContext } from "react";

export const LangCtx = createContext("zh");
export const useLang = () => useContext(LangCtx);

const S = {
  // nav
  home: ["首頁", "Home"], plan: ["行程", "Plan"], todo: ["清單", "To-do"], stay: ["預訂", "Travel"], money: ["夾錢", "Kitty"],
  unlock: ["解鎖編輯模式", "Unlock edit mode"], lockIt: ["鎖返編輯模式", "Lock edit mode"],
  lockConfirm: ["鎖返編輯模式？", "Lock edit mode?"],
  editBanner: ["編輯模式中・改嘅嘢全部人即時見到", "Edit mode · changes are live for everyone"],
  // status
  st_online: ["已同步", "Synced"], st_connecting: ["連線中", "Connecting"], st_offline: ["離線（有訊號會自動同步）", "Offline (will sync when back online)"],
  st_error: ["連唔到數據庫", "Can't reach database"], st_local: ["本機模式", "Local only"], everyoneSame: ["・全部人睇到同一份", " · everyone sees the same data"],
  // home
  countdown: ["距離出發仲有", "Departure in"], d: ["日", "d"], h: ["時", "h"], m: ["分", "m"], s: ["秒", "s"],
  departLine: ["10/10（六）08:30 HX690 香港出發", "Sat 10/10 08:30 · HX690 from Hong Kong"],
  onTrip: ["旅程進行中", "On the trip"], dayN: ["第 {n} 日", "Day {n}"], seeToday: ["撳入去睇今日行程 →", "Tap for today's plan →"],
  tripDone: ["旅程完滿結束 🍁", "Trip complete 🍁"], tripDoneSub: ["下次再嚟北海道！", "See you again, Hokkaido!"],
  flights: ["航班", "Flights"], overview: ["七日一覽", "7 days at a glance"], stayInfo: ["航班・住宿", "Flights & stays"], kitty: ["公數袋", "Kitty"],
  subtitle: ["2026・10/10 – 10/16・楓葉・海鮮・溫泉", "2026 · Oct 10–16 · Autumn leaves, seafood, onsen"], nPeopleCars: ["{p}人{c}架車", "{p} people, {c} cars"], nPeople: ["{p}人", "{p} people"],
  // plan
  pickDate: ["揀日期", "Pick a day"], today: ["今日", "Today"], must: ["★ 必去", "★ Must-go"], needBook: ["要訂位", "Book ahead"], booked: ["已訂位 ✓", "Booked ✓"],
  mustEat: ["必食：", "Must-eat: "], map: ["地圖", "Map"], nav: ["導航", "Navigate"], edit: ["改", "Edit"], addStop: ["＋ 加行程", "＋ Add stop"],
  backup: ["後備餐廳", "Backup restaurant"], dragHint: ["按住 ≡ 拖去新位置", "Hold ≡ and drag to reorder"],
  m_car: ["自駕", "Drive"], m_walk: ["步行", "Walk"], m_train: ["鐵路", "Train"], m_plane: ["飛機", "Flight"], m_taxi: ["的士", "Taxi"],
  hr: ["小時", "h"], min: ["分", "min"],
  // editors
  editStop: ["改行程", "Edit stop"], newStop: ["加行程", "Add stop"], time: ["時間", "Time"], place: ["地方", "Place"], placeEg: ["例如：小樽運河", "e.g. Otaru Canal"],
  placeEn: ["英文名（可唔填）", "English name (optional)"], mapQ: ["地圖搜尋字（唔填就用地方名）", "Map search text (defaults to place name)"], mapQEg: ["日文名或地址最準", "Japanese name or address works best"],
  how: ["點去", "Getting there"], noTag: ["唔使標", "None"], flightNo: ["航班", "Flight no."], howLong: ["要幾耐（分鐘）", "Travel time (minutes)"],
  bookedOk: ["已訂好 ✓", "Booked ✓"], dish: ["必食", "Must-eat"], note: ["備註", "Note"], noteEn: ["英文備註（可唔填）", "English note (optional)"],
  groupsOnly: ["只係某幾組去（唔揀＝全部人）", "Only for some groups (none = everyone)"], whichDay: ["邊日", "Day"],
  save: ["儲存", "Save"], del: ["刪除", "Delete"], delStop: ["刪除呢個行程", "Delete this stop"], cancel: ["取消", "Cancel"], close: ["關閉", "Close"],
  confirmDel: ["刪除「{x}」？", "Delete “{x}”?"], dayTitle: ["標題", "Title"], dayIntro: ["簡介", "Intro"], titleEn: ["英文標題", "English title"], introEn: ["英文簡介", "English intro"],
  editDay: ["改標題", "Edit day"], newTime: ["新時間", "New time"], newTimeQ: ["「{x}」改去幾點？", "What time for “{x}”?"], between: ["（{a} 同 {b} 之間）", "(between {a} and {b})"],
  ok: ["確定", "OK"],
  // pin
  pinTitle: ["輸入 PIN 解鎖", "Enter PIN to unlock"], pinWrong: ["PIN 唔啱", "Wrong PIN"], clear: ["清除", "Clear"],
  // todo
  todoTitle: ["待辦清單", "To-do list"], doneOf: ["完成 {a} / {b}", "{a} of {b} done"], addItem: ["加一項…", "Add an item…"], add: ["加", "Add"],
  loading: ["載入中…", "Loading…"], todoHint: ["清單全部人共用，邊個剔咗大家都見到。撳鉛筆可以改內容同揀俾邊組。", "Shared list — everyone sees what's ticked. Tap the pencil to edit or assign it to a group."], other: ["其他", "Other"],
  // stay
  stayTitle: ["住宿", "Stay"], copyAddr: ["複製地址", "Copy address"], copied: ["已複製 ✓", "Copied ✓"], navBack: ["導航去", "Navigate"],
  nearby: ["附近", "Nearby"], addStay: ["＋ 加住宿", "＋ Add stay"], editStay: ["改住宿", "Edit stay"], newStay: ["加住宿", "Add stay"],
  stayName: ["名稱", "Name"], stayAddr: ["地址", "Address"], stayAddrEg: ["日文地址最好，Google Maps 搵得到", "Japanese address works best"],
  stayDates: ["日期", "Dates"], stayWho: ["邊個住", "Who"], noAddr: ["未有地址", "No address yet"],
  // money
  kittySub: ["按份數攤分：A組2份・B組3份・C組2份", "Split by shares: A ×2 · B ×3 · C ×2"], collected: ["總收", "In"], spent: ["已用", "Spent"], left: ["剩餘", "Left"],
  approx: ["剩餘約 {x}・每份已用 {y}", "≈ {x} left · {y} spent per share"], short: ["公數袋現金唔夠，要加錢", "Kitty is short — add cash"],
  addExp: ["記一筆支出", "Log a payment"], amount: ["¥ 金額", "¥ Amount"], item: ["項目（可唔填）", "What (optional)"], logIt: ["記低", "Save"], logged: ["已記低 {x}", "Saved {x}"],
  unlockToLog: ["要記數？撳呢度入 PIN 解鎖", "Need to log? Tap to unlock"], rounds: ["夾錢紀錄", "Contributions"], roundN: ["第 {n} 輪・每人", "Round {n} · each"],
  gotN: ["已收 {a}/{b}", "{a}/{b} paid"], roundTotal: ["呢輪收咗 {x}", "This round: {x}"], allPaid: ["全部已俾", "All paid"], delRound: ["刪除呢一輪夾錢？", "Delete this round?"],
  topUp: ["＋ 再夾一輪", "＋ New round"], settle: ["各組結算", "Settle up by group"], grp: ["組", "Grp"], shares: ["份", "Shr"], put: ["已夾", "Paid in"], owe: ["應分", "Share"], bal: ["結餘", "Balance"],
  refund: ["退", "Refund "], topup: ["補", "Owe "], settleHint: ["應付份額＝每筆支出按份數攤落嗰組嘅總和。俾咗多過份額就應收返，少過就要補。", "Fair share = each payment split by headcount. Paid more than that → gets money back; less → owes."],
  expenses: ["支出紀錄（{n}）", "Payments ({n})"], noExp: ["未有支出", "No payments yet"], delExp: ["刪除「{x}」？", "Delete “{x}”?"],
  shareBackup: ["分享＋備份", "Share & backup"], copySum: ["複製總結去 WhatsApp", "Copy summary for WhatsApp"], copiedWA: ["已複製，可以貼落 WhatsApp", "Copied — paste into WhatsApp"],
  exportB: ["匯出備份", "Export"], importB: ["匯入備份", "Import"], importQ: ["用呢個檔覆蓋雲端公數袋紀錄？全部人都會見到。", "Replace the shared kitty with this file? Everyone will see it."],
  imported: ["已匯入", "Imported"], badFile: ["檔案格式唔啱", "Invalid file"], rate: ["匯率 1 日元 =", "Rate: ¥1 ="], hkd: ["港元", "HKD"],
  share: ["分享", "Share"], shareDay: ["分享成日", "Share day"], addrOpt: ["地址（可唔填，分享時會顯示）", "Address (optional, shown when sharing)"], category: ["分類", "Category"],
  cashLeft: ["公數袋現金剩", "Cash left in kitty"], cashIn: ["夾咗現金", "Cash in"], byCash: ["現金支出", "Paid by cash"], byCard: ["碌卡支出", "Paid by card"], spentAll: ["總支出", "Total spent"],
  whoPaid: ["邊個俾", "Who paid"], kittyCash: ["公數袋現金", "Kitty cash"], cardOf: ["{g}碌卡", "{g} card"], splitAmong: ["邊幾組分（唔係全部人就揀返）", "Split between"],
  onlyFor: ["只{g}分", "{g} only"], cashInTitle: ["每組夾咗幾多現金", "Cash put in by each group"], addCash: ["＋ 加現金", "＋ Add cash"], addCashFor: ["{g}加現金", "{g}: add cash"],
  cashAmt: ["金額（日元）", "Amount (¥)"], cashNoteEg: ["例如：第二次夾", "e.g. top-up"], cashInS: ["現金", "Cash"], cardS: ["碌卡", "Card"], oweS: ["應付份額", "Fair share"],
  getBack: ["應收返", "Gets back"], payMore: ["要補", "Owes"], howSettle: ["點樣找數", "How to settle"], allEven: ["而家啱啱好，唔使找", "All square — nothing to settle"],
  settleNow: ["按而家條數計；旅程完咗先跟住做。", "Based on current numbers — do this at the end of the trip."],
  whereMoney: ["錢用咗去邊", "Where the money went"], viewBy: ["顯示方式", "View by"], byCat: ["分類", "Category"], byDay: ["每日", "Day"], all: ["全部", "All"], groupBy: ["分組", "Group by"],
  kittyCashSub: ["由公數袋俾", "Paid from the kitty"], notIncl: ["唔包", "Not incl."], sharesN: ["{n}份", "{n} shares"], paidTotal: ["俾咗", "Paid"],
  nowDoing: ["而家", "Now"], upNext: ["下一站", "Up next"], inMin: ["仲有 {x}", "in {x}"], dayDone: ["今日行程完咗 🌙", "Done for today 🌙"], startsAt: ["{x} 開始", "starts {x}"], goNow: ["導航", "Go"],
  c_stay: ["住宿", "Lodging"], addCat: ["＋ 自訂", "＋ Custom"], newCatQ: ["新分類叫咩名？", "Name for the new category?"],
  editExp: ["改支出", "Edit payment"], editCashFor: ["改{g}現金", "{g}: edit cash"], tapToEdit: ["撳任何一筆可以改", "Tap any payment to edit"],
  settings: ["設定", "Settings"], byPayer: ["邊個俾", "Payer"], exportMore: ["匯出／備份 →", "Export / backup →"],
  todayPlan: ["今日行程", "Today's plan"], firstDay: ["第一日行程", "Day 1 plan"], allDays: ["睇全部日子 →", "All days →"],
  unlockToEdit: ["解鎖先改得", "Unlock to edit"], groupsHint: ["共 {n} 人。每組嘅人數就係佢嘅份數。", "{n} people. Each group's headcount is its number of shares."],
  groupName: ["組名", "Group name"], groupNameEn: ["英文組名", "English name"], color: ["顏色", "Colour"], personName: ["名", "Name"],
  addPerson: ["＋ 加人", "＋ Person"], delGroupQ: ["刪除「{g}」？佢之前嘅公數袋紀錄會唔計入。", "Delete “{g}”? Its kitty records will no longer count."], delGroup: ["刪除呢組", "Delete group"],
  addGroup: ["＋ 加一組", "＋ Add group"], errEmptyGroup: ["每組最少要有 1 個人", "Every group needs at least one person"], errDupName: ["有重複嘅名", "Names must be unique"],
  saveGroups: ["儲存分組", "Save groups"], saved: ["已儲存 ✓", "Saved ✓"], startDate: ["開始日期", "Start date"], nDays: ["日數", "Days"],
  cutDaysQ: ["減少日數會刪走 {n} 日嘅行程，確定？", "This removes {n} day(s) that have stops. Continue?"], applyDates: ["套用日期", "Apply dates"],
  pinHint: ["解鎖之後可以改 PIN。", "Unlock to change the PIN."], newPin: ["新 PIN（4–6 位數字）", "New PIN (4–6 digits)"],
  makeLinkQ: ["會將而家所有資料搬去一個私人位置，之後要用新連結開。確定？", "This moves all data to a private location; everyone will need the new link. Continue?"],
  linkFail: ["搬唔到，請再試", "Couldn't move the data — try again"], privateOn: ["已經用緊私人連結", "Private link is on"], copyLink: ["複製連結", "Copy link"],
  linkMsg: ["北海道 app 新連結（請用呢個開）：", "New Hokkaido app link (please use this one):"],
  privateHint: ["連結入面有條鎖匙，唔好公開 post。每部手機用呢條連結開一次就記住。", "The link contains the key — don't post it publicly. Each phone only needs to open it once."],
  publicNow: ["而家資料放喺公開位置：知道 GitHub 網址嘅人都可以睇同改。", "Data is in a public location: anyone who finds the GitHub page can read and change it."],
  makeLink: ["建立私人連結", "Create private link"],
  p_days: ["行程", "Itinerary"], p_kitty: ["公數袋", "Kitty"], p_todo: ["清單", "To-do"], p_stays: ["住宿", "Stays"], p_config: ["設定", "Settings"],
  exportJson: ["匯出備份 (JSON)", "Export backup (JSON)"], exportCsv: ["支出 CSV（Excel）", "Payments CSV (Excel)"], importJson: ["匯入備份", "Import backup"],
  nothingToImport: ["個檔冇揀咗嘅部分", "The file has none of the selected parts"], importPartsQ: ["用個檔覆蓋：{x}？全部人都會見到。", "Replace {x} with the file? Everyone will see it."],
  exportHint: ["揀要邊幾部分。JSON 可以匯入返；CSV 可以用 Excel／Numbers 開。", "Pick the parts. JSON can be imported back; CSV opens in Excel/Numbers."],
  display: ["顯示（只係呢部手機）", "Display (this phone only)"], language: ["語言", "Language"], timeFmt: ["時間", "Time"], displayHint: ["每部手機可以揀自己鍾意嘅。", "Each phone keeps its own choice."],
  tripDates: ["旅程日子", "Trip dates"], groupsPeople: ["分組同人名", "Groups & people"], security: ["私隱同安全", "Privacy & security"], pinTitle2: ["編輯 PIN", "Edit PIN"],
  exportImport: ["匯出／匯入", "Export / import"], needLink: ["要用私人連結開", "Open with the private link"],
  needLinkSub: ["呢個 app 嘅資料而家要用私人連結先睇到。請喺 WhatsApp group 撳嗰條連結，或者貼落下面。", "This app's data now needs the private link. Tap it in the WhatsApp group, or paste it below."],
  pasteLink: ["貼上連結", "Paste link"],
  flightsN: ["{n} 班機・撳開睇", "{n} flights · tap to open"],
  swapDay: ["同另一日對調", "Swap with another day"], swapHint: ["成日行程（標題、所有景點）會同揀咗嗰日交換，日期唔變。", "The whole plan (title and all stops) swaps with the chosen day; dates stay put."],
  swapGo: ["對調 {a} ⇄ {b}", "Swap {a} ⇄ {b}"],
  vaultOn: ["私人東京行程", "Private Tokyo plan"], vaultExit: ["離開", "Exit"], vaultSub: ["2026・10/16 – 10/18・三日兩夜・之後飛多倫多", "2026 · Oct 16–18 · 3 days 2 nights · then Toronto"],
  vaultHint: ["呢個行程同北海道分開儲存，要用密碼先開到。", "This plan is stored separately from Hokkaido and opens only with its code."],
  vaultDepart: ["10/16（五）07:30 NH50 新千歲 → 羽田", "Fri 10/16 07:30 · NH50 New Chitose → Haneda"],
  sortBy: ["排序", "Sort"], s_new: ["最新", "Newest"], s_old: ["最舊", "Oldest"], s_high: ["$ 高", "$ High"], s_low: ["$ 低", "$ Low"],
  collapseAll: ["全部收埋", "Collapse all"], expandAll: ["全部打開", "Expand all"], allExp: ["全部支出", "All payments"],
  done: ["完成", "Done"], editOn: ["編輯中", "Editing"], editOff: ["睇緊（唔會改到嘢）", "View only"],
  editOnHint: ["改完撳「完成」。", "Tap “Done” when finished."], editOffHint: ["撳「編輯」入 PIN，先改得行程、預訂、夾錢，同埋睇到其他設定。", "Tap “Edit” and enter the PIN to change the plan, bookings and kitty, and to see the other settings."],
  forgetPin: ["喺呢部手機忘記 PIN", "Forget PIN on this phone"],
  vaultLock: ["鎖上", "Lock"], tokyoLockTitle: ["私人行程", "Private plan"], tokyoLockSub: ["輸入密碼開啟", "Enter the code to open"], toHokkaido: ["← 返北海道行程", "← Back to the Hokkaido plan"],
  tripInfo: ["旅程資料", "Trip details"], tripTitle: ["標題", "Title"], tripTitleEn: ["英文標題", "English title"], tripSub: ["副標題", "Subtitle"], tripSubEn: ["英文副標題", "English subtitle"],
  departAt: ["出發時間（倒數用，手機當地時間）", "Departure time (for the countdown, phone's local time)"],
  editFlight: ["改航班", "Edit flight"], addFlight: ["加航班", "Add flight"], addFlightBtn: ["＋ 加航班", "＋ Add flight"],
  flNo: ["航班號", "Flight no."], flDate: ["日期（例：10/16（五））", "Date (e.g. Fri 10/16)"], flFrom: ["出發機場代號", "From (code)"], flFromName: ["出發機場", "From"],
  flDep: ["起飛時間", "Departs"], flTo: ["到達機場代號", "To (code)"], flToName: ["到達機場", "To"], flArr: ["到達時間", "Arrives"], flWho: ["乘客", "Passengers"],
  features: ["功能", "Features"], featKitty: ["夾錢", "Money"], kFull: ["公數袋＋分組", "Group kitty"], kLog: ["只記支出", "Log only"], kOff: ["唔使", "Off"],
  featKittyHint: ["兩三個人去或者唔使夾錢，可以揀「只記支出」或者「唔使」。", "For small trips choose “Log only” or turn it off."],
  on: ["開", "On"], off: ["關", "Off"], moneyLog: ["支出", "Spending"], moneyLogNav: ["支出", "Spend"], logSub: ["記低每筆支出，睇用咗幾多", "Log each payment and see the total"], nPayments: ["{n} 筆", "{n} payments"],
  editBtn: ["編輯", "Edit"],
  bookTitle: ["預訂", "Bookings"], bookSub: ["航班・租車・住宿", "Flights · cars · stays"], cars: ["租車", "Cars"], carN: ["{n}號車", "Car {n}"],
  carName: ["車名（例：Toyota）", "Name (e.g. Toyota)"], whoInCar: ["坐呢架車嘅人", "Who's in this car"], addCar: ["＋ 加一架車", "＋ Add car"],
  editCar: ["改車", "Edit car"], newCar: ["加車", "Add car"], noOne: ["未分配", "Not assigned"], unassigned: ["未有車坐：{x}", "No car yet: {x}"],
  selfDrive: ["自駕", "Driving"], selfDriveQ: ["呢個旅程有冇自己揸車？", "Are you driving on this trip?"], yes: ["有", "Yes"], no: ["冇", "No"],
  driveHint: ["首頁會畫返幾多架車；多過三架就會變成車隊駛過。", "The home picture draws each car — more than three become a convoy driving past."],
  noDriveHint: ["唔揸車：首頁會畫火車。", "Not driving: the home picture shows a train."],
  everyone: ["全部人", "Everyone"], pickWho: ["撳組名＝成組；撳名＝個別揀", "Tap a group for all of it, or pick people"],
  meTitle: ["我係", "I am"], meQ: ["你係邊個？", "Who are you?"], meHint: ["揀咗之後，清單、航班、車同行程會標出你組嘅嘢（只係呢部手機）。", "Your group's to-dos, flights, car and stops get highlighted (this phone only)."],
  you: ["你", "You"], mine: ["我組", "Mine"], later: ["遲啲先", "Later"],
  lockedSettings: ["旅程資料、首頁插圖、自駕、功能、分組同私隱設定，要撳「編輯」入 PIN 先睇到。", "Trip details, home picture, driving, features, groups and privacy appear after you tap “Edit” and enter the PIN."],
  sceneTitle: ["首頁插圖", "Home picture"], sc_hokkaido: ["北海道", "Hokkaido"], sc_tokyo: ["城市", "City"], sc_kyoto: ["古都", "Old town"], sc_beach: ["海邊", "Beach"], sc_camp: ["山野", "Mountains"],
  seasonAuto: ["季節跟出發月份自動轉：而家係{s}。", "The season follows the start month: {s}."], se_spring: ["春天", "spring"], se_summer: ["夏天", "summer"], se_autumn: ["秋天", "autumn"], se_winter: ["冬天", "winter"],
  sortDate: ["按日期排", "Sort by date"], sortAmt: ["按金額排", "Sort by amount"], tip_new: ["最新先", "Newest first"], tip_old: ["最舊先", "Oldest first"], tip_high: ["金額大至細", "Largest first"], tip_low: ["金額細至大", "Smallest first"],
  editTodo: ["改項目", "Edit item"], todoText: ["內容", "Item"], forWho: ["俾邊個", "For"],
  addNear: ["＋ 加附近地方", "＋ Add nearby place"], nearName: ["地方", "Place"], nearNote: ["備註", "Note"],
  swipeHint: ["左右掃都可以轉日子", "Swipe left or right to change day"], customColor: ["自訂顏色", "Custom colour"],
  yourFlight: ["你嘅航班", "Your flight"], yourCar: ["你架車", "Your car"], editFlights: ["改航班", "Edit flights"],
  c_food: ["食", "Food"], c_car: ["油／泊車", "Fuel/Parking"], c_ticket: ["門票", "Tickets"], c_transport: ["交通", "Transport"], c_super: ["超市", "Groceries"], c_other: ["其他", "Other"],
};

export function tr(lang, key, vars) {
  const pair = S[key];
  let s = pair ? pair[lang === "en" ? 1 : 0] : key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.split("{" + k + "}").join(v); });
  return s;
}
export function useT() {
  const lang = useLang();
  return (key, vars) => tr(lang, key, vars);
}
// 揀中定英：obj.en.field 有就用英文
export function pick(lang, obj, field) {
  if (!obj) return "";
  if (lang === "en" && obj.en && obj.en[field]) return obj.en[field];
  return obj[field] || "";
}
export const WEEK_EN = { 日: "Sun", 一: "Mon", 二: "Tue", 三: "Wed", 四: "Thu", 五: "Fri", 六: "Sat" };

/* ---------- 預設行程嘅英文 ---------- */
export const EN_DAYS = {
  "抵達＋百年花火": { title: "Arrival + Centennial Fireworks", intro: "Immigration and car pickup take about 2 hours; leave at 17:00." },
  "札幌市內": { title: "Sapporo City", intro: "Most city-centre spots are walkable from each other." },
  "小樽": { title: "Otaru", intro: "Park at the Sakaimachi shopping street lot (Minatomachi 7-7), max ¥1,000/day." },
  "洞爺湖": { title: "Lake Toya", intro: "Leave 08:00 via Jozankei and Nakayama Pass for the autumn leaves." },
  "札幌美食日": { title: "Sapporo Food Day", intro: "Today: king crab, Shiraoi beef and parfait." },
  "登別溫泉": { title: "Noboribetsu Onsen", intro: "Leave 09:00, about 1h15 drive." },
  "分3組返程": { title: "Heading Home in 3 Groups", intro: "Groups B & C check out at 10:00." },
};
export const EN_STOPS = {
  "新千歲機場": { name: "New Chitose Airport", note: "Immigration + car pickup ~2h" },
  "苫小牧漁港西側廣場": { name: "Tomakomai Fishing Port West Plaza", note: "Arrive early for a good spot" },
  "苫小牧百年花火大會": { name: "Tomakomai Centennial Fireworks", note: "~10,000 shells, free" },
  "返住宿": { name: "Back to the apartment" },
  "POP/iN coffee": { name: "POP/iN coffee", note: "Breakfast · Odori Nishi 18" },
  "北海道神宮・圓山公園": { name: "Hokkaido Shrine & Maruyama Park" },
  "舊道廳赤磚廳舍": { name: "Former Hokkaido Gov't Office (Red Brick)" },
  "二条市場": { name: "Nijo Market", dish: "Uni bowl" },
  "狸小路": { name: "Tanukikoji Shopping Street" },
  "成吉思汗だるま本店": { name: "Daruma Genghis Khan (Main)", note: "Queue — arrive before 18:00" },
  "薄野散步": { name: "Susukino stroll" },
  "Espresso D Works": { name: "Espresso D Works", note: "COCONO SUSUKINO 1F" },
  "小樽運河": { name: "Otaru Canal", note: "Park at the Sakaimachi shopping street lot" },
  "北一硝子・音樂盒堂": { name: "Kitaichi Glass & Music Box Museum" },
  "壽司屋通午餐": { name: "Lunch on Sushi Street", dish: "Uni, crab" },
  "LeTAO 本店": { name: "LeTAO Main Store" },
  "SNOOPY 茶屋": { name: "Snoopy Chaya" },
  "湯咖哩 GARAKU": { name: "Soup Curry GARAKU" },
  "定山溪・中山峠": { name: "Jozankei & Nakayama Pass", note: "Autumn leaves + age-imo fried potatoes" },
  "洞爺湖サイロ展望台": { name: "Lake Toya Silo Observatory", note: "View over the whole lake" },
  "昭和新山＋有珠山纜車": { name: "Showa-Shinzan + Mt. Usu Ropeway", note: "Check ropeway closing time first" },
  "洞爺湖溫泉街午餐": { name: "Lunch in Toyako Onsen town" },
  "湖畔散步／遊覽船": { name: "Lakeside walk / cruise" },
  "根室花丸迴轉壽司": { name: "Nemuro Hanamaru Conveyor Sushi", note: "No bookings — get a ticket on arrival" },
  "白色戀人公園": { name: "Shiroi Koibito Park" },
  "場外市場": { name: "Jogai Market", dish: "King crab" },
  "Sapporo Factory": { name: "Sapporo Factory" },
  "藥妝＋Majisand": { name: "Drugstores + Majisand", dish: "Fruit sandwiches" },
  "焼肉徳寿 しんら亭": { name: "Yakiniku Tokuju Shinratei", dish: "Shiraoi beef", note: "Minami 3 Nishi 5, Sanjo Mimatsu Bldg 2F" },
  "パフェテリア ミル": { name: "Parfaiteria miL", dish: "Parfait", note: "Same building, B1F" },
  "登別地獄谷": { name: "Noboribetsu Hell Valley" },
  "大湯沼＋足湯": { name: "Oyunuma + foot bath" },
  "登別伊達時代村": { name: "Noboribetsu Date Jidaimura" },
  "Toriton 迴轉壽司": { name: "Toriton Conveyor Sushi", note: "Call ahead for a table for 7" },
  "的士去新千歲": { name: "Taxi to New Chitose", note: "Book the taxi the night before" },
  "NH50 → 羽田 09:05": { name: "NH50 → Haneda 09:05" },
  "退房": { name: "Check out" },
  "千歲 Outlet Rera": { name: "Chitose Outlet Rera" },
  "機場附近還車（Toyota）": { name: "Return car near airport (Toyota)", note: "Shuttle to airport ~9 min" },
  "機場 Check-in": { name: "Airport check-in" },
  "HX691 返香港": { name: "HX691 to Hong Kong" },
  "札幌市內還車（ORIX）": { name: "Return car in Sapporo (ORIX)", note: "Then go to the second hotel" },
};
export const EN_TODO = {
  "訂位：湯咖哩 GARAKU（10/12）": "Book: Soup Curry GARAKU (10/12)",
  "訂位：焼肉徳寿しんら亭（10/14）": "Book: Yakiniku Tokuju Shinratei (10/14)",
  "打電話：Toriton 7人位（10/15）": "Call Toriton for a table for 7 (10/15)",
  "ORIX 還車地點改札幌市內店": "Change ORIX return to a Sapporo city branch",
  "A組預約 10/16 05:00 的士": "Group A: book 05:00 taxi on 10/16",
  "國際車牌＋香港車牌": "International + HK driving licences",
  "護照、Visit Japan Web": "Passports, Visit Japan Web",
  "日元現金（公數袋）": "Yen cash (kitty)",
  "上網卡／eSIM": "SIM / eSIM",
  "厚外套（札幌10月約 8–17°C）": "Warm jacket (Sapporo Oct ~8–17°C)",
  "叉電線、尿袋": "Chargers, power bank",
};
export const EN_CAT = { 訂位: "Bookings", 租車: "Car", 證件: "Documents", 錢: "Money", 行李: "Packing", 買嘢: "Shopping", 其他: "Other" };

// 將英文加落預設行程（新開數據庫用）
export function withEn(days) {
  return days.map((d) => ({
    ...d,
    en: EN_DAYS[d.title] || undefined,
    stops: d.stops.map((s) => (EN_STOPS[s.name] ? { ...s, en: EN_STOPS[s.name] } : s)),
  }));
}
