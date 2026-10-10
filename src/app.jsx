import React, { useEffect, useMemo, useRef, useState } from "react";
import { TRIP, PEOPLE, GROUPS, FLIGHTS, STAY, DAYS, BACKUP, TODO_SEED, EDIT_PIN } from "./data.js";
import { HeroArt, DayArt, HouseArt, PurseArt, BagArt, PlaneMini } from "./art.jsx";
import { createStore } from "./store.js";

const store = createStore();

/* ---------------- 小工具 ---------------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const yen = (n) => "¥" + Math.round(n || 0).toLocaleString("en-US");
const hkd = (n, rate) => "HK$" + Math.round((n || 0) * rate).toLocaleString("en-US");
const toList = (obj) => Object.entries(obj || {}).map(([id, v]) => ({ id, ...v }));
const asArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : v && typeof v === "object" ? Object.values(v).filter(Boolean) : []);

function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
}
function usePersist(key, initial) {
  const [v, setV] = useState(() => load(key, initial));
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* ignore */ } }, [key, v]);
  return [v, setV];
}
// 訂閱共用數據；undefined = 載入中，null = 冇數據
function useShared(path) {
  const [v, setV] = useState(undefined);
  useEffect(() => store.subscribe(path, setV), [path]);
  return v;
}

const mapsUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const navUrl = (q) => "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + encodeURIComponent(q);

function tripDayIndex(now = new Date()) {
  const jst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  const ymd = `${jst.getFullYear()}-${String(jst.getMonth() + 1).padStart(2, "0")}-${String(jst.getDate()).padStart(2, "0")}`;
  const diff = Math.round((new Date(ymd + "T00:00:00") - new Date(TRIP.startDate + "T00:00:00")) / 86400000);
  return diff >= 0 && diff < DAYS.length ? diff : -1;
}

const MOVE = {
  car: { label: "自駕", bg: "#F2A497" },
  walk: { label: "步行", bg: "#B9DAA5" },
  train: { label: "鐵路", bg: "#A8D3E6" },
  plane: { label: "飛機", bg: "#A8D3E6" },
  taxi: { label: "的士", bg: "#F6D27A" },
};
const groupOf = (id) => GROUPS.find((g) => g.id === id);

/* ---------------- 首次開：將預設資料寫入雲端 ---------------- */
function useSeed() {
  const meta = useShared("trip/meta");
  const done = useRef(false);
  useEffect(() => {
    if (meta !== null || done.current) return;
    done.current = true;
    const now = Date.now();
    const map = {
      "trip/meta": { seeded: now, v: 2 },
      "trip/days": DAYS,
      "trip/kitty/rate": 0.052,
    };
    TODO_SEED.forEach((t, i) => { map[`trip/todo/t${i}`] = { text: t.text, cat: t.cat, done: false, ts: now + i }; });
    // 舊版本機公數袋有數就搬上去
    const old = load("hok-kitty-v1", null);
    if (old && (asArray(old.expenses).length || asArray(old.rounds).some((r) => Object.keys(r.paid || {}).length))) {
      asArray(old.rounds).forEach((r, i) => { map[`trip/kitty/rounds/${r.id || "r" + i}`] = { amount: r.amount, paid: r.paid || {}, ts: now + i }; });
      asArray(old.expenses).forEach((e) => { map[`trip/kitty/expenses/${e.id}`] = { amt: e.amt, what: e.what, cat: e.cat, day: e.day, ts: e.ts || now }; });
      if (old.rate) map["trip/kitty/rate"] = old.rate;
    } else {
      map["trip/kitty/rounds/r1"] = { amount: 30000, paid: {}, ts: now };
    }
    store.update(map);
  }, [meta]);
}

/* ---------------- 頂部固定選單 ---------------- */
const TABS = [
  { id: "home", label: "首頁" },
  { id: "plan", label: "行程" },
  { id: "todo", label: "清單" },
  { id: "stay", label: "住宿" },
  { id: "money", label: "夾錢" },
];
const STATUS = {
  online: { c: "#6DB35A", t: "已同步" },
  connecting: { c: "#F6D27A", t: "連線中" },
  offline: { c: "#F2A497", t: "離線（有訊號會自動同步）" },
  error: { c: "#C4584A", t: "連唔到數據庫" },
  local: { c: "#BDB6B2", t: "本機模式" },
};

function TopNav({ tab, setTab, editing, toggleEdit, status }) {
  return (
    <header className="topnav">
      <nav className="topnav-inner" aria-label="主選單">
        {TABS.map((t) => (
          <button key={t.id} className={"nav-btn" + (tab === t.id ? " on" : "")} aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <button className={"lock-btn" + (editing ? " on" : "")} onClick={toggleEdit} aria-label={editing ? "鎖返編輯模式" : "解鎖編輯模式"} title={STATUS[status].t}>
          <LockIcon open={editing} />
          <span className="sync-dot" style={{ background: STATUS[status].c }} />
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

/* ---------------- 首頁 ---------------- */
function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), ms); return () => clearInterval(id); }, [ms]);
  return now;
}

function Countdown({ goPlan, days }) {
  const now = useNow(1000);
  const diff = new Date(TRIP.departISO) - now;
  const di = tripDayIndex(now);
  if (diff > 0) {
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    return (
      <div className="card countdown">
        <div className="cd-label">距離出發仲有</div>
        <div className="cd-row">
          {[[d, "日"], [h, "時"], [m, "分"], [s, "秒"]].map(([v, u]) => (
            <div key={u} className="cd-cell"><div className="cd-num">{String(v).padStart(2, "0")}</div><div className="cd-unit">{u}</div></div>
          ))}
        </div>
        <div className="cd-foot">10/10（六）08:30 HX690 香港出發</div>
      </div>
    );
  }
  if (di >= 0) {
    return (
      <button className="card countdown today" onClick={() => goPlan(di)}>
        <div className="cd-label">旅程進行中</div>
        <div className="cd-big">第 {di + 1} 日・{days[di] ? days[di].title : ""}</div>
        <div className="cd-foot">撳入去睇今日行程 →</div>
      </button>
    );
  }
  return (<div className="card countdown"><div className="cd-big">旅程完滿結束 🍁</div><div className="cd-foot">下次再嚟北海道！</div></div>);
}

function FlightCard({ f }) {
  return (
    <div className="card flight" style={{ "--accent": f.color }}>
      <div className="flight-top"><span className="flight-no">{f.no}</span><span className="flight-date">{f.date}</span></div>
      <div className="flight-route">
        <div className="apt"><div className="apt-code">{f.from}</div><div className="apt-name">{f.fromName}</div><div className="apt-time">{f.dep}</div></div>
        <PlaneMini color={f.color} />
        <div className="apt right"><div className="apt-code">{f.to}</div><div className="apt-name">{f.toName}</div><div className="apt-time">{f.arr}</div></div>
      </div>
      <div className="flight-who">{f.who}{f.note ? <span className="muted">・{f.note}</span> : null}</div>
    </div>
  );
}

function Home({ goPlan, setTab, days, status }) {
  return (
    <div className="page">
      <div className="hero card"><HeroArt /></div>
      <h1 className="title">{TRIP.title}</h1>
      <p className="subtitle">2026・10/10 – 10/16 ・{TRIP.sub}・7人2架車</p>
      <Countdown goPlan={goPlan} days={days} />

      <h2 className="sec">航班</h2>
      <div className="flights">{FLIGHTS.map((f) => <FlightCard key={f.id} f={f} />)}</div>

      <h2 className="sec">七日一覽</h2>
      <div className="overview">
        {days.map((day, i) => (
          <button key={day.d} className="card ov-item" onClick={() => goPlan(i)}>
            <DayArt kind={day.icon} size={48} />
            <div><div className="ov-date">{day.d}（{day.w}）</div><div className="ov-title">{day.title}</div></div>
          </button>
        ))}
      </div>

      <div className="quick">
        <button className="btn" onClick={() => setTab("stay")}>住宿資料</button>
        <button className="btn yellow" onClick={() => setTab("money")}>公數袋</button>
      </div>
      <p className="sync-line"><span className="sync-dot inline" style={{ background: STATUS[status].c }} />{STATUS[status].t}{status === "online" ? "・全部人睇到同一份" : ""}</p>
    </div>
  );
}

/* ---------------- 行程 ---------------- */
function moveText(move) {
  if (move.txt) return move.txt;
  if (!move.min) return "";
  const m = Number(move.min);
  return m >= 60 ? `${Math.floor(m / 60)}小時${m % 60 ? (m % 60) + "分" : ""}` : `${m}分`;
}
function MoveTag({ move }) {
  if (!move || !MOVE[move.t]) return null;
  const txt = moveText(move);
  return <span className="tag" style={{ background: MOVE[move.t].bg }}>{MOVE[move.t].label}{txt ? " " + txt : ""}</span>;
}
function GroupTag({ g }) {
  if (!g) return null;
  return g.split("").map((id) => {
    const grp = groupOf(id);
    return grp ? <span key={id} className="tag group" style={{ background: grp.color }}>{grp.name}</span> : null;
  });
}

const sortStops = (arr) => [...arr].sort((a, b) => String(a.t).localeCompare(String(b.t)));

function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet card" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head"><h2>{title}</h2><button className="x" onClick={onClose} aria-label="關閉">×</button></div>
        {children}
      </div>
    </div>
  );
}

function StopEditor({ stop, onSave, onDelete, onClose }) {
  const [s, setS] = useState(() => ({ t: "12:00", name: "", q: "", must: false, book: false, booked: false, dish: "", note: "", group: "", ...stop, move: stop && stop.move ? { ...stop.move } : null }));
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const setMove = (t) => setS((x) => ({ ...x, move: t ? { ...(x.move || {}), t } : null }));
  const toggleGroup = (id) => set("group", s.group.includes(id) ? s.group.replace(id, "") : (s.group + id).split("").sort().join(""));
  const save = (e) => {
    e.preventDefault();
    if (!s.name.trim()) return;
    const out = { ...s, name: s.name.trim() };
    Object.keys(out).forEach((k) => { if (out[k] === "" || out[k] === false) delete out[k]; });
    if (out.move && out.move.t !== "plane") delete out.move.txt;
    if (out.move && out.move.t === "plane") delete out.move.min;
    onSave(out);
  };
  return (
    <Sheet title={stop ? "改行程" : "加行程"} onClose={onClose}>
      <form className="form" onSubmit={save}>
        <div className="form-row">
          <label className="fld narrow"><span>時間</span><input className="input" type="time" value={s.t} onChange={(e) => set("t", e.target.value)} required /></label>
          <label className="fld"><span>地方</span><input className="input" value={s.name} onChange={(e) => set("name", e.target.value)} placeholder="例如：小樽運河" required /></label>
        </div>
        <label className="fld"><span>地圖搜尋字（唔填就用地方名）</span><input className="input" value={s.q || ""} onChange={(e) => set("q", e.target.value)} placeholder="日文名或地址最準" /></label>
        <div className="fld"><span>點去</span>
          <div className="chips">
            <button type="button" className={"chip" + (!s.move ? " on" : "")} onClick={() => setMove(null)}>唔使標</button>
            {Object.entries(MOVE).map(([k, m]) => (
              <button type="button" key={k} className={"chip" + (s.move && s.move.t === k ? " on" : "")} onClick={() => setMove(k)}>{m.label}</button>
            ))}
          </div>
        </div>
        {s.move ? (
          s.move.t === "plane" ? (
            <label className="fld"><span>航班</span><input className="input" value={s.move.txt || ""} onChange={(e) => setS((x) => ({ ...x, move: { ...x.move, txt: e.target.value } }))} placeholder="例如：NH50" /></label>
          ) : (
            <label className="fld"><span>要幾耐（分鐘）</span><input className="input" inputMode="numeric" value={s.move.min || ""} onChange={(e) => setS((x) => ({ ...x, move: { ...x.move, min: Number(e.target.value.replace(/\D/g, "")) || "" } }))} /></label>
          )
        ) : null}
        <div className="chips">
          <button type="button" className={"chip" + (s.must ? " on" : "")} onClick={() => set("must", !s.must)}>★ 必去</button>
          <button type="button" className={"chip" + (s.book ? " on" : "")} onClick={() => set("book", !s.book)}>要訂位</button>
          {s.book ? <button type="button" className={"chip" + (s.booked ? " on" : "")} onClick={() => set("booked", !s.booked)}>已訂好 ✓</button> : null}
        </div>
        <label className="fld"><span>必食</span><input className="input" value={s.dish || ""} onChange={(e) => set("dish", e.target.value)} /></label>
        <label className="fld"><span>備註</span><input className="input" value={s.note || ""} onChange={(e) => set("note", e.target.value)} /></label>
        <div className="fld"><span>只係某幾組去（唔揀＝全部人）</span>
          <div className="chips">
            {GROUPS.map((g) => (
              <button type="button" key={g.id} className={"chip" + (s.group.includes(g.id) ? " on" : "")} onClick={() => toggleGroup(g.id)}>{g.name}</button>
            ))}
          </div>
        </div>
        <button className="btn full" type="submit">儲存</button>
        {stop ? <button type="button" className="btn full ghost danger-btn" onClick={() => { if (window.confirm("刪除「" + stop.name + "」？")) onDelete(); }}>刪除呢個行程</button> : null}
      </form>
    </Sheet>
  );
}

function DayEditor({ day, onSave, onClose }) {
  const [title, setTitle] = useState(day.title || "");
  const [intro, setIntro] = useState(day.intro || "");
  return (
    <Sheet title={`Day ${day.d} 標題`} onClose={onClose}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onSave({ title: title.trim() || day.title, intro: intro.trim() }); }}>
        <label className="fld"><span>標題</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="fld"><span>簡介</span><textarea className="input" rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} /></label>
        <button className="btn full" type="submit">儲存</button>
      </form>
    </Sheet>
  );
}

function Plan({ days, day, setDay, editing }) {
  const di = tripDayIndex();
  const data = days[day] || days[0];
  const stops = asArray(data.stops);
  const railRef = useRef(null);
  const [editor, setEditor] = useState(null); // { idx } | { idx: null } | "day"

  useEffect(() => {
    const rail = railRef.current;
    const el = rail && rail.children[day];
    if (el && rail.scrollTo) rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [day]);

  const indexed = stops.map((s, idx) => ({ ...s, _i: idx }));
  const sections = useMemo(() => {
    if (!indexed.some((s) => s.group)) return [{ key: "all", stops: indexed }];
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
  const onSave = (s) => {
    const arr = [...stops];
    if (editor.idx == null) arr.push(s); else arr[editor.idx] = s;
    saveStops(arr);
    setEditor(null);
  };
  const onDelete = () => { saveStops(stops.filter((_, i) => i !== editor.idx)); setEditor(null); };

  return (
    <div className="page">
      <div className="day-rail" ref={railRef} role="tablist" aria-label="揀日期">
        {days.map((d, i) => (
          <button key={d.d} role="tab" aria-selected={i === day} className={"day-pill" + (i === day ? " on" : "")} onClick={() => setDay(i)}>
            <span className="dp-n">Day {i + 1}</span><span className="dp-d">{d.d}</span><span className="dp-w">{d.w}{i === di ? "・今日" : ""}</span>
          </button>
        ))}
      </div>

      <div key={day} className="bounce-in">
        <div className="card day-head">
          <DayArt kind={data.icon} size={64} />
          <div className="dh-body">
            <div className="dh-date">Day {day + 1}・{data.d}（{data.w}）</div>
            <div className="dh-title">{data.title}</div>
            {data.intro ? <div className="dh-intro">{data.intro}</div> : null}
          </div>
          {editing ? <button className="edit-btn" onClick={() => setEditor("day")} aria-label="改標題">改</button> : null}
        </div>

        {sections.map((sec) => (
          <div key={sec.key} className="tl-section">
            {sec.g ? <div className="grp-head" style={{ background: sec.g.color }}>{sec.g.name}・{sec.g.members.join("、")}・{sec.g.dest}</div> : null}
            <ol className="timeline">
              {sec.stops.map((s, i) => (
                <li key={s._i + s.t + s.name} className="tl-item" style={{ animationDelay: `${i * 45}ms` }}>
                  <div className="tl-time">{s.t}</div>
                  <div className="tl-dot" style={{ background: s.must ? "#F6D27A" : "#FFFCF6" }} />
                  <div className={"card tl-card" + (s.must ? " must" : "")}>
                    <div className="tl-tags">
                      <MoveTag move={s.move} />
                      {s.must ? <span className="tag must-tag">★ 必去</span> : null}
                      {s.book ? <span className={"tag book-tag" + (s.booked ? " ok" : "")}>{s.booked ? "已訂位 ✓" : "要訂位"}</span> : null}
                      {sec.key === "all" ? <GroupTag g={s.group} /> : null}
                    </div>
                    <div className="tl-name">{s.name}</div>
                    {s.dish ? <div className="tl-dish">必食：{s.dish}</div> : null}
                    {s.note ? <div className="tl-note">{s.note}</div> : null}
                    <div className="tl-links">
                      <a href={mapsUrl(s.q || s.name)} target="_blank" rel="noreferrer">地圖</a>
                      <a href={navUrl(s.q || s.name)} target="_blank" rel="noreferrer" className="go">導航</a>
                      {editing ? <button className="edit-btn small" onClick={() => setEditor({ idx: s._i })}>改</button> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
        {editing ? <button className="btn full ghost" onClick={() => setEditor({ idx: null })}>＋ 加行程</button> : null}
      </div>

      <h2 className="sec">後備餐廳</h2>
      {BACKUP.map((b) => (
        <div key={b.name} className="card plain">
          <div className="tl-name">{b.name}</div>
          <div className="tl-note">{b.addr}・<a href={"tel:" + b.tel}>{b.tel}</a></div>
          <div className="tl-note">{b.note}</div>
        </div>
      ))}

      {editor === "day" ? (
        <DayEditor day={data} onClose={() => setEditor(null)} onSave={(v) => { store.update({ [`trip/days/${day}/title`]: v.title, [`trip/days/${day}/intro`]: v.intro }); setEditor(null); }} />
      ) : editor ? (
        <StopEditor stop={editor.idx == null ? null : stops[editor.idx]} onSave={onSave} onDelete={onDelete} onClose={() => setEditor(null)} />
      ) : null}
    </div>
  );
}

/* ---------------- 待辦清單（全部人共用） ---------------- */
function Todo() {
  const raw = useShared("trip/todo");
  const items = toList(raw).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const [text, setText] = useState("");
  const done = items.filter((i) => i.done).length;
  const cats = [...new Set(items.map((i) => i.cat || "其他"))];

  const add = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    store.set(`trip/todo/${uid()}`, { text: v, cat: "其他", done: false, ts: Date.now() });
    setText("");
  };

  return (
    <div className="page">
      <div className="page-head">
        <BagArt />
        <div><h1 className="title left">待辦清單</h1><p className="subtitle left">完成 {done} / {items.length}</p></div>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} /></div>

      <form className="add-row" onSubmit={add}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="加一項…" aria-label="新增待辦" />
        <button className="btn" type="submit">加</button>
      </form>

      {raw === undefined ? <div className="card plain empty">載入中…</div> : null}
      {cats.map((c) => (
        <div key={c}>
          <h2 className="sec small">{c}</h2>
          <ul className="todo-list">
            {items.filter((i) => (i.cat || "其他") === c).map((it) => (
              <li key={it.id} className={"card todo" + (it.done ? " done" : "")}>
                <label className="todo-label">
                  <input type="checkbox" checked={!!it.done} onChange={() => store.set(`trip/todo/${it.id}/done`, !it.done)} />
                  <span className="check" aria-hidden="true" />
                  <span className="todo-text">{it.text}</span>
                </label>
                <button className="x" aria-label={"刪除 " + it.text} onClick={() => { if (window.confirm("刪除「" + it.text + "」？")) store.remove(`trip/todo/${it.id}`); }}>×</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="hint">清單全部人共用，邊個剔咗大家都見到。</p>
    </div>
  );
}

/* ---------------- 住宿 ---------------- */
function Stay() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(STAY.addr); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) { /* ignore */ }
  };
  return (
    <div className="page">
      <div className="page-head">
        <HouseArt />
        <div><h1 className="title left">住宿</h1><p className="subtitle left">{STAY.dates}</p></div>
      </div>
      <div className="card plain stay">
        <div className="tl-name">{STAY.name}</div>
        <div className="addr">{STAY.addr}</div>
        <div className="tl-links">
          <button className="link-btn" onClick={copy}>{copied ? "已複製 ✓" : "複製地址"}</button>
          <a href={mapsUrl(STAY.addrShort)} target="_blank" rel="noreferrer">地圖</a>
          <a href={navUrl(STAY.addrShort)} target="_blank" rel="noreferrer" className="go">導航返去</a>
        </div>
      </div>
      <h2 className="sec">附近</h2>
      {STAY.near.map((n) => (
        <div key={n.name} className="card plain">
          <div className="tl-name">{n.name}</div>
          <div className="tl-note">{n.addr}・{n.note}</div>
          <div className="tl-links"><a href={mapsUrl(n.name + " " + n.addr)} target="_blank" rel="noreferrer">地圖</a></div>
        </div>
      ))}
      <h2 className="sec">C組 10/16</h2>
      <div className="card plain" style={{ background: "#EEF6E8" }}>
        <div className="tl-name">{STAY.second.name}</div>
        <div className="tl-note">{STAY.second.dates}・{STAY.second.note}</div>
      </div>
    </div>
  );
}

/* ---------------- 公數袋（全部人睇到，解鎖先改得） ---------------- */
const CATS = ["食", "油／泊車", "門票", "交通", "超市", "其他"];

function Money({ editing, askUnlock }) {
  const kitty = useShared("trip/kitty");
  const k = kitty || {};
  const rate = k.rate || 0.052;
  const rounds = toList(k.rounds).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const expenses = toList(k.expenses).sort((a, b) => (b.ts || 0) - (a.ts || 0));

  const [amt, setAmt] = useState("");
  const [what, setWhat] = useState("");
  const [cat, setCat] = useState(CATS[0]);
  const [day, setDay] = useState(() => Math.max(0, tripDayIndex()));
  const [msg, setMsg] = useState("");
  const [rateDraft, setRateDraft] = useState(null);
  const fileRef = useRef(null);

  const total = PEOPLE.length;
  const paidBy = (p) => rounds.reduce((sum, r) => sum + (r.paid && r.paid[p] ? Number(r.amount) || 0 : 0), 0);
  const collected = PEOPLE.reduce((s, p) => s + paidBy(p), 0);
  const spent = expenses.reduce((s, e) => s + (Number(e.amt) || 0), 0);
  const left = collected - spent;
  const perShare = spent / total;
  const pct = collected ? Math.min(100, (spent / collected) * 100) : 0;
  const groupRows = GROUPS.map((g) => {
    const put = g.members.reduce((s, p) => s + paidBy(p), 0);
    const owe = perShare * g.members.length;
    return { g, shares: g.members.length, put, owe, bal: put - owe };
  });

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 1800); };
  const P = "trip/kitty";

  const addExpense = (e) => {
    e.preventDefault();
    const n = Number(String(amt).replace(/[^\d.]/g, ""));
    if (!n) return;
    store.set(`${P}/expenses/${uid()}`, { amt: n, what: what.trim() || cat, cat, day, ts: Date.now() });
    setAmt(""); setWhat("");
    flash("已記低 " + yen(n));
  };
  const addRound = () => {
    const last = rounds[rounds.length - 1];
    store.set(`${P}/rounds/${uid()}`, { amount: last ? last.amount : 10000, paid: {}, ts: Date.now() });
  };

  const summary = () => [
    "💰 *北海道公數袋*",
    `總收：${yen(collected)}`,
    `已用：${yen(spent)}`,
    `剩餘：${yen(left)}（約 ${hkd(left, rate)}）`,
    `每份已用：${yen(perShare)}`,
    "",
    "*每人夾咗*",
    ...PEOPLE.map((p) => `${p}：${yen(paidBy(p))}`),
    "",
    "*各組結算*（退＝退返，補＝要補）",
    ...groupRows.map((r) => `${r.g.name}（${r.g.members.join("、")}）${r.shares}份：夾 ${yen(r.put)}／用 ${yen(r.owe)}／${r.bal >= 0 ? "退" : "補"} ${yen(Math.abs(r.bal))}`),
  ].join("\n");
  const copySummary = async () => {
    try { await navigator.clipboard.writeText(summary()); flash("已複製，可以貼落 WhatsApp"); }
    catch (e) { window.prompt("複製下面文字：", summary()); }
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
        const toObj = (v) => (Array.isArray(v) ? Object.fromEntries(v.map((x) => [x.id || uid(), x])) : v || {});
        if (!d.rounds || !d.expenses) throw new Error("bad");
        if (window.confirm("用呢個檔覆蓋雲端公數袋紀錄？全部人都會見到。")) {
          store.set(P, { rate: d.rate || rate, rounds: toObj(d.rounds), expenses: toObj(d.expenses) });
          flash("已匯入");
        }
      } catch (err) { flash("檔案格式唔啱"); }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  return (
    <div className="page">
      <div className="page-head">
        <PurseArt />
        <div><h1 className="title left">公數袋</h1><p className="subtitle left">7份：A組2份・B組3份・C組2份</p></div>
      </div>

      <div className="card kitty-sum">
        <div className="ks-row">
          <div><div className="ks-l">總收</div><div className="ks-v">{yen(collected)}</div></div>
          <div><div className="ks-l">已用</div><div className="ks-v">{yen(spent)}</div></div>
          <div><div className="ks-l">剩餘</div><div className={"ks-v" + (left < 0 ? " neg" : "")}>{yen(left)}</div></div>
        </div>
        <div className="bar"><div className="bar-fill coral" style={{ width: pct + "%" }} /></div>
        <div className="ks-foot">
          剩餘約 {hkd(left, rate)}・每份已用 {yen(perShare)}
          {left < 0 ? <span className="warn">・公數袋唔夠錢，要加一輪</span> : null}
        </div>
      </div>

      {editing ? (
        <>
          <h2 className="sec">記一筆支出</h2>
          <form className="card plain exp-form" onSubmit={addExpense}>
            <div className="add-row">
              <input className="input amt" inputMode="numeric" placeholder="¥ 金額" value={amt} onChange={(e) => setAmt(e.target.value)} aria-label="金額（日元）" />
              <input className="input" placeholder="項目（可唔填）" value={what} onChange={(e) => setWhat(e.target.value)} aria-label="項目" />
            </div>
            <div className="chips">{CATS.map((c) => <button type="button" key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}</div>
            <div className="chips">{DAYS.map((d, i) => <button type="button" key={d.d} className={"chip small" + (day === i ? " on" : "")} onClick={() => setDay(i)}>D{i + 1}</button>)}</div>
            <button className="btn full" type="submit">記低</button>
            {msg ? <div className="toast" role="status">{msg}</div> : null}
          </form>
        </>
      ) : (
        <button className="card plain lock-note" onClick={askUnlock}>
          <LockIcon open={false} /> 要記數？撳呢度入 PIN 解鎖
        </button>
      )}

      <h2 className="sec">夾錢紀錄</h2>
      {kitty === undefined ? <div className="card plain empty">載入中…</div> : null}
      {rounds.map((r, ri) => {
        const n = PEOPLE.filter((p) => r.paid && r.paid[p]).length;
        return (
          <div key={r.id} className="card plain round">
            <div className="round-head">
              <span className="round-title">第 {ri + 1} 輪・每人</span>
              {editing ? (
                <input className="input tiny" inputMode="numeric" defaultValue={r.amount} key={r.amount}
                  onBlur={(e) => { const v = Number(e.target.value.replace(/\D/g, "")) || 0; if (v !== r.amount) store.set(`${P}/rounds/${r.id}/amount`, v); }}
                  aria-label={`第${ri + 1}輪每人金額`} />
              ) : <b>{yen(r.amount)}</b>}
              <span className="muted">已收 {n}/{total}</span>
            </div>
            {GROUPS.map((g) => (
              <div key={g.id} className="round-grp">
                <span className="grp-dot" style={{ background: g.color }}>{g.id}</span>
                {g.members.map((p) => {
                  const on = !!(r.paid && r.paid[p]);
                  return (
                    <button key={p} className={"person" + (on ? " paid" : "")} aria-pressed={on} disabled={!editing}
                      onClick={() => store.set(`${P}/rounds/${r.id}/paid/${p}`, on ? null : true)}>
                      {on ? "✓ " : ""}{p}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="round-foot">
              <span>呢輪收咗 {yen(n * r.amount)}</span>
              {editing ? (
                <span>
                  <button className="link-btn" onClick={() => store.set(`${P}/rounds/${r.id}/paid`, Object.fromEntries(PEOPLE.map((p) => [p, true])))}>全部已俾</button>
                  {rounds.length > 1 ? <button className="link-btn danger" onClick={() => { if (window.confirm("刪除呢一輪夾錢？")) store.remove(`${P}/rounds/${r.id}`); }}>刪除</button> : null}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
      {editing ? <button className="btn full ghost" onClick={addRound}>＋ 再夾一輪</button> : null}

      <h2 className="sec">各組結算</h2>
      <div className="card plain">
        <table className="settle">
          <thead><tr><th>組</th><th>份</th><th>已夾</th><th>應分</th><th>結餘</th></tr></thead>
          <tbody>
            {groupRows.map((r) => (
              <tr key={r.g.id}>
                <td><span className="grp-dot" style={{ background: r.g.color }}>{r.g.id}</span></td>
                <td>{r.shares}</td><td>{yen(r.put)}</td><td>{yen(r.owe)}</td>
                <td className={r.bal >= 0 ? "pos" : "neg"}>{r.bal >= 0 ? "退" : "補"}{yen(Math.abs(r.bal))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hint">應分＝已用 ÷ 7 × 份數。「退」＝完咗旅程退返俾嗰組。</div>
      </div>

      <h2 className="sec">支出紀錄（{expenses.length}）</h2>
      {kitty !== undefined && expenses.length === 0 ? <div className="card plain empty">未有支出</div> : null}
      <ul className="exp-list">
        {expenses.map((e) => (
          <li key={e.id} className="card exp">
            <span className="tag" style={{ background: "#FBEAD0" }}>D{(Number(e.day) || 0) + 1}・{e.cat}</span>
            <span className="exp-what">{e.what}</span>
            <span className="exp-amt">{yen(e.amt)}</span>
            {editing ? <button className="x" aria-label={"刪除 " + e.what} onClick={() => { if (window.confirm(`刪除「${e.what} ${yen(e.amt)}」？`)) store.remove(`${P}/expenses/${e.id}`); }}>×</button> : null}
          </li>
        ))}
      </ul>

      <h2 className="sec">分享＋備份</h2>
      <div className="card plain">
        <button className="btn full" onClick={copySummary}>複製總結去 WhatsApp</button>
        {!editing && msg ? <div className="toast" role="status">{msg}</div> : null}
        <div className="row2">
          <button className="btn ghost" onClick={exportJson}>匯出備份</button>
          {editing ? <button className="btn ghost" onClick={() => fileRef.current && fileRef.current.click()}>匯入備份</button> : null}
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
        </div>
        <label className="rate">
          匯率 1 日元 =
          {editing ? (
            <input className="input tiny" inputMode="decimal" value={rateDraft ?? rate} onChange={(e) => setRateDraft(e.target.value)}
              onBlur={() => { const v = Number(rateDraft); if (v > 0) store.set(`${P}/rate`, v); setRateDraft(null); }} aria-label="日元兌港元匯率" />
          ) : <b>{rate}</b>}
          港元
        </label>
      </div>
    </div>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  const [tab, setTab] = usePersist("hok-tab", "home");
  const [day, setDay] = useState(() => Math.max(0, tripDayIndex()));
  const [editing, setEditing] = usePersist("hok-edit", false);
  const [status, setStatus] = useState(store.mode === "local" ? "local" : "connecting");
  const remoteDays = useShared("trip/days");
  const days = asArray(remoteDays).length ? asArray(remoteDays) : DAYS;

  useSeed();
  useEffect(() => store.onStatus(setStatus), []);
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const askUnlock = () => {
    const pin = window.prompt("輸入 PIN 解鎖編輯模式");
    if (pin == null) return;
    if (pin.trim() === EDIT_PIN) setEditing(true);
    else window.alert("PIN 唔啱");
  };
  const toggleEdit = () => {
    if (editing) { if (window.confirm("鎖返編輯模式？")) setEditing(false); }
    else askUnlock();
  };
  const goPlan = (i) => { setDay(i); setTab("plan"); };

  return (
    <div className="app">
      <TopNav tab={tab} setTab={setTab} editing={editing} toggleEdit={toggleEdit} status={status} />
      {editing ? <div className="edit-banner">編輯模式中・改嘅嘢全部人即時見到</div> : null}
      <main className={editing ? "with-banner" : ""}>
        {tab === "home" && <Home goPlan={goPlan} setTab={setTab} days={days} status={status} />}
        {tab === "plan" && <Plan days={days} day={Math.min(day, days.length - 1)} setDay={setDay} editing={editing} />}
        {tab === "todo" && <Todo />}
        {tab === "stay" && <Stay />}
        {tab === "money" && <Money editing={editing} askUnlock={askUnlock} />}
      </main>
    </div>
  );
}
