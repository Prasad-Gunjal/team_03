import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminDashboard/AdminSidebar";
import AdminNavbar from "../components/AdminDashboard/AdminNavbar";
import AdminReportCard from "../components/AdminDashboard/AdminReportCard";
import AdminStatusUpdateForm from "../components/AdminDashboard/AdminStatusUpdateForm";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      setError("");
      try {
        // token is stored under "token" key on login (localStorage or sessionStorage)
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/complaints/admin/list?page=1&limit=50", {
          headers: token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = await res.json();
        // API returns { data, total, page, pages }
        setComplaints(data.data || data || []);
      } catch (err) {
        console.error("Failed to fetch admin complaints:", err);
        setError("Failed to load complaints. Make sure you are logged in as admin and backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleStatusUpdate = (complaint, isRefresh = false) => {
    if (isRefresh) {
      // Update the complaint in the list
      setComplaints(prev => 
        prev.map(c => c._id === complaint._id ? complaint : c)
      );
    } else {
      // Open the update form
      setSelectedComplaint(complaint);
      setIsUpdateFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setIsUpdateFormOpen(false);
    setSelectedComplaint(null);
  };

  const handleComplaintUpdated = (updatedComplaint) => {
    // Update the complaint in the list
    setComplaints(prev => 
      prev.map(c => c._id === updatedComplaint._id ? updatedComplaint : c)
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div id="admin-header" className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Complaints Management</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Manage all user complaints</p>
              <p className="text-xs text-gray-500 mt-1">Total: {complaints.length} complaints</p>
            </div>
          </div>

          <div id="complaints-grid">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-gray-500 ml-3">Loading complaints...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-600">No complaints found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.map((c) => (
                  <AdminReportCard 
                    key={c._id || c.id} 
                    report={c} 
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status Update Form Modal */}
          <AdminStatusUpdateForm
            complaint={selectedComplaint}
            isOpen={isUpdateFormOpen}
            onClose={handleFormClose}
            onStatusUpdate={handleComplaintUpdated}
          />
        </main>
      </div>
    </div>
  );
}
