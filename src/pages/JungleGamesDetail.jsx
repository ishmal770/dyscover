// World 1's "Detective Eye" style game list page. onPlayGame (passed down
// as onStartGame) is what actually launches a specific mini-game when its
// intro modal's Start button is clicked.
import WorldHub from "../components/WorldHub";

const ACTIVITIES = [
  {
    name: "Parrot Pairs",
    description: "Spot matching letters.",
    stars: 0,
  },
  {
    name: "Syllable Safari",
    description: "Put mixed up syllables into the correct word.",
    stars: 0,
  },
  {
    name: "Monkey Mix-Up",
    description: "Swing the vowels to complete the word.",
    stars: 0,
  },
];

function JungleGamesDetail({ onHome, onMap, onPlayGame }) {
  return (
    <WorldHub
      worldLabel="WORLD 1: JUNGLE GAMES"
      title="Jungle Games"
      activities={ACTIVITIES}
      progressLabel="World 1 Progress"
      masteryStars={2}
      masteryTotal={9}
      onHome={onHome}
      onMap={onMap}
      onStartGame={onPlayGame}
      guideInstructions="These are the Jungle Games. Tap a game to read about it. Then press Start Playing. Tap Map to go back to the map."
      guideMessage="Welcome to the Jungle Games! Tap a game to see how to play, then press Start."
    />
  );
}

export default JungleGamesDetail;
