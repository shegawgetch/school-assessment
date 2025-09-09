import React, { useState, useRef, useEffect } from "react";
import { Bars3Icon, UserIcon } from "@heroicons/react/24/outline";

export default function Topbar({ toggleSidebar }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow px-4 py-3 flex items-center justify-between">
      {/* Left: Sidebar toggle & title */}
      <div className="flex items-center space-x-3">
        <button className="md:hidden text-gray-700" onClick={toggleSidebar}>
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* Right: Avatar + Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="focus:outline-none flex items-center justify-center h-9 w-9 rounded-full border-2 border-gray-300 shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition duration-200"
        >
          <UserIcon className="h-5 w-5" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-50">
            <ul className="py-2 text-sm text-gray-700">
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  Profile
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  Settings
                </a>
              </li>
              <li><hr className="my-1 border-gray-200" /></li>
              <li>
                <a href="#" className="block px-4 py-2 text-red-500 hover:bg-gray-100">
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
