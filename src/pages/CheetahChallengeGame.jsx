import { useState, useEffect, useRef } from "react";
import { Trophy, Star, Clock, Flame, Volume2, Play, RotateCcw, Mic } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import LessonComplete from "../components/LessonComplete";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import { useProgress } from "../context/ProgressContext";
import { BANKS } from "../data/questionBanks";
import "./CheetahChallengeGame.css";

const ROUND_MS = 6000;
const TICK_MS = 100;

const SpeechRecognitionApi =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

function CheetahChallengeGame({ onHome, onBack, onDone }) {
  const { grade } = useProgress();
  const words = BANKS.cheetah[grade];
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0); // words read in time (for the lesson stars)
  const [timeLeft, setTimeLeft] = useState(100);
  const [finished, setFinished] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [micFeedback, setMicFeedback] = useState("");
  const advancingRef = useRef(false);
  const remainingRef = useRef(ROUND_MS);
  const sectionRef = useRef(null);
  const recognitionRef = useRef(null);

  const stars = Math.min(3, Math.floor(streak / 3));
  const word = words[roundIndex];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setIsActive(entry.isIntersecting), {
      threshold: 0.6,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionApi) return;
    const recognition = new SpeechRecognitionApi();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    return () => recognition.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    advancingRef.current = false;
    remainingRef.current = ROUND_MS;
    setTimeLeft(100);
    setMicFeedback("");
    setListening(false);
    recognitionRef.current?.abort();
  }, [roundIndex]);

  useEffect(() => {
    if (finished || !isActive) return;
    const interval = setInterval(() => {
      remainingRef.current = Math.max(0, remainingRef.current - TICK_MS);
      const pct = (remainingRef.current / ROUND_MS) * 100;
      setTimeLeft(pct);
      if (remainingRef.current <= 0 && !advancingRef.current) {
        advancingRef.current = true;
        setStreak(0);
        recognitionRef.current?.abort();
        advanceRound();
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [isActive, finished, roundIndex]);

  function advanceRound() {
    setTimeout(() => {
      setRoundIndex((i) => {
        if (i + 1 >= words.length) {
          setFinished(true);
          return i;
        }
        return i + 1;
      });
    }, 400);
  }

  function handleGotIt() {
    if (finished || advancingRef.current) return;
    advancingRef.current = true;
    setScore((s) => s + Math.round(timeLeft * 10));
    setStreak((s) => s + 1);
    setCorrect((c) => c + 1);
    advanceRound();
  }

  function handleMicClick() {
    const recognition = recognitionRef.current;
    if (!recognition || listening || advancingRef.current) return;
    setMicFeedback("");
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      setListening(false);
      if (transcript === word.toLowerCase()) {
        handleGotIt();
      } else {
        setMicFeedback(`Heard "${transcript}" - try again!`);
      }
    };
    recognition.onerror = () => {
      setListening(false);
      setMicFeedback("Couldn't hear you - try again or tap the card.");
    };
    recognition.onend = () => setListening(false);

    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }

  function handleRestart() {
    setRoundIndex(0);
    setScore(0);
    setStreak(0);
    setCorrect(0);
    setFinished(false);
    advancingRef.current = false;
    remainingRef.current = ROUND_MS;
    setTimeLeft(100);
    setMicFeedback("");
    setListening(false);
  }

  return (
    <section className="page cheetah-game" ref={sectionRef}>
      <GameTopBar gameName="Cheetah Challenge" onHome={onHome} onBack={onBack} />

      <div className="cheetah-game__scorebar">
        <div className="cheetah-game__score">
          <Trophy size={14} />
          <span>SCORE</span>
          <strong>{score.toLocaleString()}</strong>
        </div>
        <span className="cheetah-game__round-count">
          {roundIndex + 1} / {words.length}
        </span>
        <div className="cheetah-game__stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={16} fill={i < stars ? "currentColor" : "none"} />
          ))}
        </div>
        <div className="cheetah-game__timer">
          <Clock size={14} />
          <div className="cheetah-game__timer-bar">
            <div className="cheetah-game__timer-fill" style={{ width: `${timeLeft}%` }} />
          </div>
        </div>
        <div className="cheetah-game__streak">
          <Flame size={13} /> {streak} STREAK
        </div>
        <button className="cheetah-game__restart" onClick={handleRestart} aria-label="Restart">
          <RotateCcw size={14} />
        </button>
      </div>

      {finished ? (
        <LessonComplete
          lessonId="cheetahChallengeGame"
          stars={correct >= 10 ? 3 : correct >= 7 ? 2 : 1}
          character="cheetah"
          onPlayAgain={handleRestart}
          onBack={onDone ?? onBack}
        />
      ) : (
        <>
          <div
            className="cheetah-game__card"
            role="button"
            tabIndex={0}
            onClick={handleGotIt}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleGotIt()}
          >
            <div className="cheetah-game__card-top">
              <span>
                <Play size={11} fill="currentColor" /> ROUND {roundIndex + 1}
              </span>
              <button
                className="cheetah-game__card-speaker"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(word);
                }}
              >
                <Volume2 size={14} />
              </button>
            </div>
            <div className="cheetah-game__word" style={{ "--word-len": word.length }}>
              {word}
            </div>
          </div>

          {SpeechRecognitionApi ? (
            <>
              <button
                className={`cheetah-game__mic-btn${listening ? " cheetah-game__mic-btn--listening" : ""}`}
                onClick={handleMicClick}
                disabled={listening}
              >
                <Mic size={18} /> {listening ? "Listening..." : "Tap and say the word!"}
              </button>
              <p className="cheetah-game__hint-text">
                {micFeedback || "Or tap the card once you've read it."}
              </p>
            </>
          ) : (
            <p className="cheetah-game__hint-text">Tap the card once you've read it!</p>
          )}

          <button
            className="cheetah-game__big-speaker"
            onClick={() => speak(word)}
            aria-label="Hear the word"
          >
            <Volume2 size={20} />
          </button>
        </>
      )}

      <AccessibilityToolbar />
      <GameHintBubble
        demo="cheetahChallengeGame"
        character="cheetah"
        message="Ready, set, go! Say the word out loud as fast as you can."
        instructions="A word will show up. Read it out loud as fast as you can before the time runs out. Tap the microphone and say the word, or tap the card when you have read it."
      />
    </section>
  );
}

export default CheetahChallengeGame;
