import React from 'react';

const UploadForm = ({ onFileSelect }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    onFileSelect(file);
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold text-gray-700">
        Upload Candidate File
      </label>
      <div className="bg-white border border-gray-300 rounded shadow p-2">
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={handleChange}
          className="w-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default UploadForm;
