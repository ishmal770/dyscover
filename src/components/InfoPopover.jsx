// Small dropdown opened from the Info (i) icon in TopBar/GameTopBar.
// Shows short context-appropriate help text, read aloud on open.
import { useEffect } from "react";
import { Volume2, X } from "lucide-react";
import { speak } from "./GameHintBubble";
import "./InfoPopover.css";

const DEFAULT_TEXT =
  "DysCover is a reading adventure game. Explore the map, play games in each world, and collect stars!";

function InfoPopover({ text = DEFAULT_TEXT, onClose }) {
  useEffect(() => {
    speak(text);
  }, [text]);

  return (
    <div className="info-popover__backdrop" onClick={onClose}>
      <div className="info-popover" onClick={(e) => e.stopPropagation()}>
        <div className="info-popover__header">
          <h2>About this page</h2>
          <button className="info-popover__close" onClick={onClose} aria-label="Close info">
            <X size={16} />
          </button>
        </div>
        <p>{text}</p>
        <button className="info-popover__listen" onClick={() => speak(text)}>
          <Volume2 size={14} /> Listen again
        </button>
      </div>
    </div>
  );
}

export default InfoPopover;
