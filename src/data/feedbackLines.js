// The right/wrong messages at the bottom of the games. They are recorded as audio clips
// (scripts/build_audio.py reads this list through spoken.js).
export const FEEDBACK_LINES = [
  "Perfect split!",
  "Not quite - slide the breaks to where the word splits into parts.",
  "Place all the pieces first!",
  "You built the word!",
  "Not quite the right order - tap a piece to swap it back.",
  "Great job! Those are the different letters.",
  "Not quite - try again!",
  "Here's a hint - the different letters are highlighted.",
  "Tap the letters in the second word that are different!",
  "Couldn't hear you - try again or tap the card.",
  "Try again!",
];

// good news gets the green style, everything else the warm one
export const isGoodFeedback = (text) => /^(perfect|you built|great)/i.test(text);
