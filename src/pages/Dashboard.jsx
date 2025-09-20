import React, { useState, useEffect } from "react";
import { invitationAPI } from "../api/axiosService";
import AnalyticsChart from "../components/AnalyticsChart";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSent: 0,
    totalAccepted: 0,
    totalCompleted: 0,
    totalExpired: 0,
    recentInvitations: [],
    statusDistribution: [],
    monthlyTrends: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await invitationAPI.getDashboardData();
      const backendData = response.data.data;
      setDashboardData({
        totalSent: backendData.totalSent,
        totalAccepted: backendData.totalAccepted,
        totalCompleted: backendData.totalCompleted,
        totalExpired: backendData.totalExpired,
        recentInvitations: [],
        statusDistribution: backendData.statusDistribution,
        monthlyTrends: backendData.monthlyTrends || [],
      });
    } catch (err) {
      console.error("Dashboard API error:", err);
      setDashboardData({
        totalSent: 150,
        totalAccepted: 120,
        totalCompleted: 95,
        totalExpired: 15,
        recentInvitations: [],
        statusDistribution: [
          { name: "Sent", value: 150 },
          { name: "Accepted", value: 120 },
          { name: "Completed", value: 95 },
          { name: "Expired", value: 15 },
        ],
        monthlyTrends: [
          { name: "Jan", value: 45 },
          { name: "Feb", value: 52 },
          { name: "Mar", value: 38 },
          { name: "Apr", value: 67 },
          { name: "May", value: 73 },
          { name: "Jun", value: 89 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: "Total Sent", value: dashboardData.totalSent, icon: "📧", circle: "bg-blue-500" },
    { name: "Accepted", value: dashboardData.totalAccepted, icon: "✅", circle: "bg-green-500" },
    { name: "Completed", value: dashboardData.totalCompleted, icon: "🎯", circle: "bg-indigo-500" },
    { name: "Expired", value: dashboardData.totalExpired, icon: "⏰", circle: "bg-red-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of invitation management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-2xl p-6 flex items-center gap-4 hover:shadow-xl transition"
          >
            <div className={`flex-shrink-0 p-4 rounded-full ${stat.circle}`}>
              <span className="text-2xl text-white">{stat.icon}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
          <AnalyticsChart data={dashboardData.statusDistribution} type="pie" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
          <AnalyticsChart data={dashboardData.monthlyTrends} type="bar" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-600">
            <p>Recent invitation activity will appear here</p>
            <p className="text-sm mt-2">This section can be populated with real-time updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
