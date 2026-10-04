// Top-level router: splits the kid-facing game app from the adult-facing
// Trophy Room / Clinical / Expert dashboard pages.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import { GuideProvider } from "./context/GuideContext";
import { ProgressProvider } from "./context/ProgressContext";
import KidGameApp from "./KidGameApp"; // the horizontal-scroll game experience
import TrophyRoom from "./pages/TrophyRoom";
import ClinicalOverview from "./pages/ClinicalOverview";
import ClinicalStudentDetail from "./pages/ClinicalStudentDetail";
import ExpertDashboard from "./pages/ExpertDashboard";

function App() {
  return (
    <AccessibilityProvider>
      <GuideProvider>
      <ProgressProvider>
      <BrowserRouter>
        <Routes>
          {/* Main kid app: onboarding, worlds, and all mini-games */}
          <Route path="/" element={<KidGameApp />} />
          {/* Kid-visible rewards page, linked from the trophy icon in the top bar */}
          <Route path="/trophy-room" element={<TrophyRoom />} />
          {/* Aggregate progress dashboard for parents/clinicians */}
          <Route path="/clinical" element={<ClinicalOverview />} />
          {/* Per-student deep dive, linked from the Clinical Overview table */}
          <Route path="/clinical/:studentId" element={<ClinicalStudentDetail />} />
          {/* Restricted diagnostics view for learning specialists */}
          <Route path="/expert" element={<ExpertDashboard />} />
        </Routes>
      </BrowserRouter>
      </ProgressProvider>
      </GuideProvider>
    </AccessibilityProvider>
  );
}

export default App;
