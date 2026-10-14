// The placement mission: questions that mirror the practice games - "listen and tap the
// word you hear" and "tap the missing vowel" (like Monkey Mix-Up) - and that adapt.
// It starts at the grade band the child chose, then moves up a band after a right
// answer and down a band after a wrong one. After QUESTION_COUNT questions, the band
// it would ask next is the child's level, and every game uses that band's questions.
// Plain data, read by the audio script too.

import { BANKS } from "./questionBanks.js";

export const BANDS = ["k2", "g35"];
export const QUESTION_COUNT = 6;

export const VOWELS = ["A", "E", "I", "O", "U"];

// a "tap the missing vowel" question made from a Monkey Mix-Up question
function vowelQuestion(r) {
  return { type: "vowel", word: r.template.map((c) => c ?? r.answer).join("").toLowerCase(), template: r.template, answer: r.answer };
}

// a pool of questions for each band, easiest band first
export const POOL = {
  k2: [
    { type: "word", word: "cat", choices: ["cut", "cat", "cot"] },
    { type: "word", word: "dog", choices: ["dig", "dug", "dog"] },
    { type: "word", word: "pig", choices: ["peg", "pig", "pug"] },
    { type: "word", word: "top", choices: ["tip", "top", "tap"] },
    ...BANKS.monkey.k2.slice(0, 3).map(vowelQuestion),
  ],
  g35: [
    { type: "word", word: "smile", choices: ["smile", "slime", "while"] },
    { type: "word", word: "angle", choices: ["angel", "angry", "angle"] },
    { type: "word", word: "stone", choices: ["store", "stone", "stove"] },
    { type: "word", word: "beach", choices: ["bench", "beach", "bleach"] },
    ...BANKS.monkey.g35.slice(0, 3).map(vowelQuestion),
  ],
};

export const PLACEMENT_WORDS = Object.values(POOL).flatMap((qs) => qs.map((q) => q.word));
export const PLACEMENT_PROMPT = "Listen, then tap the word you hear.";
export const PLACEMENT_VOWEL_PROMPT = "Listen, then tap the vowel that is missing.";
export const PLACEMENT_DONE = "All done! Great job. Your adventure is ready.";

// the first question of this type in a band that has not been asked yet (the questions
// alternate between the two types)
export function pickQuestion(band, askedWords, type) {
  const pool = POOL[band].filter((q) => q.type === type);
  return pool.find((q) => !askedWords.includes(q.word)) || pool[0];
}

// one band up after a right answer, one down after a wrong one (never off the ends)
export function nextBand(band, correct) {
  const i = BANDS.indexOf(band) + (correct ? 1 : -1);
  return BANDS[Math.max(0, Math.min(BANDS.length - 1, i))];
}
