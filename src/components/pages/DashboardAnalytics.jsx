import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UserGroupIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const DashboardAnalytics = () => {
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await axios.get("/api/invitations");
        setInvites(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch invitations:", err);
      }
    };
    fetchInvites();
  }, []);

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  // ======= Compute Stats =======
  const totalCandidates = invites.length;
  const invitationSent = invites.filter((i) => i.status !== "draft").length;
  const accepted = invites.filter((i) => i.status === "accepted").length;
  const pending = invites.filter((i) => i.status === "pending").length;
  const completed = invites.filter((i) => i.status === "completed").length;
  const expired = invites.filter((i) => isExpired(i.expiresAt) || i.status === "expired").length;

  const responseRate =
    invitationSent > 0 ? Math.round((accepted / invitationSent) * 100) + "%" : "0%";

  // ======= Monthly Trends =======
  const monthsLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const monthlyTrendsRaw = invites.reduce((acc, invite) => {
    if (!invite.createdAt) return acc;
    const month = new Date(invite.createdAt).toLocaleString("default", { month: "short" });
    if (!acc[month]) acc[month] = { candidateAdded: 0, invitationSent: 0, accepted: 0 };
    acc[month].candidateAdded += 1;
    if (invite.status !== "draft") acc[month].invitationSent += 1;
    if (invite.status === "accepted") acc[month].accepted += 1;
    return acc;
  }, {});

  // Convert counts to repeated points for scatter plot
  const generatePoints = (month, count) =>
    Array.from({ length: count }, (_, i) => ({
      x: month,
      y: i + 1,
    }));

  const scatterData = {
    datasets: [
      {
        label: "Candidate Added",
        data: monthsLabels.flatMap((m) => generatePoints(m, monthlyTrendsRaw[m]?.candidateAdded || 0)),
        pointStyle: "circle",
        pointRadius: 12,
        backgroundColor: "blue",
      },
      {
        label: "Invitation Sent",
        data: monthsLabels.flatMap((m) => generatePoints(m, monthlyTrendsRaw[m]?.invitationSent || 0)),
        pointStyle: "triangle",
        pointRadius: 12,
        backgroundColor: "green",
      },
      {
        label: "Accepted",
        data: monthsLabels.flatMap((m) => generatePoints(m, monthlyTrendsRaw[m]?.accepted || 0)),
        pointStyle: "rectRounded",
        pointRadius: 12,
        backgroundColor: "purple",
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Monthly Trends" },
    },
    scales: {
      y: {
        min: 0,
        max: 4,
        ticks: { stepSize: 1 },
        title: { display: true, text: "Count" },
      },
      x: {
        type: "category",
        labels: monthsLabels,
        offset: false,
        title: { display: true, text: "Month" },
        grid: { drawTicks: true, drawOnChartArea: true, drawBorder: true },
      },
    },
  };

  // ======= Top Companies =======
  const topCompanies = invites.reduce((acc, invite) => {
    if (!invite.company) return acc;
    acc[invite.company] = (acc[invite.company] || 0) + 1;
    return acc;
  }, {});
  const topCompaniesArray = Object.entries(topCompanies)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ======= Position Distribution =======
  const positions = invites.reduce((acc, invite) => {
    if (!invite.position) return acc;
    acc[invite.position] = (acc[invite.position] || 0) + 1;
    return acc;
  }, {});
  const positionsArray = Object.entries(positions)
    .map(([position, count]) => ({ position, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ======= Card Hover Class with smooth spacing =======
  const cardClass =
    "bg-white p-4 rounded-lg shadow transition transform hover:-translate-y-2 hover:shadow-lg";

  return (
    <div className="space-y-6">
      {/* Row 1: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardClass} flex items-center`}>
          <UserGroupIcon className="h-8 w-8 text-blue-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Total Candidates</p>
            <p className="text-xl font-bold">{totalCandidates}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center`}>
          <EnvelopeIcon className="h-8 w-8 text-green-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Invitation Sent</p>
            <p className="text-xl font-bold">{invitationSent}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center`}>
          <CheckCircleIcon className="h-8 w-8 text-purple-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Response Rate</p>
            <p className="text-xl font-bold">{responseRate}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center`}>
          <ClockIcon className="h-8 w-8 text-yellow-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-xl font-bold">{pending}</p>
          </div>
        </div>
      </div>

      {/* Row 2: Status Distribution + Monthly Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${cardClass} flex flex-col`}>
          <h6 className="font-semibold text-gray-700 mb-2">Status Distribution</h6>
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{accepted}</p>
              <p className="text-sm text-gray-500">Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{expired}</p>
              <p className="text-sm text-gray-500">Expired</p>
            </div>
          </div>
        </div>
        <div className={`${cardClass}`}>
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      </div>

      {/* Row 3: Top Companies & Position Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cardClass}>
          <h6 className="font-semibold text-gray-700 mb-2">Top Companies</h6>
          {topCompaniesArray.map((c, i) => (
            <p key={i} className="text-gray-500">{c.name} - {c.count} candidates</p>
          ))}
        </div>
        <div className={cardClass}>
          <h6 className="font-semibold text-gray-700 mb-2">Position Distribution</h6>
          {positionsArray.map((p, i) => (
            <p key={i} className="text-gray-500">{p.position} - {p.count}</p>
          ))}
        </div>
      </div>

      {/* Row 4: Detailed Statistics */}
      <div className={cardClass}>
        <h6 className="font-semibold text-gray-700 mb-4">Detailed Statistics</h6>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total Candidates</p>
            <p className="text-xl font-bold text-gray-900">{totalCandidates}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Positive Response</p>
            <p className="text-xl font-bold text-green-600">{accepted}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Awaiting Response</p>
            <p className="text-xl font-bold text-yellow-500">{pending}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Expired</p>
            <p className="text-xl font-bold text-red-500">{expired}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
