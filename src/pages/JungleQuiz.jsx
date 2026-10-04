// "What jungle are you joining?" - a short picture quiz after login. The sloth
// reads each question and answer aloud; the answers decide the child's jungle,
// which is saved and shown on the dashboard and profile.
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Volume2 } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import SlothArt from "../components/SlothArt";
import { speak, cancelSpeech, audioUnlocked } from "../audio/speech";
import { hasHeard, markHeard } from "../audio/heard";
import { useProgress } from "../context/ProgressContext";
import { JUNGLES, QUIZ, QUIZ_INTRO, resultText, sortIntoJungle } from "../data/jungleQuiz";
import "./JungleQuiz.css";

function JungleQuiz({ onNext }) {
  const { setJungle } = useProgress();
  const rootRef = useRef(null);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0); // 0..QUIZ.length-1 questions, QUIZ.length = result
  const [picks, setPicks] = useState([]);
  const [chosen, setChosen] = useState(null);

  const done = step >= QUIZ.length;
  const jungleId = done ? sortIntoJungle(picks) : null;
  const q = QUIZ[step];

  // Only read aloud while this page is on screen
  useEffect(() => {
    const el = rootRef.current;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.7 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const line = done ? resultText(jungleId) : step === 0 ? `${QUIZ_INTRO} ${q.question}` : q.question;
  const spoken = done ? resultText(jungleId) : q.question;

  useEffect(() => {
    if (!active) {
      cancelSpeech();
      return;
    }
    if (done) setJungle(jungleId);
    // each question is read the first time only; the speaker button reads it again
    const key = `quiz:${spoken}`;
    if (audioUnlocked() && !hasHeard(key)) {
      markHeard(key);
      speak(spoken, { voice: "sloth" });
    }
  }, [active, step]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(answer) {
    if (chosen) return;
    setChosen(answer.label);
    speak(answer.label, { voice: "sloth" });
    setTimeout(() => {
      setPicks((p) => [...p, answer.jungle]);
      setChosen(null);
      setStep((s) => s + 1);
    }, 1100);
  }

  function again() {
    setPicks([]);
    setStep(0);
  }

  return (
    <section className="page quiz" ref={rootRef}>
      <TopBar label="WHICH JUNGLE?" />
      <div className="quiz__body">
        <div className="quiz__dots" aria-label={`Question ${Math.min(step + 1, QUIZ.length)} of ${QUIZ.length}`}>
          {QUIZ.map((_, i) => (
            <span key={i} className={i < step ? "is-done" : i === step ? "is-now" : ""} />
          ))}
        </div>

        <div className="quiz__host">
          <SlothArt size={96} waving={!done} />
          <div className="quiz__bubble">
            <p>{done ? line : step === 0 ? QUIZ_INTRO : ""}</p>
            {!done && <strong>{q.question}</strong>}
            <button className="quiz__listen" onClick={() => speak(spoken, { voice: "sloth" })} aria-label="Read aloud">
              <Volume2 size={18} />
            </button>
          </div>
        </div>

        {!done ? (
          <div className="quiz__answers">
            {q.answers.map((a) => (
              <button
                key={a.label}
                className={`quiz__answer${chosen === a.label ? " is-chosen" : ""}`}
                onClick={() => pick(a)}
                disabled={Boolean(chosen)}
              >
                <span className="quiz__emoji" aria-hidden="true">
                  {a.emoji}
                </span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="quiz__result" style={{ "--jungle": JUNGLES[jungleId].color }}>
            <div className="quiz__badge" aria-hidden="true">
              {JUNGLES[jungleId].emoji}
            </div>
            <h2>{JUNGLES[jungleId].name}</h2>
            <button className="btn btn--primary" onClick={onNext}>
              Let's go! <ArrowRight size={18} />
            </button>
            <button className="quiz__again" onClick={again}>
              Take the quiz again
            </button>
          </div>
        )}
      </div>
      <AccessibilityToolbar />
    </section>
  );
}

export default JungleQuiz;
