import { Sparkles, ArrowRight } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import "./PlacementMission.css";

function PlacementMission() {
  return (
    <section className="page placement">
      <TopBar label="PLACEMENT MISSION" showLogo />
      <div className="placement__body">
        <div className="placement__card">
          <div className="placement__icon">
            <Sparkles size={22} />
          </div>
          <h2>Ready for a Quick Adventure?</h2>
          <p>
            We are going to play a few short games to figure out exactly how to
            build your perfect map.
          </p>
          <button className="btn btn--primary">
            Let&rsquo;s Play! <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <AccessibilityToolbar />
      <GuideBubble message="Hi! Need help figuring out where to go next?" />
    </section>
  );
}

export default PlacementMission;
