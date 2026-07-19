import WorldHub from "../components/WorldHub";

const ACTIVITIES = [
  {
    name: "Vine Match",
    description: "Match each word to its picture.",
    stars: 0,
  },
  {
    name: "Letter Lookouts",
    description: "Tell apart commonly confused letters.",
    stars: 0,
  },
  {
    name: "Cheetah Challenge",
    description: "Read words quickly to build fluency.",
    stars: 0,
    locked: true,
    lockNote: "Requires 2 stars in previous level",
  },
];

function CanopyQuestDetail({ onHome, onMap }) {
  return (
    <WorldHub
      worldLabel="WORLD 2: CANOPY QUEST"
      title="Canopy Quest"
      activities={ACTIVITIES}
      progressLabel="World 2 Progress"
      masteryStars={2}
      masteryTotal={9}
      onHome={onHome}
      onMap={onMap}
    />
  );
}

export default CanopyQuestDetail;
