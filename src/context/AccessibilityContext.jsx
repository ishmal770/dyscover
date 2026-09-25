// Shared accessibility state (text size, high contrast, readable spacing,
// mute) used by AccessibilityToolbar, the Settings panel, and TopBar's
// sound icon, so all of those controls stay in sync no matter which one
// the user touches. Persists to localStorage so it survives a reload.
import { createContext, useContext, useEffect, useState } from "react";
import { setSpeechMuted } from "../components/GameHintBubble";

const SIZES = ["md", "lg", "xl"];
const STORAGE_KEY = "dyscover-a11y";

const AccessibilityContext = createContext(null);

function loadInitial() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) return saved;
  } catch {
    // ignore malformed/missing storage
  }
  return { size: "md", readable: false, contrast: false, muted: false };
}

function AccessibilityProvider({ children }) {
  const [state, setState] = useState(loadInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("a11y-readable", state.readable);
    root.classList.toggle("a11y-contrast", state.contrast);
    SIZES.forEach((s) => root.classList.remove(`a11y-size-${s}`));
    if (state.size !== "md") root.classList.add(`a11y-size-${state.size}`);
    setSpeechMuted(state.muted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function cycleSize() {
    setState((s) => ({ ...s, size: SIZES[(SIZES.indexOf(s.size) + 1) % SIZES.length] }));
  }
  function toggleReadable() {
    setState((s) => ({ ...s, readable: !s.readable }));
  }
  function toggleContrast() {
    setState((s) => ({ ...s, contrast: !s.contrast }));
  }
  function toggleMuted() {
    setState((s) => ({ ...s, muted: !s.muted }));
  }

  return (
    <AccessibilityContext.Provider value={{ ...state, cycleSize, toggleReadable, toggleContrast, toggleMuted }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}

export { AccessibilityProvider, useAccessibility };
