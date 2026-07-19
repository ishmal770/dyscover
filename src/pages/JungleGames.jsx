import { Blocks } from "lucide-react";
import WorldHubOverview from "../components/WorldHubOverview";

const ACTIVITIES = [
  {
    name: "Parrot Pairs",
    description: "Spot the matching letters hidden in two different words.",
    stars: 0,
  },
  {
    name: "Syllable Safari",
    description: "Split the words into syllables and then build the word out of it.",
    stars: 0,
  },
  {
    name: "Monkey Mix-Up",
    description: "Swing the vowel in the correct place to complete each word.",
    stars: 0,
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
