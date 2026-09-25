// World 1 top-level hub ("Sound Builder" 3-card overview). Static list of
// the 3 Jungle Games mini-games with their descriptions.
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
      // Any card's "Play Now" just advances to the JungleGamesDetail list
      // page (the specific activity clicked isn't used to pick a game here)
      onPlay={onNext}
      onHome={onHome}
    />
  );
}

export default JungleGames;
