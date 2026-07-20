import { useState, useEffect, useRef } from "react";
import { Trophy, Star, Clock, Flame, Volume2, Play, RotateCcw } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import "./CheetahChallengeGame.css";

const WORDS = ["FOX", "DOG", "CAT", "SUN", "TREE", "BIRD", "FISH"];
const ROUND_MS = 5000;
const TICK_MS = 100;

function CheetahChallengeGame({ onHome, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [finished, setFinished] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const advancingRef = useRef(false);
  const remainingRef = useRef(ROUND_MS);
  const sectionRef = useRef(null);

  const stars = Math.min(3, Math.floor(streak / 3));
  const word = WORDS[roundIndex];

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
    advancingRef.current = false;
    remainingRef.current = ROUND_MS;
    setTimeLeft(100);
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
        advanceRound();
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [isActive, finished, roundIndex]);

  function advanceRound() {
    setTimeout(() => {
      setRoundIndex((i) => {
        if (i + 1 >= WORDS.length) {
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
    advanceRound();
  }

  function handleRestart() {
    setRoundIndex(0);
    setScore(0);
    setStreak(0);
    setFinished(false);
    advancingRef.current = false;
    remainingRef.current = ROUND_MS;
    setTimeLeft(100);
  }

  return (
    <section className="page cheetah-game" ref={sectionRef}>
      <GameTopBar gameName="Quick Speed" onHome={onHome} onBack={onBack} />

      <div className="cheetah-game__scorebar">
        <div className="cheetah-game__score">
          <Trophy size={14} />
          <span>SCORE</span>
          <strong>{score.toLocaleString()}</strong>
        </div>
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
        <div className="cheetah-game__finished">
          <h1>Great job!</h1>
          <p>Final score: {score.toLocaleString()}</p>
          <button className="btn btn--primary" onClick={handleRestart}>
            <Play size={14} fill="currentColor" /> Play Again
          </button>
        </div>
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
            <div className="cheetah-game__word">{word}</div>
          </div>
          <p className="cheetah-game__hint-text">Tap the card once you've read it!</p>
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
      <GameHintBubble message="Ready, set, go! Name what you see as fast as you can." speakText={word} />
    </section>
  );
}

export default CheetahChallengeGame;
