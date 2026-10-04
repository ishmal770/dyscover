// The kid's home base, shown before the map. Like a language-learning app's
// home screen: streak, XP and stars at the top, this week's practice days,
// today's goal, and one big "next lesson" button so there's always an obvious
// thing to do. Everything shown here is real saved progress (ProgressContext).
import { Flame, Zap, Star, Target, Play, Map as MapIcon, Backpack, Check, UserRound } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import Avatar from "../components/Avatar";
import { GemArt } from "../components/TreasureArt";
import { GEMS } from "../data/treasures";
import { useProgress, dayKey } from "../context/ProgressContext";
import { LESSON_BY_ID, UNITS } from "../data/lessons";
import "./Dashboard.css";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

// The last 7 days (oldest first, ending today) and how much was practiced on each
function lastSevenDays(history) {
  const days = [];
  for (let back = 6; back >= 0; back--) {
    const date = new Date();
    date.setDate(date.getDate() - back);
    const key = dayKey(date);
    days.push({ key, letter: DAY_LETTERS[date.getDay()], xp: history[key] || 0, isToday: back === 0 });
  }
  return days;
}

function Dashboard({ onStartLesson, onOpenMap, onOpenUnit, onOpenBackpack, onOpenProfile }) {
  const progress = useProgress();
  const { pendingGem, name, avatar, levelInfo, xp, streak, todayXp, goal, totalStars, maxStars, history, playedToday, unitProgress } = progress;
  const next = LESSON_BY_ID[progress.nextLesson().id];
  const nextProgress = progress.lessons[next.id];
  const goalPercent = Math.min(100, Math.round((todayXp / goal) * 100));
  const goalDone = todayXp >= goal;

  let headline = "Let's start your first lesson!";
  if (streak > 0 && !playedToday) headline = "Play today to keep your streak going!";
  else if (goalDone) headline = "Daily goal done. Great job today!";
  else if (playedToday) headline = "You're on a roll!";

  return (
    <section className="page dash">
      <TopBar label="MY DASHBOARD" />
      <div className="dash__scroll">
        <div className="dash__inner">
          <header className="dash__hero">
            <button className="dash__me" onClick={onOpenProfile} aria-label="Open my profile">
              <span className="dash__me-avatar">
                <Avatar id={avatar} size={64} />
                <span className="dash__me-level">Lv {levelInfo.level}</span>
              </span>
              <span className="dash__me-text">
                <span className="dash__me-name">Hi, {name}!</span>
                <span className="dash__me-sub">{headline}</span>
              </span>
            </button>
            <div className="dash__chips">
              <span className="dash__chip dash__chip--streak" title="Days in a row">
                <Flame size={18} fill="currentColor" /> {streak}
              </span>
              <span className="dash__chip dash__chip--xp" title="XP">
                <Zap size={18} fill="currentColor" /> {xp}
              </span>
              <span className="dash__chip dash__chip--stars" title="Stars">
                <Star size={18} fill="currentColor" /> {totalStars}/{maxStars}
              </span>
            </div>
          </header>

          {pendingGem && (
            <div className="dash__gem">
              <GemArt color={GEMS[pendingGem.id].color} dark={GEMS[pendingGem.id].dark} size={64} glow />
              <div>
                <h2>You won the {GEMS[pendingGem.id].name}!</h2>
                <p>Put it in the gate on the map to open the next world.</p>
              </div>
              <button className="dash__start" onClick={onOpenMap}>
                <MapIcon size={18} /> TO THE GATE
              </button>
            </div>
          )}

          <div className="dash__next">
            <div>
              <span className="dash__next-unit">{next.unitTitle.toUpperCase()}</span>
              <h2>{next.name}</h2>
              <p>{next.blurb}</p>
              {nextProgress && <span className="dash__next-done">Finished before - practice to earn more stars</span>}
            </div>
            <button className="dash__start" onClick={() => onStartLesson(next.id)}>
              <Play size={18} fill="currentColor" /> {nextProgress ? "PRACTICE" : "START"}
            </button>
          </div>

          <div className="dash__row">
            <section className="dash__card">
              <h3>
                <Target size={16} /> Daily goal
              </h3>
              <div className="dash__goal-bar" role="progressbar" aria-valuenow={todayXp} aria-valuemin={0} aria-valuemax={goal}>
                <div className="dash__goal-fill" style={{ width: `${goalPercent}%` }} />
              </div>
              <p className="dash__goal-text">
                <strong>{Math.min(todayXp, goal)}</strong> / {goal} XP today
                {goalDone && <span className="dash__goal-done"> - goal reached!</span>}
              </p>
            </section>

            <section className="dash__card">
              <h3>
                <Flame size={16} /> This week
              </h3>
              <div className="dash__week">
                {lastSevenDays(history).map((day) => (
                  <div key={day.key} className={`dash__day${day.xp > 0 ? " is-played" : ""}${day.isToday ? " is-today" : ""}`}>
                    <span className="dash__day-dot">{day.xp > 0 ? <Check size={14} strokeWidth={3} /> : null}</span>
                    <span className="dash__day-letter">{day.letter}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <h3 className="dash__heading">Your adventure</h3>
          <div className="dash__units">
            {UNITS.map((unit, i) => {
              const p = unitProgress(unit.id);
              return (
                <button key={unit.id} className="dash__unit" onClick={() => onOpenUnit(unit.sectionKey)}>
                  <span className="dash__unit-num">UNIT {i + 1}</span>
                  <strong>{unit.title}</strong>
                  <span className="dash__unit-tag">{unit.tagline}</span>
                  <span className="dash__unit-bar">
                    <span style={{ width: `${(p.done / p.total) * 100}%` }} />
                  </span>
                  <span className="dash__unit-count">
                    {p.done}/{p.total} lessons &middot; {p.stars}/{p.maxStars} stars
                  </span>
                </button>
              );
            })}
          </div>

          <div className="dash__links">
            <button className="btn btn--outline" onClick={onOpenMap}>
              <MapIcon size={16} /> Adventure map
            </button>
            <button className="btn btn--outline" onClick={onOpenProfile}>
              <UserRound size={16} /> My profile
            </button>
            <button className="btn btn--outline" onClick={onOpenBackpack}>
              <Backpack size={16} /> My backpack
            </button>
          </div>
        </div>
      </div>

      <AccessibilityToolbar />
      <GuideBubble
        fixedCharacter="sloth"
        message="Welcome back, explorer! Tap Start to keep learning."
        instructions="This is your home base. The flame counts the days in a row that you play. The bar shows today's goal. Tap Start to begin your next lesson, or open the map to choose a world. Tap your picture to open your profile."
      />
    </section>
  );
}

export default Dashboard;
