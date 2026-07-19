import { Volume2 } from "lucide-react";
import "./GuideBubble.css";

function GuideBubble({ message, avatarIcon: AvatarIcon, avatarLabel }) {
  return (
    <div className="guide-bubble">
      <div className="guide-bubble__message">
        <p>{message}</p>
        <Volume2 size={12} />
      </div>
      <div className="guide-bubble__avatar-col">
        <div className="guide-bubble__avatar" aria-hidden="true">
          {AvatarIcon && <AvatarIcon size={16} />}
          <span className="guide-bubble__avatar-sound">
            <Volume2 size={9} />
          </span>
        </div>
        {avatarLabel && <span className="guide-bubble__avatar-label">{avatarLabel}</span>}
      </div>
    </div>
  );
}

export default GuideBubble;
