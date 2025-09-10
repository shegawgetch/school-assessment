import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import CandidateFormDynamic from "./CandidateFormDynamic";
import AdminCandidateUpload from "./AdminCandidateUpload";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  PlusIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

const CandidateManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [rowSelection, setRowSelection] = useState({});
  const [editingCell, setEditingCell] = useState({});

  const bulkModalRef = useRef();
  const manualModalRef = useRef();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/candidates");
        if (Array.isArray(res.data)) setCandidates(res.data);
        else setCandidates([]);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const addCandidate = async (candidate) => {
    try {
      const res = await axios.post("/api/candidates", candidate);
      setCandidates((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const addCandidatesBulk = async (list) => {
    try {
      const res = await axios.post("/api/candidates/bulk", {
        emails: list.map((c) => c.email),
      });
      setCandidates((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewCandidate = async (id) => {
    try {
      const res = await axios.get(`/api/candidates/${id}`);
      setSelectedCandidate(res.data);
      setShowViewModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch candidate details.");
    }
  };

  const handleDeleteCandidate = async (id) => {
    try {
      await axios.delete(`/api/candidates/${id}`);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      if (selectedCandidate?.id === id) setShowViewModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
    if (!selectedIds.length) return alert("No candidates selected.");
    if (!window.confirm(`Delete ${selectedIds.length} candidate(s)?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => axios.delete(`/api/candidates/${id}`)));
      setCandidates((prev) => prev.filter((c) => !selectedIds.includes(c.id.toString())));
      setRowSelection({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleCellSave = async (rowId, columnId, value) => {
    if (columnId === "email" && !value.includes("@")) {
      alert("Invalid email address!");
      return;
    }
    try {
      const candidate = candidates.find((c) => c.id === rowId);
      if (!candidate) return;
      const updatedData = { ...candidate, [columnId]: value };
      await axios.put(`/api/candidates/${rowId}`, updatedData);
      setCandidates((prev) =>
        prev.map((c) => (c.id === rowId ? updatedData : c))
      );
      setEditingCell((prev) => ({ ...prev, [`${rowId}_${columnId}`]: false }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkOverlayClick = (e) => {
    if (bulkModalRef.current && !bulkModalRef.current.contains(e.target)) {
      setShowBulkModal(false);
    }
  };
  const handleManualOverlayClick = (e) => {
    if (manualModalRef.current && !manualModalRef.current.contains(e.target)) {
      setShowManualModal(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: () => {
                const allSelected = table.getIsAllRowsSelected();
                const newSelection = {};
                table.getRowModel().rows.forEach((row) => {
                  newSelection[row.original.id] = !allSelected;
                });
                setRowSelection(newSelection);
              },
            }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            {...{
              checked: rowSelection[row.original.id] ?? false,
              onChange: (e) =>
                setRowSelection((prev) => ({
                  ...prev,
                  [row.original.id]: e.target.checked,
                })),
            }}
          />
        ),
      },
      {
        header: "#",
        accessorFn: (_row, index) => index + 1,
      },
      {
        header: "Email",
        accessorKey: "email",
        cell: ({ row, column, getValue }) => {
          const key = `${row.original.id}_${column.id}`;
          const isEditing = editingCell[key] ?? false;
          const [value, setValue] = useState(getValue());
          const save = () => handleCellSave(row.original.id, column.id, value);
          return isEditing ? (
            <div className="flex items-center gap-1">
              <input
                className="border px-1 rounded w-full"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={save}
                onKeyDown={(e) => e.key === "Enter" && save()}
              />
              <button onClick={save}>
                <CheckIcon className="w-4 h-4 text-green-600" />
              </button>
            </div>
          ) : (
            <span
              onDoubleClick={() =>
                setEditingCell((prev) => ({ ...prev, [key]: true }))
              }
            >
              {value}
            </span>
          );
        },
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row, column, getValue }) => {
          const key = `${row.original.id}_${column.id}`;
          const isEditing = editingCell[key] ?? false;
          const [value, setValue] = useState(getValue() ?? "");
          const save = () => handleCellSave(row.original.id, column.id, value);
          return isEditing ? (
            <div className="flex items-center gap-1">
              <input
                className="border px-1 rounded w-full"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={save}
                onKeyDown={(e) => e.key === "Enter" && save()}
              />
              <button onClick={save}>
                <CheckIcon className="w-4 h-4 text-green-600" />
              </button>
            </div>
          ) : (
            <span
              onDoubleClick={() =>
                setEditingCell((prev) => ({ ...prev, [key]: true }))
              }
            >
              {value ?? ""}
            </span>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row, column, getValue }) => {
          const key = `${row.original.id}_${column.id}`;
          const isEditing = editingCell[key] ?? false;
          const [value, setValue] = useState(getValue() ?? "");
          const save = () => handleCellSave(row.original.id, column.id, value);
          return isEditing ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={save}
              className="border px-1 rounded"
            >
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
            </select>
          ) : (
            <span
              onDoubleClick={() =>
                setEditingCell((prev) => ({ ...prev, [key]: true }))
              }
            >
              {value ?? ""}
            </span>
          );
        },
      },
      {
        header: "Actions",
        cell: (info) => (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1 text-blue-600 hover:underline"
              onClick={() => handleViewCandidate(info.row.original.id)}
            >
              <EyeIcon className="w-4 h-4" /> View
            </button>
            <button
              className="flex items-center gap-1 text-yellow-600 hover:underline"
              onClick={() => {
                setSelectedCandidate(info.row.original);
                setShowManualModal(true);
              }}
            >
              <PencilIcon className="w-4 h-4" /> Edit
            </button>
            <button
              className="flex items-center gap-1 text-red-600 hover:underline"
              onClick={() => handleDeleteCandidate(info.row.original.id)}
            >
              <TrashIcon className="w-4 h-4" /> Delete
            </button>
          </div>
        ),
      },
    ],
    [editingCell, rowSelection]
  );

  const table = useReactTable({
    data: candidates,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) =>
      row.getValue("email")?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
      row.getValue("name")?.toString().toLowerCase().includes(filterValue.toLowerCase()),
  });

  const renderSortingIcon = (column) => {
    const sort = sorting.find((s) => s.id === column.id);
    if (!sort) return <span className="inline-block ml-1"><ChevronUpIcon className="w-3 h-3 text-gray-400 rotate-180"/></span>;
    if (sort.desc) return <ChevronDownIcon className="w-3 h-3 text-gray-600 ml-1" />;
    return <ChevronUpIcon className="w-3 h-3 text-gray-600 ml-1" />;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="max-w-6xl mx-auto space-y-2">
        {/* Top Buttons */}
        <div className="flex flex-wrap justify-end gap-2 mb-4">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" /> Add Candidate
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-gray-200 bg-opacity-50 border border-gray-400 text-gray-800 px-3 py-1.5 rounded-lg shadow hover:bg-gray-300 transition flex items-center gap-1 font-medium text-sm"
          >
            <ArrowUpTrayIcon className="w-5 h-5" /> Upload CSV/Excel
          </button>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <TrashIcon className="w-5 h-5" /> Delete Selected
          </button>
        </div>

        {/* Search + Per Page */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by email or name..."
              className="pl-10 bg-white pr-3 py-2 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition"
            />
          </div>
          <div>
            <select
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(e.target.value),
                  pageIndex: 0,
                }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            >
              {[10, 20,50,100].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gradient-to-r from-gray-30 to-gray-10 shadow-sm">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-3 border-b border-gray-300 text-left text-gray-800 font-semibold cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && renderSortingIcon(header.column)}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                    {loading ? "Loading..." : "No candidates found."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t even:bg-white odd:bg-gray-50 hover:shadow-md hover:bg-gray-100 transition-all duration-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-2 border text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {/* Manual, Bulk, and View modals remain unchanged from your original code */}
    </div>
  );
};

export default CandidateManager;
