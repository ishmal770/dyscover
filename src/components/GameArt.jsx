// The picture for each game: a real photo of its animal (see data/pictures.js).
// Used on the game banners, the map circles, the lesson card and the home page.
import { pictureUrl } from "../data/pictures";

const PHOTOS = {
  parrotPairsGame: "parrot",
  syllableSafariGame: "elephant",
  monkeyMixUpGame: "monkey",
  lionsLettersGame: "lion",
  lizardLookoutsGame: "lizard",
  cheetahChallengeGame: "cheetah",
};

export const GAME_TITLES = {
  parrotPairsGame: { name: "Parrot Pairs", skill: "Letter order", tint: "#ffe3dc" },
  syllableSafariGame: { name: "Syllable Safari", skill: "Syllables", tint: "#e4ecf5" },
  monkeyMixUpGame: { name: "Monkey Mix-Up", skill: "Vowel sounds", tint: "#fdeccb" },
  lionsLettersGame: { name: "Lion's Letters", skill: "Handwriting", tint: "#fff0c2" },
  lizardLookoutsGame: { name: "Lizard Lookouts", skill: "Letter recognition", tint: "#dff3d3" },
  cheetahChallengeGame: { name: "Cheetah Challenge", skill: "Reading speed", tint: "#ffe9b8" },
};

function GameArt({ id, size = 80 }) {
  return (
    <span className="game-art" style={{ width: size, height: size }} aria-hidden="true">
      <img src={pictureUrl(PHOTOS[id])} alt="" draggable={false} />
    </span>
  );
}

export default GameArt;
