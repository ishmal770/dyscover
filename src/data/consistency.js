// Practice-consistency numbers for the expert dashboard. A student's practice
// is 28 numbers (oldest day first, today last): minutes practiced that day,
// 0 when they did not play. Plain functions only, no imports.

export const GOAL_DAYS_PER_WEEK = 4;

// Fake-but-steady practice history for the demo students (no backend yet).
// `rate` is roughly how often they play; the same seed always gives the same days.
export function makePractice(seed, rate) {
  let x = seed;
  const next = () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
  return Array.from({ length: 28 }, () => (next() < rate ? Math.round(8 + next() * 14) : 0));
}

export function summarize(days) {
  const active = days.filter((m) => m > 0).length;

  const weeks = [0, 1, 2, 3].map((w) => {
    const slice = days.slice(w * 7, w * 7 + 7);
    return { label: w === 3 ? "This week" : `${3 - w} wk ago`, days: slice.filter((m) => m > 0).length, minutes: slice.reduce((a, b) => a + b, 0) };
  });

  let best = 0;
  let run = 0;
  for (const m of days) {
    run = m > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  // the current streak may still be alive if they simply have not played yet today
  let now = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i] > 0) now++;
    else if (i === days.length - 1) continue;
    else break;
  }

  const weeksOnGoal = weeks.filter((w) => w.days >= GOAL_DAYS_PER_WEEK).length;
  const avgMinutes = active ? Math.round(days.reduce((a, b) => a + b, 0) / active) : 0;
  let status = "Needs a nudge";
  if (weeksOnGoal >= 3) status = "Very consistent";
  else if (weeksOnGoal >= 2) status = "Getting there";

  return { active, weeks, streakBest: best, streakNow: now, weeksOnGoal, avgMinutes, status };
}
