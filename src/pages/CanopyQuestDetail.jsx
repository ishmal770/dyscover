import WorldHub from "../components/WorldHub";

const ACTIVITIES = [
  {
    name: "Lion's Letters",
    description: "Practice tracing and writing letters.",
    stars: 0,
  },
  {
    name: "Lizard Lookouts",
    description: "Train your eyes to spot tricky letters.",
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
