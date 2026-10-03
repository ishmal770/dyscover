// World-select map slide: a curved path connecting the two world nodes
// (Jungle Games, Canopy Quest). Both are always unlocked/"active" here -
// there's no real progression gating yet, so both just show Start buttons
// with 0 stars filled.
import { Info, Play, Star } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import "./AdventureMap.css";

// Renders a row of 3 stars, filling in however many are earned so far
function Stars({ filled }) {
  return (
    <div className="map__stars">
      {[0, 1, 2].map((i) => (
        <Star key={i} size={12} fill={i < filled ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

function AdventureMap({ onNext, onStartCanopy, onHome }) {
  return (
    <section className="page map">
      <TopBar label="ADVENTURE MAP" showLogo onLogoClick={onHome} />
      <div className="map__hint">
        <Info size={12} /> Scroll horizontally to explore the map
      </div>
      <div className="map__body">
        {/* Decorative winding road connecting the two world nodes */}
        <svg className="map__road" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M40 210 C 160 260, 220 120, 340 130 S 540 40, 560 30"
            fill="none"
            stroke="var(--green)"
            strokeWidth="18"
            strokeLinecap="round"
          />
        </svg>

        {/* World 1 node - positioned with percentage left/top so it sits on the road */}
        <div className="map__node map__node--active" style={{ left: "18%", top: "72%" }}>
          <button className="map__start" onClick={onNext}>
            <Play size={10} fill="currentColor" /> Start
          </button>
          <div className="map__node-circle map__node-circle--active" />
          <Stars filled={0} />
          <span className="map__node-label">Jungle Games</span>
        </div>

        {/* World 2 node */}
        <div className="map__node map__node--active" style={{ left: "55%", top: "22%" }}>
          <button className="map__start" onClick={onStartCanopy}>
            <Play size={10} fill="currentColor" /> Start
          </button>
          <div className="map__node-circle map__node-circle--active" />
          <Stars filled={0} />
          <span className="map__node-label">Canopy Quest</span>
        </div>
      </div>
      <AccessibilityToolbar />
      <GuideBubble message="Welcome to the jungle, explorer! Pick a world to start your adventure." />
    </section>
  );
}

export default AdventureMap;
