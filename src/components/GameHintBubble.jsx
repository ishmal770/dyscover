// Shared text-to-speech helper (speak) and the floating mascot hint bubble
// that every game uses to give spoken instructions/encouragement.
import { Play, Mic } from "lucide-react";
import "./GameHintBubble.css";

// speak() is a plain function imported all over the app (not a component),
// so the mute toggle can't reach it through React context/props - this
// module-level flag is the simplest way for AccessibilityContext to turn
// audio on/off everywhere at once.
let muted = false;
function setSpeechMuted(value) {
  muted = value;
  if (value) window.speechSynthesis?.cancel();
}

// Reads text aloud via the browser's Web Speech API, normalized to avoid
// confusing dyslexia-unfriendly TTS quirks (see comments below).
function speak(text) {
  if (muted) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  // All-caps short strings get read as spelled-out acronyms by most TTS
  // voices ("SUN" -> "S U N"), so normalize to title case for real words.
  // Single letters are lowercased outright so no voice has a chance to
  // announce case ("capital C") instead of just the letter itself.
  const normalized =
    text.length === 1
      ? text.toLowerCase()
      : text === text.toUpperCase()
      ? text[0] + text.slice(1).toLowerCase()
      : text;
  const utterance = new SpeechSynthesisUtterance(normalized);
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function GameHintBubble({ message, speakText }) {
  return (
    <div className="game-hint-bubble">
      <div className="game-hint-bubble__card">
        <p>{message}</p>
        <div className="game-hint-bubble__actions">
          <button className="game-hint-bubble__btn" onClick={() => speak(speakText || message)}>
            <Play size={11} fill="currentColor" /> Listen
          </button>
          {/* Speak (voice input) is disabled here - only Cheetah Challenge
              actually uses the SpeechRecognition API */}
          <button className="game-hint-bubble__btn game-hint-bubble__btn--muted" disabled>
            <Mic size={11} /> Speak
          </button>
        </div>
      </div>
      <div className="game-hint-bubble__avatar" aria-hidden="true" />
    </div>
  );
}

export default GameHintBubble;
export { speak, setSpeechMuted };
