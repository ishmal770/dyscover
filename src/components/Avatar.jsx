// A child's avatar: one of the human explorers in a round badge. Used on the
// home page and lesson-complete screen (the picker is components/MeCard.jsx).
import ExplorerArt from "./ExplorerArt";
import { AVATAR_BY_ID, DEFAULT_AVATAR } from "../data/avatars";
import "./Avatar.css";

function Avatar({ id = DEFAULT_AVATAR, size = 64, locked = false }) {
  const avatar = AVATAR_BY_ID[id] || AVATAR_BY_ID[DEFAULT_AVATAR];
  return (
    <span
      className={`avatar${locked ? " avatar--locked" : ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={locked ? "Locked avatar" : avatar.name}
    >
      <ExplorerArt id={avatar.id} />
    </span>
  );
}

export default Avatar;
