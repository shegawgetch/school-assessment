import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NewInvitation from './pages/NewInvitation';
import InvitationDetails from './pages/InvitationDetails';
import InvitationSettings from './pages/InvitationSettings';
import CandidateShortlistMRT from './pages/CandidateShortlistMRT';
import Invitations from './pages/Invitations';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // default light mode

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div
      className={`${isDarkMode ? 'dark' : ''} min-h-screen font-sans`}
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
          },
        }}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDarkMode ? 'dark' : 'light'}
      />

      <Router>
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Topbar */}
        <Topbar toggleSidebar={toggleSidebar} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

        {/* Main content */}
        <main
          className="md:ml-64 p-6 pt-2 transition-all duration-200"
          style={{
            backgroundColor: 'var(--secondary)',
            color: 'var(--foreground)',
          }}
        >
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
      </Router>
    </div>
  );
}

export default App;
