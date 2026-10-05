// A picture for each word that can be pictured, so when a game asks for "tree"
// the child sees a tree. Words with no good picture (was, from, explain...) are
// left out and show no picture. Plain data.

export const WORD_PICTURES = {
  // animals
  cat: "🐱", dog: "🐶", pig: "🐷", frog: "🐸", crab: "🦀", duck: "🦆", fox: "🦊", fish: "🐟", bird: "🐦", lion: "🦁",
  clam: "🦪", elephant: "🐘", trunk: "🐘", wildlife: "🦒", angel: "👼", dad: "👨", son: "👦",
  // things
  hat: "🎩", cup: "🥤", pen: "🖊️", bed: "🛏️", bag: "👜", map: "🗺️", lamp: "💡", clock: "🕐", sun: "☀️", sunset: "🌅",
  tree: "🌳", forest: "🌲", river: "🏞️", beach: "🏖️", desert: "🏜️", dessert: "🍰", stone: "🪨", world: "🌍", planet: "🪐",
  bike: "🚲", rocket: "🚀", castle: "🏰", bridge: "🌉", garden: "🌷", winter: "❄️", silver: "🥈", jungle: "🌴", mountain: "⛰️",
  bench: "🪑", store: "🏪", saw: "🪚", cut: "✂️", top: "🔝", drip: "💧", step: "👣", stamp: "📮", spend: "💰",
  basket: "🧺", fabric: "🧵", problem: "🧩", mitten: "🧤", button: "🔘", picnic: "🥪", dentist: "🦷", muffin: "🧁",
  contest: "🏆", champion: "🏆", win: "🏆", treasure: "💎", explorer: "🧭", explore: "🧭", adventure: "🗺️", discover: "🔍",
  challenge: "🧗", understand: "💡", smile: "😊", calm: "😌", quiet: "🤫", angle: "📐", stationery: "✏️", principal: "🏫",
  blink: "👁️", jump: "🤸", play: "🎮", dig: "⛏️", breath: "💨", plum: "🍑", slime: "🟢", trail: "🥾",
};

export const pictureFor = (word) => WORD_PICTURES[word.toLowerCase()] || null;
