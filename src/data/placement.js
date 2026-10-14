// The placement mission: "listen and tap the word you hear" questions that adapt.
// It starts at the grade band the child chose, then moves up a band after a right
// answer and down a band after a wrong one. After QUESTION_COUNT questions, the band
// it would ask next is the child's level, and every game uses that band's questions.
// Plain data, read by the audio script too.

export const BANDS = ["k2", "g35", "g68"];
export const QUESTION_COUNT = 6;

// a pool of questions for each band, easiest band first
export const POOL = {
  k2: [
    { word: "cat", choices: ["cut", "cat", "cot"] },
    { word: "dog", choices: ["dig", "dug", "dog"] },
    { word: "pig", choices: ["peg", "pig", "pug"] },
    { word: "top", choices: ["tip", "top", "tap"] },
  ],
  g35: [
    { word: "smile", choices: ["smile", "slime", "while"] },
    { word: "angle", choices: ["angel", "angry", "angle"] },
    { word: "stone", choices: ["store", "stone", "stove"] },
    { word: "beach", choices: ["bench", "beach", "bleach"] },
  ],
  g68: [
    { word: "explore", choices: ["explain", "expose", "explore"] },
    { word: "experiment", choices: ["excitement", "experiment", "expectations"] },
    { word: "expectations", choices: ["explanations", "expectations", "exceptions"] },
    { word: "excitement", choices: ["excitement", "experiment", "exceptions"] },
  ],
};

export const PLACEMENT_WORDS = Object.values(POOL).flatMap((qs) => qs.map((q) => q.word));
export const PLACEMENT_PROMPT = "Listen, then tap the word you hear.";
export const PLACEMENT_DONE = "All done! Great job. Your adventure is ready.";

// the first question in a band that has not been asked yet
export function pickQuestion(band, askedWords) {
  const pool = POOL[band];
  return pool.find((q) => !askedWords.includes(q.word)) || pool[0];
}

// one band up after a right answer, one down after a wrong one (never off the ends)
export function nextBand(band, correct) {
  const i = BANDS.indexOf(band) + (correct ? 1 : -1);
  return BANDS[Math.max(0, Math.min(BANDS.length - 1, i))];
}
