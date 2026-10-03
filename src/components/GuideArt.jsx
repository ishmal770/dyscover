// Animated SVG art for the two jungle guides. Each draws a friendly
// head-and-shoulders character that bobs gently, blinks, and (when
// `waving`) waves one arm. Animation is pure CSS - see GuideArt.css.
import "./GuideArt.css";

function SlothArt() {
  return (
    <>
      {/* hanging leaf for jungle flavor */}
      <path d="M18 22 Q8 10 22 6 Q30 14 18 22Z" fill="#5dbb2f" />
      <path d="M102 20 Q114 8 100 4 Q92 12 102 20Z" fill="#4a9524" />
      {/* resting arm */}
      <ellipse cx="26" cy="92" rx="9" ry="22" fill="#8a7355" transform="rotate(12 26 92)" />
      {/* body */}
      <ellipse cx="60" cy="98" rx="32" ry="26" fill="#8a7355" />
      <ellipse cx="60" cy="102" rx="19" ry="17" fill="#b39d76" />
      {/* waving arm */}
      <g className="guide-art__arm">
        <ellipse cx="97" cy="76" rx="9" ry="22" fill="#8a7355" transform="rotate(-18 97 76)" />
        <path d="M100 52 l1 -7 M105 54 l3 -6 M95 51 l-1 -7" stroke="#e8d9b5" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {/* head */}
      <ellipse cx="60" cy="52" rx="32" ry="27" fill="#a38c68" />
      <ellipse cx="60" cy="56" rx="24" ry="19" fill="#ecdfc0" />
      {/* signature sloth eye stripes */}
      <ellipse cx="47" cy="52" rx="8" ry="5.5" fill="#5a4632" transform="rotate(22 47 52)" />
      <ellipse cx="73" cy="52" rx="8" ry="5.5" fill="#5a4632" transform="rotate(-22 73 52)" />
      <circle className="guide-art__eye" cx="48" cy="52" r="3" fill="#fff" />
      <circle className="guide-art__eye" cx="72" cy="52" r="3" fill="#fff" />
      <circle className="guide-art__eye" cx="48.6" cy="52.4" r="1.6" fill="#2b2b2b" />
      <circle className="guide-art__eye" cx="72.6" cy="52.4" r="1.6" fill="#2b2b2b" />
      <ellipse cx="60" cy="62" rx="4.5" ry="3.2" fill="#4a3826" />
      <path d="M52 69 Q60 77 68 69" fill="none" stroke="#4a3826" strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

function MonkeyArt() {
  return (
    <>
      <path d="M18 22 Q8 10 22 6 Q30 14 18 22Z" fill="#5dbb2f" />
      <path d="M102 20 Q114 8 100 4 Q92 12 102 20Z" fill="#4a9524" />
      {/* tail */}
      <path d="M88 110 Q116 106 108 80 Q104 70 96 76" fill="none" stroke="#7a4a22" strokeWidth="8" strokeLinecap="round" />
      {/* resting arm */}
      <ellipse cx="26" cy="92" rx="9" ry="22" fill="#8b5a2b" transform="rotate(12 26 92)" />
      {/* body */}
      <ellipse cx="60" cy="98" rx="30" ry="26" fill="#8b5a2b" />
      <ellipse cx="60" cy="102" rx="18" ry="17" fill="#f1d3a8" />
      {/* waving arm */}
      <g className="guide-art__arm">
        <ellipse cx="97" cy="76" rx="9" ry="22" fill="#8b5a2b" transform="rotate(-18 97 76)" />
        <circle cx="102" cy="52" r="8" fill="#f1d3a8" />
      </g>
      {/* ears */}
      <circle cx="26" cy="50" r="12" fill="#8b5a2b" />
      <circle cx="26" cy="50" r="7" fill="#f1b9a0" />
      <circle cx="94" cy="50" r="12" fill="#8b5a2b" />
      <circle cx="94" cy="50" r="7" fill="#f1b9a0" />
      {/* head */}
      <ellipse cx="60" cy="50" rx="31" ry="28" fill="#8b5a2b" />
      {/* heart-shaped face patch */}
      <circle cx="49" cy="50" r="14" fill="#f1d3a8" />
      <circle cx="71" cy="50" r="14" fill="#f1d3a8" />
      <ellipse cx="60" cy="60" rx="19" ry="14" fill="#f1d3a8" />
      <circle className="guide-art__eye" cx="50" cy="48" r="3.6" fill="#2b2b2b" />
      <circle className="guide-art__eye" cx="70" cy="48" r="3.6" fill="#2b2b2b" />
      <circle cx="51" cy="46.8" r="1.1" fill="#fff" />
      <circle cx="71" cy="46.8" r="1.1" fill="#fff" />
      <ellipse cx="56" cy="60" rx="1.6" ry="2.2" fill="#6b4220" />
      <ellipse cx="64" cy="60" rx="1.6" ry="2.2" fill="#6b4220" />
      <path d="M50 66 Q60 75 70 66" fill="none" stroke="#6b4220" strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

function GuideArt({ character = "sloth", waving = false, size = 72 }) {
  return (
    <svg
      className={`guide-art${waving ? " guide-art--waving" : ""}`}
      viewBox="0 0 120 124"
      width={size}
      height={size}
      role="img"
      aria-label={character === "monkey" ? "Momo the Monkey" : "Sunny the Sloth"}
    >
      <g className="guide-art__bob">{character === "monkey" ? <MonkeyArt /> : <SlothArt />}</g>
    </svg>
  );
}

export default GuideArt;
