import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { BrowsePage } from "./pages/BrowsePage";
import { DashboardPage } from "./pages/DashboardPage";
import { MistakesPage } from "./pages/MistakesPage";
import { QuizPage } from "./pages/QuizPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StudyPage } from "./pages/StudyPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/mistakes" element={<MistakesPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
