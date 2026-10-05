// The kid's home page - everything about "me" in one place: avatar, name,
// level and stats (with a picker to change the avatar), today's goal, this
// week, and one big "next lesson" button so there is always an obvious thing to
// do. All of it is real saved progress (ProgressContext).
import { Target, Play, Map as MapIcon, Backpack, Check, Flame, Volume2 } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import MeCard from "../components/MeCard";
import GameArt from "../components/GameArt";
import { GemArt } from "../components/TreasureArt";
import { speak } from "../audio/speech";
import { useProgress, dayKey } from "../context/ProgressContext";
import { LESSON_BY_ID } from "../data/lessons";
import { GEMS } from "../data/treasures";
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

function Dashboard({ onStartLesson, onOpenMap, onOpenBackpack, onQuiz, onPlacement }) {
  const progress = useProgress();
  const { pendingGem, streak, todayXp, goal, history, playedToday } = progress;
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
      <TopBar label="MY HOME" />
      <div className="dash__scroll">
        <div className="dash__inner">
          <MeCard headline={headline} />

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
            <span className="dash__next-art">
              <GameArt id={next.id} size={92} />
            </span>
            <div>
              <span className="dash__next-unit">{next.unitTitle.toUpperCase()}</span>
              <h2>
                {next.name}
                <button className="dash__speak" onClick={() => speak(`${next.name}. ${next.blurb}`)} aria-label="Read aloud">
                  <Volume2 size={18} />
                </button>
              </h2>
              <p>{next.blurb}</p>
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

          <div className="dash__links">
            <button className="btn btn--outline" onClick={onOpenMap}>
              <MapIcon size={18} /> Adventure map
            </button>
            <button className="btn btn--outline" onClick={onOpenBackpack}>
              <Backpack size={18} /> My backpack
            </button>
          </div>

          <p className="dash__redo">
            <button onClick={onQuiz}>Retake the jungle quiz</button>
            <span aria-hidden="true">&middot;</span>
            <button onClick={onPlacement}>Play the placement games again</button>
          </p>
        </div>
      </div>

      <AccessibilityToolbar />
      <GuideBubble
        fixedCharacter="sloth"
        message="Welcome back, explorer! Tap Start to keep learning."
        instructions="This is your home base. The flame counts the days in a row that you play. The bar shows today's goal. Tap Start to begin your next lesson, or open the map to choose a world. Tap Change picture to pick a new avatar."
      />
    </section>
  );
}

export default Dashboard;
