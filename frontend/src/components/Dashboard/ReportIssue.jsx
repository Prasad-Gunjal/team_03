import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiUploadCloud,
  FiCamera,
  FiLoader,
} from "react-icons/fi";

import LocationMap from "./LocationMap";
import { reverseGeocode } from "../../utils/geocoding";

export default function ReportIssue() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    priority: "",
    photos: [],
  });

  const [showMap, setShowMap] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleLocationChange = async (coords) => {
    setIsLoadingLocation(true);
    try {
      // Get human-readable address from coordinates
      const address = await reverseGeocode(coords[0], coords[1]);
      setFormData((prev) => ({ ...prev, location: address }));
      setShowMap(false);
    } catch (error) {
      console.error('Error getting address:', error);
      // Fallback to coordinates if geocoding fails
      setFormData((prev) => ({ ...prev, location: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}` }));
      setShowMap(false);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      photos: Array.from(e.target.files),
    });
  };

  const getAuthToken = () => {
    // Try to get token directly first (stored by login)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      return token;
    }
    
    // Fallback: try to get from user object (legacy)
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.token;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  };

  const validateForm = () => {
    const { title, category, location, description, priority } = formData;
    
    if (!category) {
      setError('Issue Category is required');
      return false;
    }
    if (!title.trim()) {
      setError('Issue Title is required');
      return false;
    }
    if (!description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!priority) {
      setError('Priority Level is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!validateForm()) {

      return;
    }

    const token = getAuthToken();
    console.log('Auth token check:', {
      hasToken: !!token,
      tokenSource: localStorage.getItem('token') ? 'localStorage' : sessionStorage.getItem('token') ? 'sessionStorage' : 'none'
    });
    
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Prepare FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("description", formData.description);
      // Only send first photo (backend expects single file)
      if (formData.photos && formData.photos.length > 0) {
        formDataToSend.append("photo", formData.photos[0]);
      }

      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setSuccess('Report submitted successfully!');
        // Reset form
        setFormData({
          category: "",
          title: "",
          description: "",
          location: "",
          priority: "",
          photos: [],
        });
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-purple-800 hover:bg-purple-900 px-3 py-1 rounded-md shadow"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div className="ml-5">
            <h1 className="text-2xl font-bold text-left">Report an Issue</h1>
            <p className="text-sm opacity-90">
              Help make your community cleaner and safer
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-3xl mx-auto mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-center font-medium">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-center">{error}</p>
        </div>
      )}

      {/* Form Section */}
      <div className="max-w-3xl mx-auto mt-8 bg-white shadow rounded-lg p-8">
        <h2 className="flex items-center gap-2 font-semibold text-gray-800 text-lg">
          <FiCamera className="text-purple-600 " /> Issue Details
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-left mt-2">
          Provide detailed information about the issue you want to report
        </p>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Issue Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">
              Issue Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1 bg-gray-100 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select an issue category</option>
              <option>Infrastructure</option>
              <option>Roads</option>
              <option>Public Safety</option>
              <option>Environment</option>
              <option>Public Transport</option>
              <option>Other</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">
              Issue Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief summary of the issue"
              className="w-full border rounded p-2 mt-1 bg-gray-100 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue, including when you noticed it and any relevant details..."
              rows="3"
              className="w-full border rounded p-2 mt-1 bg-gray-100 focus:ring-2 focus:ring-purple-500"
              required
            ></textarea>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">
              Location * {isLoadingLocation && <span className="text-purple-600 text-xs">(Fetching address...)</span>}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter address or use location picker"
                className="flex-1 border rounded p-2 mt-1 bg-gray-100 focus:ring-2 focus:ring-purple-500"
                required
                disabled={isLoadingLocation}
              />
              <button
                type="button"
                className="border rounded p-2 mt-1 bg-purple-100 hover:bg-purple-200 flex items-center disabled:opacity-50 text-purple-700"
                onClick={() => setShowMap(true)}
                disabled={isLoadingLocation}
                title="Pick location from map"
              >
                <FiMapPin className="text-purple-700" />
              </button>
              {showMap && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-xl">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                      onClick={() => setShowMap(false)}
                    >
                      &times;
                    </button>
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">📍 Select Location on Map</h3>
                    <LocationMap onLocationChange={handleLocationChange} />
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>How to use:</strong> Click anywhere on the map to select a location. 
                        The address will be automatically fetched and filled in the location field.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">
              Priority Level *
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1 bg-gray-100 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select priority level</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">
              Photos (Optional)
            </label>
            <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50">
              <FiUploadCloud className="text-gray-400 text-3xl" />
              <p className="text-gray-500 text-sm mt-2">
                Drag and drop photos here, or{" "}
                <label className="text-purple-600 cursor-pointer hover:underline">
                  click to browse
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maximum 5 photos, up to 10MB each
              </p>
              {/* Photo Preview */}
              {formData.photos[0] && (
                <img
                  src={URL.createObjectURL(formData.photos[0])}
                  alt="Preview"
                  style={{ maxWidth: 200, marginTop: 10, borderRadius: 8, boxShadow: '0 2px 8px #ccc' }}
                />
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border rounded-md shadow hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md shadow hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Cards */}
      <div className="max-w-3xl mx-auto mt-10 grid grid-cols-3 gap-6 mb-10">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center shadow-sm">
          <FiCamera className="text-purple-600 text-2xl mx-auto" />
          <h3 className="mt-2 font-medium text-gray-800">Add Photos</h3>
          <p className="text-sm text-gray-500">
            Photos help authorities understand and prioritize your report
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center shadow-sm">
          <FiMapPin className="text-green-600 text-2xl mx-auto" />
          <h3 className="mt-2 font-medium text-gray-800">Precise Location</h3>
          <p className="text-sm text-gray-500">
            Accurate location helps dispatch teams reach the right place
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center shadow-sm">
          <FiUploadCloud className="text-orange-600 text-2xl mx-auto" />
          <h3 className="mt-2 font-medium text-gray-800">Track Progress</h3>
          <p className="text-sm text-gray-500">
            Monitor your report status from submission to resolution
          </p>
        </div>
      </div>
    </div>
  );
}
