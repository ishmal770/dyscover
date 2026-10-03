// The jungle guide (one of six jungle animals) shown on onboarding/hub pages. When its
// page scrolls into view it pops in, waves, and reads `message` aloud - that
// is the "welcome". Tapping the guide opens a chooser to swap animals.
import { useEffect, useRef, useState } from "react";
import { Volume2, X } from "lucide-react";
import GuideArt from "./GuideArt";
import { speak, cancelSpeech } from "./GameHintBubble";
import { useGuide } from "../context/GuideContext";
import "./GuideBubble.css";

const WELCOME_MS = 4500;

function GuideBubble({ message }) {
  const { guide, guides, chooseGuide } = useGuide();
  const rootRef = useRef(null);
  const [welcoming, setWelcoming] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
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
          speak(`Hi, I'm ${guideName}! ${message}`);
          timer = setTimeout(() => setWelcoming(false), WELCOME_MS);
        } else {
          clearTimeout(timer);
          setWelcoming(false);
          setPickerOpen(false);
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

  function pick(id) {
    chooseGuide(id);
    setPickerOpen(false);
    setWelcoming(true);
    speak(`Hi, I'm ${guides[id].name}! ${message}`);
    setTimeout(() => setWelcoming(false), WELCOME_MS);
  }

  return (
    <div ref={rootRef} className={`guide-bubble${welcoming ? " guide-bubble--welcome" : ""}`}>
      {pickerOpen && (
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
        <p>{message}</p>
        <button className="guide-bubble__listen" onClick={() => speak(message)} aria-label="Hear the guide again">
          <Volume2 size={14} />
        </button>
      </div>
      <button
        className="guide-bubble__avatar"
        onClick={() => setPickerOpen((open) => !open)}
        aria-label={`${guide.label} - tap to change your guide`}
      >
        <GuideArt character={guide.id} waving={welcoming} size={70} />
      </button>
    </div>
  );
}

export default GuideBubble;
