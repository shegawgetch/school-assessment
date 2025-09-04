import React, { useState, useEffect, useRef } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { validateCandidates } from "../../utils/validateCandidates";

const EditableCandidateTable = ({ candidates, setCandidates, onSubmit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const inputRefs = useRef([]);

  // Dynamically calculate rows per page based on screen height
  useEffect(() => {
    const calculateRows = () => {
      const headerHeight = 250;
      const rowHeight = 50;
      const rows = Math.max(3, Math.floor((window.innerHeight - headerHeight) / rowHeight));
      setRowsPerPage(rows);
    };

    calculateRows();
    window.addEventListener("resize", calculateRows);
    return () => window.removeEventListener("resize", calculateRows);
  }, []);

  const totalPages = Math.ceil(candidates.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentCandidates = candidates.slice(startIndex, startIndex + rowsPerPage);

  const handleChange = (index, value) => {
    const updated = [...candidates];
    updated[startIndex + index].email = value;
    updated[startIndex + index].error = "";
    setCandidates(updated);
  };

  const handleRemove = (index) => {
    const updated = candidates.filter((_, i) => i !== startIndex + index);
    setCandidates(updated);
  };

  const handleSubmit = () => {
    const validationErrors = validateCandidates(candidates);

    const updatedData = candidates.map((c, index) => {
      const errorObj = validationErrors.find((err) => err.row === index);
      return { ...c, error: errorObj ? errorObj.message : "" };
    });

    setCandidates(updatedData);

    if (validationErrors.length > 0) {
      const firstInvalidIndex = updatedData.findIndex((c) => c.error);
      if (inputRefs.current[firstInvalidIndex]) {
        inputRefs.current[firstInvalidIndex].focus();
      }
      return; // stop submission
    }

    onSubmit(candidates);
  };

  return (
    <div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentCandidates.map((candidate, index) => (
            <tr key={candidate.id || index} className="border-t">
              <td className="p-2">{startIndex + index + 1}</td>
              <td className="p-2">
                <input
                  ref={(el) => (inputRefs.current[startIndex + index] = el)}
                  type="email"
                  value={candidate.email}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className={`w-full border rounded px-2 py-1 ${
                    candidate.error
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                {candidate.error && (
                  <p className="text-red-600 text-sm mt-1">{candidate.error}</p>
                )}
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Submit
      </button>
    </div>
  );
};

export default EditableCandidateTable;
