import React, { useRef, useEffect } from "react";

export default function CandidateModal({ candidate, onClose }) {
  const modalRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!candidate) return null;

  const skillsMatch = candidate["Job Description Match (%)"] * 0.6;
  const experienceMatch = candidate["Job Description Match (%)"] * 0.4;

  return (
    <div className="bg-black/40 fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-2">{candidate["Candidate Name"]}</h2>
        <p className="text-gray-700 mb-1"><strong>Email:</strong> {candidate.Email}</p>
        <p className="text-gray-700 mb-1"><strong>Phone:</strong> {candidate.Phone}</p>
        <p className="text-gray-700 mb-1"><strong>Field:</strong> {candidate["Field of Study"]}</p>
        <p className="text-gray-700 mb-1"><strong>CGPA:</strong> {candidate.CGPA}</p>
        <p className="text-gray-700 mb-1"><strong>Experience:</strong> {candidate.Experience}</p>
        <p className="text-gray-700 mb-2"><strong>Strength:</strong> {candidate.Strength}</p>

        {/* Skills as tags */}
        <div className="mb-3">
          <strong>Skills:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {candidate.Skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Job match bar */}
        <div className="mb-3">
          <strong>Job Match: {candidate["Job Description Match (%)"]}%</strong>
          <div className="w-full h-4 bg-gray-200 rounded mt-1">
            <div
              className={`h-4 rounded ${
                candidate["Job Description Match (%)"] > 70
                  ? "bg-green-500"
                  : candidate["Job Description Match (%)"] > 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${candidate["Job Description Match (%)"]}%` }}
            />
          </div>
        </div>

        {/* Optional breakdown */}
        <div>
          <strong>Breakdown:</strong>
          <div className="flex flex-col gap-1 mt-1">
            <div className="text-sm text-gray-700">Skills Match: {Math.round(skillsMatch)}%</div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div className="h-2 bg-blue-400 rounded" style={{ width: `${skillsMatch}%` }} />
            </div>

            <div className="text-sm text-gray-700">Experience Match: {Math.round(experienceMatch)}%</div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div className="h-2 bg-purple-400 rounded" style={{ width: `${experienceMatch}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
