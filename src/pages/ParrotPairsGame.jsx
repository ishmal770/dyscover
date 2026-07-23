import { useState } from "react";
import { Star, Search, Volume2, RotateCcw, Check } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import "./ParrotPairsGame.css";

const ROUNDS = [
  { word1: "ANGLE", word2: "ANGEL" },
  { word1: "FORM", word2: "FROM" },
  { word1: "CALM", word2: "CLAM" },
];

function getDiffRange(word1, word2) {
  let start = 0;
  while (start < word1.length && word1[start].toLowerCase() === word2[start].toLowerCase()) {
    start++;
  }
  let end = word1.length;
  while (end > start && word1[end - 1].toLowerCase() === word2[end - 1].toLowerCase()) {
    end--;
  }
  return { start, end };
}

function sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

function ParrotPairsGame({ onHome, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected1, setSelected1] = useState(() => new Set());
  const [selected2, setSelected2] = useState(() => new Set());
  const [wrongFlash, setWrongFlash] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState("Tap the letters that got mixed up in each word!");
  const [solved, setSolved] = useState(false);

  const round = ROUNDS[roundIndex];
  const stars = Math.max(0, 3 - hintsUsed);
  const { start, end } = getDiffRange(round.word1, round.word2);
  const expected = new Set(Array.from({ length: end - start }, (_, i) => start + i));

  function toggle(setSelected, selected, index) {
    if (solved) return;
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelected(next);
  }

  function handleCheckAnswer() {
    const correct = sameSet(selected1, expected) && sameSet(selected2, expected);
    if (correct) {
      setSolved(true);
      setScore((s) => s + 100);
      setMessage("Great job! Those are the letters that got mixed up.");
    } else {
      setMessage("Not quite - try again!");
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 500);
    }
  }

  function handleHint() {
    if (solved) return;
    setSelected1(new Set(expected));
    setSelected2(new Set(expected));
    setHintsUsed((h) => h + 1);
    setMessage("Here's a hint - the mixed-up letters are highlighted.");
  }

  function handleReset() {
    setSelected1(new Set());
    setSelected2(new Set());
    setMessage("Tap the letters that got mixed up in each word!");
  }

  function handleNextWord() {
    const next = (roundIndex + 1) % ROUNDS.length;
    setRoundIndex(next);
    setSelected1(new Set());
    setSelected2(new Set());
    setSolved(false);
    setMessage("Tap the letters that got mixed up in each word!");
  }

  return (
    <section className="page parrot-game">
      <GameTopBar gameName="Parrot Pairs" onHome={onHome} onBack={onBack} />
      <div className="parrot-game__scorebar">
        <div className="parrot-game__score">
          <Star size={14} fill="currentColor" />
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>
        <div className="parrot-game__stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={18} fill={i < stars ? "currentColor" : "none"} />
          ))}
        </div>
        <button className="parrot-game__hint-pill" onClick={handleHint}>
          <Search size={13} /> Hint
        </button>
      </div>

      <h1 className="parrot-game__title">Find the mixed-up letters!</h1>
      <p className="parrot-game__subtitle">Tap the letters in each word that got swapped around.</p>

      <div className="parrot-game__board">
        <div className="parrot-game__word-card">
          <div className="parrot-game__word-header">
            <span>WORD 1</span>
            <button className="parrot-game__speaker" onClick={() => speak(round.word1)}>
              <Volume2 size={14} />
            </button>
          </div>
          <div className="parrot-game__letters">
            {[...round.word1].map((letter, i) => (
              <button
                key={i}
                className={`parrot-game__letter${
                  solved && expected.has(i) ? " parrot-game__letter--matched" : ""
                }${!solved && selected1.has(i) ? " parrot-game__letter--selected" : ""}${
                  wrongFlash && selected1.has(i) ? " parrot-game__letter--wrong" : ""
                }`}
                onClick={() => toggle(setSelected1, selected1, i)}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <button className="parrot-game__clue-btn" onClick={handleHint} aria-label="Get a clue">
          <Search size={18} />
          <span>CLUE</span>
        </button>

        <div className="parrot-game__word-card">
          <div className="parrot-game__word-header">
            <span>WORD 2</span>
            <button className="parrot-game__speaker" onClick={() => speak(round.word2)}>
              <Volume2 size={14} />
            </button>
          </div>
          <div className="parrot-game__letters">
            {[...round.word2].map((letter, i) => (
              <button
                key={i}
                className={`parrot-game__letter${
                  solved && expected.has(i) ? " parrot-game__letter--matched" : ""
                }${!solved && selected2.has(i) ? " parrot-game__letter--selected" : ""}${
                  wrongFlash && selected2.has(i) ? " parrot-game__letter--wrong" : ""
                }`}
                onClick={() => toggle(setSelected2, selected2, i)}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="parrot-game__message">{message}</p>

      <div className="parrot-game__controls">
        <button className="parrot-game__reset" onClick={handleReset} aria-label="Reset">
          <RotateCcw size={16} />
        </button>
        {solved ? (
          <button className="btn btn--primary" onClick={handleNextWord}>
            Next Word <Check size={16} />
          </button>
        ) : (
          <button className="btn btn--primary" onClick={handleCheckAnswer}>
            Check Answer <Check size={16} />
          </button>
        )}
      </div>

      <AccessibilityToolbar />
      <GameHintBubble
        message="Can you find the letters that got mixed up? Tap the speaker to hear the word!"
        speakText={round.word1}
      />
    </section>
  );
}

export default ParrotPairsGame;
