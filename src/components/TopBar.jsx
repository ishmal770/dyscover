import { Info, Settings, Trophy, Volume2 } from "lucide-react";
import logo from "../assets/dyscover-logo.png";
import "./TopBar.css";

function TopBar({ label, showLogo = false, onLogoClick }) {
  return (
    <header className="topbar">
      <div className="topbar__side">
        {showLogo && (
          <button className="topbar__logo" onClick={onLogoClick} aria-label="Go to homepage">
            <img src={logo} alt="DysCover" />
          </button>
        )}
      </div>
      <div className="topbar__label">{label}</div>
      <div className="topbar__side topbar__side--end">
        <button className="topbar__icon-btn" aria-label="Info">
          <Info size={16} />
        </button>
        <button className="topbar__icon-btn" aria-label="Settings">
          <Settings size={16} />
        </button>
        <button className="topbar__icon-btn" aria-label="Achievements">
          <Trophy size={16} />
        </button>
        <button className="topbar__icon-btn topbar__icon-btn--avatar" aria-label="Sound">
          <Volume2 size={14} />
        </button>
      </div>
    </header>
  );
}

export default TopBar;
