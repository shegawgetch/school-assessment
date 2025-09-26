import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Invitations from './pages/Invitations';
import NewInvitation from './pages/NewInvitation';
import InvitationDetails from './pages/InvitationDetails';
import InvitationSettings from './pages/InvitationSettings';
import CandidateShortlist from './pages/CandidateShortlist';
import CandidateShortlistMRT from './pages/CandidateShortlistMRT';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
      <div className="min-h-screen bg-gray-50">
              <Toaster position="top-right" />
               <ToastContainer position="top-right" autoClose={3000} />


        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Topbar */}
        <Topbar toggleSidebar={toggleSidebar} />

        {/* Main content */}
        <main className=" md:ml-64 p-6 pt-3 transition-all duration-200">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invitations" element={<Invitations />} />
            <Route path="/invitations/new" element={<NewInvitation />} />
            <Route path="/invitations/:id" element={<InvitationDetails />} />
            <Route path="/invitation-settings" element={<InvitationSettings />} />
            <Route path="/candidate-shortlisting" element={<CandidateShortlistMRT />} />
          </Routes>
        </main>
      </div>
  );
}

export default App;
