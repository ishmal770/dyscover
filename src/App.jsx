import { BrowserRouter, Routes, Route } from "react-router-dom";
import KidGameApp from "./KidGameApp";
import TrophyRoom from "./pages/TrophyRoom";
import ClinicalOverview from "./pages/ClinicalOverview";
import ClinicalStudentDetail from "./pages/ClinicalStudentDetail";
import ExpertDashboard from "./pages/ExpertDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KidGameApp />} />
        <Route path="/trophy-room" element={<TrophyRoom />} />
        <Route path="/clinical" element={<ClinicalOverview />} />
        <Route path="/clinical/:studentId" element={<ClinicalStudentDetail />} />
        <Route path="/expert" element={<ExpertDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
