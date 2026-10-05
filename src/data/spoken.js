// Every line of new spoken text that lives in data files rather than in a page,
// collected in one place so scripts/build_audio.py can record them all.
// Plain data (.js imports only) so Node can read it.
import { LESSONS, UNITS } from "./lessons.js";
import { TREASURES, GATE_TEXT_LINES } from "./treasures.js";
import { DEMO_LINES } from "./demos.js";
import { HELP_TIP_LINES } from "./helpTips.js";
import { QUIZ_LINES } from "./jungleQuiz.js";
import { BANKS } from "./questionBanks.js";
import { LETTER_LINES } from "./letters.js";
import { PLACEMENT, PLACEMENT_DONE, PLACEMENT_PROMPT } from "./placement.js";

// read in the neutral voice
export const NEUTRAL_LINES = [
  "My Backpack",
  ...LESSONS.map((l) => `${l.name}. ${l.blurb}`),
  ...UNITS.map((u) => `${u.title}. ${u.tagline}`),
  ...Object.values(TREASURES).map((t) => `${t.name}. ${t.blurb}`),
  ...GATE_TEXT_LINES,
  ...DEMO_LINES,
  ...HELP_TIP_LINES,
  ...QUIZ_LINES,
  PLACEMENT_PROMPT,
  PLACEMENT_DONE,
  ...LETTER_LINES,
  ...PLACEMENT.map((q) => q.word),
];

// the sloth reads the jungle quiz and the placement result
export const SLOTH_LINES = [...QUIZ_LINES, PLACEMENT_DONE];

// words, letters and syllable pieces the games say (lowercase)
export const WORDS = [
  ...BANKS.parrot.k2, ...BANKS.parrot.g35, ...BANKS.parrot.g68,
].flatMap((r) => [r.word1, r.word2])
  .concat(Object.values(BANKS.syllable).flat().map((r) => r.word))
  .concat(Object.values(BANKS.cheetah).flat())
  .concat(Object.values(BANKS.lion).flat().filter((r) => r.type === "word").map((r) => r.value))
  .concat(
    Object.values(BANKS.monkey).flat().map((r) => r.template.map((c) => c ?? r.answer).join(""))
  )
  .map((w) => w.toLowerCase());

export const LETTERS = [...new Set(Object.values(BANKS.lion).flat().filter((r) => r.type === "letter").map((r) => r.value))];

export const PIECES = [...new Set(Object.values(BANKS.syllable).flat().flatMap((r) => r.syllables.map((s) => s.toLowerCase())))];
