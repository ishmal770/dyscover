// The child's avatar as a whole person carrying a backpack. Each explorer has its own picture
// (src/assets/avatars-full, made by scripts/make_avatar_figures.py): the open-source portrait they
// chose is the head, on a watercolor-style body with a backpack. `pose` animates the picture:
// "cutting" tilts it and swings scissors, "happy" jumps, "sad" shakes.
import { Scissors } from "lucide-react";
import { AVATAR_BY_ID, DEFAULT_AVATAR } from "../data/avatars";
import "./PersonFigure.css";

const pictures = import.meta.glob("../assets/avatars-full/*.svg", { eager: true, import: "default" });

function PersonFigure({ id = DEFAULT_AVATAR, height = 220, pose = "idle", packCount = null, label }) {
  const avatar = AVATAR_BY_ID[id] || AVATAR_BY_ID[DEFAULT_AVATAR];
  const width = (height * 150) / 240;
  return (
    <span className={`fig fig--${pose}`} style={{ height, width }}>
      <img src={pictures[`../assets/avatars-full/${avatar.id}.svg`]} alt={label || `${avatar.name}, carrying a backpack`} draggable={false} />
      {packCount !== null && <span className="fig__count">{packCount}</span>}
      <span className="fig__scissors" aria-hidden="true">
        <Scissors size={Math.round(height * 0.14)} />
      </span>
    </span>
  );
}

export default PersonFigure;
