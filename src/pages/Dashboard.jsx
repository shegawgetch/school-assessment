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
    { name: "Total Sent", value: dashboardData.totalSent, icon: "📧", circle: "bg-[var(--color-primary-blue-dark)]" },
    { name: "Accepted", value: dashboardData.totalAccepted, icon: "✅", circle: "bg-[var(--color-success-light)]" },
    { name: "Completed", value: dashboardData.totalCompleted, icon: "🎯", circle: "bg-[var(--color-info-light)]" },
    { name: "Expired", value: dashboardData.totalExpired, icon: "⏰", circle: "bg-[var(--color-error-light)]" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-blue-dark)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--secondary)] dark:bg-[var(--secondary),min-h-screen px-0 sm:px-0 md:px-6 lg:px-0 py-0 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold 
                       text-[var(--foreground)] dark:text-[var(--foreground)] leading-tight">
          Dashboard
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg 
                      text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
          Overview of invitation management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[var(--card)] dark:bg-[var(--card)] 
                       shadow-md rounded-2xl p-4 sm:p-6 flex items-center gap-4 
                       hover:shadow-lg transition-all duration-300"
          >
            {/* Icon container with fixed size and centered */}
            <div
              className={`flex-shrink-0 flex items-center justify-center rounded-full ${stat.circle}`} 
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="text-2xl sm:text-2xl md:text-2xl text-white">{stat.icon}</span>
            </div>

            <div>
              <p className="text-xs sm:text-sm md:text-base text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
                {stat.name}
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[var(--card)] dark:bg-[var(--card)] 
                        rounded-2xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg sm:text-xl font-medium text-[var(--foreground)] dark:text-[var(--foreground)] mb-4">
            Status Distribution
          </h3>
          <AnalyticsChart data={dashboardData.statusDistribution} type="pie" />
        </div>

        <div className="bg-[var(--card)] dark:bg-[var(--card)] 
                        rounded-2xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg sm:text-xl font-medium text-[var(--foreground)] dark:text-[var(--foreground)] mb-4">
            Monthly Trends
          </h3>
          <AnalyticsChart data={dashboardData.monthlyTrends} type="bar" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--card)] dark:bg-[var(--card)] 
                      rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
        <div className="px-4 sm:px-6 py-3 border-b border-[var(--border)] dark:border-[var(--border)]">
          <h3 className="text-lg sm:text-xl font-medium text-[var(--foreground)] dark:text-[var(--foreground)]">
            Recent Activity
          </h3>
        </div>
        <div className="p-4 sm:p-6 text-center text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]">
          <p>Recent invitation activity will appear here</p>
          <p className="text-sm mt-2">This section can be populated with real-time updates</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
