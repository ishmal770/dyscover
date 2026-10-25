// The message under a game that says whether the answer was right or wrong: big, bold text with a
// speaker button (audio plays only when it is pressed).
import { Volume2 } from "lucide-react";
import { speak } from "../audio/speech";
import { isGoodFeedback } from "../data/feedbackLines";
import "./FeedbackLine.css";

function FeedbackLine({ text, say, className = "" }) {
  if (!text) return <p className={`feedback ${className}`} aria-live="polite" />;
  return (
    <p className={`feedback ${isGoodFeedback(text) ? "feedback--good" : "feedback--try"} ${className}`} aria-live="polite">
      <button className="feedback__speak" onClick={() => speak(say || text)} aria-label="Read aloud">
        <Volume2 size={22} />
      </button>
      <span>{text}</span>
    </p>
  );
}

export default FeedbackLine;
