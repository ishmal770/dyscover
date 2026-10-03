// The home-page host: a hand-drawn sloth that bobs, blinks and waves.
// (The six choosable animals are images - see GuideArt.jsx.)
import "./SlothArt.css";

function SlothArt({ waving = false, size = 72 }) {
  return (
    <svg
      className={`sloth-art${waving ? " sloth-art--waving" : ""}`}
      viewBox="0 0 120 124"
      width={size * 1.2}
      height={size * 1.2}
      role="img"
      aria-label="Sunny the Sloth"
    >
      <g className="sloth-art__bob">
      {/* hanging leaf for jungle flavor */}
      <path d="M18 22 Q8 10 22 6 Q30 14 18 22Z" fill="#5dbb2f" />
      <path d="M102 20 Q114 8 100 4 Q92 12 102 20Z" fill="#4a9524" />
      {/* resting arm */}
      <ellipse cx="26" cy="92" rx="9" ry="22" fill="#8a7355" transform="rotate(12 26 92)" />
      {/* body */}
      <ellipse cx="60" cy="98" rx="32" ry="26" fill="#8a7355" />
      <ellipse cx="60" cy="102" rx="19" ry="17" fill="#b39d76" />
      {/* waving arm */}
      <g className="sloth-art__arm">
        <ellipse cx="97" cy="76" rx="9" ry="22" fill="#8a7355" transform="rotate(-18 97 76)" />
        <path d="M100 52 l1 -7 M105 54 l3 -6 M95 51 l-1 -7" stroke="#e8d9b5" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {/* head */}
      <ellipse cx="60" cy="52" rx="32" ry="27" fill="#a38c68" />
      <ellipse cx="60" cy="56" rx="24" ry="19" fill="#ecdfc0" />
      {/* signature sloth eye stripes */}
      <ellipse cx="47" cy="52" rx="8" ry="5.5" fill="#5a4632" transform="rotate(22 47 52)" />
      <ellipse cx="73" cy="52" rx="8" ry="5.5" fill="#5a4632" transform="rotate(-22 73 52)" />
      <circle className="sloth-art__eye" cx="48" cy="52" r="3" fill="#fff" />
      <circle className="sloth-art__eye" cx="72" cy="52" r="3" fill="#fff" />
      <circle className="sloth-art__eye" cx="48.6" cy="52.4" r="1.6" fill="#2b2b2b" />
      <circle className="sloth-art__eye" cx="72.6" cy="52.4" r="1.6" fill="#2b2b2b" />
      <ellipse cx="60" cy="62" rx="4.5" ry="3.2" fill="#4a3826" />
      <path d="M52 69 Q60 77 68 69" fill="none" stroke="#4a3826" strokeWidth="2.4" strokeLinecap="round" />
    </g>
    </svg>
  );
}

export default SlothArt;
