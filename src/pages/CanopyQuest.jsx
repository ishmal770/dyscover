import { Blocks } from "lucide-react";
import WorldHubOverview from "../components/WorldHubOverview";

const ACTIVITIES = [
  {
    name: "Vine Match",
    description: "Match each word to its picture, then trace or draw the word.",
    stars: 0,
  },
  {
    name: "Letter Lookouts",
    description: "Learn to tell apart commonly confused letters through fun activities.",
    stars: 0,
  },
  {
    name: "Cheetah Challenge",
    description: "Read words quickly before time runs out to build reading fluency.",
    stars: 0,
    locked: true,
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
