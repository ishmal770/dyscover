// The picture banner at the top of every game: the game's character, its name
// and the skill it practices.
import GameArt, { GAME_TITLES } from "./GameArt";
import "./GameBanner.css";

function GameBanner({ game }) {
  const info = GAME_TITLES[game];
  return (
    <div className="game-banner" style={{ "--banner-tint": info.tint }}>
      <GameArt id={game} size={72} />
      <div>
        <strong>{info.name}</strong>
        <span>{info.skill}</span>
      </div>
    </div>
  );
}

export default GameBanner;
