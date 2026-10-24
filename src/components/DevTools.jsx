// A small floating panel for demos. It only shows in demo mode (open the app with ?dev=1):
// every game is unlocked, vines cost nothing, and these buttons add XP, refill the vine doors, or
// leave demo mode.
import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import "./DevTools.css";

function DevTools() {
  const { dev, devAddXp, devResetDoors } = useProgress();
  const [open, setOpen] = useState(false);
  if (!dev) return null;

  function leave() {
    try {
      localStorage.removeItem("dyscover-dev");
    } catch {
      // nothing to remove
    }
    window.location.href = `${window.location.pathname}?dev=0`;
  }

  return (
    <div className="devtools">
      {open && (
        <div className="devtools__panel">
          <strong>Demo mode</strong>
          <p>Every game is open. Vines are free.</p>
          <button onClick={() => devAddXp(35)}>+35 XP (a day&rsquo;s goal)</button>
          <button onClick={devResetDoors}>Refill the vine doors</button>
          <button onClick={leave}>Leave demo mode</button>
        </div>
      )}
      <button className="devtools__toggle" onClick={() => setOpen((o) => !o)} aria-label="Demo mode tools">
        <FlaskConical size={16} /> DEMO
      </button>
    </div>
  );
}

export default DevTools;
