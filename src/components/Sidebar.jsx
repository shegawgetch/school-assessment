import React from "react";
import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import { Link, useLocation } from "react-router-dom";
import { Switch } from "@mui/material";
import useCandidateStore from "../store/candidateStore";
import { MoonIcon } from "@heroicons/react/24/outline";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { theme, toggleTheme } = useCandidateStore();

  const handleLinkClick = () => {
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const links = [
    { to: "/", label: "Dashboard", icon: Squares2X2Icon },
    { to: "/invitations", label: "Invitations", icon: EnvelopeIcon },
    { to: "/invitation-settings", label: "Invitation Settings", icon: Cog6ToothIcon },
    { to: "/candidate-shortlisting", label: "Candidate Shortlisting", icon: ClipboardDocumentListIcon },
  ];

  return (
    <>
      <aside
        className={`fixed z-50 top-0 left-0 w-64 
          bg-sidebar text-sidebar-foreground
          border-r border-sidebar-border
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0 py-2" : "-translate-x-full"} 
          md:translate-x-0 min-h-screen shadow-xl`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-sidebar-border">
            <h2 className="text-xl font-bold tracking-wide text-sidebar-foreground">
              Admin Panel
            </h2>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {links.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={handleLinkClick}
                  className={`group flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium
    transition-all duration-300
    ${isActive
                      ? "bg-[rgba(255,255,255,0.2)] text-white shadow-inner"
                      : "hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
                    }`}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  <span>{label}</span>
                </Link>

              );
            })}

            {/* 🌙 Night Mode Toggle */}
            <div
              className="group flex items-center justify-between px-4 py-2 rounded-xl cursor-pointer
                         hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-300"
            >
              <div className="flex items-center gap-3">
                <MoonIcon className="h-5 w-5 text-blue-500 dark:text-yellow-300" />
                <span className="text-sm font-medium">Night Mode</span>
              </div>

              {/* MUI Switch */}
              <Switch
                checked={theme === "dark"}
                onChange={toggleTheme}
                color="default"
                sx={{
                  "& .MuiSwitch-switchBase": {
                    color: theme === "dark" ? "#60a5fa" : "#9ca3af", // blue in dark, gray in light
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#3b82f6", // vivid blue when ON (dark mode)
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: theme === "dark" ? "#3b82f6" : "#d1d5db", // gray in light
                    opacity: 1,
                  },
                  "& .MuiSwitch-thumb": {
                    width: 22,
                    height: 22,
                  },
                }}
              />
            </div>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0  bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
