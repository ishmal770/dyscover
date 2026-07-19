import { useRef } from "react";
import "./App.css";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import AdventureMap from "./pages/AdventureMap";
import PlacementMission from "./pages/PlacementMission";
import JungleGames from "./pages/JungleGames";
import JungleGamesDetail from "./pages/JungleGamesDetail";
import CanopyQuest from "./pages/CanopyQuest";
import CanopyQuestDetail from "./pages/CanopyQuestDetail";
import ParrotPairsGame from "./pages/ParrotPairsGame";
import SyllableSafariGame from "./pages/SyllableSafariGame";
import MonkeyMixUpGame from "./pages/MonkeyMixUpGame";

const GAME_ROUTES = {
  "Parrot Pairs": "parrotPairsGame",
  "Syllable Safari": "syllableSafariGame",
  "Monkey Mix-Up": "monkeyMixUpGame",
};

function App() {
  const sectionRefs = useRef({});

  const goTo = (key) => {
    sectionRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  const playGame = (activity) => {
    const key = GAME_ROUTES[activity.name];
    if (key) goTo(key);
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
        <AdventureMap onNext={() => goTo("placement")} onHome={() => goTo("home")} />
      </div>
      <div ref={(el) => (sectionRefs.current.placement = el)} className="scroller__section">
        <PlacementMission onNext={() => goTo("jungle")} onHome={() => goTo("home")} />
      </div>
      <div ref={(el) => (sectionRefs.current.jungle = el)} className="scroller__section">
        <JungleGames onHome={() => goTo("home")} onNext={() => goTo("jungleDetail")} />
      </div>
      <div ref={(el) => (sectionRefs.current.jungleDetail = el)} className="scroller__section">
        <JungleGamesDetail onHome={() => goTo("home")} onMap={() => goTo("map")} onPlayGame={playGame} />
      </div>
      <div ref={(el) => (sectionRefs.current.parrotPairsGame = el)} className="scroller__section">
        <ParrotPairsGame onHome={() => goTo("home")} onBack={() => goTo("jungleDetail")} />
      </div>
      <div ref={(el) => (sectionRefs.current.syllableSafariGame = el)} className="scroller__section">
        <SyllableSafariGame onHome={() => goTo("home")} onBack={() => goTo("jungleDetail")} />
      </div>
      <div ref={(el) => (sectionRefs.current.monkeyMixUpGame = el)} className="scroller__section">
        <MonkeyMixUpGame onHome={() => goTo("home")} onBack={() => goTo("jungleDetail")} />
      </div>
      <div ref={(el) => (sectionRefs.current.canopy = el)} className="scroller__section">
        <CanopyQuest onHome={() => goTo("home")} onNext={() => goTo("canopyDetail")} />
      </div>
      <div ref={(el) => (sectionRefs.current.canopyDetail = el)} className="scroller__section">
        <CanopyQuestDetail onHome={() => goTo("home")} onMap={() => goTo("map")} />
      </div>
    </div>
  );
}

export default App;
