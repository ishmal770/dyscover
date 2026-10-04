// The questions for every game, in three grade bands with exactly 10 each.
// The child's band (picked at login, changeable on the profile page) decides
// which set a game uses. Plain data only, so the audio script can read it.

export const GRADE_BANDS = [
  { id: "k2", label: "Grades K-2", short: "K-2" },
  { id: "g35", label: "Grades 3-5", short: "3-5" },
  { id: "g68", label: "Grades 6-8", short: "6-8" },
];

// ---- Parrot Pairs: find the letters that differ between two look-alike words
const parrot = {
  k2: [
    ["CAT", "CUT"], ["BIG", "BAG"], ["DOG", "DIG"], ["WAS", "SAW"], ["TOP", "TIP"],
    ["BAD", "DAD"], ["NOT", "TON"], ["PIG", "PEG"], ["SUN", "SON"], ["HAT", "HIT"],
  ],
  g35: [
    ["SMILE", "SLIME"], ["ANGEL", "ANGLE"], ["QUIET", "QUITE"], ["FORM", "FROM"], ["TRIAL", "TRAIL"],
    ["THEN", "THAN"], ["WORLD", "WORD"], ["STONE", "STORE"], ["BEACH", "BENCH"], ["CLAM", "CALM"],
  ],
  g68: [
    ["EXPECTATIONS", "EXPLANATIONS"], ["EXCEPTIONS", "EXPRESSIONS"], ["EXCITEMENT", "EXPERIMENT"], ["DESSERT", "DESERT"], ["AFFECT", "EFFECT"],
    ["BREATH", "BREATHE"], ["EXPLAIN", "EXPLORE"], ["PRINCIPAL", "PRINCIPLE"], ["STATIONARY", "STATIONERY"], ["ACCEPT", "EXCEPT"],
  ],
};

// ---- Syllable Safari: split a word into syllables, then build it back.
// `picture` is shown with the word.
const syllable = {
  k2: [
    { word: "TIGER", syllables: ["TI", "GER"], picture: "🐯" },
    { word: "RABBIT", syllables: ["RAB", "BIT"], picture: "🐰" },
    { word: "PENCIL", syllables: ["PEN", "CIL"], picture: "✏️" },
    { word: "BASKET", syllables: ["BAS", "KET"], picture: "🧺" },
    { word: "MONKEY", syllables: ["MON", "KEY"], picture: "🐵" },
    { word: "FLOWER", syllables: ["FLOW", "ER"], picture: "🌸" },
    { word: "PUPPY", syllables: ["PUP", "PY"], picture: "🐶" },
    { word: "CANDY", syllables: ["CAN", "DY"], picture: "🍬" },
    { word: "ROBOT", syllables: ["RO", "BOT"], picture: "🤖" },
    { word: "PIZZA", syllables: ["PIZ", "ZA"], picture: "🍕" },
  ],
  g35: [
    { word: "BUTTERFLY", syllables: ["BUT", "TER", "FLY"], picture: "🦋" },
    { word: "ELEPHANT", syllables: ["EL", "E", "PHANT"], picture: "🐘" },
    { word: "COMPUTER", syllables: ["COM", "PU", "TER"], picture: "💻" },
    { word: "BANANA", syllables: ["BA", "NAN", "A"], picture: "🍌" },
    { word: "DINOSAUR", syllables: ["DI", "NO", "SAUR"], picture: "🦖" },
    { word: "UMBRELLA", syllables: ["UM", "BREL", "LA"], picture: "☂️" },
    { word: "TOMATO", syllables: ["TO", "MA", "TO"], picture: "🍅" },
    { word: "KANGAROO", syllables: ["KAN", "GA", "ROO"], picture: "🦘" },
    { word: "HAMBURGER", syllables: ["HAM", "BUR", "GER"], picture: "🍔" },
    { word: "VOLCANO", syllables: ["VOL", "CA", "NO"], picture: "🌋" },
  ],
  g68: [
    { word: "TELEPHONE", syllables: ["TEL", "E", "PHONE"], picture: "☎️" },
    { word: "HELICOPTER", syllables: ["HEL", "I", "COP", "TER"], picture: "🚁" },
    { word: "ALLIGATOR", syllables: ["AL", "LI", "GA", "TOR"], picture: "🐊" },
    { word: "WATERMELON", syllables: ["WA", "TER", "MEL", "ON"], picture: "🍉" },
    { word: "PINEAPPLE", syllables: ["PINE", "AP", "PLE"], picture: "🍍" },
    { word: "MICROSCOPE", syllables: ["MI", "CRO", "SCOPE"], picture: "🔬" },
    { word: "ASTRONAUT", syllables: ["AS", "TRO", "NAUT"], picture: "🧑‍🚀" },
    { word: "CATERPILLAR", syllables: ["CAT", "ER", "PIL", "LAR"], picture: "🐛" },
    { word: "BICYCLE", syllables: ["BI", "CY", "CLE"], picture: "🚲" },
    { word: "SKATEBOARD", syllables: ["SKATE", "BOARD"], picture: "🛹" },
  ],
};

// ---- Monkey Mix-Up: tap the missing vowel (`sound` is the short vowel sound)
const monkey = {
  k2: [
    { template: ["S", null, "N"], answer: "U", sound: "uh" },
    { template: ["C", null, "T"], answer: "A", sound: "aa" },
    { template: ["P", null, "G"], answer: "I", sound: "ih" },
    { template: ["D", null, "G"], answer: "O", sound: "aw" },
    { template: ["B", null, "D"], answer: "E", sound: "eh" },
    { template: ["C", null, "P"], answer: "U", sound: "uh" },
    { template: ["H", null, "T"], answer: "A", sound: "aa" },
    { template: ["W", null, "N"], answer: "I", sound: "ih" },
    { template: ["T", null, "P"], answer: "O", sound: "aw" },
    { template: ["P", null, "N"], answer: "E", sound: "eh" },
  ],
  g35: [
    { template: ["F", "R", null, "G"], answer: "O", sound: "aw" },
    { template: ["P", "L", null, "M"], answer: "U", sound: "uh" },
    { template: ["C", "R", null, "B"], answer: "A", sound: "aa" },
    { template: ["D", "R", null, "P"], answer: "I", sound: "ih" },
    { template: ["S", "T", null, "P"], answer: "E", sound: "eh" },
    { template: ["T", "R", null, "N", "K"], answer: "U", sound: "uh" },
    { template: ["S", "T", null, "M", "P"], answer: "A", sound: "aa" },
    { template: ["B", "L", null, "N", "K"], answer: "I", sound: "ih" },
    { template: ["S", "P", null, "N", "D"], answer: "E", sound: "eh" },
    { template: ["C", "L", null, "C", "K"], answer: "O", sound: "aw" },
  ],
  g68: [
    { template: ["B", null, "S", "K", "E", "T"], answer: "A", sound: "aa" },
    { template: ["F", null, "B", "R", "I", "C"], answer: "A", sound: "aa" },
    { template: ["P", "R", null, "B", "L", "E", "M"], answer: "O", sound: "aw" },
    { template: ["C", "O", "N", "T", null, "S", "T"], answer: "E", sound: "eh" },
    { template: ["M", null, "T", "T", "E", "N"], answer: "I", sound: "ih" },
    { template: ["B", null, "T", "T", "O", "N"], answer: "U", sound: "uh" },
    { template: ["P", null, "C", "N", "I", "C"], answer: "I", sound: "ih" },
    { template: ["D", null, "N", "T", "I", "S", "T"], answer: "E", sound: "eh" },
    { template: ["M", null, "F", "F", "I", "N"], answer: "U", sound: "uh" },
    { template: ["S", null, "N", "S", "E", "T"], answer: "U", sound: "uh" },
  ],
};

// ---- Lion's Letters: 5 letters, each followed by a word to write (10 questions).
// Always lowercase.
const lion = {
  k2: [["c", "cat"], ["a", "map"], ["o", "dog"], ["d", "sun"], ["g", "pen"]],
  g35: [["b", "bike"], ["h", "jump"], ["k", "frog"], ["p", "lamp"], ["y", "play"]],
  g68: [["e", "jungle"], ["l", "planet"], ["f", "bridge"], ["j", "castle"], ["q", "rocket"]],
};

// ---- Lizard Lookouts: find the tricky letter in a sentence and a paragraph.
// Letters cycle b, d, p, q, b, d, p, q, b, d (the letters that flip most).
const LIZARD_LETTERS = ["b", "d", "p", "q", "b", "d", "p", "q", "b", "d"];
const LIZARD_REMINDERS = {
  b: "The bat comes before the ball when drawing a 'b'.",
  d: "The ball comes before the bat when drawing a 'd'.",
  p: "It's like half a lollipop. Draw the stick, then the lollipop on the right side.",
  q: "Take your time! A 'q' has a circle first, then a tail pointing down.",
};
const lizardText = {
  k2: [
    ["The big bug is on the bed.", "A baby bear has a ball. The bear bounces it on the bed. Bob the bug says, boo!"],
    ["The dog dug a deep den.", "Dad did a dance. The duck and the dog dig in the dirt, and Dad sees a big drum."],
    ["A pig put a pan on the pot.", "Pat has a pink pen. The puppy plays with the pup in the park, and a pig naps on a pad."],
    ["The queen has a quilt.", "The quiet queen had a quick quiz. A quail quacks, quack quack, and the queen quits."],
    ["A bee buzzed by the bus.", "Ben has a big box. In the box is a bat, a bell, and a bag of buns."],
    ["I did a drip drop dance.", "Dan has a red door. The doll is on the desk, and Dad adds a dish of dates."],
    ["Pete picked a plum.", "Pam put a pup in a pen. The pup hops up, and Pam pats the pup on the top."],
    ["The quail is quick.", "A quick quail ran by the queen. The queen asked, quack or quail? Then she quit."],
    ["Bob bit a big bun.", "Bill and Bob bake a bun. The bun is hot, so they blow, and Bob bites a bit."],
    ["The deer did a dip.", "A deer and a duck did a dip in the pond. The ducks dunk and the deer drinks."],
  ],
  g35: [
    ["The big bear bit a ripe apple by the barn.", "Ben bounced his big blue ball beside the barn. A brown bunny bounded by, and Ben laughed as the ball bumped along the bumpy path back to his backpack."],
    ["The dark deer drowned in a deep ditch.", "Daisy the friendly duck danced down a dusty dirt path. She discovered a tiny dragonfly on a dandelion and carried it back to her den before dinner."],
    ["The pig put a pepper by the pandit.", "Paul and his playful puppy walked to the park on a pleasant morning. They passed pretty purple flowers and tall pine trees."],
    ["The quiet queen quit quickly.", "Quinn, the quiet queen, packed a quilt and a quick snack. She found a duck quacking and a quail hiding in the garden."],
    ["A bright blue butterfly balanced on the branch.", "Beth the beekeeper brought a basket to the bright blossoms. The buzzing bees bumped along beside her, and she smiled at the busy hive."],
    ["Dan's dad drove down the bumpy road.", "Dana and her dad drove down a dusty road to the lake. They dipped their feet in the cold water and dried them in the sun."],
    ["The playful panda picked a pear.", "Pedro the panda packed a picnic in the park. He placed a plate of peaches and pears on a blanket and shared them with his pals."],
    ["The quick quail quivered in the quiet quarry.", "Quentin quizzed his pals about the old quarry. A quail squeaked, the quartz sparkled, and the pals quietly explored."],
    ["Bobby bakes big, bubbly bread buns.", "Bobby and his brother baked bread before breakfast. The bubbling dough bounced in the bowl, and the buns browned beautifully."],
    ["The diver dived deep to find the drum.", "A daring diver dove down to the ocean floor. She discovered a drum, a dented bucket, and a dazzling school of fish."],
  ],
  g68: [
    ["Barbara bravely balanced on the bumpy boulder.", "Barbara and her brother hiked beyond the bamboo to a beautiful, bubbling brook. They boiled water, bandaged a blister, and bundled their belongings before dusk."],
    ["The dedicated detective discovered a dangerous disguise.", "Deep in the dense, dark woods, the detective followed a dirt trail. Dozens of deer tracks led down a hidden ditch, and she decided to dig deeper."],
    ["The persistent photographer captured a perfect peacock.", "Priya prepared her camera for a peaceful morning at the preserve. A proud peacock paraded past, spreading purple and green plumage, and Priya photographed every pose."],
    ["The inquisitive queen questioned the quarrelsome squire.", "Queen Quinlan quietly inquired about the quest. The squire quivered, requested a pause, and quoted an ancient proverb about quality and courage."],
    ["The brilliant biologist observed a rare bird.", "Beyond the boundary of the bog, the biologist spotted a rare bird. She jotted down every behavior, balanced her binoculars, and published a brief report."],
    ["The daring drummer delivered a dazzling solo.", "The drummer had practiced for days. When the lights dimmed, she drummed a bold, dramatic beat that made the whole audience dance."],
    ["The pilot proposed a plan to repair the propeller.", "Pilot Priya inspected the plane's propeller and spotted a deep dent. She proposed a plan, prepared the proper tools, and repaired it in plenty of time."],
    ["The squirrel quickly acquired quite a squash.", "A squirrel squeezed through a square opening in the fence. It acquired a plump squash, quarreled with a squawking crow, and quietly scampered away."],
    ["The bold explorer climbed above the breathtaking bluff.", "Bold and brave, the explorer climbed above the bluff. A bright rainbow bridged the valley below, and she breathed in the beauty before heading back."],
    ["The daring dancer dazzled the delighted crowd.", "Dana had practiced her dance for dozens of days. On the day of the show, the drums started and she danced across the stage, delighting the whole crowd."],
  ],
};
const lizard = Object.fromEntries(
  Object.entries(lizardText).map(([band, rows]) => [
    band,
    rows.map(([sentence, paragraph], i) => {
      const letter = LIZARD_LETTERS[i];
      return {
        pairLabel: letter === "b" || letter === "d" ? "b vs d" : "p vs q",
        letter,
        sentence,
        paragraph,
        reminder: LIZARD_REMINDERS[letter],
      };
    }),
  ])
);

// ---- Cheetah Challenge: read each word out loud before the time runs out
const cheetah = {
  k2: ["FOX", "DOG", "CAT", "SUN", "TREE", "BIRD", "FISH", "FROG", "DUCK", "LION"],
  g35: ["JUNGLE", "RIVER", "PLANET", "BRIDGE", "CASTLE", "FOREST", "ROCKET", "GARDEN", "WINTER", "SILVER"],
  g68: ["ADVENTURE", "ELEPHANT", "MOUNTAIN", "DISCOVER", "TREASURE", "EXPLORER", "CHAMPION", "WILDLIFE", "CHALLENGE", "UNDERSTAND"],
};

export const BANKS = {
  parrot: Object.fromEntries(Object.entries(parrot).map(([b, rows]) => [b, rows.map(([word1, word2]) => ({ word1, word2 }))])),
  syllable,
  monkey,
  lion: Object.fromEntries(
    Object.entries(lion).map(([b, pairs]) => [
      b,
      pairs.flatMap(([letter, word]) => [{ type: "letter", value: letter }, { type: "word", value: word }]),
    ])
  ),
  lizard,
  cheetah,
};

// Sanity check at load: every game has exactly 10 questions in every band
for (const [game, bands] of Object.entries(BANKS)) {
  for (const { id } of GRADE_BANDS) {
    if (bands[id].length !== 10) throw new Error(`${game}/${id} must have 10 questions, has ${bands[id].length}`);
  }
}
