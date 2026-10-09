import React, { useEffect, useMemo, useRef, useState } from "react";
import { TRIP, PEOPLE, GROUPS, FLIGHTS, STAY, DAYS, BACKUP, TODO_SEED } from "./data.js";
import { HeroArt, DayArt, HouseArt, PurseArt, BagArt, PlaneMini } from "./art.jsx";

/* ---------------- 小工具 ---------------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const yen = (n) => "¥" + Math.round(n || 0).toLocaleString("en-US");
const hkd = (n, rate) => "HK$" + Math.round((n || 0) * rate).toLocaleString("en-US");

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function usePersist(key, initial) {
  const [v, setV] = useState(() => load(key, typeof initial === "function" ? initial() : initial));
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* 私人模式之類，唔儲都照用 */ }
  }, [key, v]);
  return [v, setV];
}

function mapsUrl(q) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
}
function navUrl(q) {
  return "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + encodeURIComponent(q);
}

// 今日係旅程第幾日（0-based），唔喺旅程期間就 -1
function tripDayIndex(now = new Date()) {
  const jst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
  const ymd = `${jst.getFullYear()}-${String(jst.getMonth() + 1).padStart(2, "0")}-${String(jst.getDate()).padStart(2, "0")}`;
  const start = new Date(TRIP.startDate + "T00:00:00");
  const cur = new Date(ymd + "T00:00:00");
  const diff = Math.round((cur - start) / 86400000);
  return diff >= 0 && diff < DAYS.length ? diff : -1;
}

const MOVE = {
  car: { label: "自駕", bg: "#F2A497" },
  walk: { label: "步行", bg: "#B9DAA5" },
  plane: { label: "飛機", bg: "#A8D3E6" },
  taxi: { label: "的士", bg: "#F6D27A" },
};
const groupOf = (id) => GROUPS.find((g) => g.id === id);

/* ---------------- 頂部固定選單 ---------------- */
const TABS = [
  { id: "home", label: "首頁" },
  { id: "plan", label: "行程" },
  { id: "todo", label: "清單" },
  { id: "stay", label: "住宿" },
  { id: "money", label: "夾錢" },
];

function TopNav({ tab, setTab }) {
  return (
    <header className="topnav">
      <nav className="topnav-inner" aria-label="主選單">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={"nav-btn" + (tab === t.id ? " on" : "")}
            aria-current={tab === t.id ? "page" : undefined}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

/* ---------------- 首頁 ---------------- */
function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

function Countdown({ goPlan }) {
  const now = useNow(1000);
  const target = new Date(TRIP.departISO);
  const diff = target - now;
  const di = tripDayIndex(now);

  if (diff > 0) {
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return (
      <div className="card countdown">
        <div className="cd-label">距離出發仲有</div>
        <div className="cd-row">
          {[[d, "日"], [h, "時"], [m, "分"], [s, "秒"]].map(([v, u]) => (
            <div key={u} className="cd-cell">
              <div className="cd-num">{String(v).padStart(2, "0")}</div>
              <div className="cd-unit">{u}</div>
            </div>
          ))}
        </div>
        <div className="cd-foot">10/10（六）08:30 HX690 香港出發</div>
      </div>
    );
  }
  if (di >= 0) {
    const day = DAYS[di];
    return (
      <button className="card countdown today" onClick={() => goPlan(di)}>
        <div className="cd-label">旅程進行中</div>
        <div className="cd-big">第 {di + 1} 日・{day.title}</div>
        <div className="cd-foot">撳入去睇今日行程 →</div>
      </button>
    );
  }
  return (
    <div className="card countdown">
      <div className="cd-big">旅程完滿結束 🍁</div>
      <div className="cd-foot">下次再嚟北海道！</div>
    </div>
  );
}

function FlightCard({ f }) {
  return (
    <div className="card flight" style={{ "--accent": f.color }}>
      <div className="flight-top">
        <span className="flight-no">{f.no}</span>
        <span className="flight-date">{f.date}</span>
      </div>
      <div className="flight-route">
        <div className="apt">
          <div className="apt-code">{f.from}</div>
          <div className="apt-name">{f.fromName}</div>
          <div className="apt-time">{f.dep}</div>
        </div>
        <PlaneMini color={f.color} />
        <div className="apt right">
          <div className="apt-code">{f.to}</div>
          <div className="apt-name">{f.toName}</div>
          <div className="apt-time">{f.arr}</div>
        </div>
      </div>
      <div className="flight-who">
        {f.who}
        {f.note ? <span className="muted">・{f.note}</span> : null}
      </div>
    </div>
  );
}

function Home({ goPlan, setTab }) {
  return (
    <div className="page">
      <div className="hero card">
        <HeroArt />
      </div>
      <h1 className="title">{TRIP.title}</h1>
      <p className="subtitle">2026・10/10 – 10/16 ・{TRIP.sub}・7人2架車</p>

      <Countdown goPlan={goPlan} />

      <h2 className="sec">航班</h2>
      <div className="flights">
        {FLIGHTS.map((f) => <FlightCard key={f.id} f={f} />)}
      </div>

      <h2 className="sec">七日一覽</h2>
      <div className="overview">
        {DAYS.map((day, i) => (
          <button key={day.d} className="card ov-item" onClick={() => goPlan(i)}>
            <DayArt kind={day.icon} size={48} />
            <div>
              <div className="ov-date">{day.d}（{day.w}）</div>
              <div className="ov-title">{day.title}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="quick">
        <button className="btn" onClick={() => setTab("stay")}>住宿資料</button>
        <button className="btn yellow" onClick={() => setTab("money")}>公數袋</button>
      </div>
    </div>
  );
}

/* ---------------- 行程 ---------------- */
function MoveTag({ move }) {
  if (!move) return null;
  const m = MOVE[move.t];
  const txt = move.txt || (move.min ? (move.min >= 60 ? `${Math.floor(move.min / 60)}小時${move.min % 60 ? (move.min % 60) + "分" : ""}` : `${move.min}分`) : "");
  return (
    <span className="tag" style={{ background: m.bg }}>
      {m.label}{txt ? " " + txt : ""}
    </span>
  );
}

function GroupTag({ g }) {
  if (!g) return null;
  const ids = g.split("");
  return ids.map((id) => {
    const grp = groupOf(id);
    return (
      <span key={id} className="tag group" style={{ background: grp.color }}>
        {grp.name}
      </span>
    );
  });
}

function Plan({ day, setDay }) {
  const di = tripDayIndex();
  const data = DAYS[day];
  const railRef = useRef(null);

  useEffect(() => {
    const rail = railRef.current;
    const el = rail && rail.children[day];
    if (el && rail.scrollTo) rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [day]);

  // Day 7 按組排
  const sections = useMemo(() => {
    if (!data.stops.some((s) => s.group)) return [{ key: "all", stops: data.stops }];
    const out = [];
    GROUPS.forEach((g) => {
      const stops = data.stops.filter((s) => s.group && s.group.includes(g.id));
      if (stops.length) out.push({ key: g.id, g, stops });
    });
    return out;
  }, [data]);

  return (
    <div className="page">
      <div className="day-rail" ref={railRef} role="tablist" aria-label="揀日期">
        {DAYS.map((d, i) => (
          <button
            key={d.d}
            role="tab"
            aria-selected={i === day}
            className={"day-pill" + (i === day ? " on" : "")}
            onClick={() => setDay(i)}
          >
            <span className="dp-n">Day {i + 1}</span>
            <span className="dp-d">{d.d}</span>
            <span className="dp-w">{d.w}{i === di ? "・今日" : ""}</span>
          </button>
        ))}
      </div>

      <div key={day} className="bounce-in">
        <div className="card day-head">
          <DayArt kind={data.icon} size={64} />
          <div>
            <div className="dh-date">Day {day + 1}・{data.d}（{data.w}）</div>
            <div className="dh-title">{data.title}</div>
            <div className="dh-intro">{data.intro}</div>
          </div>
        </div>

        {sections.map((sec) => (
          <div key={sec.key} className="tl-section">
            {sec.g ? (
              <div className="grp-head" style={{ background: sec.g.color }}>
                {sec.g.name}・{sec.g.members.join("、")}・{sec.g.dest}
              </div>
            ) : null}
            <ol className="timeline">
              {sec.stops.map((s, i) => (
                <li key={s.t + s.name} className="tl-item" style={{ animationDelay: `${i * 45}ms` }}>
                  <div className="tl-time">{s.t}</div>
                  <div className="tl-dot" style={{ background: s.must ? "#F6D27A" : "#FFFCF6" }} />
                  <div className={"card tl-card" + (s.must ? " must" : "")}>
                    <div className="tl-tags">
                      <MoveTag move={s.move} />
                      {s.must ? <span className="tag must-tag">★ 必去</span> : null}
                      {s.book ? <span className="tag book-tag">要訂位</span> : null}
                      {sec.key === "all" ? <GroupTag g={s.group} /> : null}
                    </div>
                    <div className="tl-name">{s.name}</div>
                    {s.dish ? <div className="tl-dish">必食：{s.dish}</div> : null}
                    {s.note ? <div className="tl-note">{s.note}</div> : null}
                    {s.q ? (
                      <div className="tl-links">
                        <a href={mapsUrl(s.q)} target="_blank" rel="noreferrer">地圖</a>
                        <a href={navUrl(s.q)} target="_blank" rel="noreferrer" className="go">導航</a>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <h2 className="sec">後備餐廳</h2>
      {BACKUP.map((b) => (
        <div key={b.name} className="card plain">
          <div className="tl-name">{b.name}</div>
          <div className="tl-note">{b.addr}・<a href={"tel:" + b.tel}>{b.tel}</a></div>
          <div className="tl-note">{b.note}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 待辦清單 ---------------- */
function Todo() {
  const [items, setItems] = usePersist("hok-todo-v1", () => TODO_SEED.map((t) => ({ id: uid(), ...t, done: false })));
  const [text, setText] = useState("");
  const done = items.filter((i) => i.done).length;
  const cats = [...new Set(items.map((i) => i.cat || "其他"))];

  const add = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setItems([...items, { id: uid(), text: v, cat: "其他", done: false }]);
    setText("");
  };

  return (
    <div className="page">
      <div className="page-head">
        <BagArt />
        <div>
          <h1 className="title left">待辦清單</h1>
          <p className="subtitle left">完成 {done} / {items.length}</p>
        </div>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} /></div>

      <form className="add-row" onSubmit={add}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="加一項…" aria-label="新增待辦" />
        <button className="btn" type="submit">加</button>
      </form>

      {cats.map((c) => (
        <div key={c}>
          <h2 className="sec small">{c}</h2>
          <ul className="todo-list">
            {items.filter((i) => (i.cat || "其他") === c).map((it) => (
              <li key={it.id} className={"card todo" + (it.done ? " done" : "")}>
                <label className="todo-label">
                  <input
                    type="checkbox"
                    checked={it.done}
                    onChange={() => setItems(items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))}
                  />
                  <span className="check" aria-hidden="true" />
                  <span className="todo-text">{it.text}</span>
                </label>
                <button
                  className="x"
                  aria-label={"刪除 " + it.text}
                  onClick={() => setItems(items.filter((x) => x.id !== it.id))}
                >×</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="hint">清單儲喺你自己部手機。</p>
    </div>
  );
}

/* ---------------- 住宿 ---------------- */
function Stay() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(STAY.addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) { /* ignore */ }
  };
  return (
    <div className="page">
      <div className="page-head">
        <HouseArt />
        <div>
          <h1 className="title left">住宿</h1>
          <p className="subtitle left">{STAY.dates}</p>
        </div>
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
          <div className="tl-links">
            <a href={mapsUrl(n.name + " " + n.addr)} target="_blank" rel="noreferrer">地圖</a>
          </div>
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

/* ---------------- 公數袋 ---------------- */
const CATS = ["食", "油／泊車", "門票", "交通", "超市", "其他"];
const KITTY_INIT = {
  rate: 0.052,
  rounds: [{ id: "r1", amount: 30000, paid: {} }],
  expenses: [],
};

function Money() {
  const [k, setK] = usePersist("hok-kitty-v1", KITTY_INIT);
  const [amt, setAmt] = useState("");
  const [what, setWhat] = useState("");
  const [cat, setCat] = useState(CATS[0]);
  const [day, setDay] = useState(() => Math.max(0, tripDayIndex()));
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  const total = PEOPLE.length;
  const paidBy = (p) => k.rounds.reduce((sum, r) => sum + (r.paid[p] ? r.amount : 0), 0);
  const collected = PEOPLE.reduce((s, p) => s + paidBy(p), 0);
  const spent = k.expenses.reduce((s, e) => s + e.amt, 0);
  const left = collected - spent;
  const perShare = spent / total;
  const pct = collected ? Math.min(100, (spent / collected) * 100) : 0;

  const groupRows = GROUPS.map((g) => {
    const put = g.members.reduce((s, p) => s + paidBy(p), 0);
    const owe = perShare * g.members.length;
    return { g, shares: g.members.length, put, owe, bal: put - owe };
  });

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 1800); };

  const togglePaid = (rid, p) =>
    setK({ ...k, rounds: k.rounds.map((r) => (r.id === rid ? { ...r, paid: { ...r.paid, [p]: !r.paid[p] } } : r)) });
  const setRoundAmt = (rid, v) =>
    setK({ ...k, rounds: k.rounds.map((r) => (r.id === rid ? { ...r, amount: Math.max(0, Number(v) || 0) } : r)) });
  const addRound = () => {
    const last = k.rounds[k.rounds.length - 1];
    setK({ ...k, rounds: [...k.rounds, { id: uid(), amount: last ? last.amount : 10000, paid: {} }] });
  };
  const delRound = (rid) => {
    if (!window.confirm("刪除呢一輪夾錢？")) return;
    setK({ ...k, rounds: k.rounds.filter((r) => r.id !== rid) });
  };
  const allPaid = (rid) =>
    setK({ ...k, rounds: k.rounds.map((r) => (r.id === rid ? { ...r, paid: Object.fromEntries(PEOPLE.map((p) => [p, true])) } : r)) });

  const addExpense = (e) => {
    e.preventDefault();
    const n = Number(String(amt).replace(/[^\d.]/g, ""));
    if (!n) return;
    setK({ ...k, expenses: [{ id: uid(), amt: n, what: what.trim() || cat, cat, day, ts: Date.now() }, ...k.expenses] });
    setAmt("");
    setWhat("");
    flash("已記低 " + yen(n));
  };
  const delExpense = (id) => {
    if (!window.confirm("刪除呢筆支出？")) return;
    setK({ ...k, expenses: k.expenses.filter((x) => x.id !== id) });
  };

  const summary = () => {
    const lines = [
      "💰 *北海道公數袋*",
      `總收：${yen(collected)}`,
      `已用：${yen(spent)}`,
      `剩餘：${yen(left)}（約 ${hkd(left, k.rate)}）`,
      `每份已用：${yen(perShare)}`,
      "",
      "*每人夾咗*",
      ...PEOPLE.map((p) => `${p}：${yen(paidBy(p))}`),
      "",
      "*各組結算*（正數＝退返，負數＝要補）",
      ...groupRows.map((r) => `${r.g.name}（${r.g.members.join("、")}）${r.shares}份：夾 ${yen(r.put)}／用 ${yen(r.owe)}／${r.bal >= 0 ? "退" : "補"} ${yen(Math.abs(r.bal))}`),
    ];
    return lines.join("\n");
  };
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
        if (!Array.isArray(d.rounds) || !Array.isArray(d.expenses)) throw new Error("bad");
        if (window.confirm("用呢個檔覆蓋現有公數袋紀錄？")) { setK(d); flash("已匯入"); }
      } catch (err) { flash("檔案格式唔啱"); }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  return (
    <div className="page">
      <div className="page-head">
        <PurseArt />
        <div>
          <h1 className="title left">公數袋</h1>
          <p className="subtitle left">7份：A組2份・B組3份・C組2份</p>
        </div>
      </div>

      <div className="card kitty-sum">
        <div className="ks-row">
          <div><div className="ks-l">總收</div><div className="ks-v">{yen(collected)}</div></div>
          <div><div className="ks-l">已用</div><div className="ks-v">{yen(spent)}</div></div>
          <div><div className="ks-l">剩餘</div><div className={"ks-v" + (left < 0 ? " neg" : "")}>{yen(left)}</div></div>
        </div>
        <div className="bar"><div className="bar-fill coral" style={{ width: pct + "%" }} /></div>
        <div className="ks-foot">
          剩餘約 {hkd(left, k.rate)}・每份已用 {yen(perShare)}
          {left < 0 ? <span className="warn">・公數袋唔夠錢，要加一輪</span> : null}
        </div>
      </div>

      <h2 className="sec">記一筆支出</h2>
      <form className="card plain exp-form" onSubmit={addExpense}>
        <div className="add-row">
          <input
            className="input amt"
            inputMode="numeric"
            placeholder="¥ 金額"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
            aria-label="金額（日元）"
          />
          <input className="input" placeholder="項目（可唔填）" value={what} onChange={(e) => setWhat(e.target.value)} aria-label="項目" />
        </div>
        <div className="chips">
          {CATS.map((c) => (
            <button type="button" key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="chips">
          {DAYS.map((d, i) => (
            <button type="button" key={d.d} className={"chip small" + (day === i ? " on" : "")} onClick={() => setDay(i)}>D{i + 1}</button>
          ))}
        </div>
        <button className="btn full" type="submit">記低</button>
        {msg ? <div className="toast" role="status">{msg}</div> : null}
      </form>

      <h2 className="sec">夾錢紀錄</h2>
      {k.rounds.map((r, ri) => {
        const n = PEOPLE.filter((p) => r.paid[p]).length;
        return (
          <div key={r.id} className="card plain round">
            <div className="round-head">
              <span className="round-title">第 {ri + 1} 輪・每人</span>
              <input
                className="input tiny"
                inputMode="numeric"
                value={r.amount}
                onChange={(e) => setRoundAmt(r.id, e.target.value.replace(/[^\d]/g, ""))}
                aria-label={`第${ri + 1}輪每人金額`}
              />
              <span className="muted">已收 {n}/{total}</span>
            </div>
            {GROUPS.map((g) => (
              <div key={g.id} className="round-grp">
                <span className="grp-dot" style={{ background: g.color }}>{g.id}</span>
                {g.members.map((p) => (
                  <button
                    key={p}
                    className={"person" + (r.paid[p] ? " paid" : "")}
                    aria-pressed={!!r.paid[p]}
                    onClick={() => togglePaid(r.id, p)}
                  >
                    {r.paid[p] ? "✓ " : ""}{p}
                  </button>
                ))}
              </div>
            ))}
            <div className="round-foot">
              <span>呢輪收咗 {yen(n * r.amount)}</span>
              <span>
                <button className="link-btn" onClick={() => allPaid(r.id)}>全部已俾</button>
                {k.rounds.length > 1 ? <button className="link-btn danger" onClick={() => delRound(r.id)}>刪除</button> : null}
              </span>
            </div>
          </div>
        );
      })}
      <button className="btn full ghost" onClick={addRound}>＋ 再夾一輪</button>

      <h2 className="sec">各組結算</h2>
      <div className="card plain">
        <table className="settle">
          <thead>
            <tr><th>組</th><th>份</th><th>已夾</th><th>應分</th><th>結餘</th></tr>
          </thead>
          <tbody>
            {groupRows.map((r) => (
              <tr key={r.g.id}>
                <td><span className="grp-dot" style={{ background: r.g.color }}>{r.g.id}</span></td>
                <td>{r.shares}</td>
                <td>{yen(r.put)}</td>
                <td>{yen(r.owe)}</td>
                <td className={r.bal >= 0 ? "pos" : "neg"}>{r.bal >= 0 ? "退" : "補"}{yen(Math.abs(r.bal))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hint">應分＝已用 ÷ 7 × 份數。結餘正數＝完咗旅程退返俾嗰組。</div>
      </div>

      <h2 className="sec">支出紀錄（{k.expenses.length}）</h2>
      {k.expenses.length === 0 ? <div className="card plain empty">未有支出</div> : null}
      <ul className="exp-list">
        {k.expenses.map((e) => (
          <li key={e.id} className="card exp">
            <span className="tag" style={{ background: "#FBEAD0" }}>D{e.day + 1}・{e.cat}</span>
            <span className="exp-what">{e.what}</span>
            <span className="exp-amt">{yen(e.amt)}</span>
            <button className="x" aria-label={"刪除 " + e.what} onClick={() => delExpense(e.id)}>×</button>
          </li>
        ))}
      </ul>

      <h2 className="sec">分享＋備份</h2>
      <div className="card plain">
        <button className="btn full" onClick={copySummary}>複製總結去 WhatsApp</button>
        <div className="row2">
          <button className="btn ghost" onClick={exportJson}>匯出備份</button>
          <button className="btn ghost" onClick={() => fileRef.current && fileRef.current.click()}>匯入備份</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
        </div>
        <label className="rate">
          匯率 1 日元 =
          <input
            className="input tiny"
            inputMode="decimal"
            value={k.rate}
            onChange={(e) => setK({ ...k, rate: Number(e.target.value) || 0 })}
            aria-label="日元兌港元匯率"
          />
          港元
        </label>
        <p className="hint">紀錄儲喺呢部手機。建議由管公數袋嗰位負責記數，其他人睇 WhatsApp 總結就得。</p>
      </div>
    </div>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  const [tab, setTab] = usePersist("hok-tab", "home");
  const [day, setDay] = useState(() => Math.max(0, tripDayIndex()));

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const goPlan = (i) => { setDay(i); setTab("plan"); };

  return (
    <div className="app">
      <TopNav tab={tab} setTab={setTab} />
      <main>
        {tab === "home" && <Home goPlan={goPlan} setTab={setTab} />}
        {tab === "plan" && <Plan day={day} setDay={setDay} />}
        {tab === "todo" && <Todo />}
        {tab === "stay" && <Stay />}
        {tab === "money" && <Money />}
      </main>
    </div>
  );
}
