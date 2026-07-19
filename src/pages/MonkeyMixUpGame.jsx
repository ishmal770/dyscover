import { useState } from "react";
import { Star, Zap, Lightbulb, Volume2, Play, ArrowRight } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import "./MonkeyMixUpGame.css";

const VOWELS = ["A", "E", "I", "O", "U"];

const ROUNDS = [
  { template: ["S", null, "N"], answer: "U", sound: "uh" },
  { template: ["C", null, "T"], answer: "A", sound: "aa" },
  { template: ["P", null, "G"], answer: "I", sound: "ih" },
];

const BONUS_WORDS = ["Sun", "Bug", "Cup", "Rays", "Roach"];

function MonkeyMixUpGame({ onHome, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [filled, setFilled] = useState(null);
  const [wrong, setWrong] = useState(false);
  const [stars, setStars] = useState(3);
  const [level] = useState(4);

  const round = ROUNDS[roundIndex];
  const solved = filled === round.answer;
  const word = round.template.map((c) => c ?? round.answer).join("");

  function handleVowelClick(letter) {
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
    const next = (roundIndex + 1) % ROUNDS.length;
    setRoundIndex(next);
    setFilled(null);
    setWrong(false);
  }

  return (
    <section className="page monkey-game">
      <GameTopBar gameName="Monkey Mix-Up" onHome={onHome} onBack={onBack} />
      <div className="monkey-game__body">
        <div className="monkey-game__main">
          <div className="monkey-game__topline">
            <span className="monkey-game__level">
              <Zap size={12} fill="currentColor" /> Level {level}
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
                Find the vowel that makes the &lsquo;{round.sound}&rsquo; sound to complete the word! Tap a
                vowel from the tray to complete the word.
              </p>
            </div>
            <button className="monkey-game__speaker" onClick={() => speak(word)}>
              <Volume2 size={13} />
            </button>
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
            Next <ArrowRight size={16} />
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
        message={
          solved
            ? "Amazing! You found the sound. Can you find another one?"
            : "Tap a vowel to try filling in the word!"
        }
        speakText={word}
      />
    </section>
  );
}

export default MonkeyMixUpGame;
