// Shared header bar used on the onboarding pages (Homepage, Login,
// AdventureMap, PlacementMission). Games use the similar GameTopBar instead.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Backpack, Info, Settings, Volume2, VolumeX } from "lucide-react";
import logo from "../assets/dyscover-logo.png";
import { useAccessibility } from "../context/AccessibilityContext";
import InfoPopover from "./InfoPopover";
import SettingsPopover from "./SettingsPopover";
import "./TopBar.css";

function TopBar({ label, showLogo = false, onLogoClick, infoText }) {
  const navigate = useNavigate();
  const { muted, toggleMuted } = useAccessibility();
  const [openPanel, setOpenPanel] = useState(null); // null | "info" | "settings"

  return (
    <header className="topbar">
      <div className="topbar__side">
        {/* Only the Homepage passes showLogo; it links back to itself */}
        {showLogo && (
          <button className="topbar__logo" onClick={onLogoClick} aria-label="Go to homepage">
            <img src={logo} alt="DysCover" />
          </button>
        )}
      </div>
      <div className="topbar__label">{label}</div>
      <div className="topbar__side topbar__side--end">
        <button
          className="topbar__icon-btn"
          aria-label="Info"
          onClick={() => setOpenPanel(openPanel === "info" ? null : "info")}
        >
          <Info size={16} />
        </button>
        <button
          className="topbar__icon-btn"
          aria-label="Settings"
          onClick={() => setOpenPanel(openPanel === "settings" ? null : "settings")}
        >
          <Settings size={16} />
        </button>
        {/* Backpack icon jumps to the kid-facing treasures page */}
        <button className="topbar__icon-btn" aria-label="My backpack" onClick={() => navigate("/backpack")}>
          <Backpack size={16} />
        </button>
        <button
          className="topbar__icon-btn topbar__icon-btn--avatar"
          aria-label={muted ? "Unmute audio" : "Mute audio"}
          onClick={toggleMuted}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
      {openPanel === "info" && <InfoPopover text={infoText} onClose={() => setOpenPanel(null)} />}
      {openPanel === "settings" && <SettingsPopover onClose={() => setOpenPanel(null)} />}
    </header>
  );
}

export default TopBar;
