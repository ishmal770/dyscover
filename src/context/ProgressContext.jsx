// Saved learning progress: XP, the daily streak, the daily goal, and stars per
// lesson. Everything lives in localStorage (there is no backend), so it
// survives reloads on this device. Used by the dashboard, the map, the lesson
// path, the "lesson complete" screen and the backpack.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { UNITS, LESSONS, LESSON_BY_ID } from "../data/lessons";
import { pickStartLesson } from "../data/placement";
import { TREASURES, GEMS } from "../data/treasures";
import { DOORS, prizeFor } from "../data/vineDoor";
import { AVATARS, AVATAR_BY_ID, DEFAULT_AVATAR, isAvatarUnlocked, levelFor } from "../data/avatars";
import { supabase } from "../supabase";

const STORAGE_KEY = "dyscover-progress";

// ?reset=1 starts over: it clears everything the app saved (progress, settings, what was heard),
// then drops itself from the address so a reload does not wipe again.
(() => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== "1") return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith("dyscover"))
      .forEach((k) => localStorage.removeItem(k));
    params.delete("reset");
    const rest = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}${window.location.hash}`);
  } catch {
    // storage blocked: nothing to clear
  }
})();

// demo mode: ?dev=1 turns it on (and remembers it), ?dev=0 turns it off
const DEV = (() => {
  try {
    const q = new URLSearchParams(window.location.search).get("dev");
    if (q === "1") localStorage.setItem("dyscover-dev", "1");
    if (q === "0") localStorage.removeItem("dyscover-dev");
    return localStorage.getItem("dyscover-dev") === "1";
  } catch {
    return false;
  }
})();
const DAILY_GOAL_XP = 30;

const EMPTY = {
  name: "Explorer",
  email: "",
  avatar: DEFAULT_AVATAR, // the picture on the child's account (see data/avatars.js)
  xp: 0,
  streak: 0, // consecutive days played, as of `lastDay`
  bestStreak: 0,
  lastDay: null, // "YYYY-MM-DD" of the last lesson finished
  today: { day: null, xp: 0 },
  history: {}, // "YYYY-MM-DD" -> XP earned that day (for the week row)
  lessons: {}, // lessonId -> { stars: 1-3 (best), plays }
  gems: [], // unit ids whose gem has been put into the gate (opens the next unit)
  grade: "g35", // grade band for the questions (see data/questionBanks.js)
  xpSpent: 0, // XP spent on cutting vines (level still counts all the XP ever earned)
  door: { day: null, removed: 0, collected: false }, // today's vine door
  golden: { removed: 0 }, // the golden door (saved up over days)
  doorGems: [], // ids of the gems collected from today's door
  goldenPrizes: [], // ids of the prizes collected from the golden door
  placed: false, // true once the placement mission has been finished (it is played only once)
  currentWorld: 1,
  plannedLessons: [],
  placement: null, // { grade, correct, total, startLessonId, startUnitId }
  jungle: null, // the jungle the child was sorted into by the quiz
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
    if (saved && typeof saved === "object") {
      const state = { ...EMPTY, ...saved };
      if (!["k2", "g35"].includes(state.grade)) state.grade = "g35"; // the old 6-8 band was removed
      // older saves finished placement before it chose a starting game, so ask
      // them to do the quick diagnostic once more
      if (state.placed && !state.placement) state.placed = false;
      return state;
    }
  } catch {
    // missing or unreadable - start fresh
  }
  return EMPTY;
}

// Level, stars and treasures (finished lessons) from a saved state - what
// avatars unlock against
function statsOf(s) {
  const lessons = Object.values(s.lessons);
  return {
    level: levelFor(s.xp).level,
    stars: lessons.reduce((sum, l) => sum + l.stars, 0),
    treasures: lessons.length,
  };
}

const ProgressContext = createContext(null);

function ProgressProvider({ children }) {
  const [state, setState] = useState(load);
  const stateRef = useRef(state); // so completeLesson can return its result synchronously

  // the whole app takes on the colors of the child's jungle (rainforest = green, mountain = blue, river = orange)
  useEffect(() => {
    document.documentElement.dataset.jungle = state.jungle || "";
  }, [state.jungle]);

  // text is bigger for the youngest readers (K-2) and a bit smaller for grades 3-5
  useEffect(() => {
    document.documentElement.dataset.band = state.grade;
  }, [state.grade]);

  function commit(next) {
    stateRef.current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // progress just won't persist
    }
  }

  useEffect(() => {
    async function syncCloudProfile(user) {
      if (!user) return;
      const { data: profile, error } = await supabase.from("profiles")
        .select("grade_tier, diagnostic_completed, current_world")
        .eq("id", user.id)
        .maybeSingle();
      if (error || !profile) return;
      const current = stateRef.current;
      if (profile.diagnostic_completed) {
        let placement = current.placement;
        if (!placement) {
          const { data: plans } = await supabase.from("daily_lesson_plans")
            .select("items")
            .eq("student_id", user.id)
            .order("plan_date", { ascending: false })
            .limit(1);
          const suggested = plans?.[0]?.items?.[0]?.lesson_id;
          const start = LESSON_BY_ID[suggested] || LESSON_BY_ID.monkeyMixUpGame;
          placement = { grade: profile.grade_tier, correct: 0, total: 0, startLessonId: start.id, startUnitId: start.unitId };
        }
        commit({ ...current, grade: profile.grade_tier, placed: true, placement, currentWorld: profile.current_world || 1 });
      } else if (current.placed) {
        // Old device-only placement results cannot seed the cloud diagnostic skills.
        commit({ ...current, placed: false, placement: null, currentWorld: profile.current_world || 1 });
      } else if (current.grade !== profile.grade_tier) {
        commit({ ...current, grade: profile.grade_tier });
      }
    }

    supabase.auth.getUser().then(({ data }) => syncCloudProfile(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncCloudProfile(session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

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
    const statsBefore = statsOf(s);

    const next = {
      ...s,
      xp: s.xp + xpGained,
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
      lastDay: today,
      today: { day: today, xp: todayXp },
      history: { ...s.history, [today]: (s.history[today] || 0) + xpGained },
      lessons: { ...s.lessons, [id]: { stars: Math.max(prev?.stars || 0, stars), plays: (prev?.plays || 0) + 1 } },
    };
    commit(next);

    const statsAfter = statsOf(next);
    const lessonInfo = LESSONS.find((l) => l.id === id);
    const unit = UNITS.find((u) => u.id === lessonInfo.unitId);
    const unitDone = unit.lessons.every((l) => next.lessons[l.id]);
    const unitWasDone = unit.lessons.every((l) => s.lessons[l.id]);
    return {
      treasure: firstTime ? TREASURES[id] : null,
      gem: unitDone && !unitWasDone ? { ...GEMS[unit.id], unitTitle: unit.title, hasNext: UNITS.indexOf(unit) < UNITS.length - 1 } : null,
      xpGained,
      streak,
      todayXp,
      goal: DAILY_GOAL_XP,
      goalReached: xpBefore < DAILY_GOAL_XP && todayXp >= DAILY_GOAL_XP,
      firstTime,
      level: statsAfter.level,
      leveledUp: statsAfter.level > statsBefore.level,
      newAvatars: AVATARS.filter((a) => !isAvatarUnlocked(a, statsBefore) && isAvatarUnlocked(a, statsAfter)),
    };
  }

  // ---- demo mode ---------------------------------------------------------------------
  // Open the app with ?dev=1 to unlock every game and the vine doors for a demo (?dev=0 turns it off).
  // Nothing is blocked and you start with 200 XP to spend on vines; the DEV panel (Shift+D) can add XP or refill the doors.
  const dev = DEV;

  // ---- the vine doors (see data/vineDoor.js) -----------------------------------------------
  // a door keeps the vines already cut until its gem is collected; a new door starts the next day
  const todaysDoor = (s) => (s.door.collected && s.door.day !== dayKey() ? { day: dayKey(), removed: 0, collected: false } : s.door);
  const goalReachedToday = (s) => (s.today.day === dayKey() ? s.today.xp : 0) >= DAILY_GOAL_XP;

  // In demo mode there is a 200 XP starter balance on top of any XP earned, and cutting vines spends it for real.
  const spendableOf = (s) => Math.max(0, (dev ? 200 : 0) + s.xp - s.xpSpent);

  // Cut `count` vines ("daily" or "golden") by spending 10 XP each. Returns true if they were cut.
  function cutVine(kind = "daily", count = 1) {
    const s = stateRef.current;
    const { vines, cost } = DOORS[kind];
    if (count < 1) return false;
    if (!dev && (!goalReachedToday(s) || s.xp - s.xpSpent < cost * count)) return false;
    const spent = dev ? 0 : cost * count;
    if (kind === "daily") {
      const door = todaysDoor(s);
      if (door.removed + count > vines || (door.collected && !dev)) return false;
      commit({ ...s, xpSpent: s.xpSpent + spent, door: { ...door, removed: door.removed + count, collected: false } });
    } else {
      if (s.golden.removed + count > vines) return false;
      commit({ ...s, xpSpent: s.xpSpent + spent, golden: { removed: s.golden.removed + count } });
    }
    return true;
  }

  // Take the prize from behind an open door and put it in the backpack. Returns the prize.
  function collectDoorGem(kind = "daily") {
    const s = stateRef.current;
    if (kind === "daily") {
      const door = todaysDoor(s);
      if (door.removed < DOORS.daily.vines || (door.collected && !dev)) return null;
      const prize = prizeFor("daily", s.doorGems.length);
      commit({ ...s, doorGems: [...s.doorGems, prize.id], door: { ...door, day: dayKey(), collected: true } });
      return prize;
    }
    if (s.golden.removed < DOORS.golden.vines) return null;
    const prize = prizeFor("golden", s.goldenPrizes.length);
    commit({ ...s, goldenPrizes: [...s.goldenPrizes, prize.id], golden: { removed: 0 } });
    return prize;
  }

  // demo helpers (the DEV panel)
  function devAddXp(amount) {
    const s = stateRef.current;
    const day = dayKey();
    const todayXp = (s.today.day === day ? s.today.xp : 0) + amount;
    commit({ ...s, xp: s.xp + amount, today: { day, xp: todayXp }, lastDay: day, history: { ...s.history, [day]: (s.history[day] || 0) + amount } });
  }
  function devResetDoors() {
    commit({ ...stateRef.current, xpSpent: 0, door: { day: dayKey(), removed: 0, collected: false }, golden: { removed: 0 } });
  }

  function setAvatar(id) {
    const s = stateRef.current;
    if (AVATAR_BY_ID[id] && isAvatarUnlocked(AVATAR_BY_ID[id], statsOf(s))) commit({ ...s, avatar: id });
  }

  // Put a unit's gem into its gate, which opens the next unit
  function placeGem(unitId) {
    const s = stateRef.current;
    const unit = UNITS.find((u) => u.id === unitId);
    if (!unit || s.gems.includes(unitId) || !unit.lessons.every((l) => s.lessons[l.id])) return;
    commit({ ...s, gems: [...s.gems, unitId] });
  }

  // the grade band the child says they are in (where the placement mission starts)
  function chooseGrade(grade) {
    commit({ ...stateRef.current, grade });
  }
  const setGrade = chooseGrade;

  // the level the placement mission found: this is what every game uses, and it
  // also chooses the first game on the adventure map. It is played only once.
  function completePlacement({ grade, correct, total, startLessonId: backendStartLessonId }) {
    const start = backendStartLessonId ? LESSON_BY_ID[backendStartLessonId] : pickStartLesson(correct, total);
    if (!start) return;
    commit({
      ...stateRef.current,
      grade,
      placed: true,
      currentWorld: 1,
      placement: {
        grade,
        correct,
        total,
        startLessonId: start.id,
        startUnitId: start.unitId,
      },
    });
  }

  function setCurrentWorld(world) {
    const nextWorld = Math.max(1, Math.min(2, Number(world) || 1));
    if (nextWorld !== stateRef.current.currentWorld) commit({ ...stateRef.current, currentWorld: nextWorld });
  }

  function setAdaptivePlan(items) {
    const plannedLessons = Array.isArray(items)
      ? [...new Set(items.filter((item) => item.status !== "completed").map((item) => item.lesson_id).filter((id) => LESSON_BY_ID[id]))]
      : [];
    if (JSON.stringify(plannedLessons) !== JSON.stringify(stateRef.current.plannedLessons || [])) {
      commit({ ...stateRef.current, plannedLessons });
    }
  }

  function setJungle(jungle) {
    commit({ ...stateRef.current, jungle });
  }

  function setName(name) {
    const clean = name.trim().slice(0, 16);
    if (clean) commit({ ...stateRef.current, name: clean });
  }

  function setEmail(email) {
    const clean = String(email || "").trim();
    if (clean) commit({ ...stateRef.current, email: clean });
  }

  const today = dayKey();
  const isCompleted = (id) => Boolean(state.lessons[id]);
  // A unit is open if it is the first, or the unit before it has its gem in the gate
  const unitDone = (unitId) => UNITS.find((u) => u.id === unitId).lessons.every((l) => isCompleted(l.id));
  const gemPlaced = (unitId) => state.gems.includes(unitId);
  const isUnitOpen = (unitId) => {
    // the unit the diagnostic picked is always open for this child
    if (state.placement?.startUnitId === unitId) return true;
    const i = UNITS.findIndex((u) => u.id === unitId);
    return i === 0 || gemPlaced(UNITS[i - 1].id);
  };
  const allDone = LESSONS.every((l) => isCompleted(l.id));
  // The lesson the child is on: the first one not finished, in map order, whose unit is open.
  const currentLessonId = LESSONS.find((l) => !isCompleted(l.id) && isUnitOpen(l.unitId))?.id ?? null;
  // Nothing opens until the placement mission is done. After it, only the current lesson is
  // open (finished ones stay shut and the next one stays locked) until every lesson is finished;
  // then all of them open for practice.
  const isUnlocked = (id) => {
    if (dev) return true; // demo mode: every game is open
    if (!state.placed) return false;
    if (state.plannedLessons?.includes(id)) return true;
    if (allDone) return true;
    const lesson = LESSONS.find((l) => l.id === id);
    if (!lesson || !isUnitOpen(lesson.unitId)) return false;
    // the diagnostic's recommended first game is open even when it is not the
    // first lesson in its unit
    if (state.placement?.startLessonId === id) return true;
    if (lesson.indexInUnit === 0) return true;
    const unit = UNITS.find((u) => u.id === lesson.unitId);
    return id === currentLessonId || isCompleted(unit.lessons[lesson.indexInUnit - 1].id);
  };
  // A gem that has been won but not yet put into its gate (and has a next unit to open)
  const pendingGem = UNITS.find((u, i) => i < UNITS.length - 1 && unitDone(u.id) && !gemPlaced(u.id)) || null;

  // The diagnostic rotates the lesson order so the recommended first game comes
  // first; the rest of the path follows from there.
  function lessonOrder() {
    const startId = state.placement?.startLessonId;
    const startIndex = startId ? LESSONS.findIndex((l) => l.id === startId) : -1;
    if (startIndex < 0) return LESSONS;
    return [...LESSONS.slice(startIndex), ...LESSONS.slice(0, startIndex)];
  }

  // The lesson to suggest next: the first one not finished yet in the child's
  // personalized order; once everything is done, the one with the fewest stars.
  function nextLesson() {
    const order = lessonOrder();
    const open = order.find((l) => !isCompleted(l.id) && isUnlocked(l.id));
    if (open) return open;
    
    return order.filter((l) => isUnlocked(l.id)).sort((a, b) => (state.lessons[a.id]?.stars || 0) - (state.lessons[b.id]?.stars || 0))[0] || order[0];
  }

  const stats = statsOf(state);
  const value = {
    name: state.name,
    email: state.email,
    avatar: AVATAR_BY_ID[state.avatar] ? state.avatar : DEFAULT_AVATAR,
    setAvatar,
    setName,
    setEmail,
    grade: state.grade,
    placed: state.placed,
    currentWorld: state.currentWorld || 1,
    setCurrentWorld,
    setAdaptivePlan,
    // vine door: open after the day's goal is reached, until its gem has been collected
    dev,
    devAddXp,
    devResetDoors,
    // the vine doors open after the day's goal is reached
    doorAvailable: dev || goalReachedToday(state),
    dailyLeft: DOORS.daily.vines - todaysDoor(state).removed,
    dailyCollected: todaysDoor(state).collected,
    goldenLeft: DOORS.golden.vines - state.golden.removed,
    spendableXp: spendableOf(state),
    doorGems: state.doorGems,
    goldenPrizes: state.goldenPrizes,
    cutVine,
    collectDoorGem,
    setGrade,
    placement: state.placement,
    recommendedLessonId: state.placement?.startLessonId || null,
    completePlacement,
    chooseGrade,
    jungle: state.jungle,
    setJungle,
    gems: state.gems,
    placeGem,
    isUnitOpen,
    unitDone,
    gemPlaced,
    pendingGem,
    stats,
    levelInfo: levelFor(state.xp),
    isAvatarUnlocked: (a) => isAvatarUnlocked(a, stats),
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
