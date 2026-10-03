// The floating guide hint bubble every game uses. When you arrive at a game the
// guide pops in, waves, shows the game's instructions and reads them aloud -
// the same welcome the onboarding pages give. After that the child can ask
// again any time: tapping "How to play" (or the guide) re-reads the
// instructions for the current step, and the words stay in the bubble so they
// can read along.
// (The speech functions live in src/audio/speech.js and are re-exported here
// because most of the app imports them from this file.)
import { useEffect, useRef, useState } from "react";
import { Play, HelpCircle } from "lucide-react";
import GuideArt from "./GuideArt";
import { useGuide } from "../context/GuideContext";
import { speak, cancelSpeech, audioUnlocked } from "../audio/speech";
import "./GameHintBubble.css";

export { speak, setSpeechMuted, cancelSpeech, audioUnlocked } from "../audio/speech";

const WELCOME_MS = 4500;

// `character` pins this game's own mascot (e.g. the lion in Lion's Letters);
// otherwise the child's chosen guide is shown. `instructions` is the how-to-play
// text for the current step of the game.
function GameHintBubble({ message, character, instructions }) {
  const { guide } = useGuide();
  const guideId = character || guide.id;
  const rootRef = useRef(null);
  const [showHow, setShowHow] = useState(false);
  const [asking, setAsking] = useState(false);
  const [welcoming, setWelcoming] = useState(false);
  // True when the browser blocked the automatic welcome (no click yet)
  const [needsTap, setNeedsTap] = useState(false);

  // The welcome fires when the page scrolls into view, but the instructions
  // can change step by step - read them through a ref so a new step doesn't
  // re-trigger the welcome.
  const instructionsRef = useRef(instructions);
  instructionsRef.current = instructions;

  // Ask the guide how to play: read the instructions aloud and show them.
  function askHowToPlay() {
    setNeedsTap(false);
    setShowHow(true);
    setAsking(true);
    speak(instructions, { voice: guideId });
    setTimeout(() => setAsking(false), 3500);
  }

  // Arriving at the game = the beginning: pop in, show and read the instructions.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    let timer;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWelcoming(true);
          if (instructionsRef.current) {
            setShowHow(true);
            if (audioUnlocked()) {
              setNeedsTap(false);
              setAsking(true);
              speak(instructionsRef.current, { voice: guideId });
            } else {
              setNeedsTap(true);
            }
          }
          timer = setTimeout(() => {
            setWelcoming(false);
            setAsking(false);
          }, WELCOME_MS);
        } else {
          clearTimeout(timer);
          setWelcoming(false);
          setAsking(false);
          setShowHow(false);
          cancelSpeech();
        }
      },
      { threshold: 0.7 }
    );
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [guideId]);

  return (
    <div ref={rootRef} className={`game-hint-bubble${welcoming ? " game-hint-bubble--welcome" : ""}`}>
      <div className="game-hint-bubble__card">
        <p>{message}</p>
        {showHow && instructions && <p className="game-hint-bubble__how">{instructions}</p>}
        <div className="game-hint-bubble__actions">
          {/* Listen reads exactly what is written in the bubble */}
          <button
            className="game-hint-bubble__btn"
            onClick={() => {
              setNeedsTap(false);
              speak(message, { voice: guideId });
            }}
          >
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
        <GuideArt character={guideId} waving={asking || welcoming} size={84} />
        {needsTap && <span className="game-hint-bubble__tap-hint">Tap me to hear!</span>}
      </button>
    </div>
  );
}

export default GameHintBubble;
