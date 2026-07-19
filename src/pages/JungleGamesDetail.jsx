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
    />
  );
}

export default JungleGamesDetail;
