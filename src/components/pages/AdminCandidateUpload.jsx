import React, { useState } from 'react';
import UploadForm from './UploadForm';
import { parseCandidateFile } from '../../utils/fileParser';
import { validateCandidates } from '../../utils/validateCandidates';

const AdminCandidateUpload = () => {
  const [file, setFile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file.');

    try {
      const data = await parseCandidateFile(file);
      const validationErrors = validateCandidates(data);

      if (validationErrors.length) {
        setErrors(validationErrors);
        setCandidates([]);
      } else {
        setCandidates(data);
        setErrors([]);
        alert('Candidates uploaded and validated!');
        console.log('Valid candidates:', data);
      }
    } catch (err) {
      alert('Error: ' + err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Upload Candidate List</h1>

      <form onSubmit={handleSubmit}>
        <UploadForm onFileSelect={setFile} />
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
          <h3 className="text-lg font-semibold mb-2">Validated Candidates:</h3>
          <pre className="bg-gray-100 p-3 rounded max-h-64 overflow-auto text-sm">
            {JSON.stringify(candidates, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminCandidateUpload;
