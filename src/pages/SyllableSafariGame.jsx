import { useState } from "react";
import { Star, Volume2, Check } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import LessonComplete from "../components/LessonComplete";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import { useProgress } from "../context/ProgressContext";
import { BANKS } from "../data/questionBanks";
import "./SyllableSafariGame.css";

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Base letter-tile size by word length; the CSS shrinks it so the word always
// fits the screen width (see .syllable-game__word-row).
function getLetterMetrics(len) {
  if (len <= 6) return { base: 52, gap: 14 };
  if (len <= 8) return { base: 44, gap: 10 };
  return { base: 38, gap: 6 };
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

// What the guide reads when asked for help, for each part of a round.
const HELP = {
  split: "Listen to the word. Then tap in between the letters where the word splits into parts.",
  build: "Now tap a piece to hear it, then tap a box to put it in. Put the pieces in order to build the word. Then press Check Word.",
};

function SyllableSafariGame({ onHome, onBack, onDone }) {
  const { grade } = useProgress();
  const rounds = BANKS.syllable[grade];
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState("split");
  const [placedDividers, setPlacedDividers] = useState(() => new Set());
  const [feedback, setFeedback] = useState("");
  const [tray, setTray] = useState(() => shuffle(rounds[0].syllables));
  const [slots, setSlots] = useState(() => Array(rounds[0].syllables.length).fill(null));
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [stars, setStars] = useState(3);
  const [solved, setSolved] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const round = rounds[roundIndex];
  const splitPoints = getSplitPoints(round.syllables);
  const isLastRound = roundIndex + 1 >= rounds.length;
  const letterMetrics = getLetterMetrics(round.word.length);
  const letterStyle = {
    "--letter-base": `${letterMetrics.base}px`,
    "--letter-n": round.word.length,
    "--letter-gap": `${letterMetrics.gap}px`,
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
    speak(chunk, { clip: `syl:${chunk.toLowerCase()}` });
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
    setTray(shuffle(rounds[next].syllables));
    setSlots(Array(rounds[next].syllables.length).fill(null));
    setSelectedChunk(null);
    setSolved(false);
    setFeedback("");
  }

  function handlePlayAgain() {
    setRoundIndex(0);
    setPhase("split");
    setPlacedDividers(new Set());
    setTray(shuffle(rounds[0].syllables));
    setSlots(Array(rounds[0].syllables.length).fill(null));
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
        <LessonComplete lessonId="syllableSafariGame" stars={stars} onPlayAgain={handlePlayAgain} onBack={onDone ?? onBack} />
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
            style={{ width: `${((roundIndex + (phase === "build" ? 0.5 : 0)) / rounds.length) * 100}%` }}
          />
        </div>
        <div className="syllable-game__stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={16} fill={i < stars ? "currentColor" : "none"} />
          ))}
        </div>
      </div>

      <div className="syllable-game__picture" aria-hidden="true">
        {round.picture}
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
        demo="syllableSafariGame"
        instructions={HELP[phase]}
        message="Tap the pieces to hear them, then build the word in order!"
      />
    </section>
  );
}

export default SyllableSafariGame;
