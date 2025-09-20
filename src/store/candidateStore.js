import { create } from "zustand";

const useCandidateStore = create((set, get) => ({
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
}));

export default useCandidateStore;
