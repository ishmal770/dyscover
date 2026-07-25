import { useState } from "react";
import { Star, Volume2, Check, RotateCcw, Home } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import "./SyllableSafariGame.css";

const ROUNDS = [
  { word: "TIGER", syllables: ["TI", "GER"] },
  { word: "RABBIT", syllables: ["RAB", "BIT"] },
  { word: "MUSIC", syllables: ["MU", "SIC"] },
  { word: "HAPPY", syllables: ["HAP", "PY"] },
  { word: "GARDEN", syllables: ["GAR", "DEN"] },
  { word: "PENCIL", syllables: ["PEN", "CIL"] },
  { word: "BUTTERFLY", syllables: ["BUT", "TER", "FLY"] },
  { word: "ELEPHANT", syllables: ["EL", "E", "PHANT"] },
  { word: "COMPUTER", syllables: ["COM", "PU", "TER"] },
  { word: "BANANA", syllables: ["BA", "NAN", "A"] },
  { word: "DINOSAUR", syllables: ["DI", "NO", "SAUR"] },
  { word: "ADVENTURE", syllables: ["AD", "VEN", "TURE"] },
];

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getLetterMetrics(len) {
  if (len <= 6) return { width: 48, height: 56, gap: 20, font: "1.6rem" };
  if (len <= 8) return { width: 38, height: 48, gap: 14, font: "1.3rem" };
  return { width: 30, height: 40, gap: 10, font: "1.05rem" };
}

function getSplitPoints(syllables) {
  const points = [];
  let cumulative = 0;
  for (let i = 0; i < syllables.length - 1; i++) {
    cumulative += syllables[i].length;
    points.push(cumulative);
  }
  return points;
}

function SyllableSafariGame({ onHome, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState("split");
  const [placedDividers, setPlacedDividers] = useState(() => new Set());
  const [feedback, setFeedback] = useState("");
  const [tray, setTray] = useState(() => shuffle(ROUNDS[0].syllables));
  const [slots, setSlots] = useState(() => Array(ROUNDS[0].syllables.length).fill(null));
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [stars, setStars] = useState(3);
  const [solved, setSolved] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const round = ROUNDS[roundIndex];
  const splitPoints = getSplitPoints(round.syllables);
  const isLastRound = roundIndex + 1 >= ROUNDS.length;
  const letterMetrics = getLetterMetrics(round.word.length);
  const letterStyle = {
    "--letter-width": `${letterMetrics.width}px`,
    "--letter-height": `${letterMetrics.height}px`,
    "--letter-gap": `${letterMetrics.gap}px`,
    "--letter-font": letterMetrics.font,
  };

  function handleGapClick(gapIndex) {
    if (placedDividers.has(gapIndex)) return;
    if (splitPoints.includes(gapIndex)) {
      const next = new Set(placedDividers);
      next.add(gapIndex);
      setPlacedDividers(next);
      if (next.size === splitPoints.length) {
        setFeedback("Perfect split!");
        setTimeout(() => {
          setPhase("build");
          setFeedback("");
        }, 700);
      } else {
        setFeedback("Nice! Find the next split.");
      }
    } else {
      setFeedback("Try again - listen for where the word breaks.");
      setStars((s) => Math.max(0, s - 1));
    }
  }

  function handleChunkTap(chunk) {
    speak(chunk);
    setSelectedChunk(chunk === selectedChunk ? null : chunk);
  }

  function handleSlotTap(slotIndex) {
    if (slots[slotIndex]) {
      const returned = slots[slotIndex];
      setSlots((s) => s.map((v, i) => (i === slotIndex ? null : v)));
      setTray((t) => [...t, returned]);
      return;
    }
    if (!selectedChunk) return;
    setSlots((s) => s.map((v, i) => (i === slotIndex ? selectedChunk : v)));
    setTray((t) => t.filter((c) => c !== selectedChunk));
    setSelectedChunk(null);
  }

  function checkBuild() {
    const filled = slots.every(Boolean);
    if (!filled) {
      setFeedback("Place all the pieces first!");
      return;
    }
    const correct = slots.every((s, i) => s === round.syllables[i]);
    if (correct) {
      setSolved(true);
      setFeedback("You built the word!");
    } else {
      setFeedback("Not quite the right order - tap a piece to swap it back.");
      setStars((s) => Math.max(0, s - 1));
    }
  }

  function nextRound() {
    if (isLastRound) {
      setSessionComplete(true);
      return;
    }
    const next = roundIndex + 1;
    setRoundIndex(next);
    setPhase("split");
    setPlacedDividers(new Set());
    setTray(shuffle(ROUNDS[next].syllables));
    setSlots(Array(ROUNDS[next].syllables.length).fill(null));
    setSelectedChunk(null);
    setSolved(false);
    setFeedback("");
  }

  function handlePlayAgain() {
    setRoundIndex(0);
    setPhase("split");
    setPlacedDividers(new Set());
    setTray(shuffle(ROUNDS[0].syllables));
    setSlots(Array(ROUNDS[0].syllables.length).fill(null));
    setSelectedChunk(null);
    setSolved(false);
    setFeedback("");
    setStars(3);
    setSessionComplete(false);
  }

  if (sessionComplete) {
    return (
      <section className="page syllable-game">
        <GameTopBar gameName="Syllable Safari" onHome={onHome} onBack={onBack} />
        <div className="syllable-game__complete">
          <h1>Game Session Completed!</h1>
          <p>You built {ROUNDS.length} words.</p>
          <div className="syllable-game__complete-actions">
            <button className="btn btn--outline" onClick={handlePlayAgain}>
              <RotateCcw size={14} /> Play Again
            </button>
            <button className="btn btn--primary" onClick={onBack}>
              <Home size={14} /> Back to World
            </button>
          </div>
        </div>
        <AccessibilityToolbar />
      </section>
    );
  }

  return (
    <section className="page syllable-game">
      <GameTopBar gameName="Syllable Safari" onHome={onHome} onBack={onBack} />

      <div className="syllable-game__progress">
        <div className="syllable-game__progress-bar">
          <div
            className="syllable-game__progress-fill"
            style={{ width: `${((roundIndex + (phase === "build" ? 0.5 : 0)) / ROUNDS.length) * 100}%` }}
          />
        </div>
        <div className="syllable-game__stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={16} fill={i < stars ? "currentColor" : "none"} />
          ))}
        </div>
      </div>

      {phase === "split" ? (
        <>
          <h1 className="syllable-game__title">
            Tap where the word splits into syllables
            <button className="syllable-game__speaker" onClick={() => speak(round.word)}>
              <Volume2 size={14} />
            </button>
          </h1>
          <div className="syllable-game__word-box">
            <div className="syllable-game__word-row" style={letterStyle}>
              {[...round.word].map((letter, i) => (
                <span key={i} className="syllable-game__letter-group">
                  <span className="syllable-game__letter">{letter}</span>
                  {i < round.word.length - 1 && (
                    <button
                      className={`syllable-game__gap${
                        placedDividers.has(i + 1) ? " syllable-game__gap--placed" : ""
                      }`}
                      onClick={() => handleGapClick(i + 1)}
                      aria-label={`Split after letter ${i + 1}`}
                    >
                      {placedDividers.has(i + 1) && <span className="syllable-game__divider" />}
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
          <p className="syllable-game__hint-text">
            &#9998; Tap where the word splits ({placedDividers.size} / {splitPoints.length})
          </p>
        </>
      ) : (
        <>
          <h1 className="syllable-game__title">Now build the word!</h1>
          <div className="syllable-game__slots">
            {slots.map((value, i) => (
              <button
                key={i}
                className={`syllable-game__slot${value ? " syllable-game__slot--filled" : ""}`}
                onClick={() => handleSlotTap(i)}
              >
                {value || "DROP HERE"}
              </button>
            ))}
          </div>
          <p className="syllable-game__hint-text">&#9757; Tap blocks to move them</p>
          <div className="syllable-game__tray">
            {tray.map((chunk) => (
              <button
                key={chunk}
                className={`syllable-game__chunk${selectedChunk === chunk ? " syllable-game__chunk--selected" : ""}`}
                onClick={() => handleChunkTap(chunk)}
              >
                {chunk} <Volume2 size={11} />
              </button>
            ))}
          </div>
        </>
      )}

      <p className="syllable-game__feedback">{feedback}</p>

      {phase === "build" && (
        <div className="syllable-game__controls">
          {solved ? (
            <button className="btn btn--primary" onClick={nextRound}>
              {isLastRound ? "Finish" : "Next Word"} <Check size={16} />
            </button>
          ) : (
            <button className="btn btn--primary" onClick={checkBuild}>
              Check Word <Check size={16} />
            </button>
          )}
        </div>
      )}

      <AccessibilityToolbar />
      <GameHintBubble
        message="Tap the pieces to hear them, then build the word in order!"
        speakText={round.word}
      />
    </section>
  );
}

export default SyllableSafariGame;
