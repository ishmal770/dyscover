// The learning path: two units (worlds), each a short sequence of lessons.
// A lesson is one of the mini-games; its id is the game's section key in
// KidGameApp, so the same id is used to jump to it and to save progress.
//
// Unlock rule (see ProgressContext): the first lesson of each unit is open,
// every later lesson opens once the one before it has been finished.

export const UNITS = [
  {
    id: "jungle",
    sectionKey: "map", // both units live on the adventure map
    title: "Jungle Games",
    tagline: "Spot letters and build words",
    lessons: [
      { id: "parrotPairsGame", name: "Parrot Pairs", blurb: "Spot the letters that got mixed up between two words.", skill: "Visual Discrimination" },
      { id: "syllableSafariGame", name: "Syllable Safari", blurb: "Split words into syllables, then build them back.", skill: "Phonics" },
      { id: "monkeyMixUpGame", name: "Monkey Mix-Up", blurb: "Find the missing vowel to finish each word.", skill: "Phonics" },
    ],
  },
  {
    id: "canopy",
    sectionKey: "map",
    title: "Canopy Quest",
    tagline: "Trace, look closely, and read fast",
    lessons: [
      { id: "lionsLettersGame", name: "Lion's Letters", blurb: "Listen, then trace letters and words on the lines.", skill: "Handwriting" },
      { id: "lizardLookoutsGame", name: "Lizard Lookouts", blurb: "Spot the tricky letters that like to switch places.", skill: "Visual Discrimination" },
      { id: "cheetahChallengeGame", name: "Cheetah Challenge", blurb: "Read each word out loud before the time runs out.", skill: "Reading Speed" },
    ],
  },
];

export const LESSONS = UNITS.flatMap((unit) =>
  unit.lessons.map((lesson, index) => ({ ...lesson, unitId: unit.id, unitTitle: unit.title, indexInUnit: index }))
);

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
