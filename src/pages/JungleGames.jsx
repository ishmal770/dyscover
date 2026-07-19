import { Blocks } from "lucide-react";
import WorldHubOverview from "../components/WorldHubOverview";

const ACTIVITIES = [
  {
    name: "Parrot Pairs",
    description: "Find the matching sounds and patterns between words.",
    stars: 0,
  },
  {
    name: "Syllable Safari",
    description: "Put mixed-up syllable blocks in the correct order to form words.",
    stars: 0,
  },
  {
    name: "Elephant Echo",
    description: "Listen to a word, then write each letter by following the sounds.",
    stars: 0,
    locked: true,
  },
];

function JungleGames({ onHome, onNext }) {
  return (
    <WorldHubOverview
      worldLabel="WORLD 1: JUNGLE GAMES"
      pinIcon={Blocks}
      title="Jungle Games"
      subtitle="Welcome to the jungle zone! Choose a site to start building words."
      masteryStars={2}
      masteryTotal={9}
      activities={ACTIVITIES}
      onPlay={onNext}
      onHome={onHome}
    />
  );
}

export default JungleGames;
