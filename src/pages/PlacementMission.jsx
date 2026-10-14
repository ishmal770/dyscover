// The placement mission: a few quick "listen and tap the word you hear"
// questions that adapt. It starts at the grade band the child chose, goes up
// after a right answer and down after a wrong one, and where it lands sets the
// level every game uses. No timer and no "wrong" screens - it is a game - and
// it is played only once.
import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, Volume2 } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import SlothArt from "../components/SlothArt";
import { speak, cancelSpeech } from "../audio/speech";
import { useProgress } from "../context/ProgressContext";
import { GRADE_BANDS } from "../data/questionBanks";
import { PLACEMENT_PROMPT, PLACEMENT_VOWEL_PROMPT, QUESTION_COUNT, VOWELS, nextBand, pickQuestion } from "../data/placement";
import WordPicture from "../components/WordPicture";
import "./PlacementMission.css";

function PlacementMission({ onNext, onHome }) {
  const { setGrade, placed, grade } = useProgress();
  const rootRef = useRef(null);
  const [active, setActive] = useState(false);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0); // questions answered so far
  const [band, setBand] = useState(grade); // the band of the next question
  const [asked, setAsked] = useState([]);
  const [chosen, setChosen] = useState(null);

  // the placement is played only once: after it, this page just shows the finished card
  const done = placed || count >= QUESTION_COUNT;
  const q = pickQuestion(band, asked, count % 2 === 0 ? "word" : "vowel"); // the two types alternate
  const answerOf = (question) => (question.type === "vowel" ? question.answer : question.word);

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
    // nothing is spoken automatically: "Hear it" says the word
  }, [active, started, count, done]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(choice) {
    if (chosen) return;
    setChosen(choice);
    setTimeout(() => {
      const next = nextBand(band, choice === answerOf(q));
      setAsked((a) => [...a, q.word]);
      setBand(next);
      setChosen(null);
      if (count + 1 >= QUESTION_COUNT) setGrade(next); // where it lands is the child's level
      setCount((c) => c + 1);
    }, 700);
  }

  function begin() {
    setStarted(true);
    setCount(0);
    setBand(grade);
    setAsked([]);
    setChosen(null);
  }

  const startLabel = GRADE_BANDS.find((b) => b.id === grade)?.label;

  return (
    <section className="page placement" ref={rootRef}>
      <TopBar label="PLACEMENT MISSION" showLogo onLogoClick={onHome} />
      <div className="placement__body">
        {!started && !placed ? (
          <div className="placement__card">
            <div className="placement__icon">
              <Sparkles size={22} />
            </div>
            <h2>Ready for a Quick Adventure?</h2>
            <p>We are going to play a few short games to figure out exactly how to build your perfect map.</p>
            <p className="placement__start-note">We will start with {startLabel} words and find your level.</p>
            <button className="btn btn--primary" onClick={begin}>
              Let&rsquo;s Play! <ArrowRight size={16} />
            </button>
          </div>
        ) : !done ? (
          <div className="placement__card placement__card--quiz">
            <div className="placement__dots" aria-label={`Question ${count + 1} of ${QUESTION_COUNT}`}>
              {Array.from({ length: QUESTION_COUNT }, (_, i) => (
                <span key={i} className={i < count ? "is-done" : i === count ? "is-now" : ""} />
              ))}
            </div>
            <h2>{q.type === "vowel" ? PLACEMENT_VOWEL_PROMPT : PLACEMENT_PROMPT}</h2>
            {q.type === "vowel" && (
              <>
                <WordPicture word={q.word} size={96} />
                <div className="placement__puzzle" aria-label="The word with a missing vowel">
                  {q.template.map((letter, i) => (
                    <span key={i} className={`placement__tile${letter ? "" : " is-blank"}`}>
                      {letter ?? "?"}
                    </span>
                  ))}
                </div>
              </>
            )}
            <button className="placement__listen" onClick={() => speak(q.word)} aria-label="Hear the word">
              <Volume2 size={30} /> Hear it
            </button>
            <div className={`placement__choices${q.type === "vowel" ? " placement__choices--vowels" : ""}`}>
              {(q.type === "vowel" ? VOWELS : q.choices).map((c) => (
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
          </div>
        )}
      </div>
      <AccessibilityToolbar />
      {!started && !placed && (
        <GuideBubble
          fixedCharacter="sloth"
          instructions="We will play a few short games so I can build your perfect map. Tap me when you are ready to begin."
          onAdvance={begin}
          advanceHint="Tap me to play!"
          message="Let's play a few quick games so I can build your perfect map. Tap me when you are ready!"
        />
      )}
    </section>
  );
}

export default PlacementMission;
