import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Summary Card
const SummaryCard = ({ title, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="p-4 flex flex-col items-center gap-2">
      <p className="font-semibold text-center">{title}</p>
      <p className="text-xl font-bold text-center">{count}</p>
      <div className="w-full bg-gray-200 rounded h-2">
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
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  // Fetch invitations
  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/invitations");
      setInvites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to fetch invitations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const res = await axios.get("/api/candidates");
      setCandidates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to fetch candidates.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvites();
    fetchCandidates();
  }, []);

  // Dynamic perPage based on viewport height
  const calculatePerPage = () => {
    const viewportHeight = window.innerHeight;
    const reservedHeight = 350;
    const cardHeight = 140;
    const cardsPerPage = Math.floor((viewportHeight - reservedHeight) / cardHeight);
    setPerPage(cardsPerPage > 0 ? cardsPerPage : 1);
  };

  useEffect(() => {
    calculatePerPage();
    window.addEventListener("resize", calculatePerPage);
    return () => window.removeEventListener("resize", calculatePerPage);
  }, []);

  // Generate & Send Invitations (email + SMS)
  const generateInvites = async () => {
    if (!candidates || candidates.length === 0) {
      return toast.warn("No candidates available!");
    }
    try {
      setLoading(true);
      // Send bulk invitation request to backend
      const res = await axios.post("/api/invitations/bulk", { candidates });
      const createdInvites = Array.isArray(res.data) ? res.data : [];

      setInvites(createdInvites);

      // Automatically send SMS if phone exists
      for (let invite of createdInvites) {
        if (invite.phone) {
          try {
            await axios.post(`/api/invitations/${invite.id}/send-sms`, { phone: invite.phone });
          } catch (err) {
            console.error(`SMS failed for ${invite.email}`);
          }
        }
      }

      toast.success(`Invitations sent (email + SMS) to ${createdInvites.length} candidates!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send invitations.");
    } finally {
      setLoading(false);
    }
  };

  // Resend Invitations (selected candidates)
  const resendInvites = async () => {
    if (selectedCandidates.length === 0) {
      return toast.warn("Select at least one candidate to resend!");
    }
    try {
      setLoading(true);
      for (let inviteId of selectedCandidates) {
        await axios.post(`/api/invitations/${inviteId}/resend`);
      }
      toast.success("Selected invitations resent!");
      fetchInvites();
      setSelectedCandidates([]);
    } catch (err) {
      toast.error("Failed to resend invitations.");
    } finally {
      setLoading(false);
    }
  };

  // Send Reminder (selected candidates)
  const sendReminders = async () => {
    if (selectedCandidates.length === 0) {
      return toast.warn("Select at least one candidate to send reminder!");
    }
    try {
      setLoading(true);
      for (let inviteId of selectedCandidates) {
        await axios.post(`/api/invitations/${inviteId}/reminder`);
      }
      toast.success("Reminders sent!");
    } catch (err) {
      toast.error("Failed to send reminders.");
    } finally {
      setLoading(false);
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

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  // Filter invitations
  const filteredInvites = Array.isArray(invites)
    ? invites.filter((invite) => {
        if (filter === "all") return true;
        if (filter === "expired") return isExpired(invite.expiresAt);
        return invite.status === filter && !isExpired(invite.expiresAt);
      })
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredInvites.length / perPage);
  const paginatedInvites = filteredInvites.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Summary
  const summary = {
    total: invites.length,
    pending: invites.filter((i) => i.status === "pending" && !isExpired(i.expiresAt)).length,
    accepted: invites.filter((i) => i.status === "accepted" && !isExpired(i.expiresAt)).length,
    completed: invites.filter((i) => i.status === "completed" && !isExpired(i.expiresAt)).length,
    expired: invites.filter((i) => isExpired(i.expiresAt)).length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-center md:text-left">
          Invitation Management
        </h2>
        <button
          onClick={generateInvites}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Sending Invitations..." : "Generate & Send Invitations"}
        </button>
      </div>

      {/* Bulk action buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={resendInvites}
          disabled={selectedCandidates.length === 0 || loading}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Resend Selected
        </button>
        <button
          onClick={sendReminders}
          disabled={selectedCandidates.length === 0 || loading}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send Reminder Selected
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 justify-items-center">
        <SummaryCard title="Total" count={summary.total} total={summary.total} color="#3B82F6" />
        <SummaryCard title="Pending" count={summary.pending} total={summary.total} color="#FACC15" />
        <SummaryCard title="Accepted" count={summary.accepted} total={summary.total} color="#3B82F6" />
        <SummaryCard title="Completed" count={summary.completed} total={summary.total} color="#10B981" />
        <SummaryCard title="Expired" count={summary.expired} total={summary.total} color="#EF4444" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {["all", "pending", "accepted", "completed", "expired"].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setCurrentPage(1); }}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition-colors`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Invitations List */}
      {paginatedInvites.length === 0 ? (
        <p className="text-center">No invitations found for the selected filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
          {paginatedInvites.map((invite) => {
            let statusColor;
            switch (invite.status) {
              case "pending": statusColor = "text-yellow-500"; break;
              case "accepted": statusColor = "text-blue-500"; break;
              case "completed": statusColor = "text-green-600"; break;
              case "expired":
              default: statusColor = "text-red-500"; break;
            }

            return (
              <div key={invite.id} className="p-4 flex flex-col gap-3 w-full md:w-80 border rounded-md">
                <div className="flex items-center justify-between">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(invite.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCandidates([...selectedCandidates, invite.id]);
                      else setSelectedCandidates(selectedCandidates.filter(id => id !== invite.id));
                    }}
                  />
                  <span className={`text-sm font-medium ${statusColor}`}>
                    Status: {isExpired(invite.expiresAt) ? "Expired ❌" : invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 break-all text-center">
                  {invite.email} -{" "}
                  <a href={invite.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700">
                    {invite.link}
                  </a>
                </p>
                <p className="text-sm text-gray-700 text-center">
                  Expires: <span className="font-semibold">{new Date(invite.expiresAt).toLocaleString()}</span>
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <button onClick={() => copyLink(invite.link)} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors">
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
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-300">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => goToPage(page)} className={`px-3 py-1 rounded ${currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>{page}</button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-300">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminInvitationPage;
