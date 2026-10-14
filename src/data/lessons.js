// The learning path: two units, each a short sequence of lessons (games) in the order a
// child learns: vowel sounds, then recognizing letters, then writing them (Jungle Games),
// then building and reading longer words (Canopy Quest). A lesson's id is the game's
// section key in KidGameApp, so the same id is used to jump to it and to save progress.
//
// Unlock rule (see ProgressContext): the first lesson of a unit is open once the unit is
// open, every later lesson opens once the one before it has been finished.

export const UNITS = [
  {
    id: "jungle",
    sectionKey: "map", // both units live on the adventure map
    title: "Jungle Games",
    tagline: "Letters and sounds",
    lessons: [
      { id: "monkeyMixUpGame", name: "Monkey Mix-Up", blurb: "Find the missing vowel to finish each word.", skill: "Vowel sounds" },
      { id: "lizardLookoutsGame", name: "Lizard Lookouts", blurb: "Spot the tricky letters that like to switch places.", skill: "Letter recognition" },
      { id: "lionsLettersGame", name: "Lion's Letters", blurb: "Listen, then trace letters and words on the lines.", skill: "Handwriting" },
    ],
  },
  {
    id: "canopy",
    sectionKey: "map",
    title: "Canopy Quest",
    tagline: "Words and reading",
    lessons: [
      { id: "syllableSafariGame", name: "Syllable Safari", blurb: "Build words from their syllables, then find where they split.", skill: "Syllables" },
      { id: "parrotPairsGame", name: "Parrot Pairs", blurb: "Spot the letters that are different in the second word.", skill: "Letter order" },
      { id: "cheetahChallengeGame", name: "Cheetah Challenge", blurb: "Read each word out loud before the time runs out.", skill: "Reading speed" },
    ],
  },
];

export const LESSONS = UNITS.flatMap((unit) =>
  unit.lessons.map((lesson, index) => ({ ...lesson, unitId: unit.id, unitTitle: unit.title, indexInUnit: index }))
);

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
