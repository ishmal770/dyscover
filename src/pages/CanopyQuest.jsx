import { useState } from "react";
import { TreePine, Image, ScanEye, Zap } from "lucide-react";
import WorldHub from "../components/WorldHub";
import GameIntroModal from "../components/GameIntroModal";

const ACTIVITIES = [
  {
    name: "Vine Match",
    description: "Match each word to its picture, then trace or draw the word.",
    icon: Image,
    stars: 0,
  },
  {
    name: "Letter Lookouts",
    description: "Learn to tell apart commonly confused letters through fun activities.",
    icon: ScanEye,
    stars: 0,
  },
  {
    name: "Cheetah Challenge",
    description: "Read words quickly before time runs out to build reading fluency.",
    icon: Zap,
    stars: 0,
    locked: true,
  },
];

function CanopyQuest() {
  const [activeActivity, setActiveActivity] = useState(null);

  return (
    <>
      <WorldHub
        worldLabel="WORLD 2: CANOPY QUEST"
        badgeIcon={TreePine}
        title="Canopy Quest"
        subtitle="Welcome to the jungle zone! Choose a site to start building words."
        masteryStars={2}
        masteryTotal={9}
        activities={ACTIVITIES}
        onPlay={setActiveActivity}
      />
      {activeActivity && (
        <GameIntroModal
          activityName={activeActivity.name}
          onClose={() => setActiveActivity(null)}
          onStart={() => setActiveActivity(null)}
        />
      )}
    </>
  );
}

export default CanopyQuest;
