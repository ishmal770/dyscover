// The child's avatar as a whole person: the portrait they chose is the head, on a body in an
// explorer outfit, with a backpack on their back. The skin tone of the neck and hands is
// sampled from the portrait so the head and body match. `pose` animates the figure:
// "cutting" swings an arm with scissors, "happy" jumps, "sad" shakes.
import { useEffect, useState } from "react";
import { AVATAR_BY_ID, DEFAULT_AVATAR } from "../data/avatars";
import "./PersonFigure.css";

const portraits = import.meta.glob("../assets/avatars/*.svg", { eager: true, import: "default" });
const DEFAULT_SKIN = "#d9a273";

// the skin color in the middle of a portrait (so the neck and hands match the face)
function useSkin(url) {
  const [skin, setSkin] = useState(DEFAULT_SKIN);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 40;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, 40, 40);
        const [r, g, b, a] = ctx.getImageData(20, 24, 1, 1).data;
        if (!cancelled && a > 200) setSkin(`rgb(${r}, ${g}, ${b})`);
      } catch {
        // some browsers will not let a canvas read an image - keep the default skin tone
      }
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [url]);
  return skin;
}

function PersonFigure({ id = DEFAULT_AVATAR, height = 220, pose = "idle", packCount = null, label }) {
  const avatar = AVATAR_BY_ID[id] || AVATAR_BY_ID[DEFAULT_AVATAR];
  const url = portraits[`../assets/avatars/${avatar.id}.svg`];
  const skin = useSkin(url);
  const clip = `fig-head-${avatar.id}`;

  return (
    <svg
      className={`fig fig--${pose}`}
      viewBox="0 0 150 240"
      style={{ height, width: (height * 150) / 240 }}
      role="img"
      aria-label={label || `${avatar.name}, carrying a backpack`}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="78" cy="46" r="38" />
        </clipPath>
      </defs>

      <ellipse className="fig__shadow" cx="78" cy="232" rx="44" ry="6" />

      {/* the backpack, on the back (it peeks out behind the body) */}
      <g className="fig__pack">
        <rect x="14" y="86" width="56" height="84" rx="20" fill="#e8943a" stroke="#b9661a" strokeWidth="4" />
        <path d="M24 98 Q42 84 60 98" fill="none" stroke="#b9661a" strokeWidth="4" strokeLinecap="round" />
        <rect x="24" y="132" width="36" height="28" rx="9" fill="#f4b266" stroke="#b9661a" strokeWidth="3" />
        <rect x="38" y="140" width="8" height="10" rx="3" fill="#b9661a" />
        {packCount !== null && (
          <g>
            <circle cx="22" cy="92" r="13" fill="var(--green, #5dbb2f)" stroke="#fff" strokeWidth="3" />
            <text x="22" y="97" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fff">
              {packCount}
            </text>
          </g>
        )}
      </g>

      {/* legs and shoes */}
      <rect x="60" y="156" width="20" height="64" rx="10" fill={avatar.pants} />
      <rect x="84" y="156" width="20" height="64" rx="10" fill={avatar.pants} />
      <ellipse cx="68" cy="222" rx="15" ry="8" fill="#5b3a22" />
      <ellipse cx="96" cy="222" rx="15" ry="8" fill="#5b3a22" />

      {/* neck and body */}
      <rect x="68" y="76" width="22" height="20" rx="8" fill={skin} />
      <rect x="48" y="88" width="62" height="76" rx="22" fill={avatar.shirt} />
      <path d="M48 112 Q79 132 110 112 L110 124 Q79 144 48 124Z" fill="#000" opacity="0.1" />
      <rect x="48" y="146" width="62" height="10" rx="5" fill="#5b3a22" />
      <circle cx="79" cy="151" r="4" fill="#e8c35a" />
      <path d="M62 90 L62 150 M96 90 L96 150" stroke="#b9661a" strokeWidth="6" strokeLinecap="round" opacity="0.9" />

      {/* the arm nearest the door (it swings when a vine is cut) */}
      <g className="fig__arm" style={{ transformOrigin: "108px 96px" }}>
        <rect x="104" y="92" width="16" height="58" rx="8" fill={avatar.shirt} />
        <circle cx="112" cy="154" r="9" fill={skin} />
        <g className="fig__scissors">
          <path d="M112 156 L134 130 M112 156 L136 148" stroke="#8a8f96" strokeWidth="4" strokeLinecap="round" />
          <circle cx="110" cy="160" r="6" fill="none" stroke="#c0453a" strokeWidth="3" />
          <circle cx="118" cy="164" r="6" fill="none" stroke="#c0453a" strokeWidth="3" />
        </g>
      </g>
      <rect x="38" y="92" width="16" height="56" rx="8" fill={avatar.shirt} />
      <circle cx="46" cy="152" r="9" fill={skin} />

      {/* the head: the portrait they chose */}
      <circle cx="78" cy="46" r="41" fill="#fff" />
      <image href={url} x="40" y="8" width="76" height="76" clipPath={`url(#${clip})`} preserveAspectRatio="xMidYMid slice" />
      <circle cx="78" cy="46" r="38" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
    </svg>
  );
}

export default PersonFigure;
