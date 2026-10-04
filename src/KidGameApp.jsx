// The kid-facing app: every page/game is mounted at once as a horizontal
// "slide", and navigation just smooth-scrolls between them instead of
// unmounting/remounting components. This keeps the transitions instant
// and avoids losing in-progress game state when peeking at another page.
import { useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import AdventureMap from "./pages/AdventureMap";
import PlacementMission from "./pages/PlacementMission";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
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

  const section = (key, children) => (
    <div ref={(el) => (sectionRefs.current[key] = el)} className="scroller__section">
      {children}
    </div>
  );

  return (
    <div className="scroller">
      {/* Getting started: splash -> log in -> quick placement */}
      {section("home", <Homepage onNext={() => goTo("login")} />)}
      {section("login", <Login onNext={() => goTo("placement")} />)}
      {section("placement", <PlacementMission onNext={toDashboard} onHome={toDashboard} />)}

      {/* Home base, then the world map. The map is one lesson path; each lesson is a game. */}
      {section(
        "dashboard",
        <Dashboard
          onStartLesson={goTo}
          onOpenMap={() => goTo("map")}
          onOpenUnit={goTo}
          onOpenTrophies={() => navigate("/trophy-room")}
          onOpenProfile={() => goTo("profile")}
        />
      )}
      {section("profile", <Profile onBack={toDashboard} />)}
      {section("map", <AdventureMap onHome={toDashboard} onStartLesson={goTo} />)}

      {/* The lessons: Unit 1 (Jungle Games), then Unit 2 (Canopy Quest). Each one returns to the map. */}
      {section("parrotPairsGame", <ParrotPairsGame onHome={toDashboard} onBack={() => goTo("map")} />)}
      {section("syllableSafariGame", <SyllableSafariGame onHome={toDashboard} onBack={() => goTo("map")} />)}
      {section("monkeyMixUpGame", <MonkeyMixUpGame onHome={toDashboard} onBack={() => goTo("map")} />)}
      {section("lionsLettersGame", <LionsLettersGame onHome={toDashboard} onBack={() => goTo("map")} />)}
      {section("lizardLookoutsGame", <LizardLookoutsGame onHome={toDashboard} onBack={() => goTo("map")} />)}
      {section("cheetahChallengeGame", <CheetahChallengeGame onHome={toDashboard} onBack={() => goTo("map")} />)}
    </div>
  );
}

export default KidGameApp;
