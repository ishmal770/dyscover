// Small dropdown opened from the Settings (gear) icon in TopBar/GameTopBar.
// Exposes the same controls as AccessibilityToolbar so pages that don't
// render the toolbar (Homepage, Login) still have a way to reach them.
import { Type, ZoomIn, Contrast, VolumeX, Volume2, X } from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";
import "./SettingsPopover.css";

function SettingsPopover({ onClose }) {
  const { size, readable, contrast, muted, cycleSize, toggleReadable, toggleContrast, toggleMuted } =
    useAccessibility();

  return (
    <div className="settings-popover__backdrop" onClick={onClose}>
      <div className="settings-popover" onClick={(e) => e.stopPropagation()}>
        <div className="settings-popover__header">
          <h2>Settings</h2>
          <button className="settings-popover__close" onClick={onClose} aria-label="Close settings">
            <X size={16} />
          </button>
        </div>

        <button className={`settings-popover__row${readable ? " is-active" : ""}`} onClick={toggleReadable}>
          <Type size={16} />
          <span>Readable spacing</span>
          <span className="settings-popover__state">{readable ? "On" : "Off"}</span>
        </button>

        <button className="settings-popover__row" onClick={cycleSize}>
          <ZoomIn size={16} />
          <span>Text size</span>
          <span className="settings-popover__state">
            {size === "md" ? "Default" : size === "lg" ? "Large" : "Extra Large"}
          </span>
        </button>

        <button className={`settings-popover__row${contrast ? " is-active" : ""}`} onClick={toggleContrast}>
          <Contrast size={16} />
          <span>High contrast</span>
          <span className="settings-popover__state">{contrast ? "On" : "Off"}</span>
        </button>

        <button className={`settings-popover__row${muted ? " is-active" : ""}`} onClick={toggleMuted}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>Spoken audio</span>
          <span className="settings-popover__state">{muted ? "Muted" : "On"}</span>
        </button>
      </div>
    </div>
  );
}

export default SettingsPopover;
