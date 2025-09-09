import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ClipboardDocumentCheckIcon 
} from "@heroicons/react/24/solid";

// Modern Analytics Card
const AnalyticsCard = ({ title, value, Icon, iconColor }) => {
  return (
    <div className="flex items-center p-3 bg-white rounded-2xl shadow hover:shadow-lg transition transform hover:scale-105 w-full max-w-xs">
      <div className={`p-2 rounded-full bg-gray-100 flex items-center justify-center ${iconColor}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div className="flex flex-col ml-2 gap-0">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const DashboardAnalytics = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    fetchInvites();
  }, []);

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  const totalInvites = invites.length;
  const pending = invites.filter(i => i.status === "pending" && !isExpired(i.expiresAt)).length;
  const accepted = invites.filter(i => i.status === "accepted" && !isExpired(i.expiresAt)).length;
  const completed = invites.filter(i => i.status === "completed" && !isExpired(i.expiresAt)).length;

  const cards = [
    { title: "Total Invites", value: totalInvites, Icon: UserGroupIcon, iconColor: "text-gray-400" },
    { title: "Pending Invites", value: pending, Icon: ClockIcon, iconColor: "text-yellow-500" },
    { title: "Accepted Rate", value: accepted, Icon: CheckCircleIcon, iconColor: "text-green-500" },
    { title: "Completed Rate", value: completed, Icon: ClipboardDocumentCheckIcon, iconColor: "text-blue-500" },
  ];

  return (
    <div className="p-2 max-w-7xl mx-auto space-y-4 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Invitation Analytics
      </h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 justify-items-center">
          {cards.map((card) => (
            <AnalyticsCard
              key={card.title}
              title={card.title}
              value={card.value}
              Icon={card.Icon}
              iconColor={card.iconColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardAnalytics;
