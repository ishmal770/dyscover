// Top-level router: splits the kid-facing game app from the adult-facing
// Backpack / Clinical / Expert dashboard pages.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import { GuideProvider } from "./context/GuideContext";
import { ProgressProvider } from "./context/ProgressContext";
import HelpMode from "./components/HelpMode";
import DevTools from "./components/DevTools";
import KidGameApp from "./KidGameApp"; // the horizontal-scroll game experience
import Backpack from "./pages/Backpack";
import Credits from "./pages/Credits";
import ExpertDashboard from "./pages/ExpertDashboard";

function App() {
  return (
    <AccessibilityProvider>
      <GuideProvider>
      <ProgressProvider>
      <BrowserRouter>
        <HelpMode />
        <DevTools />
        <Routes>
          {/* Main kid app: onboarding, worlds, and all mini-games */}
          <Route path="/" element={<KidGameApp />} />
          {/* Kid-visible rewards page (treasures and gems), linked from the backpack icon in the top bar */}
          <Route path="/backpack" element={<Backpack />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/trophy-room" element={<Navigate to="/backpack" replace />} />
          {/* Personal progress dashboard; backend scopes it to the signed-in user. */}
          <Route path="/clinical" element={<Navigate to="/expert" replace />} />
          <Route path="/clinical/:studentId" element={<Navigate to="/expert" replace />} />
          <Route path="/expert" element={<ExpertDashboard />} />
        </Routes>
      </BrowserRouter>
      </ProgressProvider>
      </GuideProvider>
    </AccessibilityProvider>
  );
}

export default App;
