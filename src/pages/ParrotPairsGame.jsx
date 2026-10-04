// Parrot Pairs: the player is shown two visually-similar words (e.g.
// "angel"/"angle") and must tap the specific letters that got swapped
// between them, rather than just spotting that the words differ.
import { useState } from "react";
import { Star, Search, Volume2, RotateCcw, Check } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import LessonComplete from "../components/LessonComplete";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import "./ParrotPairsGame.css";

// 12 near-identical word pairs, each differing by a small run of
// transposed/substituted letters somewhere in the middle
const ROUNDS = [
  { word1: "EXPECTATIONS", word2: "EXPLANATIONS" },
  { word1: "EXCEPTIONS", word2: "EXPRESSIONS" },
  { word1: "EXCITEMENT", word2: "EXPERIMENT" },
  { word1: "EXPLAIN", word2: "EXPLORE" },
  { word1: "SMILE", word2: "SLIME" },
  { word1: "ANGEL", word2: "ANGLE" },
  { word1: "QUIET", word2: "QUITE" },
  { word1: "DESSERT", word2: "DESERT" },
  { word1: "FORM", word2: "FROM" },
  { word1: "TRIAL", word2: "TRAIL" },
  { word1: "BREATH", word2: "BREATHE" },
  { word1: "AFFECT", word2: "EFFECT" },
];

function getDiffRanges(word1, word2) {
  const len1 = word1.length;
  const len2 = word2.length;
  const minLen = Math.min(len1, len2);

  let prefix = 0;
  while (prefix < minLen && word1[prefix].toLowerCase() === word2[prefix].toLowerCase()) {
    prefix++;
  }

  const maxSuffix = minLen - prefix;
  let suffix = 0;
  while (
    suffix < maxSuffix &&
    word1[len1 - 1 - suffix].toLowerCase() === word2[len2 - 1 - suffix].toLowerCase()
  ) {
    suffix++;
  }

  return {
    range1: { start: prefix, end: len1 - suffix },
    range2: { start: prefix, end: len2 - suffix },
  };
}

function rangeToSet({ start, end }) {
  return new Set(Array.from({ length: Math.max(0, end - start) }, (_, i) => start + i));
}

function sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

// Letter tiles: big and easy to tap, but shrunk (never below 22px) so the
// longest word still fits on one row of the screen it is played on.
function getTileMetrics(maxLen) {
  const gap = maxLen <= 5 ? 10 : maxLen <= 9 ? 7 : 4;
  const fit = (Math.min(window.innerWidth, 900) - 110) / maxLen - gap;
  const size = Math.round(Math.max(22, Math.min(maxLen <= 5 ? 64 : maxLen <= 7 ? 54 : 46, fit)));
  return { size, font: `${(size / 30).toFixed(2)}rem`, gap };
}

function ParrotPairsGame({ onHome, onBack, onDone }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected1, setSelected1] = useState(() => new Set());
  const [selected2, setSelected2] = useState(() => new Set());
  const [wrongFlash, setWrongFlash] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsTotal, setHintsTotal] = useState(0); // hints over the whole session (for the lesson stars)
  const [message, setMessage] = useState("Tap the letters that got mixed up in each word!");
  const [solved, setSolved] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const round = ROUNDS[roundIndex];
  const stars = Math.max(0, 3 - hintsUsed);
  const { range1, range2 } = getDiffRanges(round.word1, round.word2);
  const expected1 = rangeToSet(range1);
  const expected2 = rangeToSet(range2);
  const metrics = getTileMetrics(Math.max(round.word1.length, round.word2.length));
  const tileStyle = {
    "--tile-size": `${metrics.size}px`,
    "--tile-font": metrics.font,
    "--tile-gap": `${metrics.gap}px`,
  };

  function toggle(setSelected, selected, index) {
    if (solved) return;
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelected(next);
  }

  function handleCheckAnswer() {
    const correct = sameSet(selected1, expected1) && sameSet(selected2, expected2);
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
    setSelected1(new Set(expected1));
    setSelected2(new Set(expected2));
    setHintsUsed((h) => h + 1);
    setHintsTotal((h) => h + 1);
    setMessage("Here's a hint - the mixed-up letters are highlighted.");
  }

  function handleReset() {
    setSelected1(new Set());
    setSelected2(new Set());
    setMessage("Tap the letters that got mixed up in each word!");
  }

  function handleNextWord() {
    if (roundIndex + 1 >= ROUNDS.length) {
      setSessionComplete(true);
      return;
    }
    setRoundIndex((i) => i + 1);
    setSelected1(new Set());
    setSelected2(new Set());
    setSolved(false);
    setHintsUsed(0);
    setMessage("Tap the letters that got mixed up in each word!");
  }

  function handlePlayAgain() {
    setRoundIndex(0);
    setSelected1(new Set());
    setSelected2(new Set());
    setSolved(false);
    setHintsUsed(0);
    setScore(0);
    setHintsTotal(0);
    setSessionComplete(false);
    setMessage("Tap the letters that got mixed up in each word!");
  }

  if (sessionComplete) {
    return (
      <section className="page parrot-game">
        <GameTopBar gameName="Parrot Pairs" onHome={onHome} onBack={onBack} />
        <LessonComplete
          lessonId="parrotPairsGame"
          stars={hintsTotal <= 2 ? 3 : hintsTotal <= 6 ? 2 : 1}
          onPlayAgain={handlePlayAgain}
          onBack={onDone ?? onBack}
        />
        <AccessibilityToolbar />
      </section>
    );
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
        <span className="parrot-game__round-count">
          {roundIndex + 1} / {ROUNDS.length}
        </span>
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
          <div className="parrot-game__letters" style={tileStyle}>
            {[...round.word1].map((letter, i) => (
              <button
                key={i}
                className={`parrot-game__letter${
                  solved && expected1.has(i) ? " parrot-game__letter--matched" : ""
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
          <div className="parrot-game__letters" style={tileStyle}>
            {[...round.word2].map((letter, i) => (
              <button
                key={i}
                className={`parrot-game__letter${
                  solved && expected2.has(i) ? " parrot-game__letter--matched" : ""
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
            {roundIndex + 1 >= ROUNDS.length ? "Finish" : "Next Word"} <Check size={16} />
          </button>
        ) : (
          <button className="btn btn--primary" onClick={handleCheckAnswer}>
            Check Answer <Check size={16} />
          </button>
        )}
      </div>

      <AccessibilityToolbar />
      <GameHintBubble
        instructions="Look at the two words. A few letters got mixed up between them. Tap the letters that are different in each word. Then press Check Answer. You can tap a speaker to hear a word, or tap Hint if you need help."
        message="Can you find the letters that got mixed up? Tap the speaker to hear the word!"
      />
    </section>
  );
}

export default ParrotPairsGame;
