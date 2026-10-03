// The floating guide hint bubble that every game uses to give spoken
// instructions/encouragement. (The speech functions live in src/audio/speech.js
// and are re-exported here because most of the app imports them from this file.)
import { Play, Mic } from "lucide-react";
import GuideArt from "./GuideArt";
import { useGuide } from "../context/GuideContext";
import { speak } from "../audio/speech";
import "./GameHintBubble.css";

export { speak, setSpeechMuted, cancelSpeech, audioUnlocked } from "../audio/speech";

// `character` pins this game's own mascot (e.g. the lion in Lion's Letters);
// otherwise the child's chosen guide is shown.
function GameHintBubble({ message, character }) {
  const { guide } = useGuide();
  return (
    <div className="game-hint-bubble">
      <div className="game-hint-bubble__card">
        <p>{message}</p>
        <div className="game-hint-bubble__actions">
          {/* Listen reads exactly what is written in the bubble */}
          <button className="game-hint-bubble__btn" onClick={() => speak(message)}>
            <Play size={11} fill="currentColor" /> Listen
          </button>
          {/* Speak (voice input) is disabled here - only Cheetah Challenge
              actually uses the SpeechRecognition API */}
          <button className="game-hint-bubble__btn game-hint-bubble__btn--muted" disabled>
            <Mic size={11} /> Speak
          </button>
        </div>
      </div>
      <div className="game-hint-bubble__avatar">
        <GuideArt character={character || guide.id} size={84} />
      </div>
    </div>
  );
}

export default GameHintBubble;
