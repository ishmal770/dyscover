// A child's avatar: one of seven explorer portraits in a round badge. The portraits are
// "Lorelei" by Lisa Wischofsky (CC0, public domain), made with DiceBear.
import { AVATAR_BY_ID, DEFAULT_AVATAR } from "../data/avatars";
import "./Avatar.css";

const files = import.meta.glob("../assets/avatars/*.svg", { eager: true, import: "default" });
const url = (id) => files[`../assets/avatars/${id}.svg`];

function Avatar({ id = DEFAULT_AVATAR, size = 64, locked = false }) {
  const avatar = AVATAR_BY_ID[id] || AVATAR_BY_ID[DEFAULT_AVATAR];
  return (
    <span
      className={`avatar${locked ? " avatar--locked" : ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={locked ? "Locked avatar" : avatar.name}
    >
      <img src={url(avatar.id)} alt="" draggable={false} />
    </span>
  );
}

export default Avatar;
