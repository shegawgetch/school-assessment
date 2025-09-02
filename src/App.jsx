import { useState } from 'react'
import './App.css'
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./components/layout/Dashboard";
import Footer from "./components/layout/Footer";
import { Routes, Route } from 'react-router-dom';
import AdminCandidateUpload from './components/pages/AdminCandidateUpload';


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
            <Route path="/candidate-upload" element={<AdminCandidateUpload />} />
            <Route path="/" element={<Dashboard />} />

          </Routes>
        </main>
       {/* Footer */}
        <Footer /> 
      </div>
    </div>
  );
}

export default App;
