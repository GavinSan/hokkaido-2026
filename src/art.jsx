import React from "react";

const INK = "#3E3A39";
const PAPER = "#FFFCF6";
const CORAL = "#F2A497";
const YELLOW = "#F6D27A";
const MIZU = "#A8D3E6";
const GREEN = "#B9DAA5";
const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" };

function Leaf({ x, y, fill, cls, delay }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={cls} style={{ animationDelay: delay }}>
        <path d="M0 -7 L2 -2 L7 -3 L4 1 L6 6 L0 3 L-6 6 L-4 1 L-7 -3 L-2 -2 Z" fill={fill} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function Tree({ x, y, fill }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 V22" {...S} />
      <g className="sway" style={{ transformOrigin: "0px 22px" }}>
        <circle cx="0" cy="-6" r="15" fill={fill} {...S} />
      </g>
    </g>
  );
}

/* ---------- 首頁大插圖：地方 × 季節 × 幾多架車 ---------- */
const SEASONS = {
  spring: { sky: "#BFE2F0", grass: "#C6E3B0", far: "#D8EDCB", mount: "#B9DAA5", trees: ["#F7C9D6", "#FBE0E8"], sun: YELLOW, road: PAPER, sand: "#F4E2B4" },
  summer: { sky: "#9ED4EC", grass: "#A5D58A", far: "#C3E4AE", mount: "#9CCB7E", trees: ["#7DB866", "#A9D68F"], sun: YELLOW, road: PAPER, sand: "#F4E2B4" },
  autumn: { sky: MIZU, grass: GREEN, far: "#CFE5C1", mount: GREEN, trees: [CORAL, YELLOW], sun: YELLOW, road: PAPER, sand: "#F1DFB3" },
  winter: { sky: "#CFE2EC", grass: "#F7F5F0", far: "#E6EEF2", mount: "#EEF3F5", trees: ["#F4F7F8", "#E3EDF1"], sun: "#FBE7B5", road: "#E4DFD8", sand: "#EFE7D6" },
};
export const SCENES = ["hokkaido", "tokyo", "kyoto", "beach", "camp"];
export function seasonOf(dateStr) {
  const m = Number(String(dateStr || "").slice(5, 7)) || 10;
  return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter";
}
const reduced = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

function Pine({ x, y, fill, snow }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 8 V24" {...S} />
      <g className="sway" style={{ transformOrigin: "0px 24px" }}>
        <path d="M-15 12 L0 -12 L15 12 Z" fill={fill} {...S} />
        <path d="M-11 -2 L0 -24 L11 -2 Z" fill={fill} {...S} />
        {snow ? <path d="M-5 -16 L0 -24 L5 -16 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" /> : null}
      </g>
    </g>
  );
}
function Palm({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 24 Q-5 6 2 -14" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
      <path d="M0 24 Q-5 6 2 -14" fill="none" stroke="#C99A6A" strokeWidth="4" strokeLinecap="round" />
      <g className="sway" style={{ transformOrigin: "2px -14px" }}>
        {[-150, -100, -40, 10, 60].map((r) => (
          <path key={r} d="M0 0 Q12 -9 24 -2 Q12 -3 0 0 Z" transform={`translate(2 -14) rotate(${r})`} fill="#7DB866" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        ))}
        <circle cx="0" cy="-11" r="3" fill="#B0835A" stroke={INK} strokeWidth="1.5" />
        <circle cx="5" cy="-11" r="3" fill="#B0835A" stroke={INK} strokeWidth="1.5" />
      </g>
    </g>
  );
}
function ClockTower() {
  return (
    <g transform="translate(232 92)">
      <rect x="0" y="34" width="78" height="44" fill={PAPER} {...S} />
      <path d="M-6 36 L39 14 L84 36 Z" fill={CORAL} {...S} />
      <rect x="27" y="-6" width="24" height="26" fill={PAPER} {...S} />
      <path d="M23 -4 L39 -22 L55 -4 Z" fill={CORAL} {...S} />
      <circle cx="39" cy="7" r="7" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
      <path d="M39 7 V3 M39 7 H42" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <rect x="10" y="48" width="12" height="16" rx="2" fill={MIZU} stroke={INK} strokeWidth="2.5" />
      <rect x="56" y="48" width="12" height="16" rx="2" fill={MIZU} stroke={INK} strokeWidth="2.5" />
      <rect x="33" y="54" width="12" height="24" rx="2" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
    </g>
  );
}
const TOWER = "#EE7B57";
function TokyoTower() {
  return (
    <g transform="translate(238 0)">
      <path d="M0 22 V36" {...S} />
      <path d="M-30 162 Q-12 112 -7 66 H7 Q12 112 30 162 H17 Q0 132 -17 162 Z" fill={TOWER} {...S} />
      <path d="M-7 66 L-4 36 H4 L7 66 Z" fill={TOWER} {...S} />
      <rect x="-17" y="92" width="34" height="9" rx="2" fill={PAPER} {...S} />
      <rect x="-8" y="50" width="16" height="7" rx="2" fill={PAPER} stroke={INK} strokeWidth="2.4" />
      <path d="M-12 120 H12 M-20 142 H20" stroke={PAPER} strokeWidth="4" />
      <g className="glow"><circle cx="0" cy="22" r="3" fill={CORAL} stroke={INK} strokeWidth="1.8" /></g>
    </g>
  );
}
function Skyline() {
  const B = [[4, 112, 36, 50, PAPER], [44, 90, 30, 72, "#D6EAF2"], [78, 122, 26, 40, "#F4EFE8"], [108, 102, 40, 60, PAPER], [154, 118, 30, 44, "#D6EAF2"], [296, 98, 34, 64, "#F4EFE8"], [334, 120, 30, 42, PAPER]];
  return (
    <g>
      {B.map(([x, y, w, h, f], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill={f} {...S} />
          {Array.from({ length: Math.floor((h - 14) / 12) }).map((_, r) => Array.from({ length: Math.floor((w - 6) / 10) }).map((__, c) => (
            <rect key={r + "-" + c} x={x + 6 + c * 10} y={y + 7 + r * 12} width="4.5" height="6" rx="1" fill={(r + c + i) % 3 ? MIZU : YELLOW} stroke={INK} strokeWidth="1.1" />
          )))}
        </g>
      ))}
    </g>
  );
}
function Pagoda() {
  const cx = 246, roof = "#6E7F86";
  const tiers = [0, 1, 2, 3, 4].map((i) => ({ w: 34 - i * 4, bottom: 150 - i * 20 }));
  return (
    <g>
      <rect x={cx - 30} y="150" width="60" height="12" fill="#E8DFD5" {...S} />
      {tiers.map(({ w, bottom }, i) => {
        const top = bottom - 12, r = w / 2 + 11;
        return (
          <g key={i}>
            <rect x={cx - w / 2} y={top} width={w} height="12" fill={i % 2 ? PAPER : CORAL} stroke={INK} strokeWidth="2.4" />
            <path d={`M${cx - r} ${top + 1} Q${cx - r + 6} ${top - 3} ${cx - r + 11} ${top - 8} H${cx + r - 11} Q${cx + r - 6} ${top - 3} ${cx + r} ${top + 1} Z`} fill={roof} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
          </g>
        );
      })}
      <path d={`M${cx} 50 V26`} {...S} />
      <path d={`M${cx - 4} 34 H${cx + 4} M${cx - 4} 41 H${cx + 4}`} stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}
function Torii({ cx }) {
  const red = "#E0604A";
  return (
    <g>
      <rect x={cx - 21} y="118" width="6" height="44" fill={red} stroke={INK} strokeWidth="2.4" />
      <rect x={cx + 15} y="118" width="6" height="44" fill={red} stroke={INK} strokeWidth="2.4" />
      <rect x={cx - 26} y="124" width="52" height="5" fill={red} stroke={INK} strokeWidth="2.2" />
      <path d={`M${cx - 34} 112 Q${cx} 118 ${cx + 34} 112 L${cx + 32} 118 Q${cx} 123 ${cx - 32} 118 Z`} fill={red} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
    </g>
  );
}
function Lighthouse() {
  return (
    <g transform="translate(-42 0)">
      <path d="M258 160 Q266 136 290 134 Q314 136 322 160 Z" fill="#BDB4AA" {...S} />
      <path d="M281 136 L284 84 H296 L299 136 Z" fill={PAPER} {...S} />
      <path d="M282.6 110 L283.4 98 H296.6 L297.4 110 Z M281.6 128 L282.2 120 H297.8 L298.4 128 Z" fill={CORAL} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <g className="glow"><rect x="283" y="72" width="14" height="12" rx="2" fill={YELLOW} stroke={INK} strokeWidth="2.4" /></g>
      <path d="M280 73 L290 62 L300 73 Z" fill={CORAL} {...S} />
    </g>
  );
}

function CarShape({ color, n }) {
  return (
    <>
      <path d="M0 22 V12 Q2 6 10 6 L16 -4 Q18 -7 24 -7 H44 Q50 -7 53 -2 L60 6 Q68 7 68 14 V22 Z" fill={color} {...S} />
      <path d="M20 4 L25 -3 H34 V4 Z M39 4 V-3 H45 L51 4 Z" fill={MIZU} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {n ? <><circle cx="34" cy="14" r="6" fill={PAPER} stroke={INK} strokeWidth="1.8" /><text x="34" y="17.3" textAnchor="middle" fontSize="9" fontWeight="700" fill={INK} fontFamily="Huninn, sans-serif">{n}</text></> : null}
      <circle cx="16" cy="23" r="6" fill={INK} /><circle cx="16" cy="23" r="2" fill={PAPER} />
      <circle cx="52" cy="23" r="6" fill={INK} /><circle cx="52" cy="23" r="2" fill={PAPER} />
    </>
  );
}
// 細車仔（清單用）
export function CarIcon({ color = CORAL, size = 34 }) {
  return (
    <svg viewBox="-3 -10 74 40" width={size} height={size * 40 / 74} aria-hidden="true" className="car-icon"><CarShape color={color} /></svg>
  );
}

function Cars({ cars, still }) {
  const n = cars.length;
  if (!n) return null;
  const GAP = 82;
  if (n <= 3) {
    const W = n * 68 + (n - 1) * 14;
    const x0 = n === 2 ? 70 : (360 - W) / 2;
    return cars.map((c, i) => (
      <g key={i} className={"bob" + (i % 2 ? " bob-2" : "")}>
        <g transform={`translate(${x0 + i * GAP} 166)`}><CarShape color={c.color} n={n > 1 ? i + 1 : 0} /></g>
      </g>
    ));
  }
  const W = n * GAP - 14;
  if (still) {
    const k = Math.min(1, 344 / W);
    return (
      <g transform={`matrix(${k} 0 0 ${k} ${(360 - W * k) / 2} ${195 * (1 - k)})`}>
        {cars.map((c, i) => <g key={i} transform={`translate(${i * GAP} 166)`}><CarShape color={c.color} n={i + 1} /></g>)}
      </g>
    );
  }
  // 太多架：成隊車慢慢駛過
  const P = Math.max(W + 50, 380);
  const convoy = (off) => cars.map((c, i) => (
    <g key={off + "-" + i} className={"bob" + (i % 2 ? " bob-2" : "")}><g transform={`translate(${off + i * GAP} 166)`}><CarShape color={c.color} n={i + 1} /></g></g>
  ));
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" from="0 0" to={`${P} 0`} dur={`${(P / 38).toFixed(1)}s`} repeatCount="indefinite" />
      {convoy(0)}{convoy(-P)}
    </g>
  );
}
function Train({ still }) {
  const car = (x, front) => (
    <g key={x} transform={`translate(${x} 0)`}>
      <path d={front ? "M0 174 H50 Q62 174 64 188 V200 H0 Z" : "M0 174 H60 V200 H0 Z"} fill={front ? CORAL : YELLOW} {...S} />
      <rect x="8" y="179" width="12" height="9" rx="2" fill={MIZU} stroke={INK} strokeWidth="2.2" />
      <rect x="26" y="179" width="12" height="9" rx="2" fill={MIZU} stroke={INK} strokeWidth="2.2" />
      {front ? <path d="M46 179 H54 Q58 180 59 188 H46 Z" fill={MIZU} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" /> : <rect x="44" y="179" width="10" height="9" rx="2" fill={MIZU} stroke={INK} strokeWidth="2.2" />}
      <circle cx="14" cy="202" r="4.5" fill={INK} /><circle cx="46" cy="202" r="4.5" fill={INK} />
    </g>
  );
  const body = <g className="bob">{car(0)}{car(66)}{car(132, true)}</g>;
  if (still) return <g transform="translate(92 0)">{body}</g>;
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" from="-210 0" to="380 0" dur="11s" repeatCount="indefinite" />
      {body}
    </g>
  );
}

const SCENE_ALT = { hokkaido: "北海道：雪山同時計台", tokyo: "東京：高樓同東京鐵塔", kyoto: "京都：五重塔同鳥居", beach: "海邊：燈塔同椰樹", camp: "山野：雪山、湖同帳篷" };
const SEASON_ALT = { spring: "春天櫻花", summer: "夏天", autumn: "秋天紅葉", winter: "冬天落雪" };

export function HeroArt({ scene = "hokkaido", season = "autumn", cars = [], drive = true, still: stillProp = false, className = "" }) {
  const P = SEASONS[season] || SEASONS.autumn;
  const still = stillProp || reduced();
  const treeAt = [[30, 148], [205, 150], [335, 148]];
  const ground = scene === "beach" ? P.sand : P.grass;
  const winter = season === "winter";
  return (
    <svg viewBox="0 0 360 230" className={"hero-svg " + className + (stillProp ? " still" : "")} role="img" aria-label={`${SCENE_ALT[scene] || ""}・${SEASON_ALT[season] || ""}・${drive ? `${cars.length} 架車` : "火車"}`}>
      <rect x="0" y="0" width="360" height="230" fill={P.sky} />
      <g className="spin-slow" style={{ transformOrigin: "300px 46px" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M300 18 V10" {...S} transform={`rotate(${a} 300 46)`} />)}
      </g>
      <circle cx="300" cy="46" r={season === "summer" ? 21 : 18} fill={P.sun} {...S} />
      <g className="drift"><path d="M40 52 a12 12 0 0 1 22 -6 a14 14 0 0 1 26 4 a10 10 0 0 1 2 20 h-48 a10 10 0 0 1 -2 -18 z" fill={PAPER} {...S} /></g>
      <g className="drift drift-2"><path d="M170 34 a9 9 0 0 1 16 -4 a11 11 0 0 1 20 3 a8 8 0 0 1 1 15 h-36 a8 8 0 0 1 -1 -14 z" fill={PAPER} {...S} /></g>
      {season === "summer" && !still ? (
        <g className="drift drift-2" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round">
          <path d="M228 70 q4 -5 8 0 q4 -5 8 0" /><path d="M250 58 q3 -4 6 0 q3 -4 6 0" />
        </g>
      ) : null}

      {/* 背景 */}
      {scene === "hokkaido" ? (
        <g>
          <path d="M-10 160 L95 62 L200 160 Z" fill={P.mount} {...S} />
          <path d="M72 84 L95 62 L118 84 L108 80 L100 88 L92 80 L84 88 Z" fill={PAPER} {...S} />
          <path d="M140 160 L210 100 L290 160 Z" fill={P.far} {...S} />
          <ClockTower />
        </g>
      ) : scene === "tokyo" ? (
        <g><Skyline /><TokyoTower /></g>
      ) : scene === "kyoto" ? (
        <g>
          <path d="M-10 162 Q60 92 130 138 Q190 98 250 128 Q320 96 370 136 V162 Z" fill={P.far} {...S} />
          <Pagoda />
          <Torii cx={140} />
        </g>
      ) : scene === "beach" ? (
        <g>
          <path d="M-5 116 H365 V164 H-5 Z" fill="#86C8E2" {...S} />
          <path d="M14 117 Q44 92 78 117 Z" fill={P.mount} {...S} />
          <g className="wave" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round">
            <path d="M100 132 q6 -5 12 0 t12 0 M170 146 q6 -5 12 0 t12 0 M40 144 q6 -5 12 0 t12 0" />
          </g>
          <Lighthouse />
        </g>
      ) : (
        <g>
          <path d="M-10 160 L70 70 L150 160 Z" fill={P.mount} {...S} />
          <path d="M52 90 L70 70 L88 90 L80 87 L74 93 L66 87 L60 92 Z" fill={PAPER} {...S} />
          <path d="M110 160 L205 82 L300 160 Z" fill={P.far} {...S} />
          <path d="M186 98 L205 82 L224 98 L214 95 L205 101 L196 95 Z" fill={PAPER} {...S} />
          <path d="M240 160 L305 104 L370 160 Z" fill={P.mount} {...S} />
        </g>
      )}

      {/* 地面＋路 */}
      <rect x="-5" y="158" width="370" height="80" fill={ground} {...S} />
      {scene === "camp" ? (
        <g>
          <ellipse cx="272" cy="171" rx="46" ry="8" fill="#8FCBE3" stroke={INK} strokeWidth="2.6" />
          <path d="M126 180 L150 142 L174 180 Z" fill={CORAL} {...S} />
          <path d="M150 142 L143 180 H157 Z" fill={YELLOW} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        </g>
      ) : null}
      {drive ? (
        <>
          <path d="M-5 186 H365 V214 H-5 Z" fill={P.road} {...S} />
          <path d="M10 200 H40 M70 200 H100 M130 200 H160 M190 200 H220 M250 200 H280 M310 200 H340" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M-5 203 H365 M-5 211 H365" stroke={INK} strokeWidth="3" />
          <path d="M6 199 V215 M26 199 V215 M46 199 V215 M66 199 V215 M86 199 V215 M106 199 V215 M126 199 V215 M146 199 V215 M166 199 V215 M186 199 V215 M206 199 V215 M226 199 V215 M246 199 V215 M266 199 V215 M286 199 V215 M306 199 V215 M326 199 V215 M346 199 V215" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        </>
      )}

      {treeAt.map(([x, y], i) => {
        const f = P.trees[i % 2];
        if (scene === "beach") return i === 1 ? null : <Palm key={i} x={x} y={y} />;
        if (scene === "camp") return <Pine key={i} x={i === 1 ? 104 : x} y={y} fill={winter ? P.trees[0] : i % 2 ? "#7DB866" : "#5E9E58"} snow={winter} />;
        if (scene === "kyoto" && i === 1) return <Tree key={i} x={196} y={y} fill={f} />;
        return <Tree key={i} x={x} y={y} fill={f} />;
      })}

      {drive ? <Cars cars={cars} still={still} /> : <Train still={still} />}

      {/* 季節效果 */}
      {stillProp ? null : season === "autumn" ? (
        <>
          <Leaf x={120} y={40} fill={CORAL} cls="fall" delay="0s" />
          <Leaf x={250} y={20} fill={YELLOW} cls="fall" delay="2.2s" />
          <Leaf x={60} y={10} fill={CORAL} cls="fall" delay="4s" />
        </>
      ) : season === "spring" ? (
        [[90, 30, "0s"], [210, 12, "1.6s"], [40, 20, "3.1s"], [300, 70, "4.4s"], [160, 4, "5.6s"]].map(([x, y, d], i) => (
          <g key={i} transform={`translate(${x} ${y})`}><g className="fall" style={{ animationDelay: d }}><ellipse cx="0" cy="0" rx="5" ry="3.2" fill="#F7C9D6" stroke={INK} strokeWidth="1.5" /></g></g>
        ))
      ) : season === "winter" ? (
        [[30, 10, "0s"], [90, 30, "1.2s"], [150, 0, "2.6s"], [210, 24, ".6s"], [270, 8, "3.4s"], [330, 30, "1.9s"], [60, 60, "4.1s"], [240, 50, "4.8s"], [180, 70, "2.1s"]].map(([x, y, d], i) => (
          <g key={i} transform={`translate(${x} ${y})`}><g className="snow" style={{ animationDelay: d }}><circle cx="0" cy="0" r="3.2" fill="#fff" stroke={INK} strokeWidth="1.3" /></g></g>
        ))
      ) : null}
    </svg>
  );
}

/* ---------- 每日小插圖 ---------- */
const DAY_ART = {
  fireworks: (
    <g>
      <rect x="0" y="0" width="64" height="64" fill="#CDE6F0" />
      <g className="pop" style={{ transformOrigin: "24px 24px" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d="M24 14 V6" stroke={CORAL} strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 24 24)`} />
        ))}
        <circle cx="24" cy="24" r="5" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
      </g>
      <g className="pop pop-2" style={{ transformOrigin: "44px 36px" }}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d="M44 29 V24" stroke={YELLOW} strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 44 36)`} />
        ))}
        <circle cx="44" cy="36" r="3.5" fill={CORAL} stroke={INK} strokeWidth="2" />
      </g>
      <path d="M0 54 H64 V64 H0 Z" fill={MIZU} {...S} />
    </g>
  ),
  clock: (
    <g>
      <rect x="0" y="0" width="64" height="64" fill="#D6EAF2" />
      <rect x="12" y="36" width="40" height="22" fill={PAPER} {...S} />
      <path d="M8 38 L32 26 L56 38 Z" fill={CORAL} {...S} />
      <rect x="24" y="12" width="16" height="16" fill={PAPER} {...S} />
      <path d="M21 13 L32 2 L43 13 Z" fill={CORAL} {...S} />
      <g className="tick" style={{ transformOrigin: "32px 20px" }}>
        <circle cx="32" cy="20" r="4.5" fill={YELLOW} stroke={INK} strokeWidth="2" />
        <path d="M32 20 V17" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </g>
  ),
  canal: (
    <g>
      <rect x="0" y="0" width="64" height="64" fill="#D6EAF2" />
      <rect x="6" y="18" width="30" height="22" fill={CORAL} {...S} />
      <path d="M6 18 L21 9 L36 18" fill="none" {...S} />
      <rect x="15" y="26" width="6" height="8" fill={YELLOW} stroke={INK} strokeWidth="2" />
      <path d="M48 40 V16" {...S} />
      <g className="glow"><circle cx="48" cy="13" r="5" fill={YELLOW} stroke={INK} strokeWidth="2.5" /></g>
      <path d="M0 42 H64 V64 H0 Z" fill={MIZU} {...S} />
      <g className="wave"><path d="M8 52 q5 -4 10 0 t10 0 M36 56 q5 -4 10 0 t10 0" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" /></g>
    </g>
  ),
  lake: (
    <g>
      <rect x="0" y="0" width="64" height="64" fill="#D6EAF2" />
      <path d="M2 38 L22 14 L42 38 Z" fill={GREEN} {...S} />
      <path d="M16 21 L22 14 L28 21 L24 20 L22 23 L20 20 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M30 38 L46 22 L62 38 Z" fill="#CFE5C1" {...S} />
      <ellipse cx="32" cy="50" rx="30" ry="12" fill={MIZU} {...S} />
      <ellipse cx="34" cy="49" rx="8" ry="3.5" fill={GREEN} stroke={INK} strokeWidth="2.2" />
      <g className="bob"><path d="M12 52 h10 l-2 3 h-6 z" fill={CORAL} stroke={INK} strokeWidth="2" strokeLinejoin="round" /></g>
    </g>
  ),
  crab: (
    <g>
      <rect x="0" y="0" width="64" height="64" fill="#FBEAD0" />
      <g className="scuttle">
        <path d="M14 40 L6 46 M16 44 L10 52 M50 40 L58 46 M48 44 L54 52" {...S} />
        <ellipse cx="32" cy="38" rx="18" ry="11" fill={CORAL} {...S} />
        <path d="M20 30 Q12 20 16 14" fill="none" {...S} />
        <path d="M44 30 Q52 20 48 14" fill="none" {...S} />
        <circle cx="16" cy="12" r="5" fill={CORAL} {...S} />
        <circle cx="48" cy="12" r="5" fill={CORAL} {...S} />
        <circle cx="26" cy="35" r="2.2" fill={INK} />
        <circle cx="38" cy="35" r="2.2" fill={INK} />
        <path d="M29 42 q3 2 6 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  ),
  onsen: (
    <g>
      <rect x="0" y="0" width="64" height="64" fill="#FBEAD0" />
      <g className="steam">
        <path d="M20 26 q-4 -6 0 -12 t0 -12" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M32 26 q-4 -6 0 -12 t0 -12" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M44 26 q-4 -6 0 -12 t0 -12" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      </g>
      <path d="M8 34 H56 Q56 56 32 56 Q8 56 8 34 Z" fill={MIZU} {...S} />
      <path d="M8 34 H56" {...S} />
    </g>
  ),
  plane: (
    <g>
      <rect x="0" y="0" width="64" height="64" fill="#D6EAF2" />
      <g className="drift-small">
        <path d="M6 44 a6 6 0 0 1 10 -3 a7 7 0 0 1 12 2 a5 5 0 0 1 0 9 h-20 a5 5 0 0 1 -2 -8 z" fill={PAPER} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      </g>
      <g className="fly">
        <path d="M10 30 L50 18 Q58 16 58 21 Q58 25 50 26 L14 34 Z" fill={PAPER} {...S} />
        <path d="M30 24 L22 10 L30 10 L40 22 Z" fill={CORAL} {...S} />
        <path d="M30 30 L26 40 L33 40 L38 28 Z" fill={CORAL} {...S} />
      </g>
    </g>
  ),
};

export function DayArt({ kind, size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="day-art" aria-hidden="true">
      <clipPath id={`clip-${kind}`}><rect x="0" y="0" width="64" height="64" rx="14" /></clipPath>
      <g clipPath={`url(#clip-${kind})`}>{DAY_ART[kind]}</g>
      <rect x="1.5" y="1.5" width="61" height="61" rx="14" fill="none" stroke={INK} strokeWidth="3" />
    </svg>
  );
}

/* ---------- 住宿：小屋 ---------- */
export function HouseArt() {
  return (
    <svg viewBox="0 0 120 90" className="side-art" aria-hidden="true">
      <g className="steam"><path d="M86 18 q-3 -5 0 -10 t0 -10" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" /></g>
      <rect x="80" y="20" width="12" height="20" fill={CORAL} {...S} />
      <rect x="24" y="44" width="72" height="40" fill={PAPER} {...S} />
      <path d="M14 48 L60 14 L106 48 Z" fill={CORAL} {...S} />
      <rect x="52" y="58" width="16" height="26" rx="2" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
      <rect x="32" y="56" width="13" height="13" rx="2" fill={MIZU} stroke={INK} strokeWidth="2.5" />
      <rect x="76" y="56" width="13" height="13" rx="2" fill={MIZU} stroke={INK} strokeWidth="2.5" />
      <path d="M4 84 H116" {...S} />
    </svg>
  );
}

/* ---------- 預訂：小屋＋機票 ---------- */
export function BookingArt() {
  return (
    <svg viewBox="0 0 120 90" className="side-art" aria-hidden="true">
      <rect x="10" y="44" width="56" height="38" fill={PAPER} {...S} />
      <path d="M2 48 L38 18 L74 48 Z" fill={CORAL} {...S} />
      <rect x="31" y="58" width="13" height="24" rx="2" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
      <rect x="15" y="55" width="11" height="11" rx="2" fill={MIZU} stroke={INK} strokeWidth="2.5" />
      <g className="sway" style={{ transformOrigin: "92px 80px" }}>
        <g transform="rotate(-10 92 60)">
          <path d="M66 42 H118 V52 a5 5 0 0 0 0 10 V72 H66 V62 a5 5 0 0 0 0 -10 Z" fill={MIZU} {...S} />
          <path d="M100 44 V70" stroke={INK} strokeWidth="2" strokeDasharray="3 3" />
          <g transform="translate(84 57) rotate(90) scale(.9)"><path d="M0 -8 Q2 -8 2 -4 V-1 L8 3 V5 L2 3 V6 L4 8 V9 L0 8 L-4 9 V8 L-2 6 V3 L-8 5 V3 L-2 -1 V-4 Q-2 -8 0 -8 Z" fill={CORAL} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" /></g>
        </g>
      </g>
      <path d="M2 84 H118" {...S} />
    </svg>
  );
}

/* ---------- 公數袋：がま口銀包 ---------- */
export function PurseArt() {
  return (
    <svg viewBox="0 0 120 90" className="side-art" aria-hidden="true">
      <g className="bob">
        <circle cx="52" cy="14" r="5" fill={YELLOW} {...S} />
        <circle cx="68" cy="14" r="5" fill={YELLOW} {...S} />
        <path d="M30 30 Q60 18 90 30" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <path d="M24 34 H96 Q104 80 60 82 Q16 80 24 34 Z" fill={CORAL} {...S} />
        <path d="M24 34 H96" {...S} />
        <text x="60" y="66" textAnchor="middle" fontSize="22" fontWeight="700" fill={INK} fontFamily="Huninn, sans-serif">¥</text>
      </g>
      <g className="coin">
        <circle cx="102" cy="22" r="9" fill={YELLOW} {...S} />
        <path d="M102 18 V26" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ---------- 清單：行李箱 ---------- */
export function BagArt() {
  return (
    <svg viewBox="0 0 120 90" className="side-art" aria-hidden="true">
      <g className="sway" style={{ transformOrigin: "60px 84px" }}>
        <path d="M48 26 V16 Q48 12 52 12 H68 Q72 12 72 16 V26" fill="none" {...S} />
        <rect x="28" y="26" width="64" height="54" rx="10" fill={MIZU} {...S} />
        <path d="M44 26 V80 M76 26 V80" stroke={INK} strokeWidth="3" />
        <circle cx="60" cy="50" r="9" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
        <path d="M56 50 l3 3 l5 -6" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M8 84 H112" {...S} />
    </svg>
  );
}

export function PlaneMini({ color = CORAL }) {
  return (
    <svg viewBox="0 0 40 20" width="40" height="20" aria-hidden="true">
      <path d="M2 10 H36" stroke={INK} strokeWidth="2.5" strokeDasharray="2 5" strokeLinecap="round" />
      <g transform="translate(20 10) rotate(90)">
        <path d="M0 -8 Q2 -8 2 -4 V-1 L8 3 V5 L2 3 V6 L4 8 V9 L0 8 L-4 9 V8 L-2 6 V3 L-8 5 V3 L-2 -1 V-4 Q-2 -8 0 -8 Z" fill={color} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
