import { Info, Settings, Trophy, Volume2 } from "lucide-react";
import logo from "../assets/dyscover-logo.png";
import "./GameTopBar.css";

function GameTopBar({ gameName, onHome, onBack }) {
  return (
    <header className="gametopbar">
      <button className="gametopbar__logo" onClick={onHome} aria-label="Go to homepage">
        <img src={logo} alt="DysCover" />
      </button>
      <div className="gametopbar__breadcrumb">
        <button onClick={onBack}>Games</button>
        <span>&gt;</span>
        <span className="gametopbar__breadcrumb-current">{gameName}</span>
      </div>
      <div className="gametopbar__icons">
        <button className="gametopbar__icon-btn" aria-label="Info">
          <Info size={16} />
        </button>
        <button className="gametopbar__icon-btn" aria-label="Settings">
          <Settings size={16} />
        </button>
        <button className="gametopbar__icon-btn" aria-label="Achievements">
          <Trophy size={16} />
        </button>
        <button className="gametopbar__icon-btn gametopbar__icon-btn--avatar" aria-label="Sound">
          <Volume2 size={14} />
        </button>
      </div>
    </header>
  );
}

export default GameTopBar;
