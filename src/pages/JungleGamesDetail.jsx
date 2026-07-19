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
    locked: true,
    lockNote: "Requires 2 stars in previous level",
  },
];

function JungleGamesDetail({ onHome, onMap }) {
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
    />
  );
}

export default JungleGamesDetail;
