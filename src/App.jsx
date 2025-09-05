import { useState } from 'react'
import './App.css'
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./components/layout/Dashboard";
import Footer from "./components/layout/Footer";
import { Routes, Route } from 'react-router-dom';
import AdminCandidateUpload from './components/pages/AdminCandidateUpload';
import CandidateFormDynamic from './components/pages/CandidateFormDynamic';
import CandidateManager from './components/pages/CandidateManager';
import AdminInvitationPage from './components/pages/AdminInvitationPage';


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 m-0 flex flex-col overflow-hidden">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/manage-candidate" element={<CandidateManager />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-candidates" element={<CandidateFormDynamic />} />
            <Route path="/manage-invitations" element={<AdminInvitationPage />} />



          </Routes>
        </main>
       {/* Footer */}
        <Footer /> 
      </div>
    </div>
  );
}

export default App;
