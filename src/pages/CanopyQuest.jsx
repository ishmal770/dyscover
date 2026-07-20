import { Blocks } from "lucide-react";
import WorldHubOverview from "../components/WorldHubOverview";

const ACTIVITIES = [
  {
    name: "Lion's Letters",
    description: "Practice tracing and writing letters to build strong handwriting.",
    stars: 0,
  },
  {
    name: "Lizard Lookouts",
    description: "Train your eyes to spot tricky letters that like to switch places.",
    stars: 0,
  },
  {
    name: "Cheetah Challenge",
    description: "Read words as quickly as you can before time runs out.",
    stars: 0,
  },
];

function CanopyQuest({ onHome, onNext }) {
  return (
    <WorldHubOverview
      worldLabel="WORLD 2: CANOPY QUEST"
      pinIcon={Blocks}
      title="Canopy Quest"
      subtitle="Welcome to the jungle zone! Choose a site to start building words."
      masteryStars={2}
      masteryTotal={9}
      activities={ACTIVITIES}
      onPlay={onNext}
      onHome={onHome}
    />
  );
}

export default CanopyQuest;
