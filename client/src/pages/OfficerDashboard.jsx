import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { complaintAPI, officerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import OfficerAssignedComplaints from './OfficerAssignedComplaints';
import OfficerProfile from './OfficerProfile';
import OfficerReports from './OfficerReports';

function OfficerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [officerProfile, setOfficerProfile] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchAssignedComplaints();
    fetchOfficerProfile();
  }, []);

  const fetchOfficerProfile = async () => {
    try {
      const response = await officerAPI.getProfile();
      setOfficerProfile(response.data.officer);
    } catch (err) {
      console.error('Failed to fetch officer profile:', err);
    }
  };

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getAssigned();
      setComplaints(response.data.complaints);
    } catch (err) {
      setError('Failed to fetch assigned complaints. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (status) => {
    try {
      setAvailabilityLoading(true);
      await officerAPI.updateAvailability({ status });
      fetchOfficerProfile();
    } catch (err) {
      console.error('Failed to update availability:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Helper function to check if the current route is active
  const isActive = (path) => {
    const currentPath = location.pathname;
    return currentPath === `/officer${path}` ? 'bg-gray-100 font-medium' : '';
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
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
            <p className="text-gray-500">
              Welcome back, {user?.name}
            </p>
          </div>
          
          {/* Data privacy notice */}
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 mb-4 mx-6 mt-4">
            <h3 className="text-lg font-medium text-blue-800">Privacy Notice</h3>
            <p className="text-sm text-blue-700 mt-1">
              For privacy and data protection reasons, you can only access complaints that have been directly assigned to you.
              This ensures citizen information is only visible to the officers handling their specific cases.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 border-r border-gray-200 p-6">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Officer Details</h2>
                {officerProfile ? (
                  <div>
                    <p className="text-gray-700"><span className="font-medium">ID:</span> {officerProfile.officer_id}</p>
                    <p className="text-gray-700"><span className="font-medium">Department:</span> {officerProfile.department}</p>
                    <p className="text-gray-700"><span className="font-medium">Designation:</span> {officerProfile.designation}</p>
                    <p className="text-gray-700"><span className="font-medium">Assigned Area:</span> {officerProfile.pin_codes}</p>
                    <p className="text-gray-700">
                      <span className="font-medium">Complaints Pending:</span> {officerProfile.complaints_pending}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Complaints Solved:</span> {officerProfile.complaints_solved}
                    </p>
                    
                    <div className="mt-4">
                      <p className="text-gray-700 mb-2"><span className="font-medium">Availability Status:</span></p>
                      <div className="flex space-x-2">
                        <button
                          disabled={availabilityLoading || officerProfile.availability_status === 'available'}
                          onClick={() => updateAvailability('available')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            officerProfile.availability_status === 'available'
                              ? 'bg-green-100 text-green-800 font-semibold'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          Available
                        </button>
                        <button
                          disabled={availabilityLoading || officerProfile.availability_status === 'unavailable'}
                          onClick={() => updateAvailability('unavailable')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            officerProfile.availability_status === 'unavailable'
                              ? 'bg-red-100 text-red-800 font-semibold'
                              : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          Unavailable
                        </button>
                        <button
                          disabled={availabilityLoading || officerProfile.availability_status === 'on-leave'}
                          onClick={() => updateAvailability('on-leave')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            officerProfile.availability_status === 'on-leave'
                              ? 'bg-yellow-100 text-yellow-800 font-semibold'
                              : 'bg-gray-100 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700'
                          }`}
                        >
                          On Leave
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading officer details...</p>
                )}
              </div>
              
              <nav className="space-y-1">
                <Link 
                  to="/officer" 
                  className={`block px-3 py-2 rounded-md text-gray-700 ${isActive('')}`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </span>
                </Link>
                <Link 
                  to="/officer/my-complaints" 
                  className={`block px-3 py-2 rounded-md text-gray-700 ${isActive('/my-complaints')}`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    My Assigned Complaints
                  </span>
                </Link>
                <Link 
                  to="/profile" 
                  className={`block px-3 py-2 rounded-md text-gray-700 ${location.pathname.includes('/profile') ? 'bg-gray-100 font-medium' : ''}`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    My Profile
                  </span>
                </Link>
                <Link 
                  to="/officer/reports" 
                  className={`block px-3 py-2 rounded-md text-gray-700 ${isActive('/reports')}`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                    </svg>
                    Reports
                  </span>
                </Link>
              </nav>
            </div>
            
            <div className="md:col-span-3">
              <Routes>
                <Route path="/" element={<OfficerHome complaints={complaints} error={error} getStatusBadgeColor={getStatusBadgeColor} user={user} fetchComplaints={fetchAssignedComplaints} />} />
                <Route path="/my-complaints" element={<OfficerAssignedComplaints />} />
                <Route path="/profile" element={<OfficerProfile />} />
                <Route path="/reports" element={<OfficerReports />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfficerHome({ complaints, error, getStatusBadgeColor, user, fetchComplaints }) {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('');
  
  // Stats calculation
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === 'assigned' || c.status === 'pending').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'in-progress' || c.status === 'processing').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  
  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);
  
  // View complaint details
  const viewComplaint = (id) => {
    navigate(`/complaints/${id}`);
  };
  
  // Update complaint status quickly
  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      // Ask for details if not "processing" status
      let statusDetails = '';
      if (newStatus !== 'processing') {
        statusDetails = prompt(`Please provide details for status change to ${newStatus.toUpperCase()}`);
      }
      
      await complaintAPI.updateStatus(complaintId, newStatus, statusDetails);
      setStatusMessage(`Complaint status updated to ${newStatus.toUpperCase()}`);
      fetchComplaints();
    } catch (err) {
      console.error('Failed to update status:', err);
      setStatusMessage('Failed to update status. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Officer Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {statusMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 animate-fade-in-out">
            {statusMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-700">Total Assigned</h3>
            <p className="text-3xl font-bold text-blue-600">{totalComplaints}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-500">
            <h3 className="font-semibold text-gray-700">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingComplaints}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-md border-l-4 border-indigo-500">
            <h3 className="font-semibold text-gray-700">In Progress</h3>
            <p className="text-3xl font-bold text-indigo-600">{inProgressComplaints}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md border-l-4 border-green-500">
            <h3 className="font-semibold text-gray-700">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{resolvedComplaints}</p>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Your Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 text-sm">Officer ID:</span>
              <p className="text-gray-900 font-medium">{user?.officerId || 'Not assigned'}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Assigned PIN Code:</span>
              <p className="text-gray-900 font-medium">{user?.pinCode || 'Not assigned'}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            You are responsible for handling all complaints from your assigned PIN code area.
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-md shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assigned Complaints</h2>
        </div>
        
        {complaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complaint ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Citizen
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link 
                        to={`/complaints/${complaint.id}`}
                        className="text-primary hover:text-primary-dark hover:underline"
                      >
                        {complaint.complaint_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {complaint.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {complaint.citizen_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {complaint.location} 
                      <div className="text-xs text-gray-400">
                        PIN: {complaint.pin_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      <button
                        onClick={() => viewComplaint(complaint.id)}
                        className="text-primary hover:text-primary-dark mr-2"
                      >
                        View
                      </button>
                      
                      {/* Status update dropdown */}
                      <div className="relative inline-block text-left">
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              updateComplaintStatus(complaint.id, e.target.value);
                              e.target.value = ""; // Reset after selection
                            }
                          }}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          value=""
                        >
                          <option value="">Update Status</option>
                          <option value="assigned">Assigned</option>
                          <option value="processing">Processing</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No complaints assigned to you yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

function AreaComplaints({ complaints, loading, getStatusBadgeColor }) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading area complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Area Complaints</h1>
      <p className="text-gray-600 mb-6">All complaints in your assigned PIN code area</p>
      
      {complaints.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citizen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link 
                      to={`/complaints/${complaint.id}`}
                      className="text-primary hover:text-primary-dark hover:underline"
                    >
                      {complaint.complaint_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.citizen_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                      {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.officer_name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/complaints/${complaint.id}`}
                      className="text-primary hover:text-primary-dark"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No complaints in your assigned area.</p>
        </div>
      )}
    </div>
  );
}

export default OfficerDashboard; 