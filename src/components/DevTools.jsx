// A small floating panel for demos. Demo mode (open the app with ?dev=1) has no visible tag; press Shift+D for this panel:
// every game is unlocked, vines cost nothing, and these buttons add XP, refill the vine doors, or
// leave demo mode.
import { useEffect, useState } from "react";
import { useProgress } from "../context/ProgressContext";
import "./DevTools.css";

function DevTools() {
  const { dev, devAddXp, devResetDoors } = useProgress();
  const [open, setOpen] = useState(false);

  // no visible tag: Shift+D opens or closes the panel
  useEffect(() => {
    if (!dev) return undefined;
    const onKey = (e) => {
      if (e.shiftKey && e.key === "D" && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dev]);

  if (!dev || !open) return null;

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
      <div className="devtools__panel">
        <strong>Demo mode</strong>
        <p>Every game is open. Vines are free.</p>
        <button onClick={() => devAddXp(35)}>+35 XP (a day&rsquo;s goal)</button>
        <button onClick={devResetDoors}>Refill the vine doors</button>
        <button onClick={leave}>Leave demo mode</button>
        <button onClick={() => setOpen(false)}>Close</button>
      </div>
    </div>
  );
}

export default DevTools;
