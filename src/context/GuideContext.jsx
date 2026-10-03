// Which jungle guide the child has chosen (sloth or monkey). Shared so every
// page's guide shows the same character, and remembered across visits.
import { createContext, useContext, useState } from "react";

const GUIDES = {
  sloth: { id: "sloth", name: "Sunny", label: "Sunny the Sloth" },
  monkey: { id: "monkey", name: "Momo", label: "Momo the Monkey" },
};
const STORAGE_KEY = "dyscover-guide";

const GuideContext = createContext(null);

function GuideProvider({ children }) {
  const [characterId, setCharacterId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && GUIDES[saved]) return saved;
    } catch {
      // storage unavailable - fall back to the default guide
    }
    return "sloth";
  });

  function chooseGuide(id) {
    if (!GUIDES[id]) return;
    setCharacterId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // choice just won't persist
    }
  }

  return (
    <GuideContext.Provider value={{ guide: GUIDES[characterId], guides: GUIDES, chooseGuide }}>
      {children}
    </GuideContext.Provider>
  );
}

function useGuide() {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error("useGuide must be used within GuideProvider");
  return ctx;
}

export { GuideProvider, useGuide };
