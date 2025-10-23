import { create } from "zustand";

// Helper to get and apply initial theme globally
const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const storedTheme = localStorage.getItem("theme");
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "light";

    document.documentElement.classList.toggle("dark", theme === "dark");
    return theme;
  }
  return "light";
};

const useCandidateStore = create((set) => ({
  // ==========================
  // Candidate-related state
  // ==========================
  filters: {
    search: "",
    field: [],
    minCgpa: 0,
    jobMatchRange: [0, 100],
    experience: "",
  },
  pagination: { page: 0, rows: 10 },
  sorting: "",
  selectedIds: [],
  selectedCandidate: null,

  setFilters: (filters) => set({ filters }),
  setPagination: (pagination) => set({ pagination }),
  setSorting: (sorting) => set({ sorting }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),

  // ==========================
  // Theme-related state
  // ==========================
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";

      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newTheme);
      }

      return { theme: newTheme };
    }),

  setTheme: (theme) =>
    set(() => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", theme);
      }
      return { theme };
    }),
}));

// Ensure theme is applied on page load
if (typeof window !== "undefined") {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.classList.toggle("dark", savedTheme === "dark");
}

export default useCandidateStore;
