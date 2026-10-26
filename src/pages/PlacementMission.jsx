// The placement diagnostic adapts one step after every answer. Signed-in students
// get server-scored questions and persistent skill results; demo play stays local.
import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, Volume2, RefreshCw } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import SlothArt from "../components/SlothArt";
import { speak, cancelSpeech } from "../audio/speech";
import { useProgress } from "../context/ProgressContext";
import { GRADE_BANDS } from "../data/questionBanks";
import { LESSON_BY_ID } from "../data/lessons";
import { PLACEMENT_PROMPT, PLACEMENT_VOWEL_PROMPT, QUESTION_COUNT, VOWELS, nextBand, pickQuestion } from "../data/placement";
import { answerPlacementDiagnostic, startPlacementDiagnostic } from "../learningApi";
import { supabase } from "../supabase";
import { clockNow } from "../learningSessionClock";
import WordPicture from "../components/WordPicture";
import "./PlacementMission.css";

function PlacementMission({ onNext, onHome }) {
  const { completePlacement, placed, grade, placement } = useProgress();
  const rootRef = useRef(null);
  const correctRef = useRef(0);
  const historyRef = useRef([]);
  const questionStartedAt = useRef(0);
  const [active, setActive] = useState(false);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);
  const [band, setBand] = useState(grade);
  const [asked, setAsked] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [question, setQuestion] = useState(null);
  const [remote, setRemote] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const done = placed || count >= QUESTION_COUNT;
  const q = question || pickQuestion(band, asked, count % 2 === 0 ? "word" : "vowel");
  const answerOf = (current) => (current.type === "vowel" ? current.answer : current.word);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.7 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active && started) cancelSpeech();
  }, [active, started, count]);

  async function begin() {
    setError("");
    correctRef.current = 0;
    historyRef.current = [];
    questionStartedAt.current = clockNow();
    setCount(0);
    setBand(grade);
    setAsked([]);
    setChosen(null);
    setQuestion(null);
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const first = await startPlacementDiagnostic(grade);
        setQuestion(first.question);
        setRemote(true);
      } else {
        setRemote(false);
      }
      setStarted(true);
    } catch (err) {
      setError(err.message || "Could not connect to the learning service. Try again.");
    }
  }

  async function pick(choice) {
    if (chosen || busy) return;
    setChosen(choice);
    const correct = choice === answerOf(q);

    if (remote) {
      setBusy(true);
      const nextHistory = [...historyRef.current, {
        question_id: q.id,
        answer: choice,
        duration_ms: Math.max(0, clockNow() - questionStartedAt.current),
      }];
      try {
        const result = await answerPlacementDiagnostic(nextHistory);
        historyRef.current = nextHistory;
        if (result.complete) {
          correctRef.current = result.correct;
          setBand(result.grade_tier);
          completePlacement({
            grade: result.grade_tier,
            correct: result.correct,
            total: result.total,
            startLessonId: result.start_lesson_id,
          });
          setCount(QUESTION_COUNT);
          setQuestion(null);
          setChosen(null);
        } else {
          if (result.correct) correctRef.current += 1;
          setQuestion(result.question);
          setBand(result.current_band);
          setCount(result.question_number - 1);
          setAsked((items) => [...items, q.word]);
          questionStartedAt.current = clockNow();
          setChosen(null);
        }
      } catch (err) {
        setError(err.message || "Could not save that answer. Try again.");
        setChosen(null);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (correct) correctRef.current += 1;
    setTimeout(() => {
      const next = nextBand(band, correct);
      setAsked((items) => [...items, q.word]);
      setBand(next);
      setChosen(null);
      if (count + 1 >= QUESTION_COUNT) {
        completePlacement({ grade: next, correct: correctRef.current, total: QUESTION_COUNT });
      }
      setCount((value) => value + 1);
    }, 650);
  }

  const startLabel = GRADE_BANDS.find((item) => item.id === grade)?.label;
  const levelLabel = GRADE_BANDS.find((item) => item.id === (placement?.grade || grade))?.label;
  const startName = placement?.startLessonId ? LESSON_BY_ID[placement.startLessonId]?.name : null;

  return (
    <section className="page placement" ref={rootRef}>
      <TopBar label="PLACEMENT MISSION" showLogo onLogoClick={onHome} />
      <div className="placement__body">
        {!started && !placed ? (
          <div className="placement__card">
            <div className="placement__icon"><Sparkles size={22} /></div>
            <h2>Ready for a Quick Adventure?</h2>
            <p>We are going to play a few short games to find the right lessons for you.</p>
            <p className="placement__start-note">We will start with {startLabel} words and adjust as you answer.</p>
            {error && <p role="alert" className="placement__error">{error}</p>}
            <button className="btn btn--primary" onClick={begin} disabled={busy}>
              {error ? "TRY AGAIN" : "LET’S PLAY"} <ArrowRight size={16} />
            </button>
          </div>
        ) : !done ? (
          <div className="placement__card placement__card--quiz">
            <div className="placement__dots" aria-label={`Question ${count + 1} of ${QUESTION_COUNT}`}>
              {Array.from({ length: QUESTION_COUNT }, (_, i) => (
                <span key={i} className={i < count ? "is-done" : i === count ? "is-now" : ""} />
              ))}
            </div>
            <h2>{q.prompt || (q.type === "vowel" ? PLACEMENT_VOWEL_PROMPT : PLACEMENT_PROMPT)}</h2>
            {remote && q.type === "choice" && <p className="placement__word-prompt">{q.word}</p>}
            {q.type === "vowel" && (
              <>
                <WordPicture word={q.word} size={96} />
                <div className="placement__puzzle" aria-label="The word with a missing vowel">
                  {q.template.map((letter, i) => (
                    <span key={i} className={`placement__tile${letter ? "" : " is-blank"}`}>{letter ?? "?"}</span>
                  ))}
                </div>
              </>
            )}
            <button className="placement__listen" onClick={() => speak(q.word)} aria-label="Hear the word">
              <Volume2 size={30} /> Hear it
            </button>
            <div className={`placement__choices${q.type === "vowel" ? " placement__choices--vowels" : ""}`}>
              {(q.type === "vowel" ? VOWELS : q.choices).map((choice) => (
                <button key={choice} className={`placement__choice${chosen === choice ? " is-chosen" : ""}`}
                  onClick={() => pick(choice)} disabled={Boolean(chosen) || busy}>
                  {choice}
                </button>
              ))}
            </div>
            {busy && <p role="status" className="placement__saving"><RefreshCw size={14} /> Saving your answer…</p>}
            {error && <p role="alert" className="placement__error">{error}</p>}
          </div>
        ) : (
          <div className="placement__card">
            <SlothArt size={90} waving />
            <h2>All done! Your adventure is ready.</h2>
            <p>Your level: {levelLabel}.{startName ? ` First game: ${startName}.` : " I picked the perfect games for you."}</p>
            <button className="btn btn--primary" onClick={onNext}>Open my map! <ArrowRight size={16} /></button>
          </div>
        )}
      </div>
      <AccessibilityToolbar />
      {!started && !placed && !error && (
        <GuideBubble fixedCharacter="sloth"
          instructions="We will play a few short games so I can build your perfect map. Tap me when you are ready to begin."
          onAdvance={begin} advanceHint="Tap me to play!"
          message="Let's play a few quick games so I can build your perfect map. Tap me when you are ready!" />
      )}
    </section>
  );
}

export default PlacementMission;

