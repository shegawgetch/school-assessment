import { useEffect, useState } from "react"; 
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserGroupIcon, ClockIcon, CheckCircleIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/solid";

const AnalyticsCard = ({ title, value, color, gradient, Icon, tooltip }) => {
  return (
    <div 
      className={`p-6 flex flex-col items-center gap-3 rounded-2xl shadow-lg transform transition-transform hover:-translate-y-2 w-full md:w-64 ${gradient}`}
      title={tooltip} // Tooltip on hover
    >
      {Icon && <Icon className="h-10 w-10 text-white" />}
      <p className="text-lg font-semibold text-white text-center">{title}</p>
      <p className="text-3xl font-bold text-white text-center">{value}{title.includes("Rate") ? "%" : ""}</p>
      {title.includes("Rate") && (
        <div className="w-full bg-white/30 rounded-full h-3 mt-2">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{ width: `${value}%`, backgroundColor: color }}
          ></div>
        </div>
      )}
    </div>
  );
};

const DashboardAnalytics = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/invitations");
      setInvites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to fetch invitations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  const totalInvites = invites.length;
  const pending = invites.filter(i => i.status === "pending" && !isExpired(i.expiresAt)).length;
  const accepted = invites.filter(i => i.status === "accepted" && !isExpired(i.expiresAt)).length;
  const completed = invites.filter(i => i.status === "completed" && !isExpired(i.expiresAt)).length;

  const acceptanceRate = totalInvites ? ((accepted / totalInvites) * 100).toFixed(0) : 0;
  const completionRate = totalInvites ? ((completed / totalInvites) * 100).toFixed(0) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Invitation Analytics</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 justify-items-center">
          <AnalyticsCard 
            title="Total Invites" 
            value={totalInvites} 
            color="#3B82F6" 
            gradient="bg-gradient-to-br from-blue-500 to-blue-700" 
            Icon={UserGroupIcon}
            tooltip={`Total number of invitations: ${totalInvites}`}
          />
          <AnalyticsCard 
            title="Pending Invites" 
            value={pending} 
            color="#FACC15" 
            gradient="bg-gradient-to-br from-yellow-400 to-yellow-600" 
            Icon={ClockIcon}
            tooltip={`Invitations pending: ${pending}`}
          />
          <AnalyticsCard 
            title="Acceptance Rate" 
            value={acceptanceRate} 
            color="#3B82F6" 
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" 
            Icon={CheckCircleIcon}
            tooltip={`Acceptance rate: ${accepted} accepted of ${totalInvites}`}
          />
          <AnalyticsCard 
            title="Completion Rate" 
            value={completionRate} 
            color="#10B981" 
            gradient="bg-gradient-to-br from-green-400 to-green-600" 
            Icon={ClipboardDocumentCheckIcon}
            tooltip={`Completion rate: ${completed} completed of ${totalInvites}`}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardAnalytics;
