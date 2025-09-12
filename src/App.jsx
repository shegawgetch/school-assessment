import { useState } from "react";
import { Routes, Route } from "react-router-dom";

// Admin imports
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./components/layout/Dashboard";
import AdminCandidateUpload from "./components/pages/AdminCandidateUpload";
import CandidateFormDynamic from "./components/pages/CandidateFormDynamic";
import CandidateManager from "./components/pages/CandidateManager";
import AdminInvitationPage from "./components/pages/AdminInvitationPage";

// Candidate imports
import InvitationPage from "./components/pages/candidate/InvitationPage";
import TestPage from "./components/pages/candidate/TestPage";
import CompletionPage from "./components/pages/candidate/CompletionPage";
import PlainLayout from "./components/layout/PlainLayout";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Routes>
      {/* ===== Admin Routes ===== */}
      <Route
        path="/*"
        element={<AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
      >
        <Route index element={<Dashboard />} /> {/* Default page */}
        <Route path="manage-candidate" element={<CandidateManager />} />
        <Route path="add-candidates" element={<CandidateFormDynamic />} />
        <Route path="manage-invitations" element={<AdminInvitationPage />} />
        <Route path="upload-candidates" element={<AdminCandidateUpload />} />
      </Route>

      {/* ===== Candidate Routes ===== */}
      <Route element={<PlainLayout />}>
        <Route path="/invite/:token" element={<InvitationPage />} />
        <Route path="/test/:token" element={<TestPage />} />
        <Route path="/completion/:token" element={<CompletionPage />} />
      </Route>
    </Routes>
  );
}

export default App;
