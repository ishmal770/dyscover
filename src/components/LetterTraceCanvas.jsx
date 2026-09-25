// Freehand drawing canvas used by the letter/word tracing steps in Lion's
// Letters and Lizard Lookouts. Shows a faint guide letter and ruled lines
// (like handwriting paper) behind whatever the child draws.
import { useRef, useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import "./LetterTraceCanvas.css";

const COLORS = ["#2b2b2b", "#5dbb2f", "#e05555"]; // pencil color choices

function LetterTraceCanvas({ guideText, height = 220 }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const drawing = useRef(false); // tracks pointer-down state without triggering re-renders
  const [color, setColor] = useState(COLORS[1]);

  // (Re)sizes the canvas to match its container, scaled for device pixel
  // ratio so strokes stay crisp on high-DPI screens. Re-runs if the guide
  // text or height changes (e.g. switching from letter to word tracing).
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ratio = window.devicePixelRatio || 1;
    const width = wrap.clientWidth;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [height, guideText]);

  // Converts a mouse or touch event into canvas-local x/y coordinates
  function getPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  // Pointer down: begin a new stroke at the touch/click point
  function start(e) {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPoint(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  // Pointer move: extend the current stroke (no-op if not currently drawing)
  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  // Pointer up/leave: end the current stroke
  function end() {
    drawing.current = false;
  }

  // "Reset" button: wipes the canvas so the child can retrace from scratch
  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <div className="trace-canvas">
      <div className="trace-canvas__paper" ref={wrapRef} style={{ height }}>
        <span className="trace-canvas__guide">{guideText}</span>
        <div className="trace-canvas__line trace-canvas__line--top" />
        <div className="trace-canvas__line trace-canvas__line--mid" />
        <div className="trace-canvas__line trace-canvas__line--bottom" />
        <canvas
          ref={canvasRef}
          className="trace-canvas__canvas"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <div className="trace-canvas__controls">
        {COLORS.map((c) => (
          <button
            key={c}
            className={`trace-canvas__swatch${color === c ? " trace-canvas__swatch--active" : ""}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            aria-label={`Choose color ${c}`}
          />
        ))}
        <button className="trace-canvas__clear" onClick={clearCanvas} aria-label="Clear">
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}

export default LetterTraceCanvas;
