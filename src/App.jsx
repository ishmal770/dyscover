import { useRef } from "react";
import "./App.css";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import AdventureMap from "./pages/AdventureMap";
import PlacementMission from "./pages/PlacementMission";

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
        <PlacementMission />
      </div>
    </div>
  );
}

export default App;
