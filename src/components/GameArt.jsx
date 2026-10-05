// The picture for each game: a parrot and a lizard drawn in SVG, and the
// elephant, monkey, lion and cheetah illustrations. Used on the game banners,
// the map circles, the lesson card and the dashboard.
import elephant from "../assets/guides/elephant.png";
import monkey from "../assets/guides/monkey-swing.png";
import lion from "../assets/guides/lion.png";
import cheetah from "../assets/guides/cheetah.png";

function Parrot() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <path d="M6 100 Q60 90 114 102" fill="none" stroke="#8a5a2b" strokeWidth="7" strokeLinecap="round" />
      <path d="M96 98c8-4 14-2 16 2-6 4-12 3-16-2z" fill="#4caf50" />
      <path d="M52 86 L44 112 L54 104 L58 114 L64 98z" fill="#2f7fd0" />
      <path d="M60 80 L62 112 L70 102 L74 112 L72 80z" fill="#f5b301" />
      <ellipse cx="60" cy="62" rx="27" ry="34" fill="#e0453a" />
      <ellipse cx="62" cy="70" rx="15" ry="22" fill="#ff8f7a" />
      <path d="M34 56c-12 10-14 30-6 44 12-6 20-22 18-40z" fill="#2f7fd0" />
      <path d="M32 74c-4 6-4 14-1 20 6-3 10-9 10-16z" fill="#4cc3ff" />
      <circle cx="60" cy="34" r="21" fill="#e0453a" />
      <circle cx="52" cy="30" r="8" fill="#fff" />
      <circle cx="53" cy="31" r="4" fill="#222" />
      <circle cx="54.5" cy="29.5" r="1.4" fill="#fff" />
      <path d="M68 28c16 0 20 12 12 20-4 4-10 2-12-4z" fill="#f5b301" stroke="#c98f00" strokeWidth="2" strokeLinejoin="round" />
      <path d="M40 18c2-8 10-12 18-10-6 2-10 6-12 12z" fill="#2f7fd0" />
      <path d="M46 96l-2 6M54 96l-2 6M64 96l2 6M72 96l2 6" stroke="#e0a000" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Lizard() {
  return (
    <svg viewBox="0 0 140 100" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="70" cy="90" rx="52" ry="9" fill="#a8a08a" />
      <path d="M112 66c18-2 24-18 14-26-6-5-12 0-8 6 3 4 8 3 6 8-3 6-10 8-18 8z" fill="#5cb85c" stroke="#3a8c3a" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="68" cy="62" rx="44" ry="19" fill="#6fcf6f" stroke="#3a8c3a" strokeWidth="2" />
      <path d="M30 62c8 8 28 10 44 10s30-2 38-10" fill="#d4f5a8" opacity="0.7" />
      <circle cx="56" cy="54" r="4" fill="#3a8c3a" />
      <circle cx="74" cy="52" r="4" fill="#3a8c3a" />
      <circle cx="92" cy="56" r="4" fill="#3a8c3a" />
      <path d="M44 74l-8 12M62 78l-4 12M88 78l6 12M104 72l10 10" stroke="#3a8c3a" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="32" cy="52" rx="20" ry="16" fill="#6fcf6f" stroke="#3a8c3a" strokeWidth="2" />
      <circle cx="26" cy="44" r="7" fill="#fff" stroke="#3a8c3a" strokeWidth="2" />
      <circle cx="26" cy="44" r="3.5" fill="#222" />
      <path d="M16 60c4 3 10 3 14 0" fill="none" stroke="#3a8c3a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 56l-4 3 5 1z" fill="#e0453a" />
    </svg>
  );
}

const IMAGES = {
  syllableSafariGame: elephant,
  monkeyMixUpGame: monkey,
  lionsLettersGame: lion,
  cheetahChallengeGame: cheetah,
};

export const GAME_TITLES = {
  parrotPairsGame: { name: "Parrot Pairs", skill: "Visual Discrimination", tint: "#ffe3dc" },
  syllableSafariGame: { name: "Syllable Safari", skill: "Phonics", tint: "#e4ecf5" },
  monkeyMixUpGame: { name: "Monkey Mix-Up", skill: "Phonics", tint: "#fdeccb" },
  lionsLettersGame: { name: "Lion's Letters", skill: "Handwriting", tint: "#fff0c2" },
  lizardLookoutsGame: { name: "Lizard Lookouts", skill: "Visual Discrimination", tint: "#dff3d3" },
  cheetahChallengeGame: { name: "Cheetah Challenge", skill: "Reading Speed", tint: "#ffe9b8" },
};

function GameArt({ id, size = 80 }) {
  let art;
  if (id === "parrotPairsGame") art = <Parrot />;
  else if (id === "lizardLookoutsGame") art = <Lizard />;
  else art = <img src={IMAGES[id]} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
  return (
    <span className="game-art" style={{ width: size, height: size }} aria-hidden="true">
      {art}
    </span>
  );
}

export default GameArt;
