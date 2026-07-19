import { Search, Play, X, Volume2 } from "lucide-react";
import "./GameIntroModal.css";

function GameIntroModal({ activityName, onStart, onClose }) {
  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <div className="game-modal" onClick={(e) => e.stopPropagation()}>
        <button className="game-modal__close" aria-label="Close" onClick={onClose}>
          <X size={16} />
        </button>
        <div className="game-modal__avatar" aria-hidden="true" />
        <button className="game-modal__sound-btn" aria-label="Read aloud">
          <Volume2 size={14} />
        </button>
        <h2>Let&rsquo;s Play {activityName}!</h2>
        <p>
          Look closely at the big word on top. Then, find the word below that
          looks <span className="game-modal__highlight">exactly the same</span>!
        </p>
        <div className="game-modal__hint">
          <Search size={14} /> Stuck? Click a magnifying glass for a hint.
        </div>
        <button className="btn btn--primary btn--block" onClick={onStart}>
          <Play size={14} fill="currentColor" /> Start Playing!
        </button>
      </div>
    </div>
  );
}

export default GameIntroModal;
