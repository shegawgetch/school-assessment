import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import candidates from "../api/candidates.json";
import CandidateFilter from "../components/CandidateFilter";
import CandidateTable from "../components/CandidateTable";
import CandidateModal from "../components/CandidateModal";
import useCandidateStore from "../store/candidateStore";
import { exportToCsv } from "../utils/exportCsv";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid"; 


export default function CandidateShortlist() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Zustand store
  const {
    filters,
    pagination,
    sorting,
    selectedIds,
    selectedCandidate,
    setFilters,
    setPagination,
    setSorting,
    setSelectedIds,
    setSelectedCandidate,
  } = useCandidateStore();

  const [filteredCandidates, setFilteredCandidates] = useState([]);

  // Initialize state from URL params
  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      field: searchParams.get("field")?.split(",").filter(Boolean) || [],
      minCgpa: parseFloat(searchParams.get("minCgpa")) || 0,
      jobMatchRange: [
        parseFloat(searchParams.get("jobMin")) || 0,
        parseFloat(searchParams.get("jobMax")) || 100,
      ],
      experience: searchParams.get("experience") || "",
    });

    setPagination({
      page: parseInt(searchParams.get("page")) || 0,
      rows: parseInt(searchParams.get("rows")) || 10,
    });

    setSorting(searchParams.get("sort") || "");
  }, []); // Run once on mount

  // Sync state to URL
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.field.length) params.field = filters.field.join(",");
    if (filters.minCgpa) params.minCgpa = filters.minCgpa;
    if (filters.jobMatchRange[0] !== 0) params.jobMin = filters.jobMatchRange[0];
    if (filters.jobMatchRange[1] !== 100) params.jobMax = filters.jobMatchRange[1];
    if (filters.experience) params.experience = filters.experience;

    if (sorting) params.sort = sorting;
    if (pagination.page) params.page = pagination.page;
    if (pagination.rows !== 10) params.rows = pagination.rows;

    setSearchParams(params);
  }, [filters, sorting, pagination, setSearchParams]);

  // Filtering & Sorting
  useEffect(() => {
    let result = candidates.filter((c) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        c["Candidate Name"].toLowerCase().includes(searchLower) ||
        c.Email.toLowerCase().includes(searchLower) ||
        (Array.isArray(c.Skills) &&
          c.Skills.some((s) => s.toLowerCase().includes(searchLower)));
      if (!matchesSearch) return false;

      if (filters.field.length > 0 && !filters.field.includes(c["Field of Study"]))
        return false;

      if (c.CGPA < filters.minCgpa) return false;

      const jobMatch = parseFloat(c["Job Description Match (%)"]) || 0;
      if (jobMatch < filters.jobMatchRange[0] || jobMatch > filters.jobMatchRange[1])
        return false;

      const exp = parseInt(c.Experience) || 0;
      if (filters.experience === "0" && exp !== 0) return false;
      if (filters.experience === "1-3" && (exp < 1 || exp > 3)) return false;
      if (filters.experience === ">5" && exp <= 5) return false;

      return true;
    });

    if (sorting) {
      const [key, dir] = sorting.split("_");
      result.sort((a, b) => {
        let valA, valB;
        switch (key) {
          case "CGPA":
            valA = parseFloat(a.CGPA) || 0;
            valB = parseFloat(b.CGPA) || 0;
            break;
          case "JobMatch":
            valA = parseFloat(a["Job Description Match (%)"]) || 0;
            valB = parseFloat(b["Job Description Match (%)"]) || 0;
            break;
          case "Experience":
            valA = parseInt(a.Experience) || 0;
            valB = parseInt(b.Experience) || 0;
            break;
          default:
            valA = a[key] ?? "";
            valB = b[key] ?? "";
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();
        }
        if (valA > valB) return dir === "asc" ? 1 : -1;
        if (valA < valB) return dir === "asc" ? -1 : 1;
        return 0;
      });
    }

    setFilteredCandidates(result);
  }, [filters, sorting]);
//download logic
   const handleExport = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one candidate to export.");
      return;
    }

    const exportData = filteredCandidates
      .filter((c, idx) => selectedIds.includes(idx))
      .map((c) => ({
        "Candidate Name": c["Candidate Name"] || "-",
        Email: c.Email || "-",
        "Field of Study": c["Field of Study"] || "-",
        CGPA: c.CGPA ?? "-",
        Skills: Array.isArray(c.Skills) ? c.Skills.join(", ") : "-",
        "Job Description Match (%)": c["Job Description Match (%)"] ?? "-",
        Experience: c.Experience || "-",
      }));

    exportToCsv(exportData, "shortlisted_candidates.csv");
  };

  return (
    <div className="container mx-auto p-1 m-0 pt-0">
  <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Candidate Shortlist Page</h1>
        
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Download</span>
        </button>
      </div>
      <CandidateFilter filters={filters} setFilters={setFilters} candidates={candidates} />

      <CandidateTable
        candidates={filteredCandidates.map((c, idx) => ({
          id: idx,
          "Candidate Name": c["Candidate Name"],
          Email: c.Email,
          "Field of Study": c["Field of Study"],
          CGPA: c.CGPA,
          Skills: c.Skills,
          "Job Description Match (%)": c["Job Description Match (%)"],
          Experience: c.Experience,
        }))}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onRowClick={(c) =>
          setSelectedCandidate(
            filteredCandidates.find(
              (fc) => fc["Candidate Name"] === c["Candidate Name"]
            )
          )
        }
      />

      {selectedCandidate && (
        <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </div>
  );
}
