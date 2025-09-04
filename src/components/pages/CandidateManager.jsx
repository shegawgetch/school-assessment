import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CandidateFormDynamic from "./CandidateFormDynamic";
import AdminCandidateUpload from "./AdminCandidateUpload";

const CandidateManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const bulkModalRef = useRef();
    const manualModalRef = useRef();


  // Fetch candidates from DB safely
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/candidates");
        if (Array.isArray(res.data)) {
          setCandidates(res.data);
        } else {
          console.error("API response is not an array:", res.data);
          setCandidates([]);
        }
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // Add single candidate
  const addCandidate = async (candidate) => {
    try {
      const res = await axios.post("/api/candidates", candidate);
      setCandidates((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  // Add multiple candidates (bulk)
  const addCandidatesBulk = async (list) => {
    try {
      const res = await axios.post("/api/candidates/bulk", {
        emails: list.map((c) => c.email),
      });
      setCandidates((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  // View candidate
  const handleViewCandidate = async (id) => {
    try {
      const res = await axios.get(`/api/candidates/${id}`);
      setSelectedCandidate(res.data);
      setShowViewModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch candidate details.");
    }
  };

  // Update candidate
  const handleUpdateCandidate = async (id, updatedData) => {
    try {
      const res = await axios.put(`/api/candidates/${id}`, updatedData);
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? res.data : c))
      );
      setSelectedCandidate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete candidate
  const handleDeleteCandidate = async (id) => {
    try {
      await axios.delete(`/api/candidates/${id}`);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      if (selectedCandidate?.id === id) setShowViewModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter candidates by search term
  const filteredCandidates = candidates.filter((c) =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close bulk modal if click outside
  const handleBulkOverlayClick = (e) => {
    if (bulkModalRef.current && !bulkModalRef.current.contains(e.target)) {
      setShowBulkModal(false);
    }
  };
    // Close bulk modal if click outside
  const handleManualOverlayClick = (e) => {
    if (manualModalRef.current && !manualModalRef.current.contains(e.target)) {
      setShowManualModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Add Buttons */}
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

        {/* Search + Table */}
        <div className="bg-white p-6 rounded-lg shadow mt-4">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate by email..."
              className="w-64 px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Table */}
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left border">#</th>
                <th className="p-2 text-left border">Email</th>
                <th className="p-2 text-left border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-gray-500">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate, index) => (
                  <tr key={candidate.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{candidate.email}</td>
                    <td className="p-2 border flex gap-2">
                      <button
                        onClick={() => handleViewCandidate(candidate.id)}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40"
                 onClick={handleManualOverlayClick}
        >
          <div className="relative w-full max-w-md mt-16 mb-16 bg-white rounded-lg shadow-lg flex flex-col max-h-[calc(100vh-64px)]"
                      ref={manualModalRef}
              >
            <div className="flex justify-end p-2 border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowManualModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-0 overflow-auto flex-grow">
              <CandidateFormDynamic
                onAdd={(data) => {
                  addCandidate(data);
                  setShowManualModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40"
          onClick={handleBulkOverlayClick}
        >
          <div
            ref={bulkModalRef}
            className="relative w-full max-w-2xl mt-16 mb-16 bg-white rounded-lg shadow-lg flex flex-col max-h-[calc(100vh-64px)]"
          >
            <div className="flex justify-end p-1 pr-3 border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-2 pt-0 overflow-auto flex-grow">
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

      {/* View Candidate Modal */}
      {showViewModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
          <div className="relative w-full max-w-md mt-16 mb-16 bg-white rounded-lg shadow-lg flex flex-col max-h-[calc(100vh-64px)]">
            <div className="flex justify-between items-center p-2 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold">Candidate Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <p>
                <strong>Email:</strong> {selectedCandidate.email}
              </p>
              <div className="flex gap-4">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  onClick={() => {
                    setShowManualModal(true);
                    setShowViewModal(false);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  onClick={() => handleDeleteCandidate(selectedCandidate.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateManager;
