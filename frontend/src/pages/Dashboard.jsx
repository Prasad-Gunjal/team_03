import { useCallback, useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiFilter,
  FiMapPin,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import DashFooter from "../components/Dashboard/DashFooter";
import Sidebar from "../components/Dashboard/DashSidebar";
import Navbar from "../components/Dashboard/Navbar";
import ReportCard from "../components/Dashboard/ReportCard";
import StatCard from "../components/Dashboard/StatCard";
import { scrollToElement } from "../utils/smoothScroll";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("My Reports");
  const [username, setUsername] = useState("User");
  const [city, setCity] = useState("Unknown");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getToken = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) return token;

    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.token;
      } catch (err) {
        console.error("Error parsing user:", err);
        return null;
      }
    }
    return null;
  };

  const fetchComplaints = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Please login to view your complaints");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/complaints/my", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setComplaints(data.data || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load your complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const stats = {
    totalReports: complaints.length,
    pending: complaints.filter((c) => c.status === "Received" || c.status === "In Review").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length,
    completionRate:
      complaints.length > 0
        ? Math.round(
            (complaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length /
              complaints.length) *
              100
          )
        : 0,
  };

  useEffect(() => {
    fetchComplaints();
    const storedName = localStorage.getItem("username") || sessionStorage.getItem("username");
    const storedCity = localStorage.getItem("city") || sessionStorage.getItem("city");
    if (storedName) setUsername(storedName);
    if (storedCity) setCity(storedCity);
  }, [fetchComplaints]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                Welcome back, {username}!
              </h1>
              <p className="flex items-center text-gray-600 text-sm mt-1">
                <FiMapPin size={16} className="mr-1 text-purple-600" />
                {city} • Civic Engagement Dashboard
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={fetchComplaints}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
              >
                <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>

              {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-100 transition">
                <FiFilter size={16} />
                Filter
              </button> */}

              <button
                onClick={() => navigate("/reportissue")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-md hover:opacity-90 transition"
              >
                + Report Issue
              </button>
            </div>
          </div>

          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="My Reports"
              value={stats.totalReports.toString()}
              subtitle={`${stats.pending} pending`}
              color="from-purple-500 to-purple-600"
              icon={<FiFileText size={24} />}
            />
            <StatCard
              title="Resolved"
              value={stats.resolved.toString()}
              subtitle={`${stats.completionRate}% completion`}
              color="from-green-500 to-green-600"
              icon={<FiCheckCircle size={24} />}
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress.toString()}
              subtitle="Being addressed"
              color="from-orange-500 to-orange-600"
              icon={<FiClock size={24} />}
            />
            <StatCard
              title="Community Score"
              value="8.7"
              subtitle="+0.3 this month"
              color="from-pink-500 to-purple-500"
              icon={<FiUsers size={24} />}
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap border-b gap-4">
            {["My Reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 font-medium transition ${
                  activeTab === tab
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-500 hover:text-purple-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <p className="text-purple-600 font-medium flex items-center gap-2">
                <FiTrendingUp /> Response Rate
              </p>
              <h2 className="text-2xl font-bold">{stats.completionRate}%</h2>
              <div className="w-full bg-gray-200 h-2 rounded mt-2">
                <div
                  className="h-2 rounded bg-purple-600"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <p className="text-green-600 font-medium flex items-center gap-2">
                <FiCalendar /> This Month
              </p>
              <h2 className="text-2xl font-bold">{stats.totalReports}</h2>
              <p className="text-gray-500 text-sm">Your reports</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <p className="text-purple-600 font-medium flex items-center gap-2">
                <FiUsers /> Active Status
              </p>
              <h2 className="text-2xl font-bold">{stats.inProgress + stats.pending}</h2>
              <p className="text-gray-500 text-sm">Awaiting action</p>
            </div>
          </div>

          {/* Reports List */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-2 text-gray-500">
                <FiRefreshCw className="animate-spin" size={20} /> Loading reports...
              </div>
            </div>
          ) : complaints.length === 0 ? (
            <p className="text-gray-500">You have not submitted any reports yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.map((c) => (
                <ReportCard key={c._id} complaint={c} />
              ))}
            </div>
          )}

          <DashFooter />
        </main>
      </div>
    </div>
  );
}
