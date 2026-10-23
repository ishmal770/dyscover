// The vine door: a bonus game that opens after a day of lessons (the daily goal is reached).
// A door is covered in VINES. To cut a vine the child answers a question and spends VINE_COST
// of the XP they earned in their lessons. Cut every vine and the gem behind the door goes into
// their backpack. One door a day. Plain data (the audio script reads it too).
import { POOL } from "./placement.js";

export const VINES = 3;
export const VINE_COST = 10; // XP spent per vine (a day's goal is 30 XP, so one day pays for one door)

// the gems behind the doors, in order
export const DOOR_GEMS = [
  { id: "ruby", name: "Ruby" },
  { id: "sapphire", name: "Sapphire" },
  { id: "amethyst", name: "Amethyst" },
  { id: "topaz", name: "Topaz" },
  { id: "diamond", name: "Diamond" },
  { id: "opal", name: "Opal" },
];
export const gemFor = (count) => DOOR_GEMS[count % DOOR_GEMS.length];

// A vine's question: they alternate between "hear the word" and "missing vowel", taken from
// the child's grade band and spread out so a day's three questions are different.
export function vineQuestion(band, step, seed) {
  const type = step % 2 === 0 ? "word" : "vowel";
  const pool = POOL[band].filter((q) => q.type === type);
  return pool[(seed + step) % pool.length];
}

export const DOOR_INTRO = "You finished a day of lessons! Tap a vine, answer the question, and spend some XP to cut it down. Cut every vine to get the gem.";
export const DOOR_NEED_XP = "You need more XP to cut a vine. Finish more lessons to earn it.";
export const DOOR_OPEN = "The door is open! Tap the gem to put it in your backpack.";
export const gemFoundLine = (gem) => `You found the ${gem.name}! It is in your backpack.`;

export const DOOR_LINES = [DOOR_INTRO, DOOR_NEED_XP, DOOR_OPEN, ...DOOR_GEMS.map(gemFoundLine)];
