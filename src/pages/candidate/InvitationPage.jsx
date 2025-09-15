import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export default function InvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await axios.get(`http://localhost:8083/invitations/validate/${token}`);
        setInvitation(res.data);
        toast.success("Invitation validated successfully!", {
          icon: <CheckCircleIcon className="w-5 h-5 text-white" />,
        });

        // Countdown timer
        const expires = new Date(res.data.expiresAt).getTime();
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const diff = expires - now;
          if (diff <= 0) {
            clearInterval(interval);
            setTimeLeft("Expired");
            toast.warning("Invitation expired!", { icon: "⚠️" });
          } else {
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${mins}m ${secs}s`);
          }
        }, 1000);
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load invitation";
        setError(msg);
        toast.error(msg, { icon: <XCircleIcon className="w-5 h-5 text-white" /> });
      } finally {
        setLoading(false);
      }
    };
    fetchInvitation();
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!invitation) return null;

  const { candidate, test, status } = invitation;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-4 text-center">{test.title}</h1>

        <div className="flex justify-between mb-4 text-gray-700">
          <p>👤 {candidate.name}</p>
          <p>⏰ Deadline: {timeLeft}</p>
          <p>Status: <span className={`font-semibold ${status === 'Expired' ? 'text-red-600' : 'text-green-600'}`}>{status}</span></p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-6">
          <h2 className="font-semibold mb-2">📜 Instructions</h2>
          <div
            className="text-gray-700 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: test.instructions }}
          />
        </div>

        {status === "Pending" || status === "Started" ? (
          <button
            onClick={() => navigate(`/test/${token}`)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Start Assessment
          </button>
        ) : (
          <button
            disabled
            className="w-full px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold cursor-not-allowed"
          >
            Cannot Start
          </button>
        )}
      </div>
    </div>
  );
}
