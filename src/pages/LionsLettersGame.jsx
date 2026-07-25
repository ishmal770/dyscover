import { useState } from "react";
import { Volume2, ArrowRight, RotateCcw, Home } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import LetterTraceCanvas from "../components/LetterTraceCanvas";
import "./LionsLettersGame.css";

const LETTERS = ["C", "D", "M", "T", "G", "R"];
const WORDS = ["BOX", "CAT", "SUN", "DOG", "MAP", "PEN"];

const ROUNDS = LETTERS.flatMap((letter, i) => [
  { type: "letter", value: letter },
  { type: "word", value: WORDS[i] },
]);

function LionsLettersGame({ onHome, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [heardSound, setHeardSound] = useState(false);
  const [revealed, setRevealed] = useState(() => new Set());
  const [wordPhase, setWordPhase] = useState("letters");
  const [sessionComplete, setSessionComplete] = useState(false);

  const round = ROUNDS[roundIndex];
  const isLastRound = roundIndex + 1 >= ROUNDS.length;

  function resetRoundState() {
    setHeardSound(false);
    setRevealed(new Set());
    setWordPhase("letters");
  }

  function handleContinue() {
    if (isLastRound) {
      setSessionComplete(true);
      return;
    }
    setRoundIndex((i) => i + 1);
    resetRoundState();
  }

  function handlePlayAgain() {
    setRoundIndex(0);
    resetRoundState();
    setSessionComplete(false);
  }

  function handleLetterHeard(letter, index) {
    speak(letter);
    setRevealed((prev) => new Set([...prev, index]));
  }

  if (sessionComplete) {
    return (
      <section className="page lions-game">
        <GameTopBar gameName="Letter Match" onHome={onHome} onBack={onBack} />
        <div className="lions-game__complete">
          <h1>Game Session Completed!</h1>
          <p>You practiced {LETTERS.length} letters and {WORDS.length} words.</p>
          <div className="lions-game__complete-actions">
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
    <section className="page lions-game">
      <GameTopBar gameName="Letter Match" onHome={onHome} onBack={onBack} />

      <div className="lions-game__topline">
        <span className="lions-game__progress-pill">
          {roundIndex + 1} / {ROUNDS.length}
        </span>
      </div>

      {round.type === "letter" ? (
        <div className="lions-game__round-card">
          <h1>Listen, then trace the letter</h1>
          <button
            className="lions-game__sound-box"
            onClick={() => {
              speak(round.value);
              setHeardSound(true);
            }}
          >
            <Volume2 size={28} />
            <span>Tap to hear the letter</span>
          </button>
          <LetterTraceCanvas guideText={round.value} />
          <button className="btn btn--primary" onClick={handleContinue} disabled={!heardSound}>
            {isLastRound ? "Finish" : "Continue"} <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="lions-game__round-card">
          {wordPhase === "letters" ? (
            <>
              <h1>Spell it out: listen to each letter</h1>
              <div className="lions-game__letter-slots">
                {[...round.value].map((letter, i) => (
                  <div key={i} className="lions-game__letter-slot">
                    <button className="lions-game__number-btn" onClick={() => handleLetterHeard(letter, i)}>
                      {i + 1}
                    </button>
                    {revealed.has(i) ? (
                      <LetterTraceCanvas guideText={letter} height={110} />
                    ) : (
                      <div className="lions-game__slot-placeholder">Tap to hear</div>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="btn btn--primary"
                onClick={() => setWordPhase("fullword")}
                disabled={revealed.size < round.value.length}
              >
                Continue to full word <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <h1>Now write the whole word!</h1>
              <LetterTraceCanvas guideText={round.value} />
              <button className="btn btn--primary" onClick={handleContinue}>
                {isLastRound ? "Finish" : "Continue"} <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      )}

      <AccessibilityToolbar />
      <GameHintBubble
        message="Tap the sound box to hear the letters, then trace them!"
        speakText={round.value}
      />
    </section>
  );
}

export default LionsLettersGame;
