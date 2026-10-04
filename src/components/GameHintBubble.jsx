// The floating guide hint bubble every game uses. When you arrive at a game the
// guide pops in, waves, shows the game's instructions and reads them aloud -
// the same welcome the onboarding pages give. After that the child can ask
// again any time: tapping "How to play" (or the guide) re-reads the
// instructions for the current step, and the words stay in the bubble so they
// can read along.
// (The speech functions live in src/audio/speech.js and are re-exported here
// because most of the app imports them from this file.)
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, HelpCircle, Film, Volume2, X } from "lucide-react";
import GameDemo from "./GameDemo";
import GuideArt from "./GuideArt";
import { useGuide } from "../context/GuideContext";
import { speak, cancelSpeech, audioUnlocked } from "../audio/speech";
import { hasHeard, markHeard } from "../audio/heard";
import "./GameHintBubble.css";

export { speak, setSpeechMuted, cancelSpeech, audioUnlocked } from "../audio/speech";

const WELCOME_MS = 4500;

// What the guide asks after reading the instructions for the current step
export const ASK_MORE = "Do you want to hear the other instructions? Tap one to listen.";

// roughly how long a line takes to say aloud
const readMs = (text) => 2200 + text.length * 55;

// `character` pins this game's own mascot (e.g. the lion in Lion's Letters);
// otherwise the child's chosen guide is shown. `instructions` is the how-to-play
// text for the current step of the game.
// `steps` lists every step's instructions ([{ label, text }]); after the current
// step is read, the guide offers the others.
function GameHintBubble({ message, character, instructions, demo, steps = [] }) {
  const { guide } = useGuide();
  const guideId = character || guide.id;
  const rootRef = useRef(null);
  const [showHow, setShowHow] = useState(false);
  const [asking, setAsking] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const moreTimer = useRef(null);
  const heardKey = `game:${demo || message}`;
  const [welcoming, setWelcoming] = useState(false);
  // True when the browser blocked the automatic welcome (no click yet)
  const [needsTap, setNeedsTap] = useState(false);

  // The welcome fires when the page scrolls into view, but the instructions
  // can change step by step - read them through a ref so a new step doesn't
  // re-trigger the welcome.
  const instructionsRef = useRef(instructions);
  instructionsRef.current = instructions;

  // Ask the guide how to play: read the instructions aloud and show them.
  // Say this step's instructions, then (if the game has other steps) ask whether
  // the child wants to hear those too.
  function readInstructions(text) {
    setAsking(true);
    speak(text, { voice: guideId });
    clearTimeout(moreTimer.current);
    setShowMore(false);
    if (steps.some((st) => st.text !== text)) {
      moreTimer.current = setTimeout(() => {
        setShowMore(true);
        setAsking(false);
        speak(ASK_MORE, { voice: guideId });
      }, readMs(text));
    } else {
      moreTimer.current = setTimeout(() => setAsking(false), 3500);
    }
  }

  function askHowToPlay() {
    setNeedsTap(false);
    setShowHow(true);
    markHeard(heardKey);
    readInstructions(instructions);
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
          // The instructions are read the first time a child reaches this game;
          // after that it stays quiet (tap "How to play" to hear them again)
          if (instructionsRef.current && !hasHeard(heardKey)) {
            setShowHow(true);
            if (audioUnlocked()) {
              setNeedsTap(false);
              markHeard(heardKey);
              readInstructions(instructionsRef.current);
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
          clearTimeout(moreTimer.current);
          setWelcoming(false);
          setAsking(false);
          setShowHow(false);
          setShowMore(false);
          cancelSpeech();
        }
      },
      { threshold: 0.7 }
    );
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      clearTimeout(moreTimer.current);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideId]);

  return (
    <div ref={rootRef} className={`game-hint-bubble${welcoming ? " game-hint-bubble--welcome" : ""}`}>
      <div className="game-hint-bubble__card">
        <p>{message}</p>
        {showHow && instructions && <p className="game-hint-bubble__how">{instructions}</p>}
        {showMore && (
          <div className="game-hint-bubble__more">
            <p>
              Do you want to hear the other instructions?
              <button className="game-hint-bubble__more-close" onClick={() => setShowMore(false)} aria-label="No thanks">
                <X size={14} />
              </button>
            </p>
            {steps
              .filter((st) => st.text !== instructions)
              .map((st) => (
                <button
                  key={st.label}
                  className="game-hint-bubble__more-btn"
                  onClick={() => {
                    setShowHow(true);
                    speak(st.text, { voice: guideId });
                  }}
                >
                  <Volume2 size={14} /> {st.label}
                </button>
              ))}
          </div>
        )}
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
          {demo && (
            <button
              className="game-hint-bubble__btn game-hint-bubble__btn--demo"
              onClick={() => {
                cancelSpeech();
                setShowDemo(true);
              }}
            >
              <Film size={12} /> Watch demo
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
      {showDemo && createPortal(<GameDemo demoId={demo} onClose={() => setShowDemo(false)} />, document.body)}
    </div>
  );
}

export default GameHintBubble;
