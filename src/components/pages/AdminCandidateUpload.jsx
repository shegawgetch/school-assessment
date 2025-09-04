import React, { useState } from "react";
import UploadForm from "./UploadForm";
import EditableCandidateTable from "./EditableCandidateTable";
import { parseCandidateFile } from "../../utils/fileParser";

const AdminCandidateUpload = () => {
  const [file, setFile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [assessmentName, setAssessmentName] = useState("");

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");
    if (!assessmentName) return alert("Please select an assessment.");

    try {
      const rawData = await parseCandidateFile(file);

      // Normalize keys to lowercase and add empty error field
      const normalizedData = rawData.map((row) => {
        const normalizedRow = {};
        for (const key in row) {
          normalizedRow[key.toLowerCase()] = row[key];
        }
        return { email: normalizedRow.email || "", error: "" };
      });

      setCandidates(normalizedData);
    } catch (err) {
      alert("Error: " + err);
    }
  };

  // Callback when table submit succeeds
  const handleTableSubmit = (validCandidates) => {
    console.log("Final Data:", { assessmentName, candidates: validCandidates });
    alert("Candidates linked to assessment successfully!");
    // Optional: clear state
    // setCandidates([]);
    // setFile(null);
    // setAssessmentName("");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white mt-0 p-6 md:p-8 rounded-lg shadow-md">
      <h6 className="text-2xl font-bold text-gray-800 mb-4">
        Admin - Upload Candidate List
      </h6>

      <form onSubmit={handleFileUpload} className="space-y-5">
        <UploadForm onFileSelect={setFile} />

        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Assessment Name
          </label>
          <select
            value={assessmentName}
            onChange={(e) => setAssessmentName(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">Select Assessment</option>
            <option value="Assessment A">Assessment A</option>
            <option value="Assessment B">Assessment B</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto"
        >
          Upload
        </button>
      </form>

      {candidates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Editable Email List:</h3>
          <EditableCandidateTable
            candidates={candidates}
            setCandidates={setCandidates}
            onSubmit={handleTableSubmit}
          />
        </div>
      )}
    </div>
  );
};

export default AdminCandidateUpload;
