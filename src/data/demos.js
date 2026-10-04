// Animated "how to play" demos, one per game, shown by components/GameDemo.jsx.
// Each demo is a tiny stage (rows of pretend game pieces) and a list of steps.
// A step has a spoken caption, an optional `cursor` (the id of the piece the
// pretend finger moves to) and `set` (pieces that change after the finger
// arrives: `{ id: "state" }` or `{ id: { state, text } }`).
// Plain data, read by the audio script too, so every caption has a recorded voice.

const tiles = (word, prefix) => [...word].map((ch, i) => ({ id: `${prefix}${i}`, kind: "tile", text: ch }));

export const DEMOS = {
  parrotPairsGame: {
    title: "How to play Parrot Pairs",
    rows: [
      { items: tiles("CAT", "a") },
      { items: tiles("CUT", "b") },
      { items: [{ id: "btn", kind: "button", text: "Check Answer" }] },
    ],
    steps: [
      { caption: "Look at the two words. They look almost the same." },
      { caption: "Tap the letter that is different in the top word.", cursor: "a1", set: { a1: "selected" } },
      { caption: "Now tap the different letter in the bottom word.", cursor: "b1", set: { b1: "selected" } },
      { caption: "Press Check Answer.", cursor: "btn", set: { btn: "pressed" } },
      { caption: "Great job! You found the mixed-up letters.", set: { a1: "correct", b1: "correct" } },
    ],
  },

  syllableSafariGame: {
    title: "How to play Syllable Safari",
    rows: [
      { items: [{ id: "pic", kind: "emoji", text: "🐯" }] },
      { items: [...tiles("TI", "l"), { id: "gap", kind: "gap" }, ...tiles("GER", "m")] },
      { items: [{ id: "b1", kind: "box", text: "" }, { id: "b2", kind: "box", text: "" }] },
      { items: [{ id: "p1", kind: "tile", text: "TI" }, { id: "p2", kind: "tile", text: "GER" }] },
      { items: [{ id: "btn", kind: "button", text: "Check Word" }] },
    ],
    steps: [
      { caption: "Look at the picture and listen to the word. It is tiger." },
      { caption: "Tap between the letters where the word splits into parts.", cursor: "gap", set: { gap: "placed" } },
      { caption: "Now build the word. Tap a piece to pick it up.", cursor: "p1", set: { p1: "selected" } },
      { caption: "Then tap a box to put it in.", cursor: "b1", set: { b1: { state: "filled", text: "TI" }, p1: "used" } },
      { caption: "Do the same with the next piece.", cursor: "p2", set: { p2: "selected" } },
      { caption: "Put it in the second box.", cursor: "b2", set: { b2: { state: "filled", text: "GER" }, p2: "used" } },
      { caption: "Press Check Word. Great job!", cursor: "btn", set: { btn: "pressed", b1: { state: "correct", text: "TI" }, b2: { state: "correct", text: "GER" } } },
    ],
  },

  monkeyMixUpGame: {
    title: "How to play Monkey Mix-Up",
    rows: [
      { items: [{ id: "s", kind: "tile", text: "S" }, { id: "blank", kind: "box", text: "?" }, { id: "n", kind: "tile", text: "N" }] },
      { items: [{ id: "sound", kind: "button", text: "Hear the sound" }] },
      { items: ["A", "E", "I", "O", "U"].map((v) => ({ id: `k${v}`, kind: "key", text: v })) },
      { items: [{ id: "btn", kind: "button", text: "Next" }] },
    ],
    steps: [
      { caption: "Look at the word. A vowel is missing.", cursor: "blank" },
      { caption: "Tap the sound button to hear the sound. It says uh.", cursor: "sound", set: { sound: "pressed" } },
      { caption: "Tap the vowel that makes that sound.", cursor: "kU", set: { kU: "selected" } },
      { caption: "The vowel fills the word. It spells sun!", set: { blank: { state: "correct", text: "U" }, kU: "correct" } },
      { caption: "Press Next to keep going.", cursor: "btn", set: { btn: "pressed" } },
    ],
  },

  lionsLettersGame: {
    title: "How to play Lion's Letters",
    rows: [
      { items: [{ id: "snd", kind: "button", text: "Tap to hear the letter" }] },
      { items: [{ id: "paper", kind: "canvas", text: "c" }] },
      { items: [{ id: "btn", kind: "button", text: "Continue" }] },
    ],
    steps: [
      { caption: "Tap the sound box to hear the letter.", cursor: "snd", set: { snd: "pressed" } },
      { caption: "Now trace the letter with your finger. Follow the faint letter on the lines.", cursor: "paper", set: { paper: "tracing" } },
      { caption: "Keep your letter sitting on the line. Then press Continue.", cursor: "btn", set: { btn: "pressed" } },
    ],
  },

  lizardLookoutsGame: {
    title: "How to play Lizard Lookouts",
    rows: [
      { items: [{ id: "find", kind: "label", text: "Find every b" }] },
      { items: [...tiles("abigbed", "t")] },
    ],
    steps: [
      { caption: "Look for the tricky letter. Today it is b." },
      { caption: "Tap every b you can find.", cursor: "t1", set: { t1: "correct" } },
      { caption: "Keep going until you find them all.", cursor: "t4", set: { t4: "correct" } },
      { caption: "If you tap a different letter, it shakes. Just try again.", cursor: "t2", set: { t2: "wrong" } },
      { caption: "Then trace the letter and find it in the paragraph too." },
    ],
  },

  cheetahChallengeGame: {
    title: "How to play Cheetah Challenge",
    rows: [
      { items: tiles("FOX", "w") },
      { items: [{ id: "meter", kind: "meter", text: "" }] },
      { items: [{ id: "mic", kind: "button", text: "Say it" }] },
    ],
    steps: [
      { caption: "A word shows up on the screen." },
      { caption: "Read the word out loud before the timer runs out.", cursor: "meter", set: { meter: "running" } },
      { caption: "Press the microphone button and say the word.", cursor: "mic", set: { mic: "pressed" } },
      { caption: "You did it! You beat the clock.", set: { w0: "correct", w1: "correct", w2: "correct", meter: "done" } },
    ],
  },
};

export const DEMO_LINES = Object.values(DEMOS).flatMap((d) => [d.title, ...d.steps.map((s) => s.caption)]);
