import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

// Summary Card
const SummaryCard = ({ title, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="p-1 flex flex-col items-center gap-1">
      <p className="font-semibold text-center">{title}</p>
      <p className="text-xl font-bold text-center">{count}</p>
      <div className="w-full bg-gray-200 p-0 rounded h-2">
        <div
          className="h-2 rounded"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 text-center">{percentage.toFixed(0)}%</p>
    </div>
  );
};

const AdminInvitationPage = () => {
  const [invites, setInvites] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedInvites, setSelectedInvites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    expired: 0,
  });

  // Fetch invitations
  const fetchInvites = async (exam = selectedExam, status = "all") => {
    if (!exam) return;
    try {
      setLoadingFetch(true);
      const res = await axios.get("http://localhost:8083/invitations", {
        params: { exam, status },
      });
      const data = Array.isArray(res.data.invitations) ? res.data.invitations : [];
      setInvites(data);

      if (res.data.summary) {
        setSummary(res.data.summary);
      } else {
        const total = data.length;
        setSummary({
          total,
          pending: data.filter(i => i.status === "pending").length,
          accepted: data.filter(i => i.status === "accepted").length,
          completed: data.filter(i => i.status === "completed").length,
          expired: data.filter(i => i.status === "expired").length,
        });
      }
    } catch (err) {
      toast.error("Failed to fetch invitations.");
      console.error(err);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    if (selectedExam) fetchInvites(selectedExam);
  }, [selectedExam]);

  // Bulk actions: Resend and Remind
  const resendInvites = async () => {
    if (selectedInvites.length === 0)
      return toast.warn("Select at least one invitation to resend!");
    try {
      setLoadingAction(true);
      await axios.post("http://localhost:8083/invitations/bulk/resend", {
        invitationIds: selectedInvites,
      });
      toast.success("Selected invitations resent!");
      fetchInvites(selectedExam, filter);
      setSelectedInvites([]);
    } catch {
      toast.error("Failed to resend invitations.");
    } finally {
      setLoadingAction(false);
    }
  };

  const sendReminders = async () => {
    if (selectedInvites.length === 0)
      return toast.warn("Select at least one invitation to remind!");
    try {
      setLoadingAction(true);
      await axios.post("http://localhost:8083/invitations/bulk/reminder", {
        invitationIds: selectedInvites,
      });
      toast.success("Reminders sent!");
      setSelectedInvites([]);
    } catch {
      toast.error("Failed to send reminders.");
    } finally {
      setLoadingAction(false);
    }
  };

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.info("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        id: "select",
        header: "Select",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedInvites.includes(row.original.id)}
            onChange={(e) => {
              if (e.target.checked)
                setSelectedInvites([...selectedInvites, row.original.id]);
              else
                setSelectedInvites(selectedInvites.filter(id => id !== row.original.id));
            }}
          />
        ),
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "link",
        header: "Link",
        cell: ({ getValue }) => (
          <a
            href={getValue()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-700"
          >
            {getValue()}
          </a>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          let color;
          switch (getValue()) {
            case "pending": color = "text-yellow-500"; break;
            case "accepted": color = "text-blue-500"; break;
            case "completed": color = "text-green-600"; break;
            case "expired": color = "text-red-500"; break;
            default: color = "text-gray-500";
          }
          return (
            <span className={`font-semibold ${color}`}>
              {getValue().charAt(0).toUpperCase() + getValue().slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "expiresAt",
        header: "Expires",
        cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => copyLink(row.original.link)}
            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Copy Link
          </button>
        ),
      },
    ],
    [selectedInvites]
  );

  // Filtered & searched data
  const filteredData = useMemo(
    () =>
      invites
        .filter(
          (i) =>
            i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.link.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [invites, searchTerm]
  );

  // Paginate
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, perPage]);

  // React Table instance
  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const totalPages = Math.ceil(filteredData.length / perPage);

  return (
    <div className="p-2 max-w-7xl mx-auto bg-gray-100 min-h-screen space-y-0">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Exam Selection */}
      <div className="flex gap-2 items-center mb-4">
        <label className="font-semibold">Select Exam:</label>
        <select
          value={selectedExam}
          onChange={(e) => {
            setSelectedExam(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-white border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Exam</option>
          <option value="Assessment A">Assessment A</option>
          <option value="Assessment B">Assessment B</option>
        </select>
      </div>

      {/* Bulk Actions */}
      <div className="flex gap-2 justify-center mb-4">
        <button
          onClick={resendInvites}
          disabled={selectedInvites.length === 0 || loadingAction}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loadingAction ? "Processing..." : "Resend Selected"}
        </button>
        <button
          onClick={sendReminders}
          disabled={selectedInvites.length === 0 || loadingAction}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loadingAction ? "Processing..." : "Send Reminder Selected"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 justify-items-center">
        <SummaryCard title="Total" count={summary.total} total={summary.total} color="#3B82F6" />
        <SummaryCard title="Pending" count={summary.pending} total={summary.total} color="#FACC15" />
        <SummaryCard title="Accepted" count={summary.accepted} total={summary.total} color="#3B82F6" />
        <SummaryCard title="Completed" count={summary.completed} total={summary.total} color="#10B981" />
        <SummaryCard title="Expired" count={summary.expired} total={summary.total} color="#EF4444" />
      </div>

      {/* Search + Per Page */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full md:w-1/2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by email or link..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
          <label className="text-sm font-medium text-gray-600">Per Page:</label>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white focus:outline-none text-gray-700 font-medium"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {["all", "pending", "accepted", "completed", "expired"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setCurrentPage(1);
              fetchInvites(selectedExam, status);
            }}
            className={`px-3 py-1 rounded ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Invitations Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-2 border-b text-left text-gray-700 uppercase font-semibold cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                  No invitations found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 border-b">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2 border">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminInvitationPage;
