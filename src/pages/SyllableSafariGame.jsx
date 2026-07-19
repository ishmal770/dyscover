import { useState } from "react";
import { Star, Volume2, Check } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import "./SyllableSafariGame.css";

const ROUNDS = [
  { word: "TIGER", syllables: ["TI", "GER"] },
  { word: "RABBIT", syllables: ["RAB", "BIT"] },
  { word: "MUSIC", syllables: ["MU", "SIC"] },
];

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function SyllableSafariGame({ onHome, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState("split");
  const [dividerAt, setDividerAt] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [tray, setTray] = useState(() => shuffle(ROUNDS[0].syllables));
  const [slots, setSlots] = useState(() => Array(ROUNDS[0].syllables.length).fill(null));
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [stars, setStars] = useState(3);
  const [solved, setSolved] = useState(false);

  const round = ROUNDS[roundIndex];
  const correctSplit = round.syllables[0].length;

  function handleGapClick(gapIndex) {
    if (gapIndex === correctSplit) {
      setDividerAt(gapIndex);
      setFeedback("Perfect split!");
      setTimeout(() => {
        setPhase("build");
        setFeedback("");
      }, 700);
    } else {
      setFeedback("Try again - listen for where the word breaks.");
      setStars((s) => Math.max(0, s - 1));
    }
  }

  function handleChunkTap(chunk) {
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
    const next = (roundIndex + 1) % ROUNDS.length;
    setRoundIndex(next);
    setPhase("split");
    setDividerAt(null);
    setTray(shuffle(ROUNDS[next].syllables));
    setSlots(Array(ROUNDS[next].syllables.length).fill(null));
    setSelectedChunk(null);
    setSolved(false);
    setFeedback("");
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
            Drag the divider correctly to divide it into the syllables
            <button className="syllable-game__speaker" onClick={() => speak(round.word)}>
              <Volume2 size={14} />
            </button>
          </h1>
          <div className="syllable-game__word-box">
            <div className="syllable-game__word-row">
              {[...round.word].map((letter, i) => (
                <span key={i} className="syllable-game__letter-group">
                  <span className="syllable-game__letter">{letter}</span>
                  {i < round.word.length - 1 && (
                    <button
                      className={`syllable-game__gap${dividerAt === i + 1 ? " syllable-game__gap--placed" : ""}`}
                      onClick={() => handleGapClick(i + 1)}
                      aria-label={`Split after letter ${i + 1}`}
                    >
                      {dividerAt === i + 1 && <span className="syllable-game__divider" />}
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
          <p className="syllable-game__hint-text">&#9998; Tap where the word splits</p>
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
              Next Word <Check size={16} />
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
        message="Drag the pieces to build the word! Then draw each letter."
        speakText={round.word}
      />
    </section>
  );
}

export default SyllableSafariGame;
