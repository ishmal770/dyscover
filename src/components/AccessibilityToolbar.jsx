import { Type, ZoomIn, Contrast, VolumeX } from "lucide-react";
import "./AccessibilityToolbar.css";

const ITEMS = [
  { icon: Type, label: "Font" },
  { icon: ZoomIn, label: "Size" },
  { icon: Contrast, label: "Contrast" },
  { icon: VolumeX, label: "Mute" },
];

function AccessibilityToolbar() {
  return (
    <div className="a11y-toolbar">
      {ITEMS.map(({ icon: Icon, label }) => (
        <button key={label} className="a11y-toolbar__btn">
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default AccessibilityToolbar;
