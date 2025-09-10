import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false); // resend/reminder
  const [invites, setInvites] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [selectedInvites, setSelectedInvites] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    expired: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch invitations
  const fetchInvites = async (status = "all") => {
    try {
      setLoadingFetch(true);
      const res = await axios.get("http://localhost:8083/invitations", { params: { status } });
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
    fetchInvites(); // Only fetch existing invitations on page load
  }, []);

  // Pagination
  const totalPages = Math.ceil(invites.length / perPage);
  const filteredInvites = invites.filter(invite =>
    invite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invite.link.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedInvites = filteredInvites.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Filter change
  const handleFilterChange = (status) => {
    setFilter(status);
    setCurrentPage(1);
    fetchInvites(status);
  };

  // Generate invitations
  const generateInvites = async () => {
    try {
      setLoadingGenerate(true);
      const res = await axios.post("http://localhost:8083/invitations/bulk");
      const createdInvites = Array.isArray(res.data.invitations) ? res.data.invitations : [];
      setInvites(createdInvites);
      if (res.data.summary) setSummary(res.data.summary);
      toast.success(`Invitations processed for ${createdInvites.length} candidates!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process invitations.");
    } finally {
      setLoadingGenerate(false);
    }
  };

  // Resend invitations
  const resendInvites = async () => {
    if (selectedInvites.length === 0) return toast.warn("Select at least one invitation to resend!");
    try {
      setLoadingAction(true);
      await axios.post("http://localhost:8083/invitations/bulk/resend", {
        invitationIds: selectedInvites,
      });
      toast.success("Selected invitations resent!");
      fetchInvites(filter);
      setSelectedInvites([]);
    } catch {
      toast.error("Failed to resend invitations.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Send reminders
  const sendReminders = async () => {
    if (selectedInvites.length === 0) return toast.warn("Select at least one invitation to remind!");
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

  // Copy link
  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.info("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="p-1 pt-0 max-w-5xl mx-auto space-y-0">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-center md:text-left">
          Invitation Management
        </h2>
        <button
          onClick={generateInvites}
          disabled={loadingGenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loadingGenerate ? "Processing..." : "Generate Invitations"}
        </button>
      </div>
      {/* Bulk actions */}
      <div className="flex gap-2 justify-center">
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 justify-items-center">
        <SummaryCard title="Total" count={summary.total} total={summary.total} color="#3B82F6" />
        <SummaryCard title="Pending" count={summary.pending} total={summary.total} color="#FACC15" />
        <SummaryCard title="Accepted" count={summary.accepted} total={summary.total} color="#3B82F6" />
        <SummaryCard title="Completed" count={summary.completed} total={summary.total} color="#10B981" />
        <SummaryCard title="Expired" count={summary.expired} total={summary.total} color="#EF4444" />
      </div>
      {/* 🔹 Search + Per Page */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        {/* Search bar */}
        <div className="relative w-full md:w-1/2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by email or link..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Per Page selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
          <label className="text-sm font-medium text-gray-600">Per Page:</label>
          <select
            value={perPage}
            onChange={(e) => {
              setCurrentPage(1);
              setPerPage(Number(e.target.value));
            }}
            className="bg-white focus:outline-none text-gray-700 font-medium"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {["all", "pending", "accepted", "completed", "expired"].map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
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

      {/* Invitations List */}
      {paginatedInvites.length === 0 ? (
        <p className="text-center">No invitations found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
          {paginatedInvites.map((invite) => {
            let statusColor;
            switch (invite.status) {
              case "pending":
                statusColor = "text-yellow-500";
                break;
              case "accepted":
                statusColor = "text-blue-500";
                break;
              case "completed":
                statusColor = "text-green-600";
                break;
              case "expired":
              default:
                statusColor = "text-red-500";
                break;
            }
            return (
              <div
                key={invite.id}
                className="p-4 flex flex-col gap-3 w-full md:w-80 border rounded-md"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="checkbox"
                    checked={selectedInvites.includes(invite.id)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedInvites([...selectedInvites, invite.id]);
                      else
                        setSelectedInvites(
                          selectedInvites.filter((id) => id !== invite.id)
                        );
                    }}
                  />
                  <span className={`text-sm font-medium ${statusColor}`}>
                    Status:{" "}
                    {invite.status.charAt(0).toUpperCase() +
                      invite.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 break-all text-center">
                  {invite.email} -{" "}
                  <a
                    href={invite.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    {invite.link}
                  </a>
                </p>
                <p className="text-sm text-gray-700 text-center">
                  Expires:{" "}
                  <span className="font-semibold">
                    {new Date(invite.expiresAt).toLocaleString()}
                  </span>
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => copyLink(invite.link)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
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
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminInvitationPage;
