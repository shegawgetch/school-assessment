import { useState, useRef, useEffect } from "react";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  XCircleIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import DashboardAnalytics from "../pages/DashboardAnalytics";
import AdminCandidateUpload from "../pages/AdminCandidateUpload";
import CandidateFormDynamic from "../pages/CandidateFormDynamic";
import axios from "axios";

export default function Dashboard() {
  const [showManualModal, setShowManualModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [invites, setInvites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const manualModalRef = useRef(null);
  const uploadModalRef = useRef(null);
  const analyticsModalRef = useRef(null);

  const handleOverlayClick = (e, modalRef, closeFn) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeFn(false);
    }
  };

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await axios.get("/api/invitations");
        setInvites(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch invitations", err);
      }
    };
    fetchInvites();
  }, []);

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  const totalCandidates = invites.length;
  const pending = invites.filter((i) => i.status === "pending" && !isExpired(i.expiresAt)).length;
  const accepted = invites.filter((i) => i.status === "accepted" && !isExpired(i.expiresAt)).length;
  const completed = invites.filter((i) => i.status === "completed" && !isExpired(i.expiresAt)).length;
  const expired = invites.filter((i) => isExpired(i.expiresAt)).length;
  const invitationSent = invites.filter((i) => i.status !== "draft").length;

  const cards = [
    { title: "Total Candidates", value: totalCandidates, icon: UserGroupIcon, iconColor: "text-gray-400" },
    { title: "Pending", value: pending, icon: ClockIcon, iconColor: "text-yellow-400" },
    { title: "Accepted", value: accepted, icon: CheckCircleIcon, iconColor: "text-green-400" },
    { title: "Completed", value: completed, icon: ClipboardDocumentCheckIcon, iconColor: "text-blue-400" },
    { title: "Expired", value: expired, icon: XCircleIcon, iconColor: "text-red-400" },
    { title: "Invitation Sent", value: invitationSent, icon: EnvelopeIcon, iconColor: "text-indigo-400" },
  ];

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedInvites = [...invites].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] ?? "";
    const bVal = b[sortConfig.key] ?? "";
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredInvites = sortedInvites
    .filter((i) => (statusFilter === "All Status" ? true : i.status.toLowerCase() === statusFilter.toLowerCase()))
    .filter((i) => i.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Reusable Paper Table Component
  const PaperTable = ({ data }) => (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <div className="flex flex-wrap justify-between gap-2 items-center mb-4">
        <div className="flex gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate"
              className="pl-8 pr-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {["All Status", "Pending", "Completed", "Expired", "Accepted"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <button className="bg-gray-200 text-black border border-gray-400 px-4 py-1 rounded-lg shadow hover:bg-gray-150 transition flex items-center gap-1 font-medium">
          <ArrowDownTrayIcon className="h-5 w-5" />
          Export
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {["Candidate", "Contact", "Position", "Status", "Invitation", "Reminders", "Actions"].map(
              (col) => (
                <th
                  key={col}
                  className="px-3 py-2 cursor-pointer text-left text-gray-700 hover:text-blue-600"
                  onClick={() => requestSort(col.toLowerCase())}
                >
                  <div className="flex items-center gap-1">
                    {col}
                    {sortConfig.key === col.toLowerCase() && (
                      <ChevronDownIcon
                        className={`h-6 w-6 transform ${sortConfig.direction === "asc" ? "" : "rotate-180"}`}
                      />
                    )}
                  </div>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                No candidates found.
              </td>
            </tr>
          ) : (
            data.map((invite, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-3 py-2">{invite.name}</td>
                <td className="px-3 py-2">{invite.contact}</td>
                <td className="px-3 py-2">{invite.position}</td>
                <td className="px-3 py-2 capitalize">{invite.status}</td>
                <td className="px-3 py-2">{invite.invitation}</td>
                <td className="px-3 py-2">{invite.reminders}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button className="text-blue-600 hover:underline">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="min-h-screen p-4 pt-2 bg-gray-100">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h5 className="font-bold text-lg text-gray-800">Dashboard</h5>
          <span className="text-sm text-gray-600">Manage candidate invitations and track their progress</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow hover:bg-blue-500 transition flex items-center gap-1 font-medium text-sm"
          >
            + Add Candidate
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gray-200 bg-opacity-50 border border-gray-400 text-gray-800 px-3 py-1.5 rounded-lg shadow hover:bg-gray-300 transition flex items-center gap-1 font-medium text-sm"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            Upload CSV/Excel
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="flex items-center p-3 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:scale-105"
          >
            <card.icon className={`h-6 w-6 ${card.iconColor} mr-2`} />
            <div className="flex flex-col gap-0">
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs with icons */}
      <div className="flex border-b border-gray-300 mb-4">
        {[
          { name: "Overview", icon: ChartBarIcon },
          { name: "Candidates", icon: UserGroupIcon },
          { name: "Invitations", icon: EnvelopeIcon },
          { name: "Analytics", icon: ChartBarIcon },
        ].map((tab) => (
          <button
            key={tab.name}
            className={`px-4 py-2 font-medium flex items-center gap-1 ${
              activeTab === tab.name
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab(tab.name)}
          >
            <tab.icon className="h-5 w-5" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-white rounded-lg shadow flex flex-col">
            <h6 className="font-semibold text-gray-700 mb-2">Recent Activity</h6>
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow flex flex-col items-center text-center">
            <h6 className="font-semibold text-gray-700 mb-2">Quick Actions</h6>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => setShowManualModal(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-500 transition flex items-center justify-center gap-1 font-medium"
              >
                + Add New Candidate
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gray-200 bg-opacity-50 text-gray-800 px-3 py-2 rounded-lg shadow hover:bg-gray-300 transition flex items-center justify-center gap-1 font-medium"
              >
                Upload Bulk Candidates
              </button>
              <button
                onClick={() => setShowAnalyticsModal(true)}
                className="bg-gray-200 bg-opacity-50 text-gray-800 px-3 py-2 rounded-lg shadow hover:bg-gray-300 transition flex items-center justify-center gap-1 font-medium"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidates Tab */}
      {activeTab === "Candidates" && <PaperTable data={filteredInvites} />}

      {/* Invitations Tab */}
      {activeTab === "Invitations" && <PaperTable data={filteredInvites} />}

      {/* Analytics Tab */}
      {activeTab === "Analytics" && <DashboardAnalytics />}

      {/* Modals */}
      {showManualModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40"
          onClick={(e) => handleOverlayClick(e, manualModalRef, setShowManualModal)}
        >
          <div
            ref={manualModalRef}
            className="relative w-full max-w-md mt-16 mb-16 bg-white rounded-lg shadow-lg flex flex-col max-h-[calc(100vh-64px)]"
          >
            <div className="flex justify-end p-2 border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowManualModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-0 overflow-auto flex-grow">
              <CandidateFormDynamic onAdd={() => setShowManualModal(false)} />
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40"
          onClick={(e) => handleOverlayClick(e, uploadModalRef, setShowUploadModal)}
        >
          <div
            ref={uploadModalRef}
            className="relative w-full max-w-md mt-16 mb-16 bg-white rounded-lg shadow-lg flex flex-col max-h-[calc(100vh-64px)]"
          >
            <div className="flex justify-end p-2 border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-0 overflow-auto flex-grow">
              <AdminCandidateUpload />
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40"
          onClick={(e) => handleOverlayClick(e, analyticsModalRef, setShowAnalyticsModal)}
        >
          <div
            ref={analyticsModalRef}
            className="relative w-full max-w-3xl mt-16 mb-16 bg-white rounded-lg shadow-lg flex flex-col max-h-[calc(100vh-64px)]"
          >
            <div className="flex justify-end p-2 border-b border-gray-200 flex-shrink-0">
           {/* Centered Text */}
         <h6 className="absolute left-1/2 transform -translate-x-1/2 font-bold text-gray-700">
         Invitation Analytics
         </h6>
           <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              <DashboardAnalytics />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
