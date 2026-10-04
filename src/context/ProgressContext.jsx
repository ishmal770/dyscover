// Saved learning progress: XP, the daily streak, the daily goal, and stars per
// lesson. Everything lives in localStorage (there is no backend), so it
// survives reloads on this device. Used by the dashboard, the map, the lesson
// path, the "lesson complete" screen and the Trophy Room.
import { createContext, useContext, useRef, useState } from "react";
import { UNITS, LESSONS } from "../data/lessons";

const STORAGE_KEY = "dyscover-progress";
const DAILY_GOAL_XP = 30;

const EMPTY = {
  name: "Explorer",
  xp: 0,
  streak: 0, // consecutive days played, as of `lastDay`
  bestStreak: 0,
  lastDay: null, // "YYYY-MM-DD" of the last lesson finished
  today: { day: null, xp: 0 },
  history: {}, // "YYYY-MM-DD" -> XP earned that day (for the week row)
  lessons: {}, // lessonId -> { stars: 1-3 (best), plays }
};

function dayKey(date = new Date()) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function offsetDay(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") return { ...EMPTY, ...saved };
  } catch {
    // missing or unreadable - start fresh
  }
  return EMPTY;
}

const ProgressContext = createContext(null);

function ProgressProvider({ children }) {
  const [state, setState] = useState(load);
  const stateRef = useRef(state); // so completeLesson can return its result synchronously

  function commit(next) {
    stateRef.current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // progress just won't persist
    }
  }

  // Called once when a lesson (game session) is finished. Returns what the
  // "lesson complete" screen shows.
  function completeLesson(id, stars) {
    const s = stateRef.current;
    const today = dayKey();
    const prev = s.lessons[id];
    const firstTime = !prev;
    const xpGained = 10 + stars * 5 + (firstTime ? 10 : 0);

    const streak = s.lastDay === today ? s.streak : s.lastDay === offsetDay(-1) ? s.streak + 1 : 1;
    const xpBefore = s.today.day === today ? s.today.xp : 0;
    const todayXp = xpBefore + xpGained;

    commit({
      ...s,
      xp: s.xp + xpGained,
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
      lastDay: today,
      today: { day: today, xp: todayXp },
      history: { ...s.history, [today]: (s.history[today] || 0) + xpGained },
      lessons: { ...s.lessons, [id]: { stars: Math.max(prev?.stars || 0, stars), plays: (prev?.plays || 0) + 1 } },
    });

    return { xpGained, streak, todayXp, goal: DAILY_GOAL_XP, goalReached: xpBefore < DAILY_GOAL_XP && todayXp >= DAILY_GOAL_XP, firstTime };
  }

  const today = dayKey();
  const isCompleted = (id) => Boolean(state.lessons[id]);
  const isUnlocked = (id) => {
    const lesson = LESSONS.find((l) => l.id === id);
    if (!lesson || lesson.indexInUnit === 0) return true;
    const unit = UNITS.find((u) => u.id === lesson.unitId);
    return isCompleted(unit.lessons[lesson.indexInUnit - 1].id);
  };

  // The lesson to suggest next: the first one not finished yet (earliest unit
  // first); once everything is done, the one with the fewest stars.
  function nextLesson() {
    const open = LESSONS.find((l) => !isCompleted(l.id) && isUnlocked(l.id));
    if (open) return open;
    return [...LESSONS].sort((a, b) => (state.lessons[a.id]?.stars || 0) - (state.lessons[b.id]?.stars || 0))[0];
  }

  const value = {
    name: state.name,
    xp: state.xp,
    // a streak is only alive if you played today or yesterday
    streak: state.lastDay === today || state.lastDay === offsetDay(-1) ? state.streak : 0,
    playedToday: state.lastDay === today,
    bestStreak: state.bestStreak,
    todayXp: state.today.day === today ? state.today.xp : 0,
    goal: DAILY_GOAL_XP,
    totalStars: Object.values(state.lessons).reduce((sum, l) => sum + l.stars, 0),
    maxStars: LESSONS.length * 3,
    lessons: state.lessons,
    history: state.history,
    isCompleted,
    isUnlocked,
    stars: (id) => state.lessons[id]?.stars || 0,
    unitProgress: (unitId) => {
      const unit = UNITS.find((u) => u.id === unitId);
      const done = unit.lessons.filter((l) => isCompleted(l.id)).length;
      const stars = unit.lessons.reduce((sum, l) => sum + (state.lessons[l.id]?.stars || 0), 0);
      return { done, total: unit.lessons.length, stars, maxStars: unit.lessons.length * 3 };
    },
    nextLesson,
    completeLesson,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

export { ProgressProvider, useProgress, dayKey, offsetDay };
