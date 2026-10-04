// Header bar used inside every mini-game. Shows a "Games > GameName"
// breadcrumb (gameName is passed in by each game so it always matches the
// game's real in-app name) plus the same icon row as TopBar.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Backpack, Info, Settings, Volume2, VolumeX } from "lucide-react";
import logo from "../assets/dyscover-logo.png";
import { useAccessibility } from "../context/AccessibilityContext";
import InfoPopover from "./InfoPopover";
import SettingsPopover from "./SettingsPopover";
import "./GameTopBar.css";

function GameTopBar({ gameName, onHome, onBack }) {
  const navigate = useNavigate();
  const { muted, toggleMuted } = useAccessibility();
  const [openPanel, setOpenPanel] = useState(null); // null | "info" | "settings"

  return (
    <header className="gametopbar">
      <button className="gametopbar__logo" onClick={onHome} aria-label="Go to homepage">
        <img src={logo} alt="DysCover" />
      </button>
      <div className="gametopbar__breadcrumb">
        {/* "Games" crumb takes you back to the world's game list (Detective Eye page) */}
        <button onClick={onBack}>Games</button>
        <span>&gt;</span>
        <span className="gametopbar__breadcrumb-current">{gameName}</span>
      </div>
      <div className="gametopbar__icons">
        <button
          className="gametopbar__icon-btn"
          aria-label="Info"
          onClick={() => setOpenPanel(openPanel === "info" ? null : "info")}
        >
          <Info size={16} />
        </button>
        <button
          className="gametopbar__icon-btn"
          aria-label="Settings"
          onClick={() => setOpenPanel(openPanel === "settings" ? null : "settings")}
        >
          <Settings size={16} />
        </button>
        {/* Backpack icon jumps to the kid-facing treasures page */}
        <button className="gametopbar__icon-btn" aria-label="My backpack" onClick={() => navigate("/backpack")}>
          <Backpack size={16} />
        </button>
        <button
          className="gametopbar__icon-btn gametopbar__icon-btn--avatar"
          aria-label={muted ? "Unmute audio" : "Mute audio"}
          onClick={toggleMuted}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
      {openPanel === "info" && (
        <InfoPopover
          text={`You're playing ${gameName}! Tap any speaker icon to hear words read aloud, and use the buttons on screen to answer.`}
          onClose={() => setOpenPanel(null)}
        />
      )}
      {openPanel === "settings" && <SettingsPopover onClose={() => setOpenPanel(null)} />}
    </header>
  );
}

export default GameTopBar;
