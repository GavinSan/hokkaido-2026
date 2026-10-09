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

/* ---------- 首頁大插圖：羊蹄山、時計台、楓樹、自駕車 ---------- */
export function HeroArt() {
  return (
    <svg viewBox="0 0 360 230" className="hero-svg" role="img" aria-label="北海道秋天插圖：雪山、札幌時計台、紅葉同兩架車">
      <rect x="0" y="0" width="360" height="230" fill={MIZU} />
      <g className="spin-slow" style={{ transformOrigin: "300px 46px" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d="M300 18 V10" {...S} transform={`rotate(${a} 300 46)`} />
        ))}
      </g>
      <circle cx="300" cy="46" r="18" fill={YELLOW} {...S} />

      <g className="drift">
        <path d="M40 52 a12 12 0 0 1 22 -6 a14 14 0 0 1 26 4 a10 10 0 0 1 2 20 h-48 a10 10 0 0 1 -2 -18 z" fill={PAPER} {...S} />
      </g>
      <g className="drift drift-2">
        <path d="M170 34 a9 9 0 0 1 16 -4 a11 11 0 0 1 20 3 a8 8 0 0 1 1 15 h-36 a8 8 0 0 1 -1 -14 z" fill={PAPER} {...S} />
      </g>

      {/* 羊蹄山 */}
      <path d="M-10 160 L95 62 L200 160 Z" fill={GREEN} {...S} />
      <path d="M72 84 L95 62 L118 84 L108 80 L100 88 L92 80 L84 88 Z" fill={PAPER} {...S} />
      <path d="M140 160 L210 100 L290 160 Z" fill="#CFE5C1" {...S} />

      {/* 時計台 */}
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

      {/* 草地＋路 */}
      <rect x="-5" y="158" width="370" height="80" fill={GREEN} {...S} />
      <path d="M-5 186 H365 V214 H-5 Z" fill={PAPER} {...S} />
      <path d="M10 200 H40 M70 200 H100 M130 200 H160 M190 200 H220 M250 200 H280 M310 200 H340" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0" />

      <Tree x={30} y={148} fill={CORAL} />
      <Tree x={205} y={150} fill={YELLOW} />
      <Tree x={335} y={148} fill={CORAL} />

      {/* 兩架車 */}
      <g className="bob">
        <g transform="translate(70 166)">
          <path d="M0 22 V12 Q2 6 10 6 L16 -4 Q18 -7 24 -7 H44 Q50 -7 53 -2 L60 6 Q68 7 68 14 V22 Z" fill={CORAL} {...S} />
          <path d="M20 4 L25 -3 H34 V4 Z M39 4 V-3 H45 L51 4 Z" fill={MIZU} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="16" cy="23" r="6" fill={INK} /><circle cx="16" cy="23" r="2" fill={PAPER} />
          <circle cx="52" cy="23" r="6" fill={INK} /><circle cx="52" cy="23" r="2" fill={PAPER} />
        </g>
      </g>
      <g className="bob bob-2">
        <g transform="translate(150 166)">
          <path d="M0 22 V12 Q2 6 10 6 L16 -4 Q18 -7 24 -7 H44 Q50 -7 53 -2 L60 6 Q68 7 68 14 V22 Z" fill={YELLOW} {...S} />
          <path d="M20 4 L25 -3 H34 V4 Z M39 4 V-3 H45 L51 4 Z" fill={MIZU} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="16" cy="23" r="6" fill={INK} /><circle cx="16" cy="23" r="2" fill={PAPER} />
          <circle cx="52" cy="23" r="6" fill={INK} /><circle cx="52" cy="23" r="2" fill={PAPER} />
        </g>
      </g>

      <Leaf x={120} y={40} fill={CORAL} cls="fall" delay="0s" />
      <Leaf x={250} y={20} fill={YELLOW} cls="fall" delay="2.2s" />
      <Leaf x={60} y={10} fill={CORAL} cls="fall" delay="4s" />
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
