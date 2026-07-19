import { useRef } from "react";
import "./App.css";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import AdventureMap from "./pages/AdventureMap";
import PlacementMission from "./pages/PlacementMission";
import JungleGames from "./pages/JungleGames";
import CanopyQuest from "./pages/CanopyQuest";

function App() {
  const sectionRefs = useRef({});

  const goTo = (key) => {
    sectionRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  return (
    <div className="scroller">
      <div ref={(el) => (sectionRefs.current.home = el)} className="scroller__section">
        <Homepage onNext={() => goTo("login")} />
      </div>
      <div ref={(el) => (sectionRefs.current.login = el)} className="scroller__section">
        <Login onNext={() => goTo("map")} />
      </div>
      <div ref={(el) => (sectionRefs.current.map = el)} className="scroller__section">
        <AdventureMap onNext={() => goTo("placement")} />
      </div>
      <div ref={(el) => (sectionRefs.current.placement = el)} className="scroller__section">
        <PlacementMission onNext={() => goTo("jungle")} />
      </div>
      <div ref={(el) => (sectionRefs.current.jungle = el)} className="scroller__section">
        <JungleGames />
      </div>
      <div ref={(el) => (sectionRefs.current.canopy = el)} className="scroller__section">
        <CanopyQuest />
      </div>
    </div>
  );
}

export default App;
