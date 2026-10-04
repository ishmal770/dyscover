// The gate at the end of each unit. Finishing every lesson in the unit wins its
// gem; putting the gem into the gate's socket opens the way to the next world.
import { useState } from "react";
import { Volume2 } from "lucide-react";
import { GemArt } from "./TreasureArt";
import { speak } from "../audio/speech";
import { useProgress } from "../context/ProgressContext";
import { GEMS, gateText } from "../data/treasures";
import { UNITS } from "../data/lessons";
import "./GemGate.css";

function GemGate({ unit }) {
  const { unitDone, gemPlaced, placeGem } = useProgress();
  const [placing, setPlacing] = useState(false);
  const gem = GEMS[unit.id];
  const hasNext = UNITS.findIndex((u) => u.id === unit.id) < UNITS.length - 1;

  const placed = gemPlaced(unit.id);
  const earned = unitDone(unit.id);
  const state = placed ? "open" : earned ? "ready" : "locked";
  const text = gateText(unit, state);

  function putGemIn() {
    if (placing || !hasNext) return;
    setPlacing(true);
    setTimeout(() => {
      placeGem(unit.id);
      setPlacing(false);
      speak(gateText(unit, "open"));
    }, 1100);
  }

  return (
    <div className={`gate gate--${placing ? "placing" : state}`}>
      <div className="gate__frame">
        <svg viewBox="0 0 300 200" className="gate__art" aria-hidden="true">
          <defs>
            <linearGradient id={`stone-${unit.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b7b1a3" />
              <stop offset="1" stopColor="#8f897a" />
            </linearGradient>
          </defs>
          {/* the light on the other side of the gate */}
          <rect x="60" y="64" width="180" height="130" fill={placed ? "#fff3b8" : "#3a3f38"} />
          <g className="gate__door gate__door--left">
            <rect x="60" y="64" width="90" height="130" fill="#7a5230" stroke="#4d3219" strokeWidth="3" />
            <path d="M60 110h90M60 150h90" stroke="#4d3219" strokeWidth="3" />
            <circle cx="140" cy="132" r="4" fill="#d9b25a" />
          </g>
          <g className="gate__door gate__door--right">
            <rect x="150" y="64" width="90" height="130" fill="#7a5230" stroke="#4d3219" strokeWidth="3" />
            <path d="M150 110h90M150 150h90" stroke="#4d3219" strokeWidth="3" />
            <circle cx="160" cy="132" r="4" fill="#d9b25a" />
          </g>
          <rect x="16" y="40" width="46" height="156" rx="6" fill={`url(#stone-${unit.id})`} stroke="#6d675a" strokeWidth="3" />
          <rect x="238" y="40" width="46" height="156" rx="6" fill={`url(#stone-${unit.id})`} stroke="#6d675a" strokeWidth="3" />
          <path d="M10 70C10 20 60 8 150 8s140 12 140 62h-50C240 44 200 40 150 40S60 44 60 70z" fill={`url(#stone-${unit.id})`} stroke="#6d675a" strokeWidth="3" />
          {/* the gem socket */}
          <circle cx="150" cy="30" r="21" fill="#4d483e" stroke="#6d675a" strokeWidth="4" />
          {!placed && <circle cx="150" cy="30" r="13" fill="#2f2c26" />}
          {placed && (
            <g transform="translate(130 10) scale(0.625)">
              <path d="M18 8h28l14 16-28 34L4 24z" fill={gem.color} stroke={gem.dark} strokeWidth="3" strokeLinejoin="round" />
              <path d="M4 24h56M18 8l14 16 14-16M32 24v34" fill="none" stroke={gem.dark} strokeWidth="2" opacity="0.6" />
            </g>
          )}
        </svg>
        {state === "ready" && hasNext && (
          <button className="gate__gem" onClick={putGemIn} aria-label={`Put the ${gem.name} in the gate`}>
            <GemArt color={gem.color} dark={gem.dark} size={64} glow />
          </button>
        )}
      </div>
      <p className="gate__text">
        <button className="gate__speak" onClick={() => speak(text)} aria-label="Read aloud">
          <Volume2 size={16} />
        </button>
        {text}
      </p>
    </div>
  );
}

export default GemGate;
