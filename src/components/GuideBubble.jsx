import { Volume2 } from "lucide-react";
import "./GuideBubble.css";

function GuideBubble({ message }) {
  return (
    <div className="guide-bubble">
      <div className="guide-bubble__message">
        <p>{message}</p>
        <Volume2 size={12} />
      </div>
      <div className="guide-bubble__avatar" aria-hidden="true" />
    </div>
  );
}

export default GuideBubble;
