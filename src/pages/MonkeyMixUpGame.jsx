import { useState } from "react";
import { Star, Zap, Lightbulb, Volume2, Play, ArrowRight } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import GameBanner from "../components/GameBanner";
import WordPicture from "../components/WordPicture";
import LessonComplete from "../components/LessonComplete";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import { useProgress } from "../context/ProgressContext";
import { BANKS } from "../data/questionBanks";
import { letterName } from "../data/letters";
import "./MonkeyMixUpGame.css";

const VOWELS = ["A", "E", "I", "O", "U"];

const BONUS_WORDS = ["Sun", "Bug", "Cup", "Rays", "Roach"];

// TTS engines can't reliably pronounce isolated phonetic spellings like
// "uh" or "ih" - they read them as if they were misspelled words. Speaking
// a clear real word that contains the target sound instead is far more
// reliable and is standard phonics-teaching practice.
const SOUND_EXAMPLES = { uh: "cup", aa: "cat", ih: "pig", aw: "dog", eh: "bed" };

function MonkeyMixUpGame({ onHome, onBack, onDone }) {
  const { grade } = useProgress();
  const rounds = BANKS.monkey[grade];
  const [roundIndex, setRoundIndex] = useState(0);
  const [filled, setFilled] = useState(null);
  const [wrong, setWrong] = useState(false);
  const [stars, setStars] = useState(3);
  const [level] = useState(4);
  const [sessionComplete, setSessionComplete] = useState(false);

  const round = rounds[roundIndex];
  const solved = filled === round.answer;
  const word = round.template.map((c) => c ?? round.answer).join("");
  const isLastRound = roundIndex + 1 >= rounds.length;

  function handleVowelClick(letter) {
    speak(letterName(letter));
    if (solved) return;
    if (letter === round.answer) {
      setFilled(letter);
    } else {
      setWrong(true);
      setStars((s) => Math.max(0, s - 1));
      setTimeout(() => setWrong(false), 500);
    }
  }

  function handleNext() {
    if (!solved) return;
    if (isLastRound) {
      setSessionComplete(true);
      return;
    }
    setRoundIndex((i) => i + 1);
    setFilled(null);
    setWrong(false);
  }

  function handlePlayAgain() {
    setRoundIndex(0);
    setFilled(null);
    setWrong(false);
    setStars(3);
    setSessionComplete(false);
  }

  if (sessionComplete) {
    return (
      <section className="page monkey-game">
        <GameTopBar gameName="Monkey Mix-Up" onHome={onHome} onBack={onBack} />
        <LessonComplete lessonId="monkeyMixUpGame" stars={stars} onPlayAgain={handlePlayAgain} onBack={onDone ?? onBack} />
        <AccessibilityToolbar />
      </section>
    );
  }

  return (
    <section className="page monkey-game">
      <GameTopBar gameName="Monkey Mix-Up" onHome={onHome} onBack={onBack} />
      <GameBanner game="monkeyMixUpGame" />
      <div className="monkey-game__body">
        <div className="monkey-game__main">
          <div className="monkey-game__topline">
            <span className="monkey-game__level">
              <Zap size={12} fill="currentColor" /> Level {level}
            </span>
            <span className="monkey-game__round-count">
              {roundIndex + 1} / {rounds.length}
            </span>
            <div className="monkey-game__stars">
              {[0, 1, 2].map((i) => (
                <Star key={i} size={16} fill={i < stars ? "currentColor" : "none"} />
              ))}
            </div>
          </div>
          <h1 className="monkey-game__title">Vowel Sounds</h1>

          <div className="monkey-game__sloth-box">
            <div className="monkey-game__sloth-icon">
              <Lightbulb size={16} />
            </div>
            <div>
              <strong>Sloth says:</strong>
              <p>
                Find the vowel that makes the{" "}
                <button
                  className="monkey-game__sound-chip"
                  onClick={() => speak(SOUND_EXAMPLES[round.sound])}
                >
                  &lsquo;{round.sound}&rsquo; <Volume2 size={10} />
                </button>{" "}
                sound to complete the word! Tap a vowel from the tray to complete the word.
              </p>
            </div>
            <button
              className="monkey-game__speaker"
              onClick={() =>
                speak(
                  `Find the vowel that sounds like the one in "${SOUND_EXAMPLES[round.sound]}" to complete the word! Tap a vowel from the tray to complete the word.`
                )
              }
              aria-label="Read instructions aloud"
            >
              <Volume2 size={13} />
            </button>
          </div>

          <div className="monkey-game__picture">
            <WordPicture word={round.template.map((c) => c ?? round.answer).join("")} size={88} />
          </div>

          <div className="monkey-game__puzzle">
            {round.template.map((letter, i) =>
              letter ? (
                <div key={i} className="monkey-game__tile">
                  {letter}
                </div>
              ) : (
                <div
                  key={i}
                  className={`monkey-game__tile monkey-game__tile--blank${
                    solved ? " monkey-game__tile--solved" : ""
                  }${wrong ? " monkey-game__tile--wrong" : ""}`}
                >
                  {filled}
                  {solved && (
                    <button
                      className="monkey-game__tile-speaker"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(word);
                      }}
                    >
                      <Volume2 size={11} />
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          <div className="monkey-game__rack">
            <span className="monkey-game__rack-label">VOWEL RACK</span>
            <div className="monkey-game__rack-tiles">
              {VOWELS.map((letter) => (
                <button
                  key={letter}
                  className="monkey-game__vowel"
                  onClick={() => handleVowelClick(letter)}
                  disabled={solved}
                >
                  {letter}
                  <Volume2 size={10} />
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn--primary btn--block monkey-game__next" onClick={handleNext} disabled={!solved}>
            {isLastRound ? "Finish" : "Next"} <ArrowRight size={16} />
          </button>
        </div>

        <aside className="monkey-game__sidebar">
          <h2>Words with Vowels!</h2>
          <p>Listen and learn other words that use the same vowel sound you just built.</p>
          <ul>
            {BONUS_WORDS.map((w) => (
              <li key={w}>
                <span className="monkey-game__word-icon" aria-hidden="true" />
                <span className="monkey-game__word-name">{w}</span>
                <button onClick={() => speak(w)}>
                  <Play size={11} fill="currentColor" /> Listen
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <AccessibilityToolbar />
      <GameHintBubble
        demo="monkeyMixUpGame"
        instructions="A vowel is missing from the word. Listen to the sound in the clue. Then tap the vowel from the tray that makes that sound. When you get it right, press Next."
        message={
          solved
            ? "Amazing! You found the sound. Can you find another one?"
            : "Tap a vowel to try filling in the word!"
        }
      />
    </section>
  );
}

export default MonkeyMixUpGame;
