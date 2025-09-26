import React from "react";
import Select from "react-select";

export default function CandidateFilter({ filters, setFilters, candidates }) {
  // Options for Field of Study
  const fieldSet = new Set(candidates.map((c) => c["Field of Study"]));
  const fieldOptions = Array.from(fieldSet).map((f) => ({ value: f, label: f }));

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "44px",
      borderRadius: "10px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.2)" : "0 1px 2px rgba(0,0,0,0.05)",
      "&:hover": { borderColor: "#2563eb" },
      transition: "all 0.2s ease",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#bfdbfe",
      color: "#1e3a8a",
      fontWeight: 500,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px",
      overflowY: "auto",
    }),
  };

  const inputClasses =
    "border-2 rounded-xl p-2 w-full focus:outline-none focus:ring-2 transition shadow-sm hover:shadow-md";

  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white p-6 rounded-2xl shadow-2xl mb-2">
      <div className="flex flex-wrap gap-5">
        {/* Search */}
        <div className="flex-1 min-w-[220px]">
          <label className="block text-gray-700 font-semibold mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name, email, or skill"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className={`${inputClasses} border-gray-300 focus:border-blue-400`}
          />
        </div>

        {/* Field of Study */}
        <div className="flex-1 min-w-[265px]">
  <label className="block text-gray-700 font-semibold mb-1">Field of Study</label>
  <Select
    isMulti
    options={fieldOptions}
    value={fieldOptions.filter((opt) => filters.field.includes(opt.value))}
    onChange={(selected) =>
      setFilters({ ...filters, field: selected ? selected.map((s) => s.value) : [] })
    }
    placeholder="Select Field(s)"
    styles={{
      ...customSelectStyles,
      menu: (provided) => ({
        ...provided,
        zIndex: 1500, // ensure dropdown is above everything
      }),
    }}
    menuPortalTarget={document.body} // optional, ensures dropdown renders outside table clipping
  />
</div>


        {/* Min CGPA */}
<div className="flex-auto w-auto max-w-[80px]">
  <label className="block text-gray-700 font-semibold mb-1">Min CGPA</label>
  <input
    type="number"
    min={0}
    max={4}
    step={0.1}
    value={filters.minCgpa}
    onChange={(e) => setFilters({ ...filters, minCgpa: Number(e.target.value) })}
    className={`${inputClasses} border-gray-300 focus:border-green-400`}
  />
</div>


        {/* Job Match */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-gray-700 font-semibold mb-1">
            Job Match %: {filters.jobMatchRange[0]}–{filters.jobMatchRange[1]}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.jobMatchRange[0]}
            onChange={(e) =>
              setFilters({ ...filters, jobMatchRange: [Number(e.target.value), filters.jobMatchRange[1]] })
            }
            className="w-full mb-1 accent-blue-500"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={filters.jobMatchRange[1]}
            onChange={(e) =>
              setFilters({ ...filters, jobMatchRange: [filters.jobMatchRange[0], Number(e.target.value)] })
            }
            className="w-full accent-blue-500"
          />
        </div>

        {/* Experience */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-gray-700 font-semibold mb-1">Experience</label>
          <select
            value={filters.experience}
            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            className={`${inputClasses} border-gray-300 focus:border-purple-400`}
          >
            <option value="">Any</option>
            <option value="0">0 yrs</option>
            <option value="1-3">1-3 yrs</option>
            <option value=">5">&gt;5 yrs</option>
          </select>
        </div>
      </div>
    </div>
  );
}
