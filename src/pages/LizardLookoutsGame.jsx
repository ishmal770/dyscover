import { useState, useMemo } from "react";
import { Star, FlipHorizontal, RotateCw, Info, ArrowRight } from "lucide-react";
import GameTopBar from "../components/GameTopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GameHintBubble, { speak } from "../components/GameHintBubble";
import LetterTraceCanvas from "../components/LetterTraceCanvas";
import "./LizardLookoutsGame.css";

const ROUNDS = [
  {
    pairLabel: "b vs d",
    letter: "b",
    sentence: "The big bear bit a ripe apple by the barn.",
    paragraph:
      "Ben bounced his big blue ball beside the barn. A brown bunny bounded by, and Ben laughed as the ball bumped along the bumpy path back to his backpack.",
    reminder: "The belly comes before the ball when drawing a 'b'.",
  },
  {
    pairLabel: "b vs d",
    letter: "d",
    sentence: "The old duck did a silly dance today.",
    paragraph:
      "Daisy the duck waddled down a dusty dirt road. She discovered a shiny dime near a dandelion and carried it back to her den before dinner.",
    reminder: "The ball comes before the belly when drawing a 'd'.",
  },
  {
    pairLabel: "p vs q",
    letter: "p",
    sentence: "Paul packed a pink pepper for the picnic.",
    paragraph:
      "Paul and his playful puppy walked to the park on a pleasant morning. They passed pretty purple flowers and tall pine trees near the pond.",
    reminder: "Draw the stick first, then the loop on the right side, for a 'p'.",
  },
  {
    pairLabel: "p vs q",
    letter: "q",
    sentence: "The quiet queen packed a quick quilt.",
    paragraph:
      "Quinn the queen packed a quilt and a quick snack. She found a duck quacking by the quiet pond and watched it happily.",
    reminder: "Take your time! A 'q' has a circle first, then a tail pointing down.",
  },
];

const STEPS = ["find", "shape", "trace", "paragraph"];

function LetterHunt({ text, letter, found, onFound }) {
  const chars = [...text];
  return (
    <p className="lizard-game__hunt-text">
      {chars.map((char, i) => {
        const isTarget = char.toLowerCase() === letter.toLowerCase();
        if (!isTarget) return <span key={i}>{char}</span>;
        const isFound = found.has(i);
        return (
          <button
            key={i}
            className={`lizard-game__hunt-letter${isFound ? " lizard-game__hunt-letter--found" : ""}`}
            onClick={() => !isFound && onFound(i)}
          >
            {char}
          </button>
        );
      })}
    </p>
  );
}

function LizardLookoutsGame({ onHome, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [foundSentence, setFoundSentence] = useState(() => new Set());
  const [foundParagraph, setFoundParagraph] = useState(() => new Set());
  const [flipped, setFlipped] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [stars, setStars] = useState(0);

  const round = ROUNDS[roundIndex];
  const step = STEPS[stepIndex];

  const sentenceTotal = useMemo(
    () => [...round.sentence].filter((c) => c.toLowerCase() === round.letter.toLowerCase()).length,
    [round]
  );
  const paragraphTotal = useMemo(
    () => [...round.paragraph].filter((c) => c.toLowerCase() === round.letter.toLowerCase()).length,
    [round]
  );

  function goToStep(nextStep) {
    const idx = STEPS.indexOf(nextStep);
    setStepIndex(idx);
  }

  function handleSentenceFound(i) {
    const next = new Set(foundSentence);
    next.add(i);
    setFoundSentence(next);
    if (next.size === sentenceTotal) {
      setStars((s) => Math.min(3, s + 1));
      setTimeout(() => goToStep("shape"), 500);
    }
  }

  function handleParagraphFound(i) {
    const next = new Set(foundParagraph);
    next.add(i);
    setFoundParagraph(next);
    if (next.size === paragraphTotal) {
      setStars((s) => Math.min(3, s + 1));
      setTimeout(() => {
        if (roundIndex + 1 >= ROUNDS.length) {
          setStepIndex(STEPS.length);
        } else {
          setRoundIndex((r) => r + 1);
          setStepIndex(0);
          setFoundSentence(new Set());
          setFoundParagraph(new Set());
          setFlipped(false);
          setRotation(0);
        }
      }, 700);
    }
  }

  const isComplete = stepIndex >= STEPS.length;

  return (
    <section className="page lizard-game">
      <GameTopBar gameName="Often-Switched Letters" onHome={onHome} onBack={onBack} />

      <div className="lizard-game__topline">
        <div>
          <h1>Practice: {round.pairLabel}</h1>
          <p>Let&rsquo;s learn how to tell these tricky letters apart!</p>
        </div>
        <div className="lizard-game__progress">
          <span>LEVEL PROGRESS</span>
          <div className="lizard-game__stars">
            {[0, 1, 2].map((i) => (
              <Star key={i} size={14} fill={i < stars ? "currentColor" : "none"} />
            ))}
          </div>
        </div>
      </div>

      {isComplete ? (
        <div className="lizard-game__finished">
          <h2>Great work spotting tricky letters!</h2>
          <p>You practiced b, d, p, and q.</p>
        </div>
      ) : (
        <div className="lizard-game__steps">
          <div className="lizard-game__step-tabs">
            <span className={stepIndex === 0 ? "active" : ""}>1 Find the &lsquo;{round.letter}&rsquo;s</span>
            <span className={stepIndex === 1 ? "active" : ""}>2 Explore the Shape</span>
            <span className={stepIndex === 2 ? "active" : ""}>3 Trace It</span>
          </div>

          {step === "find" && (
            <div className="lizard-game__card">
              <p className="lizard-game__instructions">Tap all the letter &lsquo;{round.letter}&rsquo;s hiding in this sentence!</p>
              <LetterHunt
                text={round.sentence}
                letter={round.letter}
                found={foundSentence}
                onFound={handleSentenceFound}
              />
              <p className="lizard-game__found-count">
                Found {foundSentence.size} / {sentenceTotal}
              </p>
            </div>
          )}

          {step === "shape" && (
            <div className="lizard-game__card lizard-game__card--shape">
              <div
                className="lizard-game__big-letter"
                style={{ transform: `scaleX(${flipped ? -1 : 1}) rotate(${rotation}deg)` }}
              >
                {round.letter}
              </div>
              <div className="lizard-game__shape-controls">
                <button onClick={() => setFlipped((f) => !f)}>
                  <FlipHorizontal size={14} /> Flip
                </button>
                <button onClick={() => setRotation((r) => (r + 90) % 360)}>
                  <RotateCw size={14} /> Rotate
                </button>
              </div>
              <button className="btn btn--primary" onClick={() => goToStep("trace")}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === "trace" && (
            <div className="lizard-game__card">
              <LetterTraceCanvas guideText={round.letter} height={180} />
              <p className="lizard-game__reminder">
                <Info size={12} /> Remember: {round.reminder}
              </p>
              <button className="btn btn--primary" onClick={() => goToStep("paragraph")}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === "paragraph" && (
            <div className="lizard-game__card">
              <p className="lizard-game__instructions">
                Click all the {round.letter.toUpperCase()}s in this paragraph
              </p>
              <LetterHunt
                text={round.paragraph}
                letter={round.letter}
                found={foundParagraph}
                onFound={handleParagraphFound}
              />
              <p className="lizard-game__found-count">
                Found {foundParagraph.size} / {paragraphTotal}
              </p>
            </div>
          )}
        </div>
      )}

      <AccessibilityToolbar />
      <GameHintBubble
        message={`Take your time! A '${round.letter}' can be tricky to spot.`}
        speakText={round.letter}
      />
    </section>
  );
}

export default LizardLookoutsGame;
