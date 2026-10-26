// The avatars a child can pick for their account, and what unlocks each one.
// Unlocks come from levels (earned with XP), stars, or jungle buddies met in the
// backpack (one per finished lesson). They are checked against the saved progress,
// so a child can never lose an avatar they have earned.

export const XP_PER_LEVEL = 40;

// level 1 at 0 XP, then one more level every XP_PER_LEVEL
export function levelFor(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, needed: XP_PER_LEVEL, percent: Math.round((into / XP_PER_LEVEL) * 100) };
}

// Seven human explorers (open-source portraits, see components/Avatar.jsx). `shirt` and `pants`
// are the colors of the outfit their full-body figure wears (components/PersonFigure.jsx). `treasures`
// counts the jungle buddies met so far (one per finished lesson).
export const AVATARS = [
  { id: "zara", name: "Zara", shirt: "#e8a33d", pants: "#5b4636", unlock: null },
  { id: "kai", name: "Kai", shirt: "#4a90d9", pants: "#2f3e5c", unlock: null },
  { id: "maya", name: "Maya", shirt: "#7ccf4a", pants: "#3f5b3a", unlock: { type: "level", n: 2 } },
  { id: "leo", name: "Leo", shirt: "#d9d0b8", pants: "#6b5b3e", unlock: { type: "stars", n: 3 } },
  { id: "amara", name: "Amara", shirt: "#e8574f", pants: "#3a3a4a", unlock: { type: "level", n: 3 } },
  { id: "sam", name: "Sam", shirt: "#9b6fd6", pants: "#34405f", unlock: { type: "treasures", n: 4 } },
  { id: "noor", name: "Noor", shirt: "#2fb3a3", pants: "#46506b", unlock: { type: "level", n: 5 } },
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
  return `Meet ${u.n} jungle buddies`;
}
