import { Info, Play, Check, Star } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import "./AdventureMap.css";

function Stars({ filled }) {
  return (
    <div className="map__stars">
      {[0, 1, 2].map((i) => (
        <Star key={i} size={12} fill={i < filled ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

function AdventureMap({ onNext, onHome }) {
  return (
    <section className="page map">
      <TopBar label="ADVENTURE MAP" showLogo onLogoClick={onHome} />
      <div className="map__hint">
        <Info size={12} /> Scroll horizontally to explore the map
      </div>
      <div className="map__body">
        <svg className="map__road" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M40 210 C 160 260, 220 120, 340 130 S 540 40, 560 30"
            fill="none"
            stroke="var(--green)"
            strokeWidth="18"
            strokeLinecap="round"
          />
        </svg>

        <div className="map__node map__node--done" style={{ left: "18%", top: "72%" }}>
          <div className="map__node-circle map__node-circle--done">
            <Check size={20} />
          </div>
          <Stars filled={3} />
        </div>

        <div className="map__node map__node--active" style={{ left: "55%", top: "22%" }}>
          <button className="map__start" onClick={onNext}>
            <Play size={10} fill="currentColor" /> Start
          </button>
          <div className="map__node-circle map__node-circle--active" />
          <Stars filled={0} />
        </div>
      </div>
      <AccessibilityToolbar />
      <GuideBubble message="Hi! Need help figuring out where to go next?" />
    </section>
  );
}

export default AdventureMap;
