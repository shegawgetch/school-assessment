import React from "react";
import { exportToCsv } from "../utils/exportCsv";

export default function CandidateTable({
  candidates,
  pagination,
  setPagination,
  sorting,
  setSorting,
  selectedIds,
  setSelectedIds,
  onRowClick,
}) {
  const start = pagination.page * pagination.rows;
  const end = start + pagination.rows;
  const pageData = candidates.slice(start, end);

  const toggleSelect = (id) => {
    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = pageData.map((c) => c.id);
    const isAllSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(
      isAllSelected
        ? selectedIds.filter((id) => !allIds.includes(id))
        : [...new Set([...selectedIds, ...allIds])]
    );
  };

  const handleSort = (key) => {
    let dir = "asc";
    if (sorting.startsWith(key)) dir = sorting.endsWith("asc") ? "desc" : "asc";
    setSorting(`${key}_${dir}`);
  };

  const getSortIndicator = (key) => {
    if (!sorting.startsWith(key)) return "";
    return sorting.endsWith("asc") ? "⬆️" : "⬇️";
  };

  const handleExport = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one candidate to export.");
      return;
    }

    const exportData = candidates
      .filter((c) => selectedIds.includes(c.id))
      .map((c) => ({
        "Candidate Name": c["Candidate Name"] || "-",
        Email: c.Email || "-",
        "Field of Study": c["Field of Study"] || "-",
        CGPA: c.CGPA ?? "-",
        Skills: Array.isArray(c.Skills) ? c.Skills.join(", ") : "-",
        "Job Description Match (%)": c["Job Description Match (%)"] ?? "-",
        Experience: c.Experience || "-",
      }));

    exportToCsv(exportData);
  };

  const buttonClass =
    "px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-600 transition";

  const renderHeader = (label, key, hiddenClass = "") => (
    <th
      className={`px-3 py-2 cursor-pointer ${hiddenClass}`}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className="text-lg">{getSortIndicator(key)}</span>
      </div>
    </th>
  );

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-100">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-6 pt-4">
        {/* Title & Actions */}
        <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
          <button className={buttonClass} onClick={toggleSelectAll}>
            {pageData.every((c) => selectedIds.includes(c.id))
              ? "Deselect All"
              : "Select All"}
          </button>
          <button className={buttonClass} onClick={handleExport}>
            Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-3 py-2 w-6"></th>
                {renderHeader("Name", "Candidate Name")}
                <th className="px-3 py-2 hidden sm:table-cell">Email</th>
                <th className="px-3 py-2">Field</th>
                {renderHeader("CGPA", "CGPA")}
                <th className="px-3 py-2 hidden md:table-cell">Skills</th>
                {renderHeader("Job Match", "JobMatch")}
                {renderHeader("Experience", "Experience", "hidden sm:table-cell")}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {pageData.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-blue-50 cursor-pointer transition"
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleSelect(c.id)}
                    />
                  </td>
                  <td
                    className="px-3 py-2 font-medium"
                    onClick={() => onRowClick(c)}
                  >
                    {c["Candidate Name"] || "-"}
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">{c.Email || "-"}</td>
                  <td className="px-3 py-2">{c["Field of Study"] || "-"}</td>
                  <td className="px-3 py-2">{c.CGPA ?? "-"}</td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    {Array.isArray(c.Skills) ? c.Skills.join(", ") : "-"}
                  </td>
                  <td className="px-3 py-2">{c["Job Description Match (%)"] ?? "-"}%</td>
                  <td className="px-3 py-2 hidden sm:table-cell">{c.Experience || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
          <button
            className={buttonClass}
            disabled={pagination.page === 0}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            Prev
          </button>
          <span className="text-gray-700">
            Page {pagination.page + 1} of {Math.ceil(candidates.length / pagination.rows)}
          </span>
          <button
            className={buttonClass}
            disabled={(pagination.page + 1) * pagination.rows >= candidates.length}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
