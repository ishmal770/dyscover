// The gate at the end of each unit. Finishing every lesson in the unit wins its gem;
// putting the gem into the gate's socket opens the way to the next world.
import { useState } from "react";
import { Volume2 } from "lucide-react";
import WordPicture from "./WordPicture";
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
        <div className="gate__arch">
          <span className="gate__socket">{placed && <WordPicture word={gem.photo} size={52} />}</span>
          <span className="gate__doors" aria-hidden="true">
            <span className="gate__door gate__door--left" />
            <span className="gate__door gate__door--right" />
          </span>
        </div>
        {state === "ready" && hasNext && (
          <button className="gate__gem" onClick={putGemIn} aria-label={`Put the ${gem.name} in the gate`}>
            <WordPicture word={gem.photo} size={72} />
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
