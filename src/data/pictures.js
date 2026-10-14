// The real photos used for words, quiz answers and jungles. They live in
// src/assets/pics (one small JPEG per name, from Wikipedia, with credits in
// pictureCredits.json - see scripts/fetch_pictures.py and the Credits page).
const files = import.meta.glob("../assets/pics/*.jpg", { eager: true, import: "default" });

const PICS = {};
for (const [path, url] of Object.entries(files)) PICS[path.split("/").pop().replace(".jpg", "")] = url;

// a few words share another word's photo
const ALIASES = { bike: "bicycle", trunk: "elephant", win: "contest", champion: "contest", explorer: "explore", clam: null };

// the photo for a name or word (lowercase), or null if there is none
export function pictureUrl(name) {
  const key = name.toLowerCase();
  const slug = key in ALIASES ? ALIASES[key] : key;
  return (slug && PICS[slug]) || null;
}
