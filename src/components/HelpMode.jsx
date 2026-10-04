// "?" help mode. When on, every button shows a small "?" and tapping one reads
// out what it does instead of pressing it (tips in data/helpTips.js). Turned on
// from the Help button in the bottom toolbar; mounted once for the whole app.
import { useEffect, useState, useSyncExternalStore } from "react";
import { Volume2, X } from "lucide-react";
import { getHelp, setHelp, subscribeHelp } from "../helpState";
import { speak } from "../audio/speech";
import { hasHeard, markHeard } from "../audio/heard";
import { HELP_ON, tipFor } from "../data/helpTips";
import "./HelpMode.css";

const BUTTONS = "button, a.btn, [role='button']";

// The words a button is looked up by: its data-help name, aria-label or visible text
function labelOf(el) {
  return el.getAttribute("data-help") || el.getAttribute("aria-label") || el.textContent || "";
}

function HelpMode() {
  const on = useSyncExternalStore(subscribeHelp, getHelp);
  const [tip, setTip] = useState("");
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle("help-mode", on);
    if (on) {
      // the "help is on" line is said the first time only (it is also written on the card)
      if (!hasHeard("help-on")) {
        markHeard("help-on");
        speak(HELP_ON);
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setTip("");
  }, [on]);

  // a "?" on every button that is on screen
  useEffect(() => {
    if (!on) return undefined;
    const tick = () => {
      const list = [];
      document.querySelectorAll(BUTTONS).forEach((el) => {
        if (el.closest(".help-ui") || el.disabled) return;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8 || r.right < 0 || r.left > window.innerWidth || r.bottom < 0 || r.top > window.innerHeight) return;
        if (getComputedStyle(el).visibility === "hidden") return;
        list.push({ x: r.right - 10, y: r.top - 8, key: list.length });
      });
      setBadges(list.slice(0, 80));
    };
    tick();
    const id = setInterval(tick, 350);
    return () => clearInterval(id);
  }, [on]);

  // while on, a tap on a button explains it instead of pressing it
  useEffect(() => {
    if (!on) return undefined;
    function onClick(e) {
      const btn = e.target.closest(BUTTONS);
      if (!btn || btn.closest(".help-ui") || btn.dataset.helpToggle) return;
      e.preventDefault();
      e.stopPropagation();
      const text = tipFor(labelOf(btn));
      setTip(text);
      speak(text);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [on]);

  if (!on) return null;
  return (
    <div className="help-ui">
      {badges.map((b) => (
        <span key={b.key} className="help-ui__badge" style={{ left: b.x, top: b.y }} aria-hidden="true">
          ?
        </span>
      ))}
      <div className="help-ui__card" role="status">
        <p>{tip || HELP_ON}</p>
        {tip && (
          <button className="help-ui__speak" onClick={() => speak(tip)} aria-label="Read aloud">
            <Volume2 size={18} />
          </button>
        )}
        <button className="help-ui__off" onClick={() => setHelp(false)}>
          <X size={16} /> Turn help off
        </button>
      </div>
    </div>
  );
}

export default HelpMode;
