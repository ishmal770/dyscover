// The kid-facing app: every page/game is mounted at once as a horizontal
// "slide", and navigation just smooth-scrolls between them instead of
// unmounting/remounting components. This keeps the transitions instant
// and avoids losing in-progress game state when peeking at another page.
import { useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import LionsLettersGame from "./pages/LionsLettersGame";
import CheetahChallengeGame from "./pages/CheetahChallengeGame";
import LizardLookoutsGame from "./pages/LizardLookoutsGame";

// Maps a game's display name (used on hub/trophy cards) to its section key,
// so hub pages and the Trophy Room's "Play Again" links can jump straight
// to the right game.
const GAME_ROUTES = {
  "Parrot Pairs": "parrotPairsGame",
  "Syllable Safari": "syllableSafariGame",
  "Monkey Mix-Up": "monkeyMixUpGame",
  "Lion's Letters": "lionsLettersGame",
  "Lizard Lookouts": "lizardLookoutsGame",
  "Cheetah Challenge": "cheetahChallengeGame",
};

function KidGameApp() {
  // Holds a live DOM node reference for every section, keyed by section name,
  // so goTo() can scroll to any of them without re-rendering.
  const sectionRefs = useRef({});
  const [searchParams] = useSearchParams();

  // Smoothly scrolls the horizontal strip so the named section fills the view.
  const goTo = (key) => {
    sectionRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  // Used by hub pages when a game card is tapped: looks up the section key
  // for the given game and scrolls to it.
  const playGame = (activity) => {
    const key = GAME_ROUTES[activity.name];
    if (key) goTo(key);
  };

  // Supports deep links like /?play=parrotPairsGame (used by the Trophy
  // Room and Expert Dashboard) by jumping straight to that section on load.
  useEffect(() => {
    const play = searchParams.get("play");
    if (play && sectionRefs.current[play]) {
      sectionRefs.current[play].scrollIntoView({ behavior: "instant", inline: "start" });
    }
  }, [searchParams]);

  return (
    <div className="scroller">
      {/* Onboarding flow: homepage -> login -> world map -> placement quiz */}
      <div ref={(el) => (sectionRefs.current.home = el)} className="scroller__section">
        <Homepage onNext={() => goTo("login")} />
      </div>
      <div ref={(el) => (sectionRefs.current.login = el)} className="scroller__section">
        <Login onNext={() => goTo("map")} />
      </div>
      <div ref={(el) => (sectionRefs.current.map = el)} className="scroller__section">
        <AdventureMap
          onNext={() => goTo("placement")}
          onStartCanopy={() => goTo("canopy")}
          onHome={() => goTo("home")}
        />
      </div>
      <div ref={(el) => (sectionRefs.current.placement = el)} className="scroller__section">
        <PlacementMission onNext={() => goTo("jungle")} onHome={() => goTo("home")} />
      </div>

      {/* World 1: Jungle Games - hub, its game list, then the 3 games themselves */}
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

      {/* World 2: Canopy Quest - hub, its game list, then the 3 games themselves */}
      <div ref={(el) => (sectionRefs.current.canopy = el)} className="scroller__section">
        <CanopyQuest onHome={() => goTo("home")} onNext={() => goTo("canopyDetail")} />
      </div>
      <div ref={(el) => (sectionRefs.current.canopyDetail = el)} className="scroller__section">
        <CanopyQuestDetail onHome={() => goTo("home")} onMap={() => goTo("map")} onPlayGame={playGame} />
      </div>
      <div ref={(el) => (sectionRefs.current.lionsLettersGame = el)} className="scroller__section">
        <LionsLettersGame onHome={() => goTo("home")} onBack={() => goTo("canopyDetail")} />
      </div>
      <div ref={(el) => (sectionRefs.current.lizardLookoutsGame = el)} className="scroller__section">
        <LizardLookoutsGame onHome={() => goTo("home")} onBack={() => goTo("canopyDetail")} />
      </div>
      <div ref={(el) => (sectionRefs.current.cheetahChallengeGame = el)} className="scroller__section">
        <CheetahChallengeGame onHome={() => goTo("home")} onBack={() => goTo("canopyDetail")} />
      </div>
    </div>
  );
}

export default KidGameApp;
