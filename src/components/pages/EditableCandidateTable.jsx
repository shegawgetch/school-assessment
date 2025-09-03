import React from 'react';

const EditableCandidateTable = ({ candidates, setCandidates }) => {
  const handleChange = (index, value) => {
    const updated = [...candidates];
    updated[index].email = value;
    setCandidates(updated);
  };

  return (
    <table className="w-full mt-4 border">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left">#</th>
          <th className="p-2 text-left">Email</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((candidate, index) => (
          <tr key={index} className="border-t">
            <td className="p-2">{index + 1}</td>
            <td className="p-2">
              <input
                type="email"
                value={candidate.email}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EditableCandidateTable;
