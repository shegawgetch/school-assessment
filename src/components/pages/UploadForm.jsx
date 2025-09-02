import React from 'react';

const UploadForm = ({ onFileSelect }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    onFileSelect(file);
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Upload Candidate File</label>
      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={handleChange}
        className="block w-full border p-2 rounded"
      />
    </div>
  );
};

export default UploadForm;
