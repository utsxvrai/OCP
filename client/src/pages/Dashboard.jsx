import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getMyComplaints();
      setComplaints(response.data.complaints);
    } catch (err) {
      setError('Failed to fetch complaints. Please try again later.');
      console.error(err);
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
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container">
        <div className="mb-8 bg-white p-6 rounded-md shadow-sm border-l-4 border-primary">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Citizen Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Citizen'}</p>
            </div>
            <Link to="/complaints/new" className="btn btn-primary">
              File New Complaint
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Your Complaints</h2>

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
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Officer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
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
                        {complaint.complaint_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complaint.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complaint.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                          {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complaint.officer_name ? (
                          <div>
                            <div className="font-medium">{complaint.officer_name}</div>
                            <div className="text-xs text-gray-400">{complaint.officer_designation}</div>
                            {complaint.officer_availability && (
                              <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                complaint.officer_availability === 'available' 
                                  ? 'bg-green-100 text-green-800' 
                                  : complaint.officer_availability === 'busy'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {complaint.officer_availability.charAt(0).toUpperCase() + complaint.officer_availability.slice(1)}
                              </span>
                            )}
                          </div>
                        ) : complaint.status === 'pending' ? (
                          <span className="italic text-gray-400">Waiting for assignment</span>
                        ) : (
                          <span className="italic text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
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
              <p className="text-gray-500 mb-4">You haven't filed any complaints yet.</p>
              <Link to="/complaints/new" className="btn btn-primary">
                File Your First Complaint
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-md shadow-sm border-t-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/complaints/new" className="text-blue-600 hover:underline">
                  File New Complaint
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-blue-600 hover:underline">
                  Update Profile
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-blue-600 hover:underline">
                  Track Complaint
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-md shadow-sm border-t-4 border-green-500">
            <h3 className="text-lg font-semibold mb-2">Help &amp; Support</h3>
            <p className="text-gray-600 mb-4">Need assistance with your complaints?</p>
            <div className="text-gray-700">
              <p><strong>Email:</strong> support@ocportal.gov.in</p>
              <p><strong>Phone:</strong> 1800-123-4567 (Toll Free)</p>
              <p><strong>Hours:</strong> 9 AM to 6 PM (Mon-Sat)</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-md shadow-sm border-t-4 border-amber-500">
            <h3 className="text-lg font-semibold mb-2">Important Information</h3>
            <div className="text-gray-600 space-y-2">
              <p>• All complaints are reviewed within 24-48 hours</p>
              <p>• You'll receive updates via email</p>
              <p>• Please provide accurate information</p>
              <p>• Keep your complaint ID safe for future reference</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 