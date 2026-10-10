import React, { useEffect, useMemo, useRef, useState } from "react";
import { TRIP, PEOPLE, GROUPS, FLIGHTS, STAY_NEAR, STAYS_SEED, DAYS, BACKUP, TODO_SEED, EDIT_PIN } from "./data.js";
import { HeroArt, DayArt, HouseArt, PurseArt, BagArt, PlaneMini } from "./art.jsx";
import { createStore } from "./store.js";
import { LangCtx, useLang, useT, tr, pick, WEEK_EN, EN_DAYS, EN_STOPS, EN_TODO, EN_CAT, withEn } from "./i18n.js";

const store = createStore();
const SCHEMA_V = 3;

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

const mapsUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const navUrl = (q) => "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + encodeURIComponent(q);

function tripDayIndex(now = new Date()) {
  const jst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  const ymd = `${jst.getFullYear()}-${String(jst.getMonth() + 1).padStart(2, "0")}-${String(jst.getDate()).padStart(2, "0")}`;
  const diff = Math.round((new Date(ymd + "T00:00:00") - new Date(TRIP.startDate + "T00:00:00")) / 86400000);
  return diff >= 0 && diff < DAYS.length ? diff : -1;
}

const MOVE = {
  car: { k: "m_car", bg: "#F2A497" },
  walk: { k: "m_walk", bg: "#B9DAA5" },
  train: { k: "m_train", bg: "#A8D3E6" },
  plane: { k: "m_plane", bg: "#A8D3E6" },
  taxi: { k: "m_taxi", bg: "#F6D27A" },
};
const groupOf = (id) => GROUPS.find((g) => g.id === id);
const weekday = (lang, w) => (lang === "en" ? WEEK_EN[w] || w : w);

/* ---------------- 首次開／升級：寫入預設資料 ---------------- */
function useSeedAndMigrate() {
  const meta = useShared("trip/meta");
  const days = useShared("trip/days");
  const todo = useShared("trip/todo");
  const stays = useShared("trip/stays");
  const done = useRef(false);

  useEffect(() => {
    if (done.current || meta === undefined) return;
    const now = Date.now();

    // 全新數據庫
    if (meta === null) {
      done.current = true;
      const map = { "trip/meta": { seeded: now, v: SCHEMA_V }, "trip/days": withEn(DAYS), "trip/kitty/rate": 0.052, "trip/stays": STAYS_SEED };
      TODO_SEED.forEach((t, i) => { map[`trip/todo/t${i}`] = { text: t.text, en: EN_TODO[t.text] || null, cat: t.cat, done: false, ts: now + i }; });
      map["trip/kitty/rounds/r1"] = { amount: 30000, paid: {}, ts: now };
      store.update(map);
      return;
    }

    // 舊版數據：加英文、加住宿
    if ((meta.v || 0) < SCHEMA_V) {
      if (days === undefined || todo === undefined || stays === undefined) return;
      done.current = true;
      const map = { "trip/meta/v": SCHEMA_V };
      asArray(days).forEach((d, di) => {
        if (!d.en && EN_DAYS[d.title]) map[`trip/days/${di}/en`] = EN_DAYS[d.title];
        asArray(d.stops).forEach((s, si) => {
          if (!s.en && EN_STOPS[s.name]) map[`trip/days/${di}/stops/${si}/en`] = EN_STOPS[s.name];
        });
      });
      Object.entries(todo || {}).forEach(([id, it]) => { if (!it.en && EN_TODO[it.text]) map[`trip/todo/${id}/en`] = EN_TODO[it.text]; });
      if (!stays) map["trip/stays"] = STAYS_SEED;
      store.update(map);
    } else {
      done.current = true;
    }
  }, [meta, days, todo, stays]);
}

/* ---------------- 頂部固定選單 ---------------- */
const TABS = ["home", "plan", "todo", "stay", "money"];
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
function PinSheet({ onOk, onClose }) {
  const t = useT();
  const [pin, setPin] = useState("");
  const [bad, setBad] = useState(false);
  const press = (k) => {
    if (k === "del") { setPin((p) => p.slice(0, -1)); return; }
    if (k === "clr") { setPin(""); return; }
    const next = (pin + k).slice(0, EDIT_PIN.length);
    setPin(next);
    setBad(false);
    if (next.length === EDIT_PIN.length) {
      if (next === EDIT_PIN) setTimeout(onOk, 120);
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
        {Array.from({ length: EDIT_PIN.length }).map((_, i) => <span key={i} className={"pin-dot" + (i < pin.length ? " on" : "")} />)}
      </div>
      <div className="pin-msg">{bad ? t("pinWrong") : " "}</div>
      <div className="keypad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clr", "0", "del"].map((k) => (
          <button key={k} className={"key" + (k.length > 1 ? " fn" : "")} onClick={() => press(k)} aria-label={k === "del" ? "⌫" : k === "clr" ? t("clear") : k}>
            {k === "del" ? "⌫" : k === "clr" ? t("clear") : k}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* ---------------- 首頁 ---------------- */
function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), ms); return () => clearInterval(id); }, [ms]);
  return now;
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
        <div className="cd-foot">{t("departLine")}</div>
      </div>
    );
  }
  if (di >= 0) {
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
        <div className="apt"><div className="apt-code">{f.from}</div><div className="apt-name">{p("fromName")}</div><div className="apt-time">{p("dep")}</div></div>
        <PlaneMini color={f.color} />
        <div className="apt right"><div className="apt-code">{f.to}</div><div className="apt-name">{p("toName")}</div><div className="apt-time">{f.arr}</div></div>
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

function Home({ goPlan, setTab, days, status, setLang }) {
  const t = useT();
  const lang = useLang();
  return (
    <div className="page">
      <div className="hero card"><HeroArt /></div>
      <div className="title-row">
        <h1 className="title">{lang === "en" ? TRIP.titleEn : TRIP.title}</h1>
      </div>
      <p className="subtitle">{t("subtitle")}</p>
      <LangSwitch lang={lang} setLang={setLang} />
      <Countdown goPlan={goPlan} days={days} />

      <h2 className="sec">{t("flights")}</h2>
      <div className="flights">{FLIGHTS.map((f) => <FlightCard key={f.id} f={f} />)}</div>

      <h2 className="sec">{t("overview")}</h2>
      <div className="overview">
        {days.map((day, i) => (
          <button key={day.d} className="card ov-item" onClick={() => goPlan(i)}>
            <DayArt kind={day.icon} size={48} />
            <div><div className="ov-date">{day.d}（{weekday(lang, day.w)}）</div><div className="ov-title">{pick(lang, day, "title")}</div></div>
          </button>
        ))}
      </div>

      <div className="quick">
        <button className="btn" onClick={() => setTab("stay")}>{t("stayInfo")}</button>
        <button className="btn yellow" onClick={() => setTab("money")}>{t("kitty")}</button>
      </div>
      <p className="sync-line"><span className="sync-dot inline" style={{ background: STATUS_C[status] }} />{t("st_" + status)}{status === "online" ? t("everyoneSame") : ""}</p>
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
function Timeline({ stops, editing, showGroup, onEdit, onReorder }) {
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
          <li key={s._i + "-" + s.t + s.name} className={"tl-item" + (isDrag ? " lifted" : "")} style={style}>
            <div className="tl-time">{s.t}</div>
            <div className="tl-dot" style={{ background: s.must ? "#F6D27A" : "#FFFCF6" }} />
            <div className={"card tl-card" + (s.must ? " must" : "")}>
              <div className="tl-tags">
                <MoveTag move={s.move} />
                {s.must ? <span className="tag must-tag">{t("must")}</span> : null}
                {s.book ? <span className={"tag book-tag" + (s.booked ? " ok" : "")}>{s.booked ? t("booked") : t("needBook")}</span> : null}
                {showGroup ? <GroupTag g={s.group} /> : null}
              </div>
              <div className="tl-name">{name}</div>
              {dish ? <div className="tl-dish">{t("mustEat")}{dish}</div> : null}
              {note ? <div className="tl-note">{note}</div> : null}
              <div className="tl-links">
                <a href={mapsUrl(s.q || s.name)} target="_blank" rel="noreferrer">{t("map")}</a>
                <a href={navUrl(s.q || s.name)} target="_blank" rel="noreferrer" className="go">{t("nav")}</a>
                {editing ? <button className="edit-btn small" onClick={() => onEdit(s._i)}>{t("edit")}</button> : null}
              </div>
              {editing ? (
                <button className="drag-handle" aria-label={t("dragHint")}
                  onPointerDown={(e) => start(e, i)} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
                  <span /><span /><span />
                </button>
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
  const [s, setS] = useState(() => ({ t: "12:00", name: "", q: "", must: false, book: false, booked: false, dish: "", note: "", group: "", ...stop, move: stop && stop.move ? { ...stop.move } : null }));
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
          <span className="muted">{ask.a && ask.b ? t("between", { a: ask.a, b: ask.b }) : ""}</span></p>
        <input className="input time big" type="time" value={v} onChange={(e) => setV(e.target.value)} required aria-label={t("time")} />
        <div className="row2">
          <button type="button" className="btn ghost" onClick={onClose}>{t("cancel")}</button>
          <button className="btn" type="submit">{t("ok")}</button>
        </div>
      </form>
    </Sheet>
  );
}

function DayEditor({ day, onSave, onClose }) {
  const t = useT();
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
          {editing ? <button className="edit-btn" onClick={() => setEditor("day")}>{t("edit")}</button> : null}
        </div>
        {editing ? <p className="hint center">{t("dragHint")}</p> : null}

        {sections.map((sec) => (
          <div key={sec.key} className="tl-section">
            {sec.g ? <div className="grp-head" style={{ background: sec.g.color }}>{pick(lang, sec.g, "name")}・{sec.g.members.join(lang === "en" ? ", " : "、")}・{pick(lang, sec.g, "dest")}</div> : null}
            <Timeline stops={sec.stops} editing={editing} showGroup={sec.key === "all"} onEdit={(idx) => setEditor({ idx })} onReorder={onReorder(sec.stops)} />
          </div>
        ))}
        {editing ? <button className="btn full ghost" onClick={() => setEditor({ idx: null })}>{t("addStop")}</button> : null}
      </div>

      <h2 className="sec">{t("backup")}</h2>
      {BACKUP.map((b) => (
        <div key={b.name} className="card plain">
          <div className="tl-name">{pick(lang, b, "name")}</div>
          <div className="tl-note">{pick(lang, b, "addr")}・<a href={"tel:" + b.tel}>{b.tel}</a></div>
          <div className="tl-note">{pick(lang, b, "note")}</div>
        </div>
      ))}

      {editor === "day" ? (
        <DayEditor day={data} onClose={() => setEditor(null)} onSave={(v) => {
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
function Todo() {
  const t = useT();
  const lang = useLang();
  const raw = useShared("trip/todo");
  const items = toList(raw).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const [text, setText] = useState("");
  const done = items.filter((i) => i.done).length;
  const cats = [...new Set(items.map((i) => i.cat || "其他"))];
  const label = (it) => (lang === "en" && it.en ? it.en : it.text);

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
        <div><h1 className="title left">{t("todoTitle")}</h1><p className="subtitle left">{t("doneOf", { a: done, b: items.length })}</p></div>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} /></div>
      <form className="add-row" onSubmit={add}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("addItem")} aria-label={t("addItem")} />
        <button className="btn" type="submit">{t("add")}</button>
      </form>
      {raw === undefined ? <div className="card plain empty">{t("loading")}</div> : null}
      {cats.map((c) => (
        <div key={c}>
          <h2 className="sec small">{lang === "en" ? EN_CAT[c] || c : c}</h2>
          <ul className="todo-list">
            {items.filter((i) => (i.cat || "其他") === c).map((it) => (
              <li key={it.id} className={"card todo" + (it.done ? " done" : "")}>
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

/* ---------------- 公數袋 ---------------- */
const CATS = [["食", "c_food"], ["油／泊車", "c_car"], ["門票", "c_ticket"], ["交通", "c_transport"], ["超市", "c_super"], ["其他", "c_other"]];
const catLabel = (lang, c) => { const f = CATS.find(([zh]) => zh === c); return f ? tr(lang, f[1]) : c; };

function Money({ editing, askUnlock }) {
  const t = useT();
  const lang = useLang();
  const kitty = useShared("trip/kitty");
  const k = kitty || {};
  const rate = k.rate || 0.052;
  const rounds = toList(k.rounds).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const expenses = toList(k.expenses).sort((a, b) => (b.ts || 0) - (a.ts || 0));

  const [amt, setAmt] = useState("");
  const [what, setWhat] = useState("");
  const [cat, setCat] = useState(CATS[0][0]);
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

  const flash = (x) => { setMsg(x); setTimeout(() => setMsg(""), 1800); };
  const P = "trip/kitty";

  const addExpense = (e) => {
    e.preventDefault();
    const n = Number(String(amt).replace(/[^\d.]/g, ""));
    if (!n) return;
    store.set(`${P}/expenses/${uid()}`, { amt: n, what: what.trim() || cat, cat, day, ts: Date.now() });
    setAmt(""); setWhat("");
    flash(t("logged", { x: yen(n) }));
  };
  const addRound = () => {
    const last = rounds[rounds.length - 1];
    store.set(`${P}/rounds/${uid()}`, { amount: last ? last.amount : 10000, paid: {}, ts: Date.now() });
  };

  const summary = () => (lang === "en" ? [
    "💰 *Hokkaido Kitty*",
    `In: ${yen(collected)}`, `Spent: ${yen(spent)}`, `Left: ${yen(left)} (≈ ${hkd(left, rate)})`, `Spent per share: ${yen(perShare)}`,
    "", "*Paid in*", ...PEOPLE.map((p) => `${p}: ${yen(paidBy(p))}`),
    "", "*By group*",
    ...groupRows.map((r) => `${pick("en", r.g, "name")} (${r.g.members.join(", ")}) ×${r.shares}: in ${yen(r.put)} / share ${yen(r.owe)} / ${r.bal >= 0 ? "refund" : "owe"} ${yen(Math.abs(r.bal))}`),
  ] : [
    "💰 *北海道公數袋*",
    `總收：${yen(collected)}`, `已用：${yen(spent)}`, `剩餘：${yen(left)}（約 ${hkd(left, rate)}）`, `每份已用：${yen(perShare)}`,
    "", "*每人夾咗*", ...PEOPLE.map((p) => `${p}：${yen(paidBy(p))}`),
    "", "*各組結算*（退＝退返，補＝要補）",
    ...groupRows.map((r) => `${r.g.name}（${r.g.members.join("、")}）${r.shares}份：夾 ${yen(r.put)}／用 ${yen(r.owe)}／${r.bal >= 0 ? "退" : "補"} ${yen(Math.abs(r.bal))}`),
  ]).join("\n");
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
        const toObj = (v) => (Array.isArray(v) ? Object.fromEntries(v.map((x) => [x.id || uid(), x])) : v || {});
        if (!d.rounds || !d.expenses) throw new Error("bad");
        if (window.confirm(t("importQ"))) { store.set(P, { rate: d.rate || rate, rounds: toObj(d.rounds), expenses: toObj(d.expenses) }); flash(t("imported")); }
      } catch (err) { flash(t("badFile")); }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  return (
    <div className="page">
      <div className="page-head">
        <PurseArt />
        <div><h1 className="title left">{t("kitty")}</h1><p className="subtitle left">{t("kittySub")}</p></div>
      </div>

      <div className="card kitty-sum">
        <div className="ks-row">
          <div><div className="ks-l">{t("collected")}</div><div className="ks-v">{yen(collected)}</div></div>
          <div><div className="ks-l">{t("spent")}</div><div className="ks-v">{yen(spent)}</div></div>
          <div><div className="ks-l">{t("left")}</div><div className={"ks-v" + (left < 0 ? " neg" : "")}>{yen(left)}</div></div>
        </div>
        <div className="bar"><div className="bar-fill coral" style={{ width: pct + "%" }} /></div>
        <div className="ks-foot">{t("approx", { x: hkd(left, rate), y: yen(perShare) })}{left < 0 ? <span className="warn">{t("short")}</span> : null}</div>
      </div>

      {editing ? (
        <>
          <h2 className="sec">{t("addExp")}</h2>
          <form className="card plain exp-form" onSubmit={addExpense}>
            <div className="add-row">
              <input className="input amt" inputMode="numeric" pattern="[0-9]*" placeholder={t("amount")} value={amt} onChange={(e) => setAmt(e.target.value)} aria-label={t("amount")} />
              <input className="input" placeholder={t("item")} value={what} onChange={(e) => setWhat(e.target.value)} aria-label={t("item")} />
            </div>
            <div className="chips">{CATS.map(([c, key]) => <button type="button" key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{t(key)}</button>)}</div>
            <div className="chips">{DAYS.map((d, i) => <button type="button" key={d.d} className={"chip small" + (day === i ? " on" : "")} onClick={() => setDay(i)}>D{i + 1}</button>)}</div>
            <button className="btn full" type="submit">{t("logIt")}</button>
            {msg ? <div className="toast" role="status">{msg}</div> : null}
          </form>
        </>
      ) : (
        <button className="card plain lock-note" onClick={askUnlock}><LockIcon open={false} /> {t("unlockToLog")}</button>
      )}

      <h2 className="sec">{t("rounds")}</h2>
      {kitty === undefined ? <div className="card plain empty">{t("loading")}</div> : null}
      {rounds.map((r, ri) => {
        const n = PEOPLE.filter((p) => r.paid && r.paid[p]).length;
        return (
          <div key={r.id} className="card plain round">
            <div className="round-head">
              <span className="round-title">{t("roundN", { n: ri + 1 })}</span>
              {editing ? (
                <input className="input tiny" inputMode="numeric" pattern="[0-9]*" defaultValue={r.amount} key={r.amount}
                  onBlur={(e) => { const v = Number(e.target.value.replace(/\D/g, "")) || 0; if (v !== r.amount) store.set(`${P}/rounds/${r.id}/amount`, v); }}
                  aria-label={t("roundN", { n: ri + 1 })} />
              ) : <b>{yen(r.amount)}</b>}
              <span className="muted">{t("gotN", { a: n, b: total })}</span>
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
              <span>{t("roundTotal", { x: yen(n * r.amount) })}</span>
              {editing ? (
                <span>
                  <button className="link-btn" onClick={() => store.set(`${P}/rounds/${r.id}/paid`, Object.fromEntries(PEOPLE.map((p) => [p, true])))}>{t("allPaid")}</button>
                  {rounds.length > 1 ? <button className="link-btn danger" onClick={() => { if (window.confirm(t("delRound"))) store.remove(`${P}/rounds/${r.id}`); }}>{t("del")}</button> : null}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
      {editing ? <button className="btn full ghost" onClick={addRound}>{t("topUp")}</button> : null}

      <h2 className="sec">{t("settle")}</h2>
      <div className="card plain">
        <table className="settle">
          <thead><tr><th>{t("grp")}</th><th>{t("shares")}</th><th>{t("put")}</th><th>{t("owe")}</th><th>{t("bal")}</th></tr></thead>
          <tbody>
            {groupRows.map((r) => (
              <tr key={r.g.id}>
                <td><span className="grp-dot" style={{ background: r.g.color }}>{r.g.id}</span></td>
                <td>{r.shares}</td><td>{yen(r.put)}</td><td>{yen(r.owe)}</td>
                <td className={r.bal >= 0 ? "pos" : "neg"}>{r.bal >= 0 ? t("refund") : t("topup")}{yen(Math.abs(r.bal))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hint">{t("settleHint")}</div>
      </div>

      <h2 className="sec">{t("expenses", { n: expenses.length })}</h2>
      {kitty !== undefined && expenses.length === 0 ? <div className="card plain empty">{t("noExp")}</div> : null}
      <ul className="exp-list">
        {expenses.map((e) => (
          <li key={e.id} className="card exp">
            <span className="tag" style={{ background: "#FBEAD0" }}>D{(Number(e.day) || 0) + 1}・{catLabel(lang, e.cat)}</span>
            <span className="exp-what">{e.what === e.cat ? catLabel(lang, e.cat) : e.what}</span>
            <span className="exp-amt">{yen(e.amt)}</span>
            {editing ? <button className="x" aria-label={t("del") + " " + e.what} onClick={() => { if (window.confirm(t("delExp", { x: `${e.what} ${yen(e.amt)}` }))) store.remove(`${P}/expenses/${e.id}`); }}>×</button> : null}
          </li>
        ))}
      </ul>

      <h2 className="sec">{t("shareBackup")}</h2>
      <div className="card plain">
        <button className="btn full" onClick={copySummary}>{t("copySum")}</button>
        {!editing && msg ? <div className="toast" role="status">{msg}</div> : null}
        <div className="row2">
          <button className="btn ghost" onClick={exportJson}>{t("exportB")}</button>
          {editing ? <button className="btn ghost" onClick={() => fileRef.current && fileRef.current.click()}>{t("importB")}</button> : null}
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
        </div>
        <label className="rate">
          {t("rate")}
          {editing ? (
            <input className="input tiny" inputMode="decimal" value={rateDraft ?? rate} onChange={(e) => setRateDraft(e.target.value)}
              onBlur={() => { const v = Number(rateDraft); if (v > 0) store.set(`${P}/rate`, v); setRateDraft(null); }} aria-label={t("rate")} />
          ) : <b>{rate}</b>}
          {t("hkd")}
        </label>
      </div>
    </div>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  const [lang, setLang] = usePersist("hok-lang", "zh");
  const [tab, setTab] = usePersist("hok-tab", "home");
  const [day, setDay] = useState(() => Math.max(0, tripDayIndex()));
  const [editing, setEditing] = usePersist("hok-edit2", false);
  const [pinOpen, setPinOpen] = useState(false);
  const [status, setStatus] = useState(store.mode === "local" ? "local" : "connecting");
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
        {editing ? <div className="edit-banner">{tr(lang, "editBanner")}</div> : null}
        <main className={editing ? "with-banner" : ""}>
          {tab === "home" && <Home goPlan={goPlan} setTab={setTab} days={days} status={status} setLang={setLang} />}
          {tab === "plan" && <Plan days={days} day={Math.min(day, days.length - 1)} setDay={setDay} editing={editing} />}
          {tab === "todo" && <Todo />}
          {tab === "stay" && <Stay editing={editing} />}
          {tab === "money" && <Money editing={editing} askUnlock={askUnlock} />}
        </main>
        {pinOpen ? <PinSheet onOk={() => { setEditing(true); setPinOpen(false); }} onClose={() => setPinOpen(false)} /> : null}
      </div>
    </LangCtx.Provider>
  );
}
