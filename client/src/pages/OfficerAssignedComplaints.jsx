import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';

function OfficerAssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    fetchAssignedComplaints();
  }, []);
  
  const fetchAssignedComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintAPI.getAssigned();
      setComplaints(response.data.complaints);
      setError(null);
    } catch (err) {
      console.error('Error fetching assigned complaints:', err);
      setError('Failed to load assigned complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredComplaints = statusFilter === 'all'
    ? complaints
    : complaints.filter(complaint => complaint.status === statusFilter);
  
  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
      case 'processing':
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
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  // Count complaints by status
  const statusCounts = complaints.reduce((acc, complaint) => {
    const status = complaint.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  // Total assigned complaints
  const totalAssigned = complaints.length;
  const pendingCount = statusCounts['pending'] || 0;
  const inProgressCount = (statusCounts['in-progress'] || 0) + (statusCounts['processing'] || 0);
  const resolvedCount = statusCounts['resolved'] || 0;
  const closedCount = statusCounts['closed'] || 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Assigned Complaints</h1>
        <p className="text-gray-600 mt-1">
          Manage and track complaints assigned to you
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-primary">
          <div className="text-gray-500 text-sm">Total Assigned</div>
          <div className="text-2xl font-bold">{totalAssigned}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-gray-500 text-sm">Pending</div>
          <div className="text-2xl font-bold">{pendingCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
          <div className="text-gray-500 text-sm">In Progress</div>
          <div className="text-2xl font-bold">{inProgressCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-500 text-sm">Resolved</div>
          <div className="text-2xl font-bold">{resolvedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500">
          <div className="text-gray-500 text-sm">Closed</div>
          <div className="text-2xl font-bold">{closedCount}</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Status
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">All Status</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="processing">Processing</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="reopened">Reopened</option>
        </select>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {statusFilter === 'all' 
              ? 'No complaints are assigned to you yet.' 
              : `No complaints with status "${statusFilter}" are assigned to you.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citizen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    <Link 
                      to={`/complaints/${complaint.id}`}
                      className="hover:underline"
                    >
                      {complaint.complaint_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {complaint.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.citizen_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(complaint.created_at)}
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
      )}
    </div>
  );
}

export default OfficerAssignedComplaints; 