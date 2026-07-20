import { useState } from "react";
import { Star, Volume2 } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import LetterTraceCanvas from "../components/LetterTraceCanvas";
import "./LionsLettersGame.css";

const WORD = "CAT";

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildCards() {
  const letters = [...WORD, ...WORD];
  return shuffle(letters);
}

function LionsLettersGame({ onHome, onBack }) {
  const [cards] = useState(buildCards);
  const [revealed, setRevealed] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const [stars, setStars] = useState(3);

  const pairCount = WORD.length;
  const matchedPairs = matched.size / 2;
  const phase = matchedPairs === pairCount ? "trace" : "match";

  function handleCardClick(index) {
    if (busy || matched.has(index) || revealed.includes(index)) return;
    speak(cards[index]);

    if (revealed.length === 0) {
      setRevealed([index]);
      return;
    }

    const first = revealed[0];
    const newRevealed = [first, index];
    setRevealed(newRevealed);
    setBusy(true);

    setTimeout(() => {
      if (cards[first] === cards[index]) {
        setMatched((m) => new Set([...m, first, index]));
      } else {
        setStars((s) => Math.max(0, s - 1));
      }
      setRevealed([]);
      setBusy(false);
    }, 700);
  }

  return (
    <section className="page lions-game">
      <GameTopBar gameName="Letter Match" onHome={onHome} onBack={onBack} />

      <div className="lions-game__topline">
        <div className="lions-game__stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={16} fill={i < stars ? "currentColor" : "none"} />
          ))}
        </div>
        <span className="lions-game__progress-pill">{matchedPairs} / {pairCount} Matched</span>
      </div>

      <div className="lions-game__body">
        <div className="lions-game__panel">
          <div className="lions-game__panel-header">
            <h2>Find the Matches</h2>
            <Volume2 size={14} />
          </div>
          <div className="lions-game__grid">
            {cards.map((letter, i) => {
              const isMatched = matched.has(i);
              const isRevealed = revealed.includes(i);
              return (
                <button
                  key={i}
                  className={`lions-game__card${isRevealed ? " lions-game__card--selected" : ""}${
                    isMatched ? " lions-game__card--matched" : ""
                  }`}
                  onClick={() => handleCardClick(i)}
                >
                  <span>Letter {i + 1}</span>
                  <Volume2 size={13} />
                </button>
              );
            })}
          </div>
        </div>

        <div className={`lions-game__panel${phase === "trace" ? "" : " lions-game__panel--locked"}`}>
          <div className="lions-game__panel-header">
            <h2>Trace the letter</h2>
            {phase === "trace" && (
              <button className="lions-game__sounds-btn" onClick={() => speak(WORD)}>
                <Volume2 size={12} /> Letter Sounds
              </button>
            )}
          </div>
          {phase === "trace" ? (
            <LetterTraceCanvas guideText={WORD} />
          ) : (
            <p className="lions-game__locked-text">Find all the matches first!</p>
          )}
        </div>
      </div>

      <AccessibilityToolbar />
      <GameHintBubble
        message={
          phase === "trace"
            ? `Great match! Now let's practice writing '${WORD}'. Follow the lines!`
            : "Tap the cards to hear the letters and find a pair!"
        }
        speakText={WORD}
      />
    </section>
  );
}

export default LionsLettersGame;
