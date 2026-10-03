// The floating guide hint bubble every game uses. The guide never reads the
// game's instructions on its own - the child asks: tapping "How to play" (or
// the guide) makes the guide read them aloud in its own voice, and the words
// appear in the bubble so they can read along.
// (The speech functions live in src/audio/speech.js and are re-exported here
// because most of the app imports them from this file.)
import { useState } from "react";
import { Play, HelpCircle } from "lucide-react";
import GuideArt from "./GuideArt";
import { useGuide } from "../context/GuideContext";
import { speak } from "../audio/speech";
import "./GameHintBubble.css";

export { speak, setSpeechMuted, cancelSpeech, audioUnlocked } from "../audio/speech";

// `character` pins this game's own mascot (e.g. the lion in Lion's Letters);
// otherwise the child's chosen guide is shown. `instructions` is the game's
// how-to-play text.
function GameHintBubble({ message, character, instructions }) {
  const { guide } = useGuide();
  const guideId = character || guide.id;
  const [showHow, setShowHow] = useState(false);
  const [asking, setAsking] = useState(false);

  // Ask the guide how to play: read the instructions aloud and show them.
  function askHowToPlay() {
    setShowHow(true);
    setAsking(true);
    speak(instructions, { voice: guideId });
    setTimeout(() => setAsking(false), 3500);
  }

  return (
    <div className="game-hint-bubble">
      <div className="game-hint-bubble__card">
        <p>{message}</p>
        {showHow && instructions && <p className="game-hint-bubble__how">{instructions}</p>}
        <div className="game-hint-bubble__actions">
          {/* Listen reads exactly what is written in the bubble */}
          <button className="game-hint-bubble__btn" onClick={() => speak(message, { voice: guideId })}>
            <Play size={11} fill="currentColor" /> Listen
          </button>
          {instructions && (
            <button className="game-hint-bubble__btn game-hint-bubble__btn--how" onClick={askHowToPlay}>
              <HelpCircle size={12} /> How to play
            </button>
          )}
        </div>
      </div>
      {/* Tapping the guide is the same as asking how to play */}
      <button
        className="game-hint-bubble__avatar"
        onClick={instructions ? askHowToPlay : () => speak(message, { voice: guideId })}
        aria-label={`Ask ${guide.name} how to play`}
      >
        <GuideArt character={guideId} waving={asking} size={84} />
      </button>
    </div>
  );
}

export default GameHintBubble;
