import React, { useState } from 'react';
import UploadForm from './UploadForm';
import EditableCandidateTable from './EditableCandidateTable';
import { parseCandidateFile } from '../../utils/fileParser';
import { validateCandidates } from '../../utils/validateCandidates';

const AdminCandidateUpload = () => {
  const [file, setFile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [errors, setErrors] = useState([]);
  const [assessmentName, setAssessmentName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file.');
    if (!assessmentName) return alert('Please select an assessment.');

    try {
      const data = await parseCandidateFile(file);
      const validationErrors = validateCandidates(data);

      if (validationErrors.length) {
        setErrors(validationErrors);
        setCandidates([]);
      } else {
        setErrors([]);
        setCandidates(data);
      }
    } catch (err) {
      alert('Error: ' + err);
    }
  };

  const handleFinalSubmit = () => {
    console.log('Final Data:', { assessmentName, candidates });
    alert('Candidates linked to assessment successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Upload Candidate List</h1>

      <form onSubmit={handleSubmit}>
        <UploadForm onFileSelect={setFile} />

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Assessment Name</label>
          <select
            value={assessmentName}
            onChange={(e) => setAssessmentName(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Assessment</option>
            <option value="Assessment A">Assessment A</option>
            <option value="Assessment B">Assessment B</option>
            {/* You can fetch these dynamically */}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </form>

      {errors.length > 0 && (
        <div className="mt-6 text-red-700 bg-red-100 border border-red-400 p-4 rounded">
          <h3 className="font-semibold mb-2">Validation Errors:</h3>
          <ul className="list-disc ml-6">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Editable Email List:</h3>
          <EditableCandidateTable candidates={candidates} setCandidates={setCandidates} />
          <button
            onClick={handleFinalSubmit}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Final Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCandidateUpload;
