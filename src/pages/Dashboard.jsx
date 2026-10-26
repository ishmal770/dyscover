// The kid's home page - everything about "me" in one place: avatar, name,
// level and stats (with a picker to change the avatar), today's goal, this
// week, and one big "next lesson" button so there is always an obvious thing to
// do. All of it is real saved progress (ProgressContext).
import { useEffect, useState } from "react";
import { Target, Play, Map as MapIcon, Backpack, Check, Flame, Volume2 } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import MeCard from "../components/MeCard";
import GameArt from "../components/GameArt";
import WordPicture from "../components/WordPicture";
import { speak } from "../audio/speech";
import { useProgress, dayKey } from "../context/ProgressContext";
import { LESSON_BY_ID } from "../data/lessons";
import { GEMS } from "../data/treasures";
import { getSignedInUser, invokeLearningFunction } from "../learningApi";
import { signInWithGoogle } from "../supabase";
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

function Dashboard({ onStartLesson, onOpenMap, onOpenBackpack, onQuiz, onCredits, onPlacement, onOpenDoor }) {
  const progress = useProgress();
  const [learning, setLearning] = useState(null);
  const [learningError, setLearningError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function loadPlan() {
      if (!progress.placed) {
        setLearning(null);
        setNeedsSignIn(false);
        setLearningError("");
        return;
      }
      try {
        const user = await getSignedInUser();
        if (!user) {
          setLearning(null);
          progress.setAdaptivePlan([]);
          setNeedsSignIn(true);
          setLearningError("Sign in with Google to save your placement results and receive a daily adaptive lesson plan.");
          return;
        }
        const result = await invokeLearningFunction({ action: "daily_plan" });
        if (!cancelled) {
          setLearning(result);
          progress.setAdaptivePlan(result.plan?.items || []);
          progress.setCurrentWorld(result.profile?.current_world || 1);
          setNeedsSignIn(false);
          setLearningError("");
        }
      } catch (error) {
        if (!cancelled) {
          setNeedsSignIn(false);
          setLearningError(error.message || "Today's plan could not load.");
        }
      }
    }
    loadPlan();
    return () => { cancelled = true; };
  }, [progress.placed, progress.lessons]);
  const { placed, doorAvailable, dailyLeft, dailyCollected, spendableXp, pendingGem, streak, todayXp, goal, history, playedToday } = progress;
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
              <WordPicture word={GEMS[pendingGem.id].photo} size={72} />
              <div>
                <h2>You won the {GEMS[pendingGem.id].name}!</h2>
                <p>Put it in the gate on the map to open the next world.</p>
              </div>
              <button className="dash__start" onClick={onOpenMap}>
                <MapIcon size={18} /> TO THE GATE
              </button>
            </div>
          )}

          {doorAvailable && (
            <div className="dash__door">
              <WordPicture word="rainforest" size={72} />
              <div>
                <h2>The vine doors are open!</h2>
                <p>
                  You finished a day of lessons and have {spendableXp} XP to spend.{" "}
                  {dailyCollected
                    ? "Save it for the golden door and an even better prize."
                    : `Cut ${dailyLeft} ${dailyLeft === 1 ? "vine" : "vines"} for a gem, or save your XP for the golden door.`}
                </p>
              </div>
              <button className="dash__start" onClick={onOpenDoor}>
                OPEN THE DOORS
              </button>
            </div>
          )}

          {!placed ? (
            <div className="dash__next">
              <div>
                <span className="dash__next-unit">FIRST STEP</span>
                <h2>Placement games</h2>
                <p>Play a few quick games so we can find the right lessons for you. Your lessons open after this.</p>
              </div>
              <button className="dash__start" onClick={onPlacement}>
                <Play size={18} fill="currentColor" /> PLAY
              </button>
            </div>
          ) : (
            <div className="dash__next">
              <span className="dash__next-art">
                <GameArt id={next.id} size={100} />
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
          )}
          {learning?.plan && (
            <section className="dash__adaptive-plan" aria-label="Today's adaptive lesson plan">
              <div className="dash__adaptive-heading">
                <div>
                  <span className="dash__next-unit">YOUR PERSONAL PLAN · WORLD {learning.plan.world}</span>
                  <h2>Today’s learning path</h2>
                  <p>{learning.plan.target_minutes} minutes picked from your current skill levels.</p>
                </div>
                {learning.recommendation && (
                  <button className="dash__start" onClick={() => onStartLesson(learning.recommendation.game_type)}>
                    <Play size={16} fill="currentColor" /> START NEXT
                  </button>
                )}
              </div>
              <ol className="dash__adaptive-items">
                {learning.plan.items.map((item) => (
                  <li key={item.order + item.game_type} className={item.status === "completed" ? "is-complete" : ""}>
                    <span className="dash__adaptive-order">{item.status === "completed" ? <Check size={15} /> : item.order}</span>
                    <div><strong>{item.title}</strong><span>{item.reason}</span></div>
                    <button onClick={() => onStartLesson(item.lesson_id)} disabled={item.status === "completed"}>
                      {item.status === "completed" ? "DONE" : `${item.target_minutes} MIN`}
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {learningError && (
            <div className="dash__adaptive-error" role="status">
              <p>{learningError}</p>
              {needsSignIn && <button className="btn btn--outline" onClick={signInWithGoogle}>SIGN IN WITH GOOGLE</button>}
            </div>
          )}
          <div className="dash__next">
            <span className="dash__next-art">
              <GameArt id={next.id} size={100} />
            </span>
            <div>
              <span className="dash__next-unit">
                <MapIcon size={14} /> YOUR ADVENTURE MAP
              </span>
              <h2>
                {next.name}
                <button className="dash__speak" onClick={() => speak(`${next.name}. ${next.blurb}`)} aria-label="Read aloud">
                  <Volume2 size={18} />
                </button>
              </h2>
              <p>Next game: {next.blurb}</p>
            </div>
            <div className="dash__next-actions">
              <button className="dash__start" onClick={onOpenMap}>
                <MapIcon size={18} /> OPEN MAP
              </button>
              <button className="dash__start dash__start--ghost" onClick={() => onStartLesson(next.id)}>
                <Play size={18} fill="currentColor" /> {nextProgress ? "PRACTICE" : "START"}
              </button>
            </div>
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
            <button onClick={onCredits}>Picture credits</button>
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
