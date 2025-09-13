import React, { useState } from "react";
import UploadForm from "./UploadForm";
import EditableCandidateTable from "./EditableCandidateTable";
import { parseCandidateFile } from "../../utils/fileParser";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminCandidateUpload = ({ selectedAssessment }) => {
  const [file, setFile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file.");

    setIsParsing(true);
    try {
      const rawData = await parseCandidateFile(file);
      const normalizedData = rawData.map((row) => {
        const normalizedRow = {};
        for (const key in row) normalizedRow[key.toLowerCase()] = row[key];
        return { email: normalizedRow.email || "", error: "" };
      });
      setCandidates(normalizedData);
      toast.success("File parsed successfully!");
    } catch (err) {
      toast.error("Error parsing file.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async (validCandidates) => {
    await axios.post("/api/candidates/bulk", {
      assessmentName: selectedAssessment,
      candidates: validCandidates,
    });

    setFile(null);
    setCandidates([]);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white mt-0 p-6 md:p-8 rounded-lg shadow-md">
      <h6 className="text-2xl font-bold text-gray-800 mb-4">
        Admin - Upload Candidate List
      </h6>

      <form onSubmit={handleFileUpload} className="space-y-5">
        <UploadForm onFileSelect={setFile} />

        <button
          type="submit"
          disabled={isParsing}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto ${
            isParsing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isParsing ? "Parsing..." : "Upload"}
        </button>
      </form>

      {candidates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Editable Email List:</h3>
          <EditableCandidateTable
            candidates={candidates}
            setCandidates={setCandidates}
            onSubmit={handleSave}
          />
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default AdminCandidateUpload;
