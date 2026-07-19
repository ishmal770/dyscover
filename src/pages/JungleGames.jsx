import WorldHub from "../components/WorldHub";

const ACTIVITIES = [
  {
    name: "Parrot Pairs",
    description: "Find matching sounds/patterns.",
    stars: 0,
  },
  {
    name: "Syllable Safari",
    description: "Put mixed-up syllables in the correct order.",
    stars: 0,
  },
  {
    name: "Elephant Echo",
    description: "Listen to a word, then write each letter.",
    stars: 0,
    locked: true,
    lockNote: "Requires 2 stars in previous level",
  },
];

function JungleGames({ onHome, onMap }) {
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

export default JungleGames;
