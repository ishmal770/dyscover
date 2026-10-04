// A child's avatar: one of the jungle characters in a round badge. Used on the
// dashboard and the account page (the picker lives in pages/Profile.jsx).
import { GUIDES } from "../data/guides";
import { AVATAR_BY_ID, DEFAULT_AVATAR } from "../data/avatars";
import slothImage from "../assets/guides/sloth.png";
import "./Avatar.css";

function imageFor(character) {
  return character === "sloth" ? slothImage : GUIDES[character]?.image;
}

function Avatar({ id = DEFAULT_AVATAR, size = 64, locked = false }) {
  const avatar = AVATAR_BY_ID[id] || AVATAR_BY_ID[DEFAULT_AVATAR];
  return (
    <span className={`avatar${locked ? " avatar--locked" : ""}`} style={{ width: size, height: size }}>
      <img src={imageFor(avatar.character)} alt={locked ? "" : avatar.name} draggable={false} />
    </span>
  );
}

export default Avatar;
