/**
 * Illustrated burger layers for the scroll hero (viewBox width 360).
 * To use real photo cut-outs instead, replace each SVG with an <img> of the
 * same height (transparent PNG/WebP).
 */

function ruffle(top: number, bottom: number, amp: number, step = 20) {
  let d = `M8 ${top + amp}`;
  for (let x = 8; x < 352; x += step) d += ` Q ${x + step / 2} ${top - amp} ${x + step} ${top + amp}`;
  d += ` L 352 ${bottom - amp}`;
  for (let x = 352; x > 8; x -= step) d += ` Q ${x - step / 2} ${bottom + amp} ${x - step} ${bottom - amp}`;
  return d + " Z";
}

const seeds: [number, number, number][] = [
  [92, 52, -30], [130, 34, -12], [170, 24, 8], [210, 30, 20], [250, 44, 34], [282, 66, 40], [70, 80, -40],
  [118, 66, -18], [160, 54, 4], [200, 58, 14], [238, 72, 26], [140, 92, -8], [186, 86, 10], [226, 98, 22], [100, 100, -26],
];

export const LAYERS = [
  {
    id: "top",
    h: 130,
    svg: (
      <svg viewBox="0 0 360 130" className="block w-full" aria-hidden>
        <defs>
          <radialGradient id="bunTop" cx="38%" cy="22%" r="85%">
            <stop offset="0" stopColor="#f6b66a" />
            <stop offset="0.45" stopColor="#d27a2c" />
            <stop offset="1" stopColor="#7a3a10" />
          </radialGradient>
        </defs>
        <path d="M20 116C20 40 100 6 180 6s160 34 160 110q0 12-12 12H32q-12 0-12-12z" fill="url(#bunTop)" />
        <ellipse cx="130" cy="38" rx="70" ry="18" fill="#fff" opacity="0.16" />
        {seeds.map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx="5.5" ry="2.6" transform={`rotate(${r} ${x} ${y})`} fill="#f8e7c5" opacity="0.92" />
        ))}
        <path d="M24 118h312" stroke="#5c2a0b" strokeWidth="4" opacity="0.35" />
      </svg>
    ),
  },
  {
    id: "sauce",
    h: 26,
    svg: (
      <svg viewBox="0 0 360 26" className="block w-full" aria-hidden>
        <defs>
          <linearGradient id="sauce" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb36b" />
            <stop offset="1" stopColor="#e5520a" />
          </linearGradient>
        </defs>
        <path d="M24 6q36-6 76 0t80 0 80 0 76 0v6q-16 14-36 2-20 10-50 0-30 12-60 0-30 10-60 0-30 12-60 0-25 10-46-2z" fill="url(#sauce)" />
        <path d="M40 6q60-4 120 0" stroke="#fff" strokeWidth="2" opacity="0.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "cheese",
    h: 40,
    svg: (
      <svg viewBox="0 0 360 40" className="block w-full" aria-hidden>
        <defs>
          <linearGradient id="cheese" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd25c" />
            <stop offset="1" stopColor="#f09a10" />
          </linearGradient>
        </defs>
        <path d="M14 4h332v10h-16l-12 20-12-20h-56l-14 24-14-24h-72l-12 16-12-16H60l-12 22-12-22H14z" fill="url(#cheese)" stroke="#f09a10" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 8h300" stroke="#fff3c4" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "patty",
    h: 56,
    svg: (
      <svg viewBox="0 0 360 56" className="block w-full" aria-hidden>
        <defs>
          <linearGradient id="patty" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6b3519" />
            <stop offset="0.5" stopColor="#4a2210" />
            <stop offset="1" stopColor="#261007" />
          </linearGradient>
        </defs>
        <rect x="14" y="4" width="332" height="48" rx="24" fill="url(#patty)" stroke="rgba(255,106,26,0.35)" strokeWidth="1.5" />
        {[[60, 18], [110, 30], [160, 16], [205, 34], [250, 20], [300, 30], [85, 40], [180, 42], [275, 42], [135, 22], [228, 26]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={8 + (i % 3) * 4} ry="3" fill={i % 2 ? "#1d0b04" : "#8a4a26"} opacity="0.55" />
        ))}
        <path d="M40 12q140-8 280 0" stroke="#b06a3a" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "tomato",
    h: 30,
    svg: (
      <svg viewBox="0 0 360 30" className="block w-full" aria-hidden>
        {[110, 250].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="15" rx="92" ry="12" fill="#b81f1a" />
            <ellipse cx={cx} cy="14" rx="84" ry="9" fill="#e8442f" />
            {[-50, -20, 10, 40].map((dx) => (
              <ellipse key={dx} cx={cx + dx} cy="14" rx="9" ry="4" fill="#ffb199" opacity="0.7" />
            ))}
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "lettuce",
    h: 34,
    svg: (
      <svg viewBox="0 0 360 34" className="block w-full" aria-hidden>
        <defs>
          <linearGradient id="lettuce" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9bd65c" />
            <stop offset="1" stopColor="#3f8a2a" />
          </linearGradient>
        </defs>
        <path d={ruffle(8, 26, 6)} fill="url(#lettuce)" />
        <path d="M30 16q150-6 300 0" stroke="#d8f5a8" strokeWidth="1.5" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "bottom",
    h: 56,
    svg: (
      <svg viewBox="0 0 360 56" className="block w-full" aria-hidden>
        <defs>
          <linearGradient id="bunBot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e09748" />
            <stop offset="1" stopColor="#7e3e12" />
          </linearGradient>
        </defs>
        <path d="M22 6h316q10 0 7 10l-9 24q-4 12-18 12H42q-14 0-18-12l-9-24q-3-10 7-10z" fill="url(#bunBot)" />
        <path d="M24 9h312" stroke="#f6d39a" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      </svg>
    ),
  },
] as const;

// Layer top offsets (px, at 360px width) when stacked vs exploded.
export const STACKED = [0, 110, 122, 144, 190, 206, 226];
export const EXPLODED = [-70, 92, 146, 214, 302, 354, 420];
