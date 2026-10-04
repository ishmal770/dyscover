// Freehand drawing canvas used by the letter/word tracing steps in Lion's
// Letters and Lizard Lookouts. Shows a faint guide letter and ruled lines
// (like handwriting paper) behind whatever the child draws.
import { useRef, useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import "@fontsource-variable/playwrite-us-trad";
import "./LetterTraceCanvas.css";

// Writing-line positions as a fraction of the paper height; must match the
// .trace-canvas__line--mid/bottom rules in LetterTraceCanvas.css.
const MID_LINE = 0.5;
const BASE_LINE = 0.78;

const FONTS = {
  print: "system-ui, 'Segoe UI', Roboto, sans-serif",
  cursive: "'Playwrite US Trad Variable', cursive",
};

const COLORS = ["#2b2b2b", "#5dbb2f", "#e05555"]; // pencil color choices

function LetterTraceCanvas({ guideText, height = 220, cursive = false }) {
  const canvasRef = useRef(null);
  const guideRef = useRef(null);
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

  // Draws the faint guide letter on its own canvas layer so its baseline
  // sits exactly on the bottom writing line (like binder paper), sized so
  // the letter body fills the space between the dashed and bottom lines.
  useEffect(() => {
    let cancelled = false;
    const family = cursive ? FONTS.cursive : FONTS.print;
    const weight = cursive ? 500 : 700;

    function draw() {
      if (cancelled) return;
      const canvas = guideRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;
      const ratio = window.devicePixelRatio || 1;
      const width = wrap.clientWidth;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      ctx.scale(ratio, ratio);
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "center";
      ctx.fillStyle = "#cfe7c4";

      const bodyHeight = (BASE_LINE - MID_LINE) * height;
      ctx.font = `${weight} 100px ${family}`;
      const xHeight = ctx.measureText("x").actualBoundingBoxAscent || 52;
      let size = (bodyHeight / xHeight) * 100;
      ctx.font = `${weight} ${size}px ${family}`;
      const maxWidth = width * 0.88;
      const textWidth = ctx.measureText(guideText).width;
      if (textWidth > maxWidth) {
        size *= maxWidth / textWidth;
        ctx.font = `${weight} ${size}px ${family}`;
      }
      // Round letters (c, e, o...) dip a hair below the baseline. Lift letters
      // with no real descender so their bottom edge rests exactly on the line,
      // like writing on binder paper; g, j, p, q, y keep their tails below it.
      const descent = ctx.measureText(guideText).actualBoundingBoxDescent || 0;
      const lift = descent < size * 0.08 ? descent : 0;
      ctx.fillText(guideText, width / 2, BASE_LINE * height - lift);
    }

    // Wait for the web font so the first paint isn't in a fallback face
    document.fonts.load(`${weight} 40px ${family}`, guideText).then(draw, draw);
    window.addEventListener("resize", draw);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", draw);
    };
  }, [guideText, height, cursive]);

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
        <canvas ref={guideRef} className="trace-canvas__guide" aria-hidden="true" />
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
