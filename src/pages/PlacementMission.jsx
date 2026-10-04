// The placement mission: a few quick "listen and tap the word you hear"
// questions. How far the child gets sets their grade band for every game, so
// nobody has to pick one. No timer and no "wrong" screens - it is a game.
import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, Volume2 } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import SlothArt from "../components/SlothArt";
import { speak, cancelSpeech, audioUnlocked } from "../audio/speech";
import { useProgress } from "../context/ProgressContext";
import { PLACEMENT, PLACEMENT_DONE, PLACEMENT_PROMPT, placeFromAnswers } from "../data/placement";
import "./PlacementMission.css";

function PlacementMission({ onNext, onHome }) {
  const { setGrade } = useProgress();
  const rootRef = useRef(null);
  const [active, setActive] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [chosen, setChosen] = useState(null);

  const done = answers.length >= PLACEMENT.length;
  const q = PLACEMENT[Math.min(step, PLACEMENT.length - 1)];

  useEffect(() => {
    const el = rootRef.current;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.7 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // the word to find is always said when a question appears (it is the question)
  useEffect(() => {
    if (!active) {
      if (started) cancelSpeech();
      return;
    }
    if (started && !done && audioUnlocked()) speak(q.word);
    if (done) speak(PLACEMENT_DONE, { voice: "sloth" });
  }, [active, started, step, done]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(choice) {
    if (chosen) return;
    setChosen(choice);
    setTimeout(() => {
      const next = [...answers, choice === q.word];
      setAnswers(next);
      setChosen(null);
      if (next.length >= PLACEMENT.length) setGrade(placeFromAnswers(next));
      else setStep((s) => s + 1);
    }, 700);
  }

  function restart() {
    setStarted(true);
    setStep(0);
    setAnswers([]);
    setChosen(null);
  }

  return (
    <section className="page placement" ref={rootRef}>
      <TopBar label="PLACEMENT MISSION" showLogo onLogoClick={onHome} />
      <div className="placement__body">
        {!started ? (
          <div className="placement__card">
            <div className="placement__icon">
              <Sparkles size={22} />
            </div>
            <h2>Ready for a Quick Adventure?</h2>
            <p>We are going to play a few short games to figure out exactly how to build your perfect map.</p>
            <button className="btn btn--primary" onClick={restart}>
              Let&rsquo;s Play! <ArrowRight size={16} />
            </button>
          </div>
        ) : !done ? (
          <div className="placement__card placement__card--quiz">
            <div className="placement__dots" aria-label={`Question ${step + 1} of ${PLACEMENT.length}`}>
              {PLACEMENT.map((_, i) => (
                <span key={i} className={i < step ? "is-done" : i === step ? "is-now" : ""} />
              ))}
            </div>
            <h2>{PLACEMENT_PROMPT}</h2>
            <button className="placement__listen" onClick={() => speak(q.word)} aria-label="Hear the word">
              <Volume2 size={30} /> Hear it
            </button>
            <div className="placement__choices">
              {q.choices.map((c) => (
                <button key={c} className={`placement__choice${chosen === c ? " is-chosen" : ""}`} onClick={() => pick(c)} disabled={Boolean(chosen)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="placement__card">
            <SlothArt size={90} waving />
            <h2>All done! Your adventure is ready.</h2>
            <p>I picked the perfect games for you.</p>
            <button className="btn btn--primary" onClick={onNext}>
              Start! <ArrowRight size={16} />
            </button>
            <button className="placement__again" onClick={restart}>
              Play the placement games again
            </button>
          </div>
        )}
      </div>
      <AccessibilityToolbar />
      {!started && (
        <GuideBubble
          fixedCharacter="sloth"
          instructions="We will play a few short games so I can build your perfect map. Tap me when you are ready to begin."
          onAdvance={restart}
          advanceHint="Tap me to play!"
          message="Let's play a few quick games so I can build your perfect map. Tap me when you are ready!"
        />
      )}
    </section>
  );
}

export default PlacementMission;
