// A small "?" Help button for the adult dashboards (which have no guide
// character). Tapping it reads the page's instructions aloud and shows them.
import { useState } from "react";
import { HelpCircle, Volume2, X } from "lucide-react";
import { speak } from "../audio/speech";
import "./HelpButton.css";

function HelpButton({ text }) {
  const [open, setOpen] = useState(false);

  function toggle() {
    if (!open) speak(text);
    setOpen(!open);
  }

  return (
    <div className="help-button">
      <button className="help-button__btn" onClick={toggle} aria-expanded={open}>
        <HelpCircle size={15} /> Help
      </button>
      {open && (
        <div className="help-button__panel" role="dialog" aria-label="How to use this page">
          <div className="help-button__header">
            <strong>How to use this page</strong>
            <button onClick={() => setOpen(false)} aria-label="Close help">
              <X size={14} />
            </button>
          </div>
          <p>{text}</p>
          <button className="help-button__listen" onClick={() => speak(text)}>
            <Volume2 size={14} /> Read aloud
          </button>
        </div>
      )}
    </div>
  );
}

export default HelpButton;
