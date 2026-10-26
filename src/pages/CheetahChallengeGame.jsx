import FeedbackLine from "../components/FeedbackLine";
import { useState, useEffect, useRef } from "react";
import { Trophy, Star, Clock, Flame, Volume2, Play, RotateCcw, Mic } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import GameBanner from "../components/GameBanner";
import WordPicture from "../components/WordPicture";
import LessonComplete from "../components/LessonComplete";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import { useProgress } from "../context/ProgressContext";
import { BANKS } from "../data/questionBanks";
import "./CheetahChallengeGame.css";

const ROUND_MS = 6000;
const TICK_MS = 100;

// ---- deciding whether what the microphone heard is the word ----------------------------
// Speech recognition rarely returns a word exactly: it adds punctuation ("Fox."), extra words
// ("the fox"), plurals, or a near sound-alike ("son" for "sun"). So a word counts if ANY of the
// guesses the browser offers has the word in it, is a known sound-alike, or is one letter off.
const SOUND_ALIKES = { sun: ["son"], tree: ["three", "tea"], fox: ["fax", "focks", "box"], duck: ["dock", "dark"], bird: ["bud", "burd"], fish: ["fishes", "fist"], frog: ["frock", "frogs"], lion: ["line", "lying", "lyin"] };

const clean = (text) => text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim();

function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

function heardTheWord(guesses, target) {
  const want = target.toLowerCase();
  const alikes = SOUND_ALIKES[want] || [];
  return guesses.some((guess) => {
    const heard = clean(guess);
    if (!heard) return false;
    const tokens = heard.split(" ");
    const squashed = heard.replace(/ /g, "");
    return (
      squashed === want ||
      tokens.some((t) => t === want || t === `${want}s` || alikes.includes(t)) ||
      (want.length >= 4 && tokens.some((t) => editDistance(t, want) <= 1)) ||
      (want.length >= 6 && tokens.some((t) => editDistance(t, want) <= 2))
    );
  });
}

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
  const [listening, setListeningState] = useState(false);
  const setListening = (value) => {
    listeningRef.current = value;
    setListeningState(value);
  };
  const [micFeedback, setMicFeedback] = useState("");
  const advancingRef = useRef(false);
  const listeningRef = useRef(false); // the round timer pauses while the microphone is listening
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
    recognition.maxAlternatives = 5; // look at every guess, not just the first
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
      if (listeningRef.current) return; // give the microphone time to hear and answer
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
      const guesses = [...event.results[0]].map((alt) => alt.transcript);
      setListening(false);
      if (heardTheWord(guesses, word)) {
        handleGotIt();
      } else {
        setMicFeedback(`Heard "${guesses[0].trim().toLowerCase()}" - try again!`);
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
      <GameBanner game="cheetahChallengeGame" />

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
            <div className="cheetah-game__picture">
              <WordPicture word={word} size={96} />
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
              {micFeedback ? (
                <FeedbackLine text={micFeedback} say={micFeedback.startsWith("Heard") ? "Try again!" : undefined} />
              ) : (
                <p className="cheetah-game__hint-text">Or tap the card once you've read it.</p>
              )}
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
