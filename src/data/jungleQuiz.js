// "What jungle are you joining?" - four picture questions after login. Each
// answer points to one of three jungles; the most-picked one is the child's
// jungle (ties go to the first answer given). Plain data, read by the audio script too.

export const JUNGLES = {
  rainforest: { id: "rainforest", name: "Rainbow Rainforest", emoji: "🦜", color: "#2fbf71", blurb: "You love bright colors, birds, and swinging on vines!" },
  mountain: { id: "mountain", name: "Misty Mountain Jungle", emoji: "⛰️", color: "#5b9bd5", blurb: "You love adventure, climbing high, and finding sparkly crystals!" },
  river: { id: "river", name: "Sunny River Jungle", emoji: "🦦", color: "#f0a63a", blurb: "You love sunshine, splashing, and making new friends!" },
};

export const QUIZ = [
  {
    question: "What do you love to do most?",
    answers: [
      { label: "Swing on vines", emoji: "🌿", jungle: "rainforest" },
      { label: "Climb a high mountain", emoji: "🧗", jungle: "mountain" },
      { label: "Splash in the river", emoji: "💦", jungle: "river" },
    ],
  },
  {
    question: "Which jungle friend do you like best?",
    answers: [
      { label: "A colorful parrot", emoji: "🦜", jungle: "rainforest" },
      { label: "A cuddly panda", emoji: "🐼", jungle: "mountain" },
      { label: "A happy otter", emoji: "🦦", jungle: "river" },
    ],
  },
  {
    question: "What would you like to find?",
    answers: [
      { label: "A glowing flower", emoji: "🌺", jungle: "rainforest" },
      { label: "A sparkly crystal", emoji: "💎", jungle: "mountain" },
      { label: "A golden fish", emoji: "🐟", jungle: "river" },
    ],
  },
  {
    question: "What is your favorite weather?",
    answers: [
      { label: "Warm rain", emoji: "🌧️", jungle: "rainforest" },
      { label: "Cool mist", emoji: "🌫️", jungle: "mountain" },
      { label: "Bright sunshine", emoji: "☀️", jungle: "river" },
    ],
  },
];

export const QUIZ_INTRO = "Let's find out which jungle you are joining! Pick the picture you like best.";

// The jungle picked most often (ties go to the earliest answer)
export function sortIntoJungle(picks) {
  const counts = {};
  picks.forEach((p) => (counts[p] = (counts[p] || 0) + 1));
  return [...new Set(picks)].sort((a, b) => counts[b] - counts[a])[0];
}

export function resultText(jungleId) {
  const j = JUNGLES[jungleId];
  return `You are joining the ${j.name}! ${j.blurb}`;
}

export const QUIZ_LINES = [
  QUIZ_INTRO,
  ...QUIZ.flatMap((q) => [q.question, ...q.answers.map((a) => a.label)]),
  ...Object.keys(JUNGLES).map(resultText),
];
