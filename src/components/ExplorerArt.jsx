// The child's avatar art: seven cute human explorers drawn as SVG (so they
// scale to any size and need no image files). Each is a few simple choices -
// skin, hair, hat, outfit - drawn by the same code.
const EXPLORERS = {
  zara: { skin: "#8d5a3b", hair: "#251612", hairStyle: "puffs", shirt: "#f0a63a", vest: "#c97f1b", hat: "safari", hatColor: "#d8b878" },
  kai: { skin: "#e7b98f", hair: "#1f1a17", hairStyle: "short", shirt: "#4fa3e0", vest: "#2f7fbc", hat: "bandana", hatColor: "#e0453a" },
  maya: { skin: "#c68a5e", hair: "#4a2c1a", hairStyle: "braids", shirt: "#7ccf4a", vest: "#4fa42a", hat: "cap", hatColor: "#2f9e6f" },
  leo: { skin: "#f4d2b0", hair: "#d9692b", hairStyle: "short", shirt: "#d9d0b8", vest: "#a89b78", hat: "pith", hatColor: "#e8dcb0", extra: "binoculars" },
  amara: { skin: "#5f3a26", hair: "#150d0a", hairStyle: "bun", shirt: "#e8574f", vest: "#b8352f", hat: "headlamp", hatColor: "#f5c542" },
  sam: { skin: "#d9a273", hair: "#6b4426", hairStyle: "wavy", shirt: "#9b6fd6", vest: "#7549b3", hat: "bucket", hatColor: "#3e8f5a" },
  noor: { skin: "#d8a47c", hair: "#2b1a12", hairStyle: "hijab", shirt: "#2fb3a3", vest: "#1f8a7d", hat: null, hatColor: "#e9b44c", scarf: "#e9b44c" },
};

function BackHair({ e }) {
  switch (e.hairStyle) {
    case "puffs":
      return (
        <g fill={e.hair}>
          <circle cx="27" cy="30" r="13" />
          <circle cx="73" cy="30" r="13" />
          <circle cx="50" cy="28" r="22" />
        </g>
      );
    case "braids":
      return (
        <g fill={e.hair}>
          <rect x="22" y="38" width="11" height="44" rx="5.5" />
          <rect x="67" y="38" width="11" height="44" rx="5.5" />
          <circle cx="50" cy="40" r="25" />
          <circle cx="27.5" cy="84" r="4" fill="#e0453a" />
          <circle cx="72.5" cy="84" r="4" fill="#e0453a" />
        </g>
      );
    case "bun":
      return (
        <g fill={e.hair}>
          <circle cx="50" cy="14" r="11" />
          <circle cx="50" cy="38" r="25" />
        </g>
      );
    case "wavy":
      return (
        <g fill={e.hair}>
          <ellipse cx="50" cy="42" rx="30" ry="29" />
          <circle cx="24" cy="56" r="8" />
          <circle cx="76" cy="56" r="8" />
        </g>
      );
    case "hijab":
      return <path d="M50 14c-20 0-31 14-31 34 0 16 6 28 10 36h42c4-8 10-20 10-36 0-20-11-34-31-34z" fill={e.scarf} />;
    default:
      return <circle cx="50" cy="40" r="24" fill={e.hair} />;
  }
}

function FrontHair({ e }) {
  if (e.hairStyle === "hijab") {
    // the face opening of the scarf
    return <path d="M30 50c0-14 8-22 20-22s20 8 20 22c0 12-8 22-20 22S30 62 30 50z" fill="none" stroke={e.scarf} strokeWidth="5" />;
  }
  return <path d="M27 46c0-18 10-26 23-26s23 8 23 26c-6-10-14-14-23-14s-17 4-23 14z" fill={e.hair} />;
}

function Hat({ e }) {
  switch (e.hat) {
    case "safari":
      return (
        <g>
          <ellipse cx="50" cy="30" rx="34" ry="7" fill={e.hatColor} />
          <path d="M30 30c0-16 8-22 20-22s20 6 20 22z" fill={e.hatColor} />
          <rect x="30" y="23" width="40" height="6" fill="#8a6a3a" />
        </g>
      );
    case "bandana":
      return (
        <g>
          <path d="M27 34c4-14 14-18 23-18s19 4 23 18c-8-4-15-5-23-5s-15 1-23 5z" fill={e.hatColor} />
          <path d="M72 34l10 8-4-14z" fill={e.hatColor} />
          <circle cx="40" cy="26" r="1.6" fill="#fff" />
          <circle cx="52" cy="23" r="1.6" fill="#fff" />
          <circle cx="62" cy="27" r="1.6" fill="#fff" />
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M28 34c0-16 9-22 22-22s22 6 22 22z" fill={e.hatColor} />
          <path d="M60 32c8 0 20 1 22 6-8 3-22 2-26 1z" fill="#23805a" />
          <circle cx="50" cy="12.5" r="2.5" fill="#23805a" />
        </g>
      );
    case "pith":
      return (
        <g>
          <ellipse cx="50" cy="32" rx="31" ry="6" fill={e.hatColor} />
          <path d="M26 32c0-20 10-27 24-27s24 7 24 27z" fill={e.hatColor} />
          <rect x="26" y="25" width="48" height="5" fill="#8a7a50" />
        </g>
      );
    case "headlamp":
      return (
        <g>
          <path d="M26 30c0-4 10-8 24-8s24 4 24 8v4c-8-3-16-4-24-4s-16 1-24 4z" fill="#3d3d3d" />
          <circle cx="50" cy="26" r="7" fill={e.hatColor} stroke="#3d3d3d" strokeWidth="2" />
          <circle cx="50" cy="26" r="3" fill="#fff8d0" />
        </g>
      );
    case "bucket":
      return (
        <g>
          <ellipse cx="50" cy="31" rx="30" ry="7" fill={e.hatColor} />
          <path d="M31 31c1-14 8-20 19-20s18 6 19 20z" fill={e.hatColor} />
          <rect x="31" y="25" width="38" height="4" fill="#2a6b42" />
        </g>
      );
    default:
      return null;
  }
}

function ExplorerArt({ id = "zara" }) {
  const e = EXPLORERS[id] || EXPLORERS.zara;
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
      <BackHair e={e} />
      {/* shoulders, vest and neck */}
      <path d="M12 100c0-20 16-27 38-27s38 7 38 27z" fill={e.shirt} />
      <path d="M12 100c0-20 16-27 30-27l8 12 8-12c14 0 30 7 30 27z" fill={e.vest} opacity="0.55" />
      <rect x="43" y="62" width="14" height="14" rx="5" fill={e.skin} />
      <path d="M36 72l14 14 14-14c-4-3-9-4-14-4s-10 1-14 4z" fill={e.shirt} />
      {e.extra === "binoculars" && (
        <g>
          <path d="M34 74c4 14 28 14 32 0" fill="none" stroke="#5a4a2a" strokeWidth="2.5" />
          <rect x="35" y="84" width="11" height="14" rx="4" fill="#3d3d3d" />
          <rect x="54" y="84" width="11" height="14" rx="4" fill="#3d3d3d" />
          <rect x="45" y="88" width="10" height="4" fill="#5a4a2a" />
        </g>
      )}
      {/* head */}
      <circle cx="28" cy="52" r="5" fill={e.skin} />
      <circle cx="72" cy="52" r="5" fill={e.skin} />
      <circle cx="50" cy="50" r="23" fill={e.skin} />
      <FrontHair e={e} />
      {/* face */}
      <ellipse cx="41" cy="52" rx="2.8" ry="3.6" fill="#2a1a12" />
      <ellipse cx="59" cy="52" rx="2.8" ry="3.6" fill="#2a1a12" />
      <circle cx="42" cy="50.6" r="1" fill="#fff" />
      <circle cx="60" cy="50.6" r="1" fill="#fff" />
      <circle cx="34" cy="60" r="4" fill="#ff8a8a" opacity="0.45" />
      <circle cx="66" cy="60" r="4" fill="#ff8a8a" opacity="0.45" />
      <path d="M43 61c3 4 11 4 14 0" fill="none" stroke="#7a3b2a" strokeWidth="2" strokeLinecap="round" />
      <Hat e={e} />
    </svg>
  );
}

export default ExplorerArt;
