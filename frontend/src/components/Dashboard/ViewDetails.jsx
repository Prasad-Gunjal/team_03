import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiFlag,
  FiMapPin,
  FiMessageSquare,
  FiSettings,
  FiTag,
  FiThumbsDown,
  FiThumbsUp,
  FiTrash2,
  FiUser,
  FiMail
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtils";
import { scrollIntoView, scrollToElement } from "../../utils/smoothScroll";
import UpdateReport from "./UpdateReport";

export default function ViewDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const BACKEND_URL = "http://localhost:5000/api";
  const token = sessionStorage.getItem("token") || localStorage.getItem("token") || "";
  const loggedInUserId = sessionStorage.getItem("_id") || localStorage.getItem("_id") || "";
  const role = sessionStorage.getItem("role") || localStorage.getItem("role") || "";

  // Get complaint from navigation state or fetch by ID
  const [complaint, setComplaint] = useState(location.state || null);
  const [loadingComplaint, setLoadingComplaint] = useState(!location.state);
  const [upvotes, setUpvotes] = useState(complaint?.votes || 0);
  const [downvotes, setDownvotes] = useState(complaint?.downvotes || 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Refs for smooth scrolling
  const commentsRef = useRef(null);
  const newCommentRef = useRef(null);

  // Fetch complaint by ID if not present in state
  useEffect(() => {
    if (!complaint) {
      const params = new URLSearchParams(location.search);
      const id = params.get("id");
      if (id) {
        setLoadingComplaint(true);
        axios.get(`${BACKEND_URL}/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            setComplaint(res.data.data);
            setUpvotes(res.data.data.votes || 0);
            setDownvotes(res.data.data.downvotes || 0);
          })
          .catch(() => {
            alert("No complaint data found. Please navigate from the dashboard.");
            navigate("/dashboard");
          })
          .finally(() => setLoadingComplaint(false));
      } else {
        alert("No complaint data found. Please navigate from the dashboard.");
        navigate("/dashboard");
      }
    }
  }, [complaint, location.search, navigate, token]);

  const fetchComments = useCallback(async () => {
    if (!complaint?._id) {
      console.error("Cannot fetch comments: No complaint ID");
      return;
    }
    
    try {
      const url = `${BACKEND_URL}/complaints/${complaint._id}/comments`;
      console.log("Fetching comments from:", url);
      console.log("Complaint ID:", complaint._id);
      
      const res = await axios.get(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log("Comments fetched successfully:", res.data);
      setComments(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      console.error("Error details:", error.response?.data || error.message);
      console.error("Status code:", error.response?.status);
      setComments([]);
    }
  }, [BACKEND_URL, complaint?._id, token]);

  useEffect(() => {
    if (complaint && complaint._id) {
      fetchComments();
    }
  }, [fetchComments, complaint]);

  const handleVote = async (type) => {
    try {
      console.log("Voting:", type, "Complaint ID:", complaint._id);
      console.log("Token:", token ? "Present" : "Missing");
      
      const res = await axios.patch(
        `${BACKEND_URL}/complaints/${complaint._id}/vote`,
        { action: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Vote response:", res.data);
      setUpvotes(res.data.votes || 0);
      setDownvotes(res.data.downvotes || 0);
    } catch (error) {
      console.error("Error voting:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(`Failed to vote: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!complaint?._id) {
      alert("Error: No complaint ID found");
      console.error("Cannot add comment: No complaint ID");
      return;
    }
    
    try {
      const url = `${BACKEND_URL}/complaints/${complaint._id}/comments`;
      console.log("Adding comment to:", url);
      console.log("Complaint ID:", complaint._id);
      console.log("Comment text:", newComment);
      console.log("Token:", token ? "Present" : "Missing");
      
      const res = await axios.post(
        url,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Comment added successfully:", res.data);
      setComments(prev => [...prev, res.data.data]);
      setNewComment("");
      
      // Smooth scroll to the new comment after a brief delay
      setTimeout(() => {
        if (commentsRef.current) {
          scrollIntoView(commentsRef.current, 'end');
        }
      }, 100);
    } catch (error) {
      console.error("Error adding comment:", error);
      console.error("Error details:", error.response?.data || error.message);
      console.error("Status code:", error.response?.status);
      console.error("Request URL:", `${BACKEND_URL}/complaints/${complaint._id}/comments`);
      alert(`Failed to add comment: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      console.log("Deleting comment:", commentId);
      console.log("Token:", token ? "Present" : "Missing");
      
      await axios.delete(
        `${BACKEND_URL}/complaints/${complaint._id}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Comment deleted successfully");
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(`Failed to delete comment: ${error.response?.data?.message || error.message}`);
    }
  };

  // Format date helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time helper
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // If no complaint, show loading or redirect
  if (loadingComplaint || !complaint || !complaint._id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Enhanced Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-700 hover:text-purple-600 gap-2 font-semibold transition-all duration-200 hover:gap-3"
            >
              <FiArrowLeft className="text-xl" />
              <span className="text-base">Back to Dashboard</span>
            </button>
            {role === "admin" && (
              <button
                onClick={() => setModalIsOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Update Report
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Main Complaint Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight flex-1">
                    {complaint.title}
                  </h1>
                </div>
                
                {/* Status Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 border ${getStatusColor(complaint.status)}`}>
                    <FiSettings className="text-base" />
                    {complaint.status}
                  </span>
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 border ${getPriorityColor(complaint.priority)}`}>
                    <FiFlag className="text-base" />
                    {complaint.priority} Priority
                  </span>
                  <span className="px-4 py-2 text-sm font-semibold bg-purple-100 text-purple-800 rounded-full flex items-center gap-2 border border-purple-200">
                    <FiTag className="text-base" />
                    {complaint.category}
                  </span>
                   <span className="px-4 py-2 text-sm font-semibold bg-purple-100 text-purple-800 rounded-full flex items-center gap-2 border border-purple-200">
                    <FiTag className="text-base" />
                    {complaint.category} Assigned Department
                  </span>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-purple-600" />
                    <span>{formatDate(complaint.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="text-purple-600" />
                    <span>{formatTime(complaint.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-purple-600" />
                    <span>{complaint.location || "Vijayawada, Andhra Pradesh"}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {complaint.description}
                  </p>
                </div>

                {/* Complaint Photo */}
                {complaint.photo && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Attached Photo</h3>
                    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                      <img
                        src={getImageUrl(complaint.photo)}
                        alt="Complaint"
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                        onError={(e) => {
                          e.target.parentElement.parentElement.style.display = 'none';
                          console.error('Failed to load image:', complaint.photo);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Voting Section */}
                <div className="flex items-center gap-3 pt-4">
                  <span className="text-sm font-semibold text-gray-700">Community Support:</span>
                  <button
                    onClick={() => handleVote("upvote")}
                    className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 border border-green-200 transition-all duration-200 font-semibold shadow-sm hover:shadow"
                  >
                    <FiThumbsUp className="text-lg" />
                    <span>{upvotes}</span>
                  </button>
                  <button
                    onClick={() => handleVote("downvote")}
                    className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 border border-red-200 transition-all duration-200 font-semibold shadow-sm hover:shadow"
                  >
                    <FiThumbsDown className="text-lg" />
                    <span>{downvotes}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Response Section */}
            {(complaint.adminResponse || complaint.adminNotes) && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-lg border border-purple-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-600 text-white p-2 rounded-lg">
                    <FiMessageSquare className="text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Admin Response</h3>
                </div>
                {complaint.adminNotes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-purple-700 mb-2">Latest Update:</h4>
                    <p className="text-gray-800 leading-relaxed bg-white p-4 rounded-lg border border-purple-200">
                      {complaint.adminNotes}
                    </p>
                  </div>
                )}
                {complaint.adminResponse && (
                  <div>
                    <h4 className="text-sm font-semibold text-purple-700 mb-2">General Response:</h4>
                    <p className="text-gray-800 leading-relaxed">
                      {complaint.adminResponse}
                    </p>
                  </div>
                )}
                {!complaint.adminNotes && !complaint.adminResponse && (
                  <p className="text-gray-800 leading-relaxed">
                    Thank you for submitting the complaint. It will be reviewed shortly!
                  </p>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div id="comments-section" ref={commentsRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FiMessageSquare className="text-purple-600" />
                  Comments
                  <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {comments.length}
                  </span>
                </h3>
                <button
                  onClick={() => scrollToElement('comments-section', 80)}
                  className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Jump to Comments
                </button>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-8">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts or provide additional information..."
                    maxLength={500}
                    rows={4}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-500">
                      {newComment.length}/500 characters
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <FiMessageSquare className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => {
                    const userId = comment.user?._id?.toString() || "";
                    const canDelete = userId === loggedInUserId || role === "admin";
                    return (
                      <div
                        key={comment._id}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                {comment.user?.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {comment.user?.name || "Anonymous User"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(comment.createdAt)} at {formatTime(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed ml-13">
                              {comment.text}
                            </p>
                          </div>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                              title="Delete comment"
                            >
                              <FiTrash2 className="text-lg" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Reporter Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiUser className="text-purple-600" />
                Reporter Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiUser className="text-purple-600 text-xl mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">
                      {complaint.reportedBy?.name || "Not Available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiMail className="text-purple-600 text-xl mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900 break-all">
                      {complaint.reportedBy?.email || "Not Available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiMapPin className="text-purple-600 text-xl mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">
                      {complaint.location || "Vijayawada, Andhra Pradesh"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-4">Complaint Stats</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                    <p className="text-2xl font-bold text-green-600">{upvotes}</p>
                    <p className="text-xs text-gray-600">Upvotes</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                    <p className="text-2xl font-bold text-red-600">{downvotes}</p>
                    <p className="text-xs text-gray-600">Downvotes</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                    <p className="text-2xl font-bold text-blue-600">{comments.length}</p>
                    <p className="text-xs text-gray-600">Comments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {modalIsOpen && (
        <UpdateReport
          complaint={complaint}
          onClose={() => setModalIsOpen(false)}
          onUpdate={fetchComments}
        />
      )}
    </div>
  );
}
