// The vine doors: a bonus game that opens after a day of lessons (the daily goal is reached).
// There are two doors. TODAY'S DOOR has a few vines; spending XP cuts them (10 XP a vine) and
// the gem behind it goes into the backpack. The GOLDEN DOOR has more vines and a rarer prize, so
// the child chooses: spend XP now on today's door, or save it for the golden door.
// No questions - the choice is what to do with the XP. Plain data (the audio script reads it too).

export const DOORS = {
  daily: { name: "Today's door", vines: 3, cost: 10 },
  golden: { name: "Golden door", vines: 8, cost: 10 },
};
export const VINE_COST = 10;

// the gems behind today's door, one a day, in order
export const DOOR_GEMS = [
  { id: "ruby", name: "Ruby" },
  { id: "sapphire", name: "Sapphire" },
  { id: "amethyst", name: "Amethyst" },
  { id: "topaz", name: "Topaz" },
  { id: "diamond", name: "Diamond" },
  { id: "opal", name: "Opal" },
];
// the better prizes behind the golden door
export const GOLDEN_PRIZES = [
  { id: "crown", name: "Golden Crown" },
  { id: "gold", name: "Gold Crystals" },
  { id: "treasure", name: "Treasure Hoard" },
];

export const prizeFor = (kind, count) => {
  const list = kind === "golden" ? GOLDEN_PRIZES : DOOR_GEMS;
  return list[count % list.length];
};

export const DOOR_INTRO = "You finished a day of lessons! Spend your XP to cut the vines on today's door and find a gem. Or save your XP for the golden door and an even better prize.";
export const DOOR_CONFIRM = "Spend 10 XP to cut this vine, or save your XP for the golden door?";
export const DOOR_NEED_XP = "You need more XP to cut a vine. Finish more lessons to earn it.";
export const DOOR_OPEN = "The door is open! Tap the prize to put it in your backpack.";
export const prizeFoundLine = (prize) => `You found the ${prize.name}! It is in your backpack.`;

export const DOOR_LINES = [
  DOOR_INTRO,
  DOOR_CONFIRM,
  DOOR_NEED_XP,
  DOOR_OPEN,
  ...DOOR_GEMS.map(prizeFoundLine),
  ...GOLDEN_PRIZES.map(prizeFoundLine),
];
