// One hand-drawn-style vine to lay across the door: a thin, curving stem with leaves, little
// curling tendrils and a few flowers. `seed` changes the curve and where the leaves grow so
// no two vines look the same.
const LEAF = "M0 0 C 5 -11 19 -12 26 0 C 19 12 5 11 0 0 Z";
const SPIRAL = "m0 0 c 7 -8 17 -3 14 6 c -3 8 -12 6 -11 -1 c 1 -4 6 -4 6 0";

function VineArt({ seed = 0 }) {
  const flip = seed % 2 === 1;
  const shift = (seed % 3) * 14;
  // leaves along the stem: x position, how far above/below the stem, and how they tilt
  const leaves = [
    { x: 24 + shift, y: -2, r: -50, s: 1 },
    { x: 58 + shift, y: 4, r: 130, s: 0.85 },
    { x: 96, y: -4, r: -35, s: 1.1 },
    { x: 130 - shift / 2, y: 6, r: 150, s: 0.9 },
    { x: 168, y: -4, r: -60, s: 1 },
    { x: 204 + shift / 2, y: 4, r: 140, s: 0.85 },
    { x: 244, y: -2, r: -40, s: 1 },
  ];
  return (
    <svg className="vine-art" viewBox="0 0 300 76" preserveAspectRatio="none" aria-hidden="true" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <defs>
        <linearGradient id={`vine-leaf-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fd16a" />
          <stop offset="1" stopColor="#3f8f2f" />
        </linearGradient>
      </defs>
      {/* the stem: a dark thin line with a lighter one on top, like ink and highlight */}
      <path d="M-4 40 C 30 6, 62 70, 100 40 S 168 8, 204 40 S 270 66, 304 36" fill="none" stroke="#2f6b22" strokeWidth="4" strokeLinecap="round" />
      <path d="M-4 40 C 30 6, 62 70, 100 40 S 168 8, 204 40 S 270 66, 304 36" fill="none" stroke="#6fb853" strokeWidth="1.6" strokeLinecap="round" />
      {/* tendrils */}
      <path d={SPIRAL} transform="translate(70 52)" fill="none" stroke="#4a9a38" strokeWidth="1.8" strokeLinecap="round" />
      <path d={SPIRAL} transform="translate(188 24) scale(-1 1)" fill="none" stroke="#4a9a38" strokeWidth="1.8" strokeLinecap="round" />
      {/* leaves, each with a centre vein */}
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${38 + l.y}) rotate(${l.r}) scale(${l.s})`}>
          <path d={LEAF} fill={`url(#vine-leaf-${seed})`} stroke="#2f6b22" strokeWidth="1" />
          <path d="M1 0 L22 0" stroke="#2f6b22" strokeWidth="0.9" opacity="0.55" />
        </g>
      ))}
      {/* a few small flowers */}
      {[66 + shift, 150, 232].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i === 1 ? 20 : 54})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-5" rx="3" ry="4.5" fill={i % 2 ? "#ffd1dc" : "#fff3b0"} transform={`rotate(${a})`} />
          ))}
          <circle r="2.6" fill="#f0a63a" />
        </g>
      ))}
    </svg>
  );
}

export default VineArt;
