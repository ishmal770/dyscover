// Treasure, gem and backpack illustrations (SVG, so they scale and need no
// image files). `icon` is a treasure's `icon` name from data/treasures.js.
function Compass() {
  return (
    <g>
      <circle cx="32" cy="32" r="26" fill="#e8b73a" stroke="#b9861a" strokeWidth="3" />
      <circle cx="32" cy="32" r="20" fill="#fff8e1" stroke="#b9861a" strokeWidth="2" />
      <path d="M32 14l6 18-6 18-6-18z" fill="#e0453a" />
      <path d="M32 32l6 0-6 18-6-18z" fill="#fff" stroke="#b0b0b0" strokeWidth="1" />
      <circle cx="32" cy="32" r="3" fill="#b9861a" />
    </g>
  );
}
function Lantern() {
  return (
    <g>
      <path d="M24 10c0-5 16-5 16 0" fill="none" stroke="#6b4a2b" strokeWidth="3" />
      <rect x="20" y="10" width="24" height="6" rx="2" fill="#6b4a2b" />
      <rect x="18" y="16" width="28" height="34" rx="6" fill="#ffe27a" stroke="#6b4a2b" strokeWidth="3" />
      <ellipse cx="32" cy="33" rx="7" ry="10" fill="#fff6c8" />
      <path d="M26 33c0-8 12-8 12 0" fill="none" stroke="#f5a623" strokeWidth="2.5" />
      <rect x="16" y="50" width="32" height="7" rx="3" fill="#6b4a2b" />
    </g>
  );
}
function MapScroll() {
  return (
    <g>
      <rect x="10" y="12" width="44" height="40" rx="4" fill="#f3dfa8" stroke="#a9843f" strokeWidth="3" />
      <rect x="6" y="9" width="8" height="46" rx="4" fill="#d9bb72" stroke="#a9843f" strokeWidth="2" />
      <rect x="50" y="9" width="8" height="46" rx="4" fill="#d9bb72" stroke="#a9843f" strokeWidth="2" />
      <path d="M18 42c6-14 12 2 18-10s8-4 10-8" fill="none" stroke="#8a6a3a" strokeWidth="2.5" strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M40 40l8 8M48 40l-8 8" stroke="#e0453a" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}
function Binoculars() {
  return (
    <g>
      <rect x="10" y="20" width="18" height="34" rx="7" fill="#4a5a68" stroke="#2f3b46" strokeWidth="3" />
      <rect x="36" y="20" width="18" height="34" rx="7" fill="#4a5a68" stroke="#2f3b46" strokeWidth="3" />
      <rect x="26" y="30" width="12" height="10" fill="#2f3b46" />
      <rect x="13" y="10" width="12" height="14" rx="3" fill="#2f3b46" />
      <rect x="39" y="10" width="12" height="14" rx="3" fill="#2f3b46" />
      <circle cx="19" cy="47" r="5" fill="#8fd3ff" />
      <circle cx="45" cy="47" r="5" fill="#8fd3ff" />
    </g>
  );
}
function Magnifier() {
  return (
    <g>
      <circle cx="26" cy="26" r="18" fill="#cfeeff" stroke="#8a6a3a" strokeWidth="5" />
      <path d="M17 20c2-5 7-8 12-7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M39 39l16 16" stroke="#8a6a3a" strokeWidth="8" strokeLinecap="round" />
    </g>
  );
}
function Boots() {
  return (
    <g>
      <path d="M18 8h18v26l16 8c4 2 6 5 6 9v4H12V8z" fill="#c4783a" stroke="#7a4519" strokeWidth="3" strokeLinejoin="round" />
      <rect x="12" y="52" width="46" height="6" rx="3" fill="#7a4519" />
      <rect x="18" y="8" width="18" height="8" fill="#e0453a" />
      <path d="M22 26h10M22 34h10" stroke="#7a4519" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

const ICONS = { compass: Compass, lantern: Lantern, map: MapScroll, binoculars: Binoculars, magnifier: Magnifier, boots: Boots };

export function TreasureArt({ icon, size = 64, locked = false }) {
  const Icon = ICONS[icon] || Compass;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      style={locked ? { filter: "brightness(0) opacity(0.28)" } : undefined}
    >
      <Icon />
    </svg>
  );
}

export function GemArt({ color = "#2fbf71", dark = "#1c8c50", size = 64, locked = false, glow = false }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      style={locked ? { filter: "brightness(0) opacity(0.28)" } : glow ? { filter: `drop-shadow(0 0 8px ${color})` } : undefined}
    >
      <path d="M18 8h28l14 16-28 34L4 24z" fill={color} stroke={dark} strokeWidth="3" strokeLinejoin="round" />
      <path d="M4 24h56M18 8l14 16 14-16M32 24v34" fill="none" stroke={dark} strokeWidth="2" strokeLinejoin="round" opacity="0.6" />
      <path d="M20 12l-8 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function BackpackArt({ size = 72 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path d="M22 14c0-8 20-8 20 0" fill="none" stroke="#7a4519" strokeWidth="4" />
      <rect x="10" y="14" width="44" height="42" rx="14" fill="#e8943a" stroke="#7a4519" strokeWidth="3" />
      <path d="M10 30c0-8 44-8 44 0v-4c0-10-44-10-44 0z" fill="#c4742a" />
      <rect x="20" y="38" width="24" height="14" rx="5" fill="#f4b266" stroke="#7a4519" strokeWidth="2.5" />
      <rect x="29" y="30" width="6" height="8" rx="2" fill="#7a4519" />
      <rect x="6" y="30" width="6" height="18" rx="3" fill="#7a4519" />
      <rect x="52" y="30" width="6" height="18" rx="3" fill="#7a4519" />
    </svg>
  );
}
