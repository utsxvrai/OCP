import { useState } from 'react';
import { complaintAPI } from '../services/api';

function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    
    if (!complaintId.trim()) {
      setError('Please enter a valid complaint ID');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await complaintAPI.trackById(complaintId);
      setComplaint(response.data);
      setUpdates(response.data.updates || []);
    } catch (err) {
      console.error('Error tracking complaint:', err);
      setError('Complaint not found. Please check the ID and try again.');
      setComplaint(null);
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'in-progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'reopened':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Track Your Complaint</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="complaintId" className="block text-sm font-medium text-gray-700 mb-1">
                Complaint ID
              </label>
              <input
                type="text"
                id="complaintId"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                placeholder="Enter your complaint ID (e.g., OCP-123456-789)"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
        
        {complaint && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{complaint.title}</h2>
                <p className="text-gray-500 mt-1">
                  Complaint ID: <a 
                    href={`/complaints/track/${complaint.complaintId}`} 
                    className="text-primary hover:text-primary-dark hover:underline"
                  >
                    {complaint.complaintId}
                  </a>
                </p>
                <p className="text-gray-500">Filed on: {formatDate(complaint.createdAt)}</p>
              </div>
              <div className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
              </div>
            </div>
            
            {/* Assigned Officer Information */}
            {complaint.assignedOfficer && (
              <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="text-md font-semibold text-blue-800 mb-3">Assigned Officer</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">{complaint.assignedOfficer.name}</div>
                      <div className="text-sm text-gray-600">{complaint.assignedOfficer.designation}</div>
                    </div>
                  </div>
                  
                  {complaint.assignedOfficer.availability && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      complaint.assignedOfficer.availability === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : complaint.assignedOfficer.availability === 'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : complaint.assignedOfficer.availability === 'unavailable'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {complaint.assignedOfficer.availability.charAt(0).toUpperCase() + 
                       complaint.assignedOfficer.availability.slice(1)}
                    </span>
                  )}
                </div>
                
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {complaint.assignedOfficer.email && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{complaint.assignedOfficer.email}</span>
                    </div>
                  )}
                  {complaint.assignedOfficer.phone && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{complaint.assignedOfficer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Complaint Status Timeline</h3>
              {updates.length > 0 ? (
                <div className="border-l-2 border-gray-200 ml-3 mt-4">
                  {updates.map((update, index) => (
                    <div key={index} className="relative pl-8 pb-5">
                      <div className="absolute -left-2.5 mt-1.5 w-5 h-5 rounded-full bg-primary"></div>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-800">
                            {update.officer_name || 'System'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(update.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700">{update.update_text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Created event */}
                  <div className="relative pl-8 pb-5">
                    <div className="absolute -left-2.5 mt-1.5 w-5 h-5 rounded-full bg-gray-400"></div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-800">System</span>
                        <span className="text-xs text-gray-500">{formatDate(complaint.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">Complaint filed</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No updates available for this complaint yet.</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Current Status</h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={getProgressBarWidth(complaint.status)} />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Filed</span>
                <span>Assigned</span>
                <span>Processing</span>
                <span>Resolved</span>
                <span>Closed</span>
              </div>
            </div>

            {complaint.attachmentUrl && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-semibold mb-2">Attachment</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {complaint.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    // Image attachment
                    <div className="flex flex-col items-center">
                      <img 
                        src={complaint.attachmentUrl} 
                        alt="Complaint Attachment" 
                        className="max-w-full max-h-56 object-contain rounded-md mb-2" 
                      />
                      <a 
                        href={complaint.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary-dark mt-2"
                      >
                        View Full Size
                      </a>
                    </div>
                  ) : (
                    // Document or other attachment
                    <div className="flex justify-center">
                      <a 
                        href={complaint.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Attachment
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Function to determine progress bar width based on status
function getProgressBarWidth(status) {
  switch (status) {
    case 'pending':
      return 'w-1/5 bg-yellow-500 h-2.5 rounded-full';
    case 'assigned':
      return 'w-2/5 bg-blue-500 h-2.5 rounded-full';
    case 'processing':
    case 'in-progress':
      return 'w-3/5 bg-purple-500 h-2.5 rounded-full';
    case 'resolved':
      return 'w-4/5 bg-green-500 h-2.5 rounded-full';
    case 'closed':
      return 'w-full bg-green-700 h-2.5 rounded-full';
    case 'reopened':
      return 'w-2/5 bg-red-500 h-2.5 rounded-full';
    default:
      return 'w-0 bg-gray-500 h-2.5 rounded-full';
  }
}

export default TrackComplaint; 