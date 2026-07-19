import { useState } from "react";
import { Star, Search, Volume2, RotateCcw, Check } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import "./ParrotPairsGame.css";

const ROUNDS = [
  { word1: "SMILE", word2: "SLIME" },
  { word1: "STOP", word2: "SPOT" },
  { word1: "EARTH", word2: "HEART" },
];

function letterKey(word, index) {
  return `${word}-${index}`;
}

function ParrotPairsGame({ onHome, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [matched, setMatched] = useState(() => new Set());
  const [selected, setSelected] = useState(null);
  const [wrongPair, setWrongPair] = useState(null);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState("Tap a letter in each word to find a match!");
  const [solved, setSolved] = useState(false);

  const round = ROUNDS[roundIndex];
  const stars = Math.max(0, 3 - hintsUsed);

  const totalLetters = round.word1.length;
  const allMatched = matched.size === totalLetters * 2;

  function handleTileClick(word, index) {
    if (solved) return;
    const letters = word === "word1" ? round.word1 : round.word2;
    const key = letterKey(word, index);
    if (matched.has(key)) return;

    if (!selected) {
      setSelected({ word, index, letter: letters[index] });
      return;
    }

    if (selected.word === word) {
      setSelected({ word, index, letter: letters[index] });
      return;
    }

    const otherLetters = selected.word === "word1" ? round.word1 : round.word2;
    const otherLetter = otherLetters[selected.index];
    const thisLetter = letters[index];

    if (otherLetter.toLowerCase() === thisLetter.toLowerCase()) {
      const next = new Set(matched);
      next.add(letterKey(selected.word, selected.index));
      next.add(key);
      setMatched(next);
      setScore((s) => s + 50);
      setSelected(null);
      setMessage("Nice match!");
      if (next.size === totalLetters * 2) {
        setMessage("All matched! Hit Check Answer.");
      }
    } else {
      setWrongPair([letterKey(selected.word, selected.index), key]);
      setMessage("Not quite - try again!");
      setTimeout(() => setWrongPair(null), 500);
      setSelected(null);
    }
  }

  function handleHint() {
    if (solved || allMatched) return;
    const unmatchedIndex = [...round.word1].findIndex((_, i) => !matched.has(letterKey("word1", i)));
    if (unmatchedIndex === -1) return;
    const letter = round.word1[unmatchedIndex];
    const targetIndex = [...round.word2].findIndex(
      (l, i) => l.toLowerCase() === letter.toLowerCase() && !matched.has(letterKey("word2", i))
    );
    if (targetIndex === -1) return;
    const next = new Set(matched);
    next.add(letterKey("word1", unmatchedIndex));
    next.add(letterKey("word2", targetIndex));
    setMatched(next);
    setHintsUsed((h) => h + 1);
    setSelected(null);
    setMessage("Here's a hint - one pair matched for you.");
  }

  function handleReset() {
    setMatched(new Set());
    setSelected(null);
    setScore(0);
    setHintsUsed(0);
    setSolved(false);
    setMessage("Tap a letter in each word to find a match!");
  }

  function handleCheckAnswer() {
    if (allMatched) {
      setSolved(true);
      setMessage("Great job! You found every matching letter.");
    } else {
      setMessage("Keep going - not all letters are matched yet.");
    }
  }

  function handleNextWord() {
    const next = (roundIndex + 1) % ROUNDS.length;
    setRoundIndex(next);
    setMatched(new Set());
    setSelected(null);
    setSolved(false);
    setMessage("Tap a letter in each word to find a match!");
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

      <h1 className="parrot-game__title">Spot the matching letters!</h1>
      <p className="parrot-game__subtitle">Tap the letters that are exactly the same in both words.</p>

      <div className="parrot-game__board">
        <div className="parrot-game__word-card">
          <div className="parrot-game__word-header">
            <span>WORD 1</span>
            <button className="parrot-game__speaker" onClick={() => speak(round.word1)}>
              <Volume2 size={14} />
            </button>
          </div>
          <div className="parrot-game__letters">
            {[...round.word1].map((letter, i) => {
              const key = letterKey("word1", i);
              return (
                <button
                  key={key}
                  className={`parrot-game__letter${matched.has(key) ? " parrot-game__letter--matched" : ""}${
                    selected?.word === "word1" && selected.index === i ? " parrot-game__letter--selected" : ""
                  }${wrongPair?.includes(key) ? " parrot-game__letter--wrong" : ""}`}
                  onClick={() => handleTileClick("word1", i)}
                >
                  {letter}
                </button>
              );
            })}
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
            {[...round.word2].map((letter, i) => {
              const key = letterKey("word2", i);
              return (
                <button
                  key={key}
                  className={`parrot-game__letter${matched.has(key) ? " parrot-game__letter--matched" : ""}${
                    selected?.word === "word2" && selected.index === i ? " parrot-game__letter--selected" : ""
                  }${wrongPair?.includes(key) ? " parrot-game__letter--wrong" : ""}`}
                  onClick={() => handleTileClick("word2", i)}
                >
                  {letter}
                </button>
              );
            })}
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
        message="Can you find the matching letters? Tap the speaker to hear the word!"
        speakText={round.word1}
      />
    </section>
  );
}

export default ParrotPairsGame;
