import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingComplaint, setDeletingComplaint] = useState(false);
  
  // For new update form
  const [updateText, setUpdateText] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  
  // For feedback form
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: '',
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);
  
  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getById(id);
      setComplaint(response.data.complaint);
      setUpdates(response.data.updates || []);
      setFeedback(response.data.feedback);
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      
      // Check if it's an authorization error
      if (err.response && err.response.status === 403) {
        setError('You are not authorized to view this complaint. Officers can only view complaints assigned to them.');
      } else if (err.response && err.response.status === 404) {
        setError('Complaint not found. It may have been deleted or the ID is incorrect.');
      } else {
        setError('Failed to load complaint details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    
    try {
      setSubmittingUpdate(true);
      await complaintAPI.addUpdate(id, updateText);
      setUpdateText('');
      fetchComplaintDetails(); // Refresh data
    } catch (err) {
      setError('Failed to add update. Please try again.');
    } finally {
      setSubmittingUpdate(false);
    }
  };
  
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };
  
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmittingFeedback(true);
      await complaintAPI.submitFeedback(id, feedbackData);
      fetchComplaintDetails(); // Refresh data
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    try {
      // Prompt the officer for additional details about this status change
      const statusDetails = prompt(`Optional: Add details about why you're changing status to ${newStatus}`);
      
      await complaintAPI.updateStatus(id, newStatus, statusDetails);
      fetchComplaintDetails(); // Refresh data
    } catch (err) {
      setError('Failed to update status. Please try again.');
    }
  };
  
  const handleReopenComplaint = async () => {
    try {
      await complaintAPI.reopenComplaint(id);
      fetchComplaintDetails(); // Refresh data
    } catch (err) {
      setError('Failed to reopen complaint. Please try again.');
    }
  };
  
  const handleDeleteComplaint = async () => {
    try {
      setDeletingComplaint(true);
      await complaintAPI.deleteComplaint(id);
      setShowDeleteModal(false);
      navigate('/dashboard', { state: { message: 'Complaint deleted successfully' } });
    } catch (err) {
      console.error('Error deleting complaint:', err);
      setError('Failed to delete complaint. Please try again later.');
      setShowDeleteModal(false);
      setDeletingComplaint(false);
    }
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-md shadow-sm">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded mb-4">
            <h2 className="text-xl font-semibold mb-2">Error Loading Complaint</h2>
            <p>{error}</p>
          </div>
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => navigate(-1)} 
              className="text-primary hover:text-primary-dark flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Go Back
            </button>
            {user?.role === 'officer' && (
              <Link to="/officer/my-complaints" className="text-primary hover:text-primary-dark">
                View My Assigned Complaints
              </Link>
            )}
            {user?.role === 'citizen' && (
              <Link to="/dashboard" className="text-primary hover:text-primary-dark">
                Back to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (!complaint) {
    return (
      <div className="container py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Complaint not found.
        </div>
        <Link to="/dashboard" className="text-primary hover:text-primary-dark">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }
  
  const canAddUpdate = user?.role === 'officer' || user?.role === 'admin';
  const canUpdateStatus = user?.role === 'officer' || user?.role === 'admin';
  const canSubmitFeedback = user?.id === complaint.citizen_id && 
    (complaint.status === 'resolved' || complaint.status === 'closed') && 
    !feedback;
  const canReopen = user?.id === complaint.citizen_id && 
    (complaint.status === 'resolved' || complaint.status === 'closed');
  const canDelete = user?.id === complaint.citizen_id || user?.role === 'admin';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container max-w-4xl">
        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{complaint.title}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Complaint ID: <span className="font-medium">{complaint.complaint_id}</span>
              </p>
            </div>
            <div className="flex items-center">
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
              </span>
              
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="ml-3 text-red-600 hover:text-red-800 flex items-center"
                  title="Delete Complaint"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Filed By</h3>
              <p className="text-gray-900">{complaint.citizen_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Filed On</h3>
              <p className="text-gray-900">{formatDate(complaint.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
              <p className="text-gray-900">{complaint.location}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">PIN Code</h3>
              <p className="text-gray-900">{complaint.pin_code}</p>
            </div>
          </div>
          
          {/* Assigned Officer Information */}
          {user?.role === 'citizen' && complaint.officer_name && (
            <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Assigned Officer Information</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">{complaint.officer_name}</div>
                    <div className="text-sm text-gray-600">{complaint.officer_designation}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    complaint.officer_availability === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : complaint.officer_availability === 'busy'
                      ? 'bg-yellow-100 text-yellow-800'
                      : complaint.officer_availability === 'unavailable'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.officer_availability?.charAt(0).toUpperCase() + complaint.officer_availability?.slice(1) || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {complaint.officer_email && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{complaint.officer_email}</span>
                  </div>
                )}
                {complaint.officer_phone && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-600">{complaint.officer_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-900 whitespace-pre-line p-4 bg-gray-50 rounded-md">
              {complaint.description}
            </p>
          </div>
          
          {complaint.attachment_url && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Attachment</h3>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                {complaint.attachment_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  // Image attachment
                  <div>
                    <img 
                      src={complaint.full_attachment_url || complaint.attachment_url} 
                      alt="Complaint Attachment" 
                      className="max-w-full max-h-96 object-contain mx-auto rounded-md mb-2" 
                    />
                    <div className="flex justify-center mt-2">
                      <a 
                        href={complaint.full_attachment_url || complaint.attachment_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:text-primary-dark"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open Full Size
                      </a>
                    </div>
                  </div>
                ) : complaint.attachment_url.match(/\.pdf$/i) ? (
                  // PDF attachment
                  <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">PDF Document</p>
                        <p className="text-gray-500">Click to download</p>
                      </div>
                    </div>
                    <a 
                      href={complaint.full_attachment_url || complaint.attachment_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-dark"
                    >
                      Download
                    </a>
                  </div>
                ) : complaint.attachment_url.match(/\.(doc|docx)$/i) ? (
                  // DOC attachment
                  <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">Word Document</p>
                        <p className="text-gray-500">Click to download</p>
                      </div>
                    </div>
                    <a 
                      href={complaint.full_attachment_url || complaint.attachment_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-dark"
                    >
                      Download
                    </a>
                  </div>
                ) : (
                  // Generic attachment
                  <a 
                    href={complaint.full_attachment_url || complaint.attachment_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary-dark"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    View Attachment
                  </a>
                )}
              </div>
            </div>
          )}
          
          {canUpdateStatus && (
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleStatusChange('in-progress')}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                  disabled={complaint.status === 'in-progress'}
                >
                  Mark as In Progress
                </button>
                <button 
                  onClick={() => handleStatusChange('resolved')}
                  className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                  disabled={complaint.status === 'resolved'}
                >
                  Mark as Resolved
                </button>
                <button 
                  onClick={() => handleStatusChange('closed')}
                  className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
                  disabled={complaint.status === 'closed'}
                >
                  Close Complaint
                </button>
              </div>
            </div>
          )}
          
          {canReopen && (
            <div className="border-t border-gray-200 pt-4 mt-6">
              <button 
                onClick={handleReopenComplaint}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
              >
                Reopen Complaint
              </button>
              <p className="text-gray-500 text-sm mt-1">
                If you are not satisfied with the resolution, you can reopen this complaint.
              </p>
            </div>
          )}
        </div>
        
        {/* Updates Section */}
        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Updates</h2>
          
          {updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="border-l-4 border-primary pl-4 py-2">
                  <p className="text-gray-900">{update.update_text}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-500 text-sm">
                      {update.is_officer ? 'Officer' : 'Citizen'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {formatDate(update.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No updates yet.</p>
          )}
          
          {canAddUpdate && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-2">Add Update</h3>
              <form onSubmit={handleUpdateSubmit}>
                <textarea
                  className="input !h-auto"
                  rows="3"
                  placeholder="Add an update or note about this complaint..."
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  required
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingUpdate}
                  >
                    {submittingUpdate ? 'Posting...' : 'Post Update'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Feedback Section */}
        {feedback ? (
          <div className="bg-white p-6 rounded-md shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Citizen Feedback</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">{feedback.rating}/5</span>
              </div>
              <p className="text-gray-900">{feedback.comment}</p>
              <p className="text-gray-500 text-sm mt-2">
                Submitted on {formatDate(feedback.created_at)}
              </p>
            </div>
          </div>
        ) : canSubmitFeedback ? (
          <div className="bg-white p-6 rounded-md shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Submit Feedback</h2>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Rate your experience
                </label>
                <div className="flex space-x-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="flex flex-col items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={feedbackData.rating === rating}
                        onChange={handleFeedbackChange}
                        className="sr-only"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-8 w-8 cursor-pointer ${
                          feedbackData.rating >= rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs mt-1">{rating}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                  Your Comments
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="4"
                  className="input !h-auto"
                  placeholder="Share your experience with how your complaint was handled..."
                  value={feedbackData.comment}
                  onChange={handleFeedbackChange}
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingFeedback}
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
        
        <div className="flex justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="text-primary hover:text-primary-dark"
          >
            &larr; Go Back
          </button>
          <Link to="/dashboard" className="text-primary hover:text-primary-dark">
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Complaint</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this complaint? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
                disabled={deletingComplaint}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComplaint}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                disabled={deletingComplaint}
              >
                {deletingComplaint ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintDetails; 