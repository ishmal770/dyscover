// One vine to lay across the door, painted in a watercolor style: a thin curling stem, soft washes
// of green and teal for the leaves (no heavy outlines), pale blossoms, and wobbly edges from an SVG
// turbulence filter so it looks hand-painted. `seed` changes the curve and where the leaves grow so
// no two vines look alike. Drawn in code (no image files).
const LEAF = "M0 0 C 5 -11 19 -12 26 0 C 19 12 5 11 0 0 Z";
const SPIRAL = "m0 0 c 7 -8 17 -3 14 6 c -3 8 -12 6 -11 -1 c 1 -4 6 -4 6 0";

// the greens a painter would mix: yellow-green, leaf green, deep green, blue-green
const WASHES = [
  ["#b9dd7a", "#6fb24a"],
  ["#8fcf7f", "#3f9a5a"],
  ["#a6d68a", "#58a850"],
  ["#7fc7a4", "#2f8f78"],
];

function VineArt({ seed = 0 }) {
  const flip = seed % 2 === 1;
  const shift = (seed % 4) * 12;
  const curve = seed % 2 ? "M-4 38 C 34 62, 66 8, 104 38 S 172 68, 208 36 S 272 10, 304 40" : "M-4 40 C 30 8, 64 68, 100 38 S 168 6, 204 40 S 270 66, 304 34";
  const leaves = [
    { x: 22 + shift, y: -2, r: -52, s: 1.05 },
    { x: 56 + shift, y: 4, r: 128, s: 0.9 },
    { x: 94, y: -4, r: -36, s: 1.15 },
    { x: 128 - shift / 2, y: 6, r: 148, s: 0.95 },
    { x: 166, y: -4, r: -60, s: 1.05 },
    { x: 202 + shift / 2, y: 4, r: 140, s: 0.9 },
    { x: 242, y: -2, r: -40, s: 1.1 },
  ];
  const id = `vine-${seed}`;
  return (
    <svg className="vine-art" viewBox="0 0 300 76" preserveAspectRatio="none" aria-hidden="true" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <defs>
        {/* hand-painted look: wobble the edges a little and soften them */}
        <filter id={`${id}-paint`} x="-5%" y="-30%" width="110%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={seed + 3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="0.5" />
        </filter>
        {WASHES.map(([a, b], i) => (
          <linearGradient key={i} id={`${id}-wash-${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        ))}
      </defs>
      <g filter={`url(#${id}-paint)`}>
        {/* the paint bleeding out around the stem */}
        <path d={curve} fill="none" stroke="#6fb24a" strokeWidth="9" strokeLinecap="round" opacity="0.2" />
        {/* the stem: a thin line, darker where the pigment pooled */}
        <path d={curve} fill="none" stroke="#3f7f3a" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <path d={curve} fill="none" stroke="#8fcf7f" strokeWidth="0.9" strokeLinecap="round" opacity="0.9" />
        {/* tendrils */}
        <path d={SPIRAL} transform="translate(70 52)" fill="none" stroke="#58a850" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
        <path d={SPIRAL} transform="translate(188 24) scale(-1 1)" fill="none" stroke="#58a850" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
        {/* leaves: translucent washes with a faint vein */}
        {leaves.map((l, i) => (
          <g key={i} transform={`translate(${l.x} ${38 + l.y}) rotate(${l.r}) scale(${l.s})`}>
            <path d={LEAF} fill={`url(#${id}-wash-${(i + seed) % WASHES.length})`} opacity="0.78" />
            <path d={LEAF} fill="none" stroke="#2f7a45" strokeWidth="0.6" opacity="0.4" />
            <path d="M1 0 L22 0" stroke="#2f7a45" strokeWidth="0.6" opacity="0.4" />
          </g>
        ))}
        {/* pale blossoms: pink and peach washes */}
        {[66 + shift, 150, 232].map((x, i) => (
          <g key={x} transform={`translate(${x} ${i === 1 ? 20 : 54})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-5" rx="3.2" ry="4.8" fill={i % 2 ? "#f7b8c8" : "#fbd9a0"} opacity="0.85" transform={`rotate(${a})`} />
            ))}
            <circle r="2.2" fill="#f2b04a" opacity="0.9" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default VineArt;
