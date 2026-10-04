// Floating bottom-left toolbar shown on every game page. Toggles the shared
// AccessibilityContext state, so it stays in sync with the Settings panel
// opened from TopBar/GameTopBar's gear icon.
import { useSyncExternalStore } from "react";
import { Type, ZoomIn, Contrast, VolumeX, Volume2, HelpCircle } from "lucide-react";
import { getHelp, subscribeHelp, toggleHelp } from "../helpState";
import { useAccessibility } from "../context/AccessibilityContext";
import "./AccessibilityToolbar.css";

function AccessibilityToolbar() {
  const { size, readable, contrast, muted, cycleSize, toggleReadable, toggleContrast, toggleMuted } =
    useAccessibility();

  const helpOn = useSyncExternalStore(subscribeHelp, getHelp);

  const items = [
    { icon: Type, label: "Font", active: readable, onClick: toggleReadable, aria: "Toggle readable spacing" },
    { icon: ZoomIn, label: size === "md" ? "Size" : size.toUpperCase(), active: size !== "md", onClick: cycleSize, aria: "Cycle text size" },
    { icon: Contrast, label: "Contrast", active: contrast, onClick: toggleContrast, aria: "Toggle high contrast" },
    { icon: HelpCircle, label: "Help", active: helpOn, onClick: toggleHelp, aria: "Help: show a question mark on every button" },
    { icon: muted ? VolumeX : Volume2, label: "Mute", active: muted, onClick: toggleMuted, aria: muted ? "Unmute audio" : "Mute audio" },
  ];

  return (
    <div className="a11y-toolbar">
      {items.map(({ icon: Icon, label, active, onClick, aria }) => (
        <button
          key={label + aria}
          className={`a11y-toolbar__btn${active ? " a11y-toolbar__btn--active" : ""}`}
          onClick={onClick}
          aria-label={aria}
          aria-pressed={active}
          data-help-toggle={label === "Help" ? "true" : undefined}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default AccessibilityToolbar;
