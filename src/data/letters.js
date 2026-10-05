// How letters are said aloud. A bare letter name like "see" or "bee" sounds like
// an ordinary word (sea, bee), so letters are always said inside a short phrase:
// "The letter C." or, when a child is learning the letter, "The letter C, as in cat."
// Plain data, read by the audio script too.

export const LETTER_WORDS = {
  a: "apple", b: "ball", c: "cat", d: "dog", e: "egg", f: "fish", g: "goat", h: "hat", i: "igloo",
  j: "jump", k: "kite", l: "lion", m: "moon", n: "nest", o: "octopus", p: "pig", q: "queen",
  r: "rabbit", s: "sun", t: "tree", u: "umbrella", v: "van", w: "web", x: "box", y: "yellow", z: "zebra",
};

export const letterName = (letter) => `The letter ${letter.toUpperCase()}.`;
export const letterIntro = (letter) => `The letter ${letter.toUpperCase()}, as in ${LETTER_WORDS[letter.toLowerCase()]}.`;

export const LETTER_LINES = Object.keys(LETTER_WORDS).flatMap((l) => [letterName(l), letterIntro(l)]);
