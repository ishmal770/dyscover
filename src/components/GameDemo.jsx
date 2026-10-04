// A short animated demo of how a game works: a pretend finger moves around a
// mini copy of the game while a voice explains each step. Data is in
// data/demos.js; it loops until closed.
import { useEffect, useRef, useState } from "react";
import { Hand, RotateCcw, X, Volume2 } from "lucide-react";
import { speak, cancelSpeech } from "../audio/speech";
import { DEMOS } from "../data/demos";
import "./GameDemo.css";

// how long a step stays up: time to read it aloud, plus a pause
const stepMs = (caption) => 2200 + caption.length * 55;

function GameDemo({ demoId, onClose }) {
  const demo = DEMOS[demoId];
  const stageRef = useRef(null);
  const els = useRef({});
  const [index, setIndex] = useState(0);
  const [pieces, setPieces] = useState({}); // id -> { state, text }
  const [cursor, setCursor] = useState(null); // { x, y } inside the stage
  const [run, setRun] = useState(0); // bumps to replay

  const step = demo.steps[index];

  useEffect(() => {
    const timers = [];
    speak(step.caption);

    if (step.cursor) {
      const el = els.current[step.cursor];
      const stage = stageRef.current;
      if (el && stage) {
        const a = el.getBoundingClientRect();
        const b = stage.getBoundingClientRect();
        setCursor({ x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 });
      }
    } else {
      setCursor(null);
    }

    if (step.set) {
      timers.push(
        setTimeout(() => {
          setPieces((prev) => {
            const next = { ...prev };
            Object.entries(step.set).forEach(([id, v]) => {
              next[id] = typeof v === "string" ? { ...prev[id], state: v } : { ...prev[id], ...v };
            });
            return next;
          });
        }, 1200)
      );
    }

    timers.push(
      setTimeout(() => {
        if (index + 1 >= demo.steps.length) {
          setPieces({});
          setIndex(0);
          setRun((r) => r + 1);
        } else {
          setIndex(index + 1);
        }
      }, stepMs(step.caption))
    );

    return () => timers.forEach(clearTimeout);
  }, [index, run, demo, step]);

  useEffect(() => () => cancelSpeech(), []);

  function replay() {
    cancelSpeech();
    setPieces({});
    setIndex(0);
    setRun((r) => r + 1);
  }

  function renderPiece(item) {
    const p = pieces[item.id] || {};
    const text = p.text ?? item.text;
    const state = p.state || "";
    const common = { key: item.id, ref: (el) => (els.current[item.id] = el), className: `demo__piece demo__piece--${item.kind} ${state ? `is-${state}` : ""}` };
    if (item.kind === "canvas") {
      return (
        <span {...common}>
          <span className="demo__lines" aria-hidden="true" />
          <span className="demo__guide">{text}</span>
          <svg viewBox="0 0 100 100" className="demo__trace" aria-hidden="true">
            <path d="M68 38 C 60 24, 36 24, 32 48 C 30 70, 56 78, 70 62" fill="none" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </span>
      );
    }
    if (item.kind === "meter") {
      return (
        <span {...common}>
          <span className="demo__meter-fill" />
        </span>
      );
    }
    if (item.kind === "gap") {
      return (
        <span {...common}>
          <span className="demo__divider" />
        </span>
      );
    }
    return <span {...common}>{text}</span>;
  }

  return (
    <div className="demo__backdrop" role="dialog" aria-label={demo.title} onClick={onClose}>
      <div className="demo" onClick={(e) => e.stopPropagation()}>
        <div className="demo__head">
          <h2>{demo.title}</h2>
          <button className="demo__icon" onClick={onClose} aria-label="Close the demo">
            <X size={20} />
          </button>
        </div>

        <div className="demo__stage" ref={stageRef}>
          {demo.rows.map((row, r) => (
            <div key={r} className="demo__row">
              {row.items.map(renderPiece)}
            </div>
          ))}
          {cursor && (
            <span className="demo__cursor" style={{ left: cursor.x, top: cursor.y }} aria-hidden="true">
              <Hand size={34} fill="#fff" />
            </span>
          )}
        </div>

        <p className="demo__caption" key={`${run}-${index}`}>
          <button className="demo__icon demo__icon--speak" onClick={() => speak(step.caption)} aria-label="Hear this step again">
            <Volume2 size={18} />
          </button>
          {step.caption}
        </p>

        <div className="demo__dots" aria-hidden="true">
          {demo.steps.map((_, i) => (
            <span key={i} className={i === index ? "is-now" : i < index ? "is-done" : ""} />
          ))}
        </div>

        <div className="demo__actions">
          <button className="btn btn--outline" onClick={replay}>
            <RotateCcw size={16} /> Watch again
          </button>
          <button className="btn btn--primary" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameDemo;
