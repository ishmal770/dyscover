// The avatars a child can pick for their account, and what unlocks each one.
// Unlocks come from levels (earned with XP), stars, or gold trophies (a lesson
// finished with all three stars). They are checked against the saved progress,
// so a child can never lose an avatar they have earned.

export const XP_PER_LEVEL = 40;

// level 1 at 0 XP, then one more level every XP_PER_LEVEL
export function levelFor(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, needed: XP_PER_LEVEL, percent: Math.round((into / XP_PER_LEVEL) * 100) };
}

// `character` is a guide id (see guides.js / GuideArt.jsx); "sloth" is the host
export const AVATARS = [
  { id: "sloth", name: "Sunny", character: "sloth", unlock: null },
  { id: "monkey", name: "Momo", character: "monkey", unlock: null },
  { id: "mimi", name: "Mimi", character: "mimi", unlock: { type: "level", n: 2 } },
  { id: "elephant", name: "Ellie", character: "elephant", unlock: { type: "stars", n: 3 } },
  { id: "lion", name: "Leo", character: "lion", unlock: { type: "level", n: 3 } },
  { id: "cheetah", name: "Chase", character: "cheetah", unlock: { type: "trophies", n: 2 } },
  { id: "gorilla", name: "Gus", character: "gorilla", unlock: { type: "level", n: 5 } },
];

export const AVATAR_BY_ID = Object.fromEntries(AVATARS.map((a) => [a.id, a]));
export const DEFAULT_AVATAR = "sloth";

// stats: { level, stars, trophies }
export function isAvatarUnlocked(avatar, stats) {
  const u = avatar.unlock;
  if (!u) return true;
  if (u.type === "level") return stats.level >= u.n;
  if (u.type === "stars") return stats.stars >= u.n;
  return stats.trophies >= u.n;
}

// Short, kid-friendly description of what a locked avatar needs
export function unlockText(avatar) {
  const u = avatar.unlock;
  if (!u) return "";
  if (u.type === "level") return `Reach level ${u.n}`;
  if (u.type === "stars") return `Collect ${u.n} stars`;
  return `Win ${u.n} gold trophies`;
}
