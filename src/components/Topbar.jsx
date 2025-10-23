import React, { useState, useRef, useEffect } from "react";
import { Bars3Icon, UserIcon } from "@heroicons/react/24/outline";
import useCandidateStore from "../store/candidateStore";

export default function Topbar({ toggleSidebar }) {
  const { theme } = useCandidateStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const titleRef = useRef(null);

  const title = "Invitation Management System";

  // Detect text truncation
  useEffect(() => {
    const el = titleRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      setShowTooltip(true);
    }
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-[var(--card)] dark:bg-[var(--card)]
        border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]
        shadow px-4 py-3 flex items-center justify-between
        md:ml-64 md:w-[calc(100%-16rem)] transition-all duration-200`}
    >
      {/* Left: Sidebar toggle + Title */}
      <div className="flex items-center gap-3">
        {/* Sidebar toggle (mobile only) */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 cursor-pointer
 rounded-lg hover:bg-[var(--muted-light)] dark:hover:bg-[var(--muted)]
            text-[var(--foreground)] dark:text-[var(--foreground)] transition-colors"
        >
          <Bars3Icon className="h-8 w-8" />
        </button>

        {/* Title with tooltip */}
        <div className="relative group">
          <h1
            ref={titleRef}
            className="text-[var(--foreground)] dark:text-[var(--foreground)]
              font-semibold truncate cursor-default
              max-w-[250px] sm:max-w-[300px] md:max-w-full
              text-base md:text-2xl"
          >
            {title}
          </h1>

          {/* Tooltip appears only if truncated */}
          {showTooltip && (
            <div
              className="absolute hidden group-hover:block left-0 top-full mt-1
                bg-[var(--color-text-primary)] dark:bg-[var(--color-text-inverted)]
                text-[var(--color-bg-light)] dark:text-[var(--color-bg-dark)]
                text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-50"
            >
              {title}
            </div>
          )}
        </div>
      </div>

      {/* Right: Avatar */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-center h-10 w-10 rounded-full
            border-2 border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]
            shadow-sm bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)]
            text-[var(--color-text-secondary)] dark:text-[var(--color-text-inverted)]
            hover:bg-[var(--color-primary-blue-light)] dark:hover:bg-[var(--color-primary-blue-dark)]
            hover:text-white transition duration-200"
        >
          <UserIcon className="h-5 w-5" />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-44
    bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)]
    rounded shadow-lg border border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]
    z-50"
          >
            <ul className="py-2 text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-inverted)]">
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 
          hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-dark)] 
          dark:hover:text-white text-[var(--color-text-primary)] dark:text-[var(--color-text-inverted)]
          transition-colors duration-200 ease-in-out"
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 
          hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-dark)] 
          dark:hover:text-white text-[var(--color-text-primary)] dark:text-[var(--color-text-inverted)]
           transition-colors duration-200 ease-in-out"
                >
                  Settings
                </a>
              </li>
              <li>
                <hr className="my-1 border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]" />
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 text-[var(--color-error-light)]
          hover:bg-[var(--muted)]
          transition-colors duration-200 ease-in-out"
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>


        )}
      </div>
    </header>
  );
}
