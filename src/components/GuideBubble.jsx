// The jungle guide (one of six jungle animals) shown on onboarding/hub pages. When its
// page scrolls into view it pops in, waves, and reads `message` aloud - that
// is the "welcome". Tapping the guide opens a chooser to swap animals.
import { useEffect, useRef, useState } from "react";
import { Volume2, X, HelpCircle } from "lucide-react";
import GuideArt from "./GuideArt";
import { speak, cancelSpeech, audioUnlocked } from "./GameHintBubble";
import { hasHeard, markHeard } from "../audio/heard";
import { useGuide } from "../context/GuideContext";
import { SLOTH } from "../data/guides";
import "./GuideBubble.css";

const WELCOME_MS = 4500;

// What the guide says as the child moves on (a longer line than "Let's go!": very short
// clips start with a stray "eh" sound)
const GO_LINE = "Okay, let's go on an adventure!";

// Each guide introduces themselves by name only the first time they speak
// (per visit), so pages after the first just say what's on that page.
const introduced = new Set();
function spokenLine(guide, message, forceIntro = false) {
  if (!forceIntro && introduced.has(guide.id)) return message;
  introduced.add(guide.id);
  return `Hi, I'm ${guide.name}! ${message}`;
}

// `fixedCharacter="sloth"` pins a specific host (onboarding pages) and turns off the chooser.
// `onAdvance` makes the guide the "next" button: tapping him says a cheer and
// moves the child on, with `advanceHint` shown as a pulsing label.
// `centered` places him in the page flow instead of the bottom-right corner.
// `instructions` adds a "How to use this page" button: the guide reads it aloud
// (only when asked) and the words show in the bubble.
function GuideBubble({ message, fixedCharacter, onAdvance, advanceHint, centered, instructions }) {
  const { guide: chosen, guides, chooseGuide } = useGuide();
  const guide = fixedCharacter === "sloth" ? SLOTH : chosen;
  const canChoose = !fixedCharacter;
  const rootRef = useRef(null);
  const [welcoming, setWelcoming] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // True when the browser blocked the automatic welcome (no click yet) so we
  // show a "tap me to hear" prompt instead of staying silently mute.
  const [needsTap, setNeedsTap] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [asking, setAsking] = useState(false);
  const guideName = guide.name;

  // All pages stay mounted in the horizontal strip, so "arriving" means this
  // element becoming mostly visible. Greet once per arrival.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    let timer;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWelcoming(true);
          // The welcome is said once; after that this page stays quiet (tap the guide to hear it again)
          const key = `guide:${message}`;
          if (hasHeard(key)) {
            setNeedsTap(false);
          } else if (audioUnlocked()) {
            setNeedsTap(false);
            markHeard(key);
            speak(spokenLine(guide, message), { voice: guide.id });
          } else {
            setNeedsTap(true);
          }
          timer = setTimeout(() => setWelcoming(false), WELCOME_MS);
        } else {
          clearTimeout(timer);
          setWelcoming(false);
          setPickerOpen(false);
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
  }, [message, guideName]);

  function askHowToUse() {
    setNeedsTap(false);
    setShowHow(true);
    setAsking(true);
    speak(instructions, { voice: guide.id });
    setTimeout(() => setAsking(false), 3500);
  }

  // Tapping the guide to move on: say the welcome first if it has not been heard
  // yet, then "Let's go!", and only then move to the next page (so the next
  // page's welcome never cuts the guide off). Tapping again skips the wait.
  const advanceRef = useRef(null);
  function advance() {
    if (advanceRef.current) {
      advanceRef.current(); // already going: skip ahead now
      return;
    }
    setWelcoming(true);
    let went = false;
    const go = () => {
      if (went) return;
      went = true;
      advanceRef.current = null;
      clearTimeout(failsafe);
      cancelSpeech();
      onAdvance();
    };
    const failsafe = setTimeout(go, 15000); // never leave the child stuck if audio fails
    advanceRef.current = go;
    const sayGo = () => speak(GO_LINE, { voice: guide.id, onEnd: go });
    const key = `guide:${message}`;
    setNeedsTap(false);
    if (!hasHeard(key)) {
      markHeard(key);
      speak(spokenLine(guide, message), { voice: guide.id, onEnd: sayGo });
    } else {
      sayGo();
    }
  }

  function replay() {
    setNeedsTap(false);
    markHeard(`guide:${message}`);
    setWelcoming(true);
    speak(spokenLine(guide, message), { voice: guide.id });
    setTimeout(() => setWelcoming(false), WELCOME_MS);
  }

  function pick(id) {
    chooseGuide(id);
    setPickerOpen(false);
    setWelcoming(true);
    speak(spokenLine(guides[id], message, true), { voice: id });
    setTimeout(() => setWelcoming(false), WELCOME_MS);
  }

  return (
    <div ref={rootRef} className={`guide-bubble${welcoming ? " guide-bubble--welcome" : ""}${fixedCharacter ? " guide-bubble--stacked" : ""}${centered ? " guide-bubble--centered" : ""}`}>
      {canChoose && pickerOpen && (
        <div className="guide-bubble__picker" role="dialog" aria-label="Choose your jungle guide">
          <div className="guide-bubble__picker-header">
            <strong>Pick your guide</strong>
            <button onClick={() => setPickerOpen(false)} aria-label="Close guide picker">
              <X size={14} />
            </button>
          </div>
          <div className="guide-bubble__picker-options">
            {Object.values(guides).map((g) => (
              <button
                key={g.id}
                className={`guide-bubble__option${g.id === guide.id ? " is-active" : ""}`}
                onClick={() => pick(g.id)}
                aria-pressed={g.id === guide.id}
              >
                <GuideArt character={g.id} size={44} />
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="guide-bubble__message">
        <div className="guide-bubble__message-body">
          <p>{message}</p>
          {showHow && instructions && <p className="guide-bubble__how">{instructions}</p>}
          {instructions && (
            <button className="guide-bubble__how-btn" onClick={askHowToUse}>
              <HelpCircle size={14} /> How to use this page
            </button>
          )}
        </div>
        <button className="guide-bubble__listen" onClick={() => {
            setNeedsTap(false);
            markHeard(`guide:${message}`);
            speak(message, { voice: guide.id });
          }}
          aria-label="Hear the guide again">
          <Volume2 size={14} />
        </button>
      </div>
      <button
        className={`guide-bubble__avatar${needsTap ? " guide-bubble__avatar--needs-tap" : ""}`}
        onClick={onAdvance ? advance : canChoose && !needsTap ? () => setPickerOpen((open) => !open) : replay}
        aria-label={onAdvance ? `${guide.label} - tap to continue` : canChoose ? `${guide.label} - tap to change your guide` : `${guide.label} - tap to hear the welcome again`}
      >
        <GuideArt character={guide.id} waving={welcoming || asking} size={fixedCharacter === "sloth" ? 150 : 130} />
        {(advanceHint || needsTap) && <span className="guide-bubble__tap-hint">{advanceHint || "Tap me to hear!"}</span>}
      </button>
    </div>
  );
}

export default GuideBubble;
