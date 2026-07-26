import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, Volume2, Share2, Star, Play, ArrowLeft } from "lucide-react";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import { speak } from "../components/GameHintBubble";
import { GAME_TROPHIES, SKILL_FILTERS } from "../data/mockData";
import "./TrophyRoom.css";

function TrophyRoom() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [shareMessage, setShareMessage] = useState("");

  const totalStars = GAME_TROPHIES.flatMap((w) => w.games).reduce((sum, g) => sum + g.stars, 0);
  const masteredCount = GAME_TROPHIES.flatMap((w) => w.games).filter((g) => g.mastered).length;

  async function handleShare() {
    const summary = `I've earned ${totalStars} stars and mastered ${masteredCount} games on DysCover!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My DysCover Progress", text: summary });
        return;
      } catch {
        // user cancelled or share failed - fall through to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(summary);
      setShareMessage("Copied your progress summary to the clipboard!");
      setTimeout(() => setShareMessage(""), 3000);
    }
  }

  return (
    <div className="trophy-room">
      <header className="trophy-room__header">
        <button className="trophy-room__back" onClick={() => navigate("/")} aria-label="Back to game">
          <ArrowLeft size={16} />
        </button>
        <div className="trophy-room__badge">
          <Trophy size={22} />
        </div>
        <div className="trophy-room__heading">
          <h1>
            My Trophy Room
            <button onClick={() => speak("My Trophy Room")} aria-label="Read aloud">
              <Volume2 size={15} />
            </button>
          </h1>
          <p>Look at all the amazing things you've learned!</p>
        </div>
        <button className="trophy-room__share" onClick={handleShare}>
          <Share2 size={14} /> Share Progress
        </button>
      </header>

      {shareMessage && <p className="trophy-room__share-message">{shareMessage}</p>}

      <div className="trophy-room__filters">
        <span>Filter by skill</span>
        <div className="trophy-room__filter-pills">
          {SKILL_FILTERS.map((skill) => (
            <button
              key={skill}
              className={`trophy-room__pill${filter === skill ? " is-active" : ""}`}
              onClick={() => setFilter(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {GAME_TROPHIES.map(({ world, games }) => {
        const visibleGames = filter === "All" ? games : games.filter((g) => g.skill === filter);
        if (visibleGames.length === 0) return null;
        return (
          <section key={world} className="trophy-room__world">
            <h2>
              {world}
              <button onClick={() => speak(world)} aria-label="Read aloud">
                <Volume2 size={13} />
              </button>
            </h2>
            <div className="trophy-room__cards">
              {visibleGames.map((game) => (
                <div key={game.name} className="trophy-room__card">
                  <div className="trophy-room__thumb">
                    {game.mastered && <span className="trophy-room__ribbon">Mastered!</span>}
                    <Trophy size={28} />
                  </div>
                  <h3>{game.name}</h3>
                  <span className="trophy-room__skill-tag">{game.skill}</span>
                  <div className="trophy-room__stars">
                    {[0, 1, 2].map((i) => (
                      <Star key={i} size={14} fill={i < game.stars ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <Link className="btn btn--primary btn--block" to={`/?play=${game.routeKey}`}>
                    <Play size={12} fill="currentColor" /> Play Again
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <AccessibilityToolbar />
    </div>
  );
}

export default TrophyRoom;
