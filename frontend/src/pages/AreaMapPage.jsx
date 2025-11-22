import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Dashboard/Navbar";
import DashSidebar from "../components/Dashboard/DashSidebar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FiMapPin, FiAlertCircle, FiFilter, FiX } from "react-icons/fi";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { searchLocation } from "../utils/geocoding";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const statusIcons = {
  Received: createCustomIcon("#3b82f6"),
  "In Review": createCustomIcon("#f59e0b"),
  "In Progress": createCustomIcon("#f97316"),
  Resolved: createCustomIcon("#10b981"),
  Closed: createCustomIcon("#6b7280"),
};

export default function AreaMapPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const center = [20.5937, 78.9629];

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/complaints", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const complaintsData = response.data.data || [];
        
        // Set complaints first to show statistics immediately
        setComplaints(complaintsData);
        setLoading(false);
        
        // Geocode addresses in the background with rate limiting
        setGeocoding(true);
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        for (let i = 0; i < complaintsData.length; i++) {
          const complaint = complaintsData[i];
          
          // Skip if already has coordinates
          if (complaint.latitude && complaint.longitude) {
            continue;
          }
          
          // Try to geocode the location
          if (complaint.location) {
            try {
              const results = await searchLocation(complaint.location);
              if (results && results.length > 0) {
                // Update the complaint with coordinates
                complaintsData[i] = {
                  ...complaint,
                  latitude: results[0].lat,
                  longitude: results[0].lng,
                };
                // Update state to show new marker
                setComplaints([...complaintsData]);
              }
              // Add delay to respect rate limits (1 request per second)
              await delay(1000);
            } catch (error) {
              console.error(`Failed to geocode location for complaint ${complaint._id}:`, error);
            }
          }
        }
        
        setGeocoding(false);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to fetch complaints");
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [navigate]);

  const areaStats = useMemo(() => {
    const stats = {};
    
    complaints.forEach((complaint) => {
      const location = complaint.location || "Unknown Area";
      const areaParts = location.split(",").map((part) => part.trim());
      const area = areaParts.length >= 2 ? areaParts[1] : areaParts[0] || "Unknown Area";
      
      if (!stats[area]) {
        stats[area] = {
          total: 0,
          received: 0,
          inReview: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          categories: {},
        };
      }
      
      stats[area].total++;
      
      const status = complaint.status || "Received";
      if (status === "Received") stats[area].received++;
      else if (status === "In Review") stats[area].inReview++;
      else if (status === "In Progress") stats[area].inProgress++;
      else if (status === "Resolved") stats[area].resolved++;
      else if (status === "Closed") stats[area].closed++;
      
      const category = complaint.category || "Other";
      stats[area].categories[category] = (stats[area].categories[category] || 0) + 1;
    });
    
    return stats;
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const statusMatch = selectedStatus === "all" || complaint.status === selectedStatus;
      const categoryMatch = selectedCategory === "all" || complaint.category === selectedCategory;
      return statusMatch && categoryMatch;
    });
  }, [complaints, selectedStatus, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(complaints.map((c) => c.category).filter(Boolean));
    return Array.from(cats);
  }, [complaints]);

  const overallStats = useMemo(() => {
    return {
      total: filteredComplaints.length,
      received: filteredComplaints.filter((c) => c.status === "Received").length,
      inReview: filteredComplaints.filter((c) => c.status === "In Review").length,
      inProgress: filteredComplaints.filter((c) => c.status === "In Progress").length,
      resolved: filteredComplaints.filter((c) => c.status === "Resolved").length,
      closed: filteredComplaints.filter((c) => c.status === "Closed").length,
    };
  }, [filteredComplaints]);

  const complaintsWithCoords = filteredComplaints.filter((c) => {
    return c.latitude && c.longitude;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <DashSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FiMapPin className="text-purple-600" />
              Area Map View
            </h1>
            <p className="text-gray-600 mt-1">Visualize complaints across different areas</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[600px] bg-white rounded-lg shadow-md">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-100 p-6 rounded-lg text-red-700 flex items-center gap-3">
              <FiAlertCircle className="text-2xl" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-lg shadow-md p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiAlertCircle className="text-purple-600" />
                    Overall Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Complaints</span>
                      <span className="font-bold text-lg text-purple-600">{overallStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Received</span>
                      <span className="font-semibold text-blue-600">{overallStats.received}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In Review</span>
                      <span className="font-semibold text-yellow-600">{overallStats.inReview}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="font-semibold text-orange-600">{overallStats.inProgress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Resolved</span>
                      <span className="font-semibold text-green-600">{overallStats.resolved}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiFilter className="text-purple-600" />
                    Filters
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="Received">Received</option>
                      <option value="In Review">In Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {(selectedStatus !== "all" || selectedCategory !== "all") && (
                    <button
                      onClick={() => {
                        setSelectedStatus("all");
                        setSelectedCategory("all");
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <FiX /> Clear Filters
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-5 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiMapPin className="text-purple-600" />
                    Area-wise Complaints
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(areaStats)
                      .sort((a, b) => b[1].total - a[1].total)
                      .slice(0, 10)
                      .map(([area, stats]) => (
                        <div key={area} className="border-b border-gray-200 pb-3 last:border-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800 text-sm truncate" title={area}>
                              {area}
                            </span>
                            <span className="font-bold text-purple-600">{stats.total}</span>
                          </div>
                          <div className="flex gap-2 text-xs flex-wrap">
                            {stats.resolved > 0 && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                 {stats.resolved}
                              </span>
                            )}
                            {stats.inProgress > 0 && (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                 {stats.inProgress}
                              </span>
                            )}
                            {stats.received > 0 && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                 {stats.received}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Map Legend</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                      <span className="text-gray-700">Received</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
                      <span className="text-gray-700">In Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow"></div>
                      <span className="text-gray-700">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
                      <span className="text-gray-700">Resolved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow"></div>
                      <span className="text-gray-700">Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-md h-[calc(100vh-180px)] overflow-hidden relative">
                  {/* Show info about geocoded complaints */}
                  {filteredComplaints.length > 0 && (
                    <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        {geocoding && (
                          <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></span>
                        )}
                        Showing <span className="font-bold text-purple-600">{complaintsWithCoords.length}</span> of{" "}
                        <span className="font-bold">{filteredComplaints.length}</span> on map
                      </p>
                      {geocoding && (
                        <p className="text-xs text-blue-600 mt-1">
                          🌍 Geocoding addresses...
                        </p>
                      )}
                      {!geocoding && complaintsWithCoords.length < filteredComplaints.length && (
                        <p className="text-xs text-gray-500 mt-1">
                          {filteredComplaints.length - complaintsWithCoords.length} locations not found
                        </p>
                      )}
                    </div>
                  )}
                  
                  {complaintsWithCoords.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <FiMapPin className="text-6xl mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No complaints with location data</p>
                        <p className="text-sm mt-2">
                          {filteredComplaints.length > 0 
                            ? "We're trying to geocode the addresses. Please wait..." 
                            : "No complaints match the selected filters"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <MapContainer
                      center={complaintsWithCoords.length > 0 && complaintsWithCoords[0].latitude ? 
                        [complaintsWithCoords[0].latitude, complaintsWithCoords[0].longitude] : center}
                      zoom={complaintsWithCoords.length > 0 ? 12 : 5}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {complaintsWithCoords.map((complaint) => (
                        <Marker 
                          key={complaint._id}
                          position={[complaint.latitude, complaint.longitude]}
                          icon={statusIcons[complaint.status] || statusIcons["Received"]}
                        >
                          <Popup maxWidth={300}>
                            <div className="p-2">
                              <h3 className="font-bold text-gray-800 mb-2">{complaint.title}</h3>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <FiMapPin className="text-gray-500" />
                                  <span className="text-gray-700">{complaint.location}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Category:</span>
                                  <span className="font-medium text-gray-800">{complaint.category}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Priority:</span>
                                  <span className={`font-medium ${
                                    complaint.priority === "High" || complaint.priority === "Critical" ? "text-red-600" :
                                    complaint.priority === "Medium" ? "text-yellow-600" : "text-green-600"
                                  }`}>
                                    {complaint.priority}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    complaint.status === "Resolved" ? "bg-green-100 text-green-800" :
                                    complaint.status === "In Progress" ? "bg-orange-100 text-orange-800" :
                                    complaint.status === "In Review" ? "bg-yellow-100 text-yellow-800" :
                                    complaint.status === "Closed" ? "bg-gray-100 text-gray-800" :
                                    "bg-blue-100 text-blue-800"
                                  }`}>
                                    {complaint.status}
                                  </span>
                                </div>
                              </div>
                              
                              {complaint.description && (
                                <p className="mt-3 text-sm text-gray-600 border-t pt-2">
                                  {complaint.description.substring(0, 100)}
                                  {complaint.description.length > 100 && "..."}
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
