// The kid-facing app: every page/game is mounted at once as a horizontal
// "slide", and navigation just smooth-scrolls between them instead of
// unmounting/remounting components. This keeps the transitions instant
// and avoids losing in-progress game state when peeking at another page.
import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProgress } from "./context/ProgressContext";
import { LESSON_BY_ID } from "./data/lessons";
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

// The pages in the order they sit side by side (the games follow the map's order).
const ORDER = [
  "home", "login", "quiz", "placement", "dashboard", "map",
  "monkeyMixUpGame", "lizardLookoutsGame", "lionsLettersGame", "syllableSafariGame", "parrotPairsGame", "cheetahChallengeGame",
];

function KidGameApp() {
  // Holds a live DOM node reference for every section, keyed by section name,
  // so goTo() can scroll to any of them without re-rendering.
  const sectionRefs = useRef({});
  const scrollerRef = useRef(null);
  const [index, setIndex] = useState(0); // which page is showing
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { grade, isUnlocked } = useProgress();

  // A lesson that is still locked can never be opened.
  const isAllowed = (key) => !(LESSON_BY_ID[key] && !isUnlocked(key));

  // Smoothly scrolls the horizontal strip so the named section fills the view.
  const goTo = (key) => {
    // a locked lesson can never be opened: send the child to the map instead
    if (!isAllowed(key)) key = "map";
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
      const target = LESSON_BY_ID[play] && !isUnlocked(play) ? "map" : play;
      sectionRefs.current[target].scrollIntoView({ behavior: "instant", inline: "start" });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Children move through the pages at their own pace (swiping, scrolling, or the arrows),
  // but a locked lesson never stays on screen: if one slides into view, go back to the map.
  const settle = useRef(null);
  function handleScroll(e) {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(i);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const key = ORDER[Math.round(el.scrollLeft / el.clientWidth)];
      if (key && !isAllowed(key)) goTo("map");
    }, 160);
  }

  const prevKey = ORDER[index - 1];
  const nextKey = ORDER[index + 1];

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
    <div className="scroller" ref={scrollerRef} onScroll={handleScroll}>
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
          onPlacement={() => goTo("placement")}
          onCredits={() => navigate("/credits")}
        />
      )}
      {section("map", <AdventureMap onHome={toDashboard} onStartLesson={goTo} onPlacement={() => goTo("placement")} />)}

      {/* The lessons: Unit 1 (Jungle Games), then Unit 2 (Canopy Quest). Each one returns to the map. */}
      {section("monkeyMixUpGame", <MonkeyMixUpGame key={`${runs.monkeyMixUpGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("monkeyMixUpGame")} />)}
      {section("lizardLookoutsGame", <LizardLookoutsGame key={`${runs.lizardLookoutsGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("lizardLookoutsGame")} />)}
      {section("lionsLettersGame", <LionsLettersGame key={`${runs.lionsLettersGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("lionsLettersGame")} />)}
      {section("syllableSafariGame", <SyllableSafariGame key={`${runs.syllableSafariGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("syllableSafariGame")} />)}
      {section("parrotPairsGame", <ParrotPairsGame key={`${runs.parrotPairsGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("parrotPairsGame")} />)}
      {section("cheetahChallengeGame", <CheetahChallengeGame key={`${runs.cheetahChallengeGame || 0}-${grade}`} onHome={toDashboard} onBack={() => goTo("map")} onDone={() => finishLesson("cheetahChallengeGame")} />)}
      {/* previous / next page arrows (the next arrow never leads to a locked lesson) */}
      <nav className="pager" aria-label="Pages">
        {prevKey && (
          <button className="pager__btn pager__btn--prev" onClick={() => goTo(prevKey)} aria-label="Previous page">
            <ChevronLeft size={26} />
          </button>
        )}
        {nextKey && isAllowed(nextKey) && (
          <button className="pager__btn pager__btn--next" onClick={() => goTo(nextKey)} aria-label="Next page">
            <ChevronRight size={26} />
          </button>
        )}
      </nav>
    </div>
  );
}

export default KidGameApp;
