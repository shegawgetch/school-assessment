import React, { useState, useRef } from "react";
import CandidateFormDynamic from "./CandidateFormDynamic";
import AdminCandidateUpload from "./AdminCandidateUpload";

const CandidateManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const bulkModalRef = useRef();

  // Add one candidate (manual)
  const addCandidate = (candidate) => {
    setCandidates((prev) => [...prev, { id: Date.now(), ...candidate }]);
  };

  // Add multiple candidates (bulk)
  const addCandidatesBulk = (list) => {
    const enriched = list.map((c, i) => ({
      id: Date.now() + i,
      ...c,
    }));
    setCandidates((prev) => [...prev, ...enriched]);
  };

  // Delete candidate
  const deleteCandidate = (id) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  // Edit candidate
  const editCandidate = (id, updatedData) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
  };

  // Close bulk modal if click outside
  const handleBulkOverlayClick = (e) => {
    if (bulkModalRef.current && !bulkModalRef.current.contains(e.target)) {
      setShowBulkModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Buttons to open modals */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowManualModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Candidate(s)
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Upload Candidates
          </button>
        </div>

        {/* Candidate Table */}
        <div className="bg-white p-6 rounded-lg shadow mt-4">
          <h2 className="text-xl font-bold mb-4">All Candidates</h2>
          <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border border-gray-300">#</th>
                <th className="p-3 border border-gray-300 text-left">Email</th>
                <th className="p-3 border border-gray-300 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr
                  key={c.id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                >
                  <td className="p-3 border border-gray-300">{i + 1}</td>
                  <td className="p-3 border border-gray-300">
                    <input
                      type="text"
                      value={c.email}
                      onChange={(e) =>
                        editCandidate(c.id, { email: e.target.value })
                      }
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="p-3 border border-gray-300">
                    <button
                      onClick={() => deleteCandidate(c.id)}
                      className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="p-4 text-center text-gray-500 italic"
                  >
                    No candidates yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-lg max-h-[80vh] overflow-auto shadow-lg flex flex-col">
              {/* Sticky X Button */}
              <div className="sticky top-0 z-10 bg-white flex justify-end p-1 pr-3 border-b border-gray-200">
                <button
                  onClick={() => setShowManualModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Modal content */}
              <div className="p-4 flex-grow">
                <CandidateFormDynamic
                  onAdd={(data) => {
                    addCandidate(data);
                    setShowManualModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleBulkOverlayClick}
        >
          <div
            ref={bulkModalRef}
            className="relative w-full max-w-2xl bg-white rounded-lg max-h-[80vh] overflow-auto shadow-lg flex flex-col"
          >
            {/* Sticky X Button */}
            <div className="sticky top-0 z-10 bg-white flex justify-end p-1 pr-3 border-b border-gray-200">
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal content */}
            <div className="p-4 flex-grow">
              <AdminCandidateUpload
                onBulkAdd={(list) => {
                  addCandidatesBulk(list);
                  setShowBulkModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateManager;
