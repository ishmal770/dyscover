import { Play, Mic } from "lucide-react";
import "./GameHintBubble.css";

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function GameHintBubble({ message, speakText }) {
  return (
    <div className="game-hint-bubble">
      <div className="game-hint-bubble__card">
        <p>{message}</p>
        <div className="game-hint-bubble__actions">
          <button className="game-hint-bubble__btn" onClick={() => speak(speakText || message)}>
            <Play size={11} fill="currentColor" /> Listen
          </button>
          <button className="game-hint-bubble__btn game-hint-bubble__btn--muted" disabled>
            <Mic size={11} /> Speak
          </button>
        </div>
      </div>
      <div className="game-hint-bubble__avatar" aria-hidden="true" />
    </div>
  );
}

export default GameHintBubble;
export { speak };
