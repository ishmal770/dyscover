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
  },
];

function CanopyQuestDetail({ onHome, onMap, onPlayGame }) {
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
      onStartGame={onPlayGame}
    />
  );
}

export default CanopyQuestDetail;
