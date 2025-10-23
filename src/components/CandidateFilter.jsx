import { Autocomplete, TextField } from "@mui/material";
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
      borderColor: state.isFocused
        ? "var(--ring)"
        : isDarkMode
          ? "var(--table-border)"
          : "var(--border)",
      boxShadow: state.isFocused ? `0 0 0 3px rgba(59,130,246,0.2)` : "none",
      backgroundColor: "var(--secondary)",
      color: "var(--foreground)",
      "&:hover": { borderColor: "var(--ring)" },
      transition: "all 0.2s ease",
    }),

    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? "var(--primary)" : "var(--primary-light)",
      color: "var(--primary-foreground)",
      fontWeight: 500,
      borderRadius: "8px",
    }),

    multiValueLabel: (provided) => ({
      ...provided,
      color: "var(--primary-foreground)",
    }),

    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--secondary)",
      borderRadius: "10px",
      zIndex: 9999,
    }),

    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px",
      overflowY: "auto",
      backgroundColor: "var(--secondary)",
      color: "var(--foreground)",
    }),

    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "var(--table-hover)"
        : "var(--secondary)",
      color: "var(--foreground)",
      cursor: "pointer",
    }),

    placeholder: (provided) => ({
      ...provided,
      color: "var(--muted-foreground)",
    }),

    input: (provided) => ({
      ...provided,
      color: "var(--foreground)",
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "12px",
      backgroundColor: "var(--secondary)",
      color: "var(--foreground)",
    }),
  };



  const inputClasses =
    "border-2 rounded-xl p-2 w-full focus:outline-none focus:ring-2 transition shadow-sm hover:shadow-md";

  return (
    <div className="pl-6 pr-6 pt-0 pb-0 mb-0">
      <div className="flex flex-wrap gap-5 p-0 m-0">
        {/* Search */}
        <div className="flex-1 min-w-[220px]">
          <label className="block text-[var(--foreground)] dark:text-[var(--foreground)] font-semibold m-0 p-0 font-medium text-sm whitespace-nowrap">Search</label>
          <input
            type="text"
            placeholder="Search by name, email, or skill"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className={`${inputClasses} border-gray-300 focus:border-blue-100 p-0 m-0  w-48 px-3 py-2 rounded-lg border
          border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]
          bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)]
          text-[var(--color-text-primary)] dark:text-[var(--color-text-inverted)]
          focus:outline-none focus:ring-2
          focus:ring-[var(--color-primary-blue-light)] dark:focus:ring-[var(--color-primary-blue-dark)]
          transition-all duration-300`}
          />
        </div>

        {/* Field of Study */}
        <div className="flex-1 min-w-[265px]">
          <label className=" font-semibold m-0 p-0 text-[var(--foreground)] dark:text-[var(--foreground)] font-medium text-sm whitespace-nowrap">Field of Study</label>
          <Select
            isMulti  
            options={fieldOptions}
            value={fieldOptions.filter((opt) => filters.field.includes(opt.value))}
            onChange={(selected) =>
              setFilters({
                ...filters,
                field: selected ? selected.map((s) => s.value) : [],
              })
            }
            placeholder="Select Field(s)"
            styles={{
              control: (provided, state) => ({
                ...provided,
                minHeight: "44px",
                borderRadius: "10px",
                borderColor: state.isFocused ? "var(--ring)" : "var(--border)",
                boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.2)" : "none",
                backgroundColor: "white",
                color: "var(--foreground)",
                "&:hover": {
                  borderColor: "blue",
                },
                transition: "all 0.2s ease",
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                fontWeight: 500,
                borderRadius: "8px",
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: "var(--primary-foreground)",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "var(--primary)",
                color: "var(--foreground)",
                borderRadius: "10px",
                zIndex: 9999,
              }),
              menuList: (provided) => ({
                ...provided,
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "var(--secondary)",
                color: "var(--foreground)",

              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "var(--muted)" : "var(--secondary)",
                color: "var(--foreground)",
                cursor: "pointer",
                ":hover": {
                  backgroundColor: "var(--primary)",
                  color: "var(--secondary)",
                }
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "var(--muted-foreground)",
              }),
              input: (provided) => ({
                ...provided,
                color: "var(--foreground)",
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                borderRadius: "12px",
              }),
            }}
            menuPortalTarget={document.body}
          />

        </div>


        {/* Min CGPA */}
        <div className="flex-auto w-auto max-w-[80px] p-0 m-0" >
          <label className="block text-[var(--foreground)] dark:text-[var(--foreground)] font-semibold m-0 p-0 font-medium text-sm whitespace-nowrap">Min CGPA</label>
          <input
            type="number"
            min={0}
            max={4}
            step={0.1}
            value={filters.minCgpa}
            onChange={(e) => setFilters({ ...filters, minCgpa: Number(e.target.value) })}
            className={`${inputClasses} m-0  w-48 px-3 py-2
          border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]
          bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)]
          text-[var(--color-text-primary)] dark:text-[var(--color-text-inverted)]
          focus:outline-none focus:ring-2
          focus:ring-[var(--color-primary-blue-light)] dark:focus:ring-[var(--color-primary-blue-dark)]
          transition-all duration-300`}
          />
        </div>


        {/* Job Match */}
        <div className="flex-1 min-w-[160px] p-0 m-0">
          <label className="block text-[var(--foreground)] dark:text-[var(--foreground)]font-semibold mb-0 font-medium text-sm whitespace-nowrap">
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
            className="w-full mb-1 p-0 m-0  w-48 px-3 py-1 rounded-lg border
          border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]
          bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)]
          text-[var(--color-text-primary)] dark:text-[var(--color-text-inverted)]
          focus:outline-none focus:ring-2
          focus:ring-[var(--color-primary-blue-light)] dark:focus:ring-[var(--color-primary-blue-dark)]
          transition-all duration-300"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={filters.jobMatchRange[1]}
            onChange={(e) =>
              setFilters({ ...filters, jobMatchRange: [filters.jobMatchRange[0], Number(e.target.value)] })
            }
            className="w-full p-0 m-0  w-48 px-3 py-1 rounded-lg border
          border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]
          bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)]
          text-[var(--color-text-primary)] dark:text-[var(--color-text-inverted)]
          focus:outline-none focus:ring-2
          focus:ring-[var(--color-primary-blue-light)] dark:focus:ring-[var(--color-primary-blue-dark)]
          transition-all duration-300"
          />
        </div>

        {/* Experience */}
        <div className="flex-1 min-w-[160px] p-0">
          <label className="block text-[var(--foreground)] dark:text-[var(--foreground)] font-semibold m-0 p-0 font-medium text-sm whitespace-nowrap">Experience</label>
          <Select
            options={[
              { value: "", label: "Any" },
              { value: "0", label: "0 yrs" },
              { value: "1-3", label: "1–3 yrs" },
              { value: ">5", label: ">5 yrs" },
            ]}
            value={
              [
                { value: "", label: "Any" },
                { value: "0", label: "0 yrs" },
                { value: "1-3", label: "1–3 yrs" },
                { value: ">5", label: ">5 yrs" },
              ].find((opt) => opt.value === filters.experience)
            }
            onChange={(selected) =>
              setFilters({ ...filters, experience: selected ? selected.value : "" })
            }
            placeholder="Select experience"
            styles={{
              control: (provided) => ({
                ...provided,
                minHeight: "44px",
                borderRadius: "10px",
                borderColor: "var(--border)",
                backgroundColor: "white",  // always white
                color: "#000000",           // text color
                "&:hover": { borderColor: "blue" },
                boxShadow: "none",
                transition: "all 0.2s ease",
              }),
              dropdownIndicator: (provided) => ({
                ...provided,
                color: "#4B5563",           // softer gray, not bold
                "& svg": { fill: "#4B5563" }, // SVG arrow
                padding: 4,
              }),
              indicatorSeparator: (provided) => ({
                ...provided,
                backgroundColor: "#D1D5DB", // light gray separator
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "var(--primary)",
                color: "#000000",
                borderRadius: "10px",
                zIndex: 9999,
              }),
                 menuList: (provided) => ({
                ...provided,
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "var(--secondary)",
                color: "var(--foreground)",

              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "var(--muted)" : "var(--secondary)",
                color: "var(--foreground)",
                cursor: "pointer",
                ":hover": {
                  backgroundColor: "var(--primary)",
                  color: "var(--secondary)",
                }
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#6B7280", // medium gray
              }),
              input: (provided) => ({
                ...provided,
                color: "#000000",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "#000000",
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                borderRadius: "12px",
                backgroundColor: "var(--secondary)",
                color: "#000000",
              }),
            }}
            menuPortalTarget={document.body}
          />


        </div>
      </div>
    </div>
  );
}
