import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { complaintAPI, officerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdminNavbar from '../components/AdminNavbar';
import AdminComplaints from './AdminComplaints';
import AdminOfficers from './AdminOfficers';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => {
    return location.pathname === '/admin' + path ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100';
  };
  
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalOfficers: 0,
    availableOfficers: 0,
    unavailableOfficers: 0,
    citizenCount: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all complaints for statistics
        const complaintsResponse = await complaintAPI.getAll();
        const complaints = complaintsResponse.data.complaints || [];
        
        // Fetch officers for statistics
        const officersResponse = await officerAPI.getAll();
        const officers = officersResponse.data.officers || [];

        // Process data for statistics
        const pendingCount = complaints.filter(c => 
          ['pending', 'assigned', 'in-progress', 'reopened'].includes(c.status)
        ).length;
        
        const resolvedCount = complaints.filter(c => 
          ['resolved', 'closed'].includes(c.status)
        ).length;
        
        const availableCount = officers.filter(o => 
          o.availability_status === 'available'
        ).length;
        
        const unavailableCount = officers.filter(o => 
          ['busy', 'unavailable', 'on-leave'].includes(o.availability_status)
        ).length;

        // Set the most recent 5 complaints
        const recent = [...complaints]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        // Update stats
        setStats({
          totalComplaints: complaints.length,
          pendingComplaints: pendingCount,
          resolvedComplaints: resolvedCount,
          totalOfficers: officers.length,
          availableOfficers: availableCount,
          unavailableOfficers: unavailableCount,
          citizenCount: 0 // You would need an additional API endpoint to get citizen count
        });
        
        setRecentComplaints(recent);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Main dashboard overview
  const DashboardOverview = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-600">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 mr-4">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pending Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingComplaints}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Resolved Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolvedComplaints}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-600">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 mr-4">
                  <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Officers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOfficers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/admin/complaints')}
                className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View All Complaints
              </button>
              <button 
                onClick={() => navigate('/admin/officers')}
                className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Officers
              </button>
              <button 
                onClick={() => navigate('/admin/reports')}
                className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Generate Reports
              </button>
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Complaints</h2>
              <button 
                onClick={() => navigate('/admin/complaints')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentComplaints.length > 0 ? (
                    recentComplaints.map((complaint) => (
                      <tr key={complaint.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{complaint.tracking_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {complaint.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${complaint.status === 'resolved' || complaint.status === 'closed' ? 'bg-green-100 text-green-800' : 
                              complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              complaint.status === 'assigned' || complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-red-100 text-red-800'}`}
                          >
                            {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => navigate(`/complaints/${complaint.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent complaints found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Officer Availability */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Officer Availability</h2>
            </div>
            <div className="p-6">
              <div className="relative h-10 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div 
                    style={{ width: `${stats.totalOfficers ? (stats.availableOfficers / stats.totalOfficers) * 100 : 0}%` }} 
                    className="bg-green-500 h-full flex items-center justify-center text-xs text-white"
                  >
                    Available
                  </div>
                  <div 
                    style={{ width: `${stats.totalOfficers ? (stats.unavailableOfficers / stats.totalOfficers) * 100 : 0}%` }} 
                    className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white"
                  >
                    Unavailable
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4 text-sm text-gray-600">
                <div>Available: {stats.availableOfficers} officers</div>
                <div>Unavailable: {stats.unavailableOfficers} officers</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="pt-16">
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="complaints/*" element={<AdminComplaints />} />
          <Route path="officers/*" element={<AdminOfficers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard; 