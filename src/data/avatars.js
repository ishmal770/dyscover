// The avatars a child can pick for their account, and what unlocks each one.
// Unlocks come from levels (earned with XP), stars, or treasures found in the
// backpack (one per finished lesson). They are checked against the saved progress,
// so a child can never lose an avatar they have earned.

export const XP_PER_LEVEL = 40;

// level 1 at 0 XP, then one more level every XP_PER_LEVEL
export function levelFor(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, needed: XP_PER_LEVEL, percent: Math.round((into / XP_PER_LEVEL) * 100) };
}

// Seven human explorers (drawn in components/ExplorerArt.jsx). `treasures` is
// how many treasures (finished lessons) have gone into the backpack.
export const AVATARS = [
  { id: "zara", name: "Zara", unlock: null },
  { id: "kai", name: "Kai", unlock: null },
  { id: "maya", name: "Maya", unlock: { type: "level", n: 2 } },
  { id: "leo", name: "Leo", unlock: { type: "stars", n: 3 } },
  { id: "amara", name: "Amara", unlock: { type: "level", n: 3 } },
  { id: "sam", name: "Sam", unlock: { type: "treasures", n: 4 } },
  { id: "noor", name: "Noor", unlock: { type: "level", n: 5 } },
];

export const AVATAR_BY_ID = Object.fromEntries(AVATARS.map((a) => [a.id, a]));
export const DEFAULT_AVATAR = "zara";

// stats: { level, stars, treasures }
export function isAvatarUnlocked(avatar, stats) {
  const u = avatar.unlock;
  if (!u) return true;
  if (u.type === "level") return stats.level >= u.n;
  if (u.type === "stars") return stats.stars >= u.n;
  return stats.treasures >= u.n;
}

// Short, kid-friendly description of what a locked avatar needs
export function unlockText(avatar) {
  const u = avatar.unlock;
  if (!u) return "";
  if (u.type === "level") return `Reach level ${u.n}`;
  if (u.type === "stars") return `Collect ${u.n} stars`;
  return `Find ${u.n} treasures`;
}
