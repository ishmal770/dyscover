// The placement mission: six quick "listen and tap the word you hear" questions,
// two for each grade band, easiest first. How far a child gets decides their
// grade band for every game (nobody picks it). Plain data, read by the audio script too.

export const PLACEMENT = [
  { band: "k2", word: "cat", choices: ["cut", "cat", "cot"] },
  { band: "k2", word: "dog", choices: ["dig", "dug", "dog"] },
  { band: "g35", word: "smile", choices: ["smile", "slime", "while"] },
  { band: "g35", word: "angle", choices: ["angel", "angry", "angle"] },
  { band: "g68", word: "explore", choices: ["explain", "expose", "explore"] },
  { band: "g68", word: "experiment", choices: ["excitement", "experiment", "expectations"] },
];

export const PLACEMENT_PROMPT = "Listen, then tap the word you hear.";
export const PLACEMENT_DONE = "All done! Great job. Your adventure is ready.";

// From the list of answers (true = right, one per question) to a grade band.
// A child needs a right answer in a band, and both in the band below it, to move up.
export function placeFromAnswers(answers) {
  const right = (band) => PLACEMENT.filter((q, i) => q.band === band && answers[i]).length;
  if (right("k2") >= 1 && right("g35") === 2 && right("g68") >= 1) return "g68";
  if (right("k2") >= 1 && right("g35") >= 1) return "g35";
  return "k2";
}
