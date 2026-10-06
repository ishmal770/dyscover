// The kid-facing app: every page/game is mounted at once as a horizontal
// "slide", and navigation just smooth-scrolls between them instead of
// unmounting/remounting components. This keeps the transitions instant
// and avoids losing in-progress game state when peeking at another page.
import { useRef, useEffect, useState } from "react";
import { useProgress } from "./context/ProgressContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import AdventureMap from "./pages/AdventureMap";
import PlacementMission from "./pages/PlacementMission";
import Dashboard from "./pages/Dashboard";
import JungleQuiz from "./pages/JungleQuiz";
import ParrotPairsGame from "./pages/ParrotPairsGame";
import SyllableSafariGame from "./pages/SyllableSafariGame";
import MonkeyMixUpGame from "./pages/MonkeyMixUpGame";
import LionsLettersGame from "./pages/LionsLettersGame";
import CheetahChallengeGame from "./pages/CheetahChallengeGame";
import LizardLookoutsGame from "./pages/LizardLookoutsGame";

function KidGameApp() {
  // Holds a live DOM node reference for every section, keyed by section name,
  // so goTo() can scroll to any of them without re-rendering.
  const sectionRefs = useRef({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { grade } = useProgress();

  // Smoothly scrolls the horizontal strip so the named section fills the view.
  const goTo = (key) => {
    sectionRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  // Supports deep links like /?play=parrotPairsGame (used by the Trophy
  // Room and Expert Dashboard) by jumping straight to that section on load.
  useEffect(() => {
    const play = searchParams.get("play");
    if (play && sectionRefs.current[play]) {
      sectionRefs.current[play].scrollIntoView({ behavior: "instant", inline: "start" });
    }
  }, [searchParams]);

  // Every "home" button goes to the dashboard (the kid's home base); the splash
  // page is only the very first screen.
  const toDashboard = () => goTo("dashboard");

  // Finishing a lesson sends the child back to the map and then starts that
  // game fresh (a new `key`), so reopening it shows the game, not the old
  // "Lesson complete" screen. The reset waits for the scroll to finish.
  const [runs, setRuns] = useState({});
  const finishLesson = (key) => {
    goTo("map");
    setTimeout(() => setRuns((r) => ({ ...r, [key]: (r[key] || 0) + 1 })), 1000);
  };

  const section = (key, children) => (
    <div ref={(el) => (sectionRefs.current[key] = el)} className="scroller__section">
      {children}
    </div>
  );

  return (
    <div className="scroller">
      {/* Getting started: splash -> log in -> quick placement */}
      {section("home", <Homepage onNext={() => goTo("login")} />)}
      {section("login", <Login onNext={() => goTo("quiz")} />)}
      {section("quiz", <JungleQuiz onNext={() => goTo("placement")} />)}
      {section("placement", <PlacementMission onNext={toDashboard} onHome={toDashboard} />)}

      {/* Home base, then the world map. The map is one lesson path; each lesson is a game. */}
      {section(
        "dashboard",
        <Dashboard
          onStartLesson={goTo}
          onOpenMap={() => goTo("map")}
          onOpenUnit={goTo}
          onOpenBackpack={() => navigate("/backpack")}
          onQuiz={() => goTo("quiz")}
        />
      )}
      {section("map", <AdventureMap onHome={toDashboard} onStartLesson={goTo} />)}

      {/* The lessons: Unit 1 (Jungle Games), then Unit 2 (Canopy Quest). Each one returns to the map. */}
      {section("parrotPairsGame", <ParrotPairsGame key={`${runs.parrotPairsGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("parrotPairsGame")} />)}
      {section("syllableSafariGame", <SyllableSafariGame key={`${runs.syllableSafariGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("syllableSafariGame")} />)}
      {section("monkeyMixUpGame", <MonkeyMixUpGame key={`${runs.monkeyMixUpGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("monkeyMixUpGame")} />)}
      {section("lionsLettersGame", <LionsLettersGame key={`${runs.lionsLettersGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("lionsLettersGame")} />)}
      {section("lizardLookoutsGame", <LizardLookoutsGame key={`${runs.lizardLookoutsGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("lizardLookoutsGame")} />)}
      {section("cheetahChallengeGame", <CheetahChallengeGame key={`${runs.cheetahChallengeGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("cheetahChallengeGame")} />)}
    </div>
  );
}

export default KidGameApp;
