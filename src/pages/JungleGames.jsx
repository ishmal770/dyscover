import { useState } from "react";
import { Bird, Headphones, Puzzle, Ear } from "lucide-react";
import WorldHub from "../components/WorldHub";
import GameIntroModal from "../components/GameIntroModal";

const ACTIVITIES = [
  {
    name: "Parrot Pairs",
    description: "Find the matching sounds and patterns between words.",
    icon: Headphones,
    stars: 0,
  },
  {
    name: "Syllable Safari",
    description: "Put mixed-up syllable blocks in the correct order to form words.",
    icon: Puzzle,
    stars: 0,
  },
  {
    name: "Elephant Echo",
    description: "Listen to a word, then write each letter by following the sounds.",
    icon: Ear,
    stars: 0,
    locked: true,
  },
];

function JungleGames() {
  const [activeActivity, setActiveActivity] = useState(null);

  return (
    <>
      <WorldHub
        worldLabel="WORLD 1: JUNGLE GAMES"
        badgeIcon={Bird}
        title="Jungle Games"
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

export default JungleGames;
