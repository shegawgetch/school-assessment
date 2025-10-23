import React from "react";
import useCandidateStore from "../store/candidateStore";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useCandidateStore();

  return (
      <div className="border-t border-sidebar-border px-4 py-4 flex justify-center">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                  bg-sidebar-accent text-sidebar-accent-foreground
                  border border-sidebar-border hover:opacity-90 transition-all"
              >
                {theme === "light" ? (
                  <>
                    <MoonIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <SunIcon className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm">Light Mode</span>
                  </>
                )}
              </button>
            </div>
  );
}
