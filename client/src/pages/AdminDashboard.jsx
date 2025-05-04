import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { complaintAPI, officerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === '/admin' + path ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100';
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-md shadow-sm p-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
                <p className="text-gray-500 text-sm mt-1">Welcome, {user?.name}</p>
              </div>
              
              <nav className="space-y-1">
                <Link 
                  to="/admin" 
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
                  to="/admin/officers" 
                  className={`block px-3 py-2 rounded-md text-gray-700 ${isActive('/officers')}`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Manage Officers
                  </span>
                </Link>
                <Link 
                  to="/admin/complaints" 
                  className={`block px-3 py-2 rounded-md text-gray-700 ${isActive('/complaints')}`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    All Complaints
                  </span>
                </Link>
                <Link 
                  to="/admin/reports" 
                  className={`block px-3 py-2 rounded-md text-gray-700 ${isActive('/reports')}`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                    </svg>
                    Reports
                  </span>
                </Link>
                <Link 
                  to="/admin/settings" 
                  className={`block px-3 py-2 rounded-md text-gray-700 ${isActive('/settings')}`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Settings
                  </span>
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Routes>
              <Route path="/" element={<AdminHome />} />
              <Route path="/officers" element={<ManageOfficers />} />
              <Route path="/complaints" element={<AllComplaints />} />
              <Route path="/reports" element={<AdminReports />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminHome() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalOfficers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentComplaints, setRecentComplaints] = useState([]);
  
  useEffect(() => {
    // This would normally fetch dashboard stats from an admin API
    // For now, we'll simulate with sample data
    setTimeout(() => {
      setStats({
        totalComplaints: 125,
        pendingComplaints: 34,
        resolvedComplaints: 91,
        totalOfficers: 12
      });
      
      setRecentComplaints([
        { id: 1, complaint_id: 'OCP-123456-789', title: 'Road maintenance required', status: 'pending', created_at: '2023-05-15T10:30:00' },
        { id: 2, complaint_id: 'OCP-234567-890', title: 'Street light not working', status: 'assigned', created_at: '2023-05-14T14:20:00' },
        { id: 3, complaint_id: 'OCP-345678-901', title: 'Garbage collection issue', status: 'in-progress', created_at: '2023-05-13T09:15:00' },
        { id: 4, complaint_id: 'OCP-456789-012', title: 'Water supply disruption', status: 'resolved', created_at: '2023-05-12T16:45:00' },
        { id: 5, complaint_id: 'OCP-567890-123', title: 'Public park maintenance', status: 'closed', created_at: '2023-05-11T11:30:00' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);
  
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
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-700">Total Complaints</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalComplaints}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-500">
            <h3 className="font-semibold text-gray-700">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingComplaints}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md border-l-4 border-green-500">
            <h3 className="font-semibold text-gray-700">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.resolvedComplaints}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-md border-l-4 border-purple-500">
            <h3 className="font-semibold text-gray-700">Total Officers</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalOfficers}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Complaints</h2>
          <div className="space-y-4">
            {recentComplaints.map(complaint => (
              <div key={complaint.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{complaint.title}</p>
                    <p className="text-gray-500 text-sm">{complaint.complaint_id}</p>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/admin/complaints" className="text-primary hover:text-primary-dark text-sm font-medium">
              View All Complaints
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/admin/officers/new" 
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
            >
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-md mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Register New Officer</h3>
                  <p className="text-gray-500 text-sm">Add a new officer to the system</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/admin/reports/generate" 
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
            >
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-md mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Generate Report</h3>
                  <p className="text-gray-500 text-sm">Create reports for complaints and officers</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/admin/settings" 
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
            >
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-md mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">System Settings</h3>
                  <p className="text-gray-500 text-sm">Configure system parameters and options</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function ManageOfficers() {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Manage Officers</h2>
      <p className="text-gray-500">Officer management features will be implemented here.</p>
    </div>
  );
}

function AllComplaints() {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-6">All Complaints</h2>
      <p className="text-gray-500">Complaint management features will be implemented here.</p>
    </div>
  );
}

function AdminReports() {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Reports</h2>
      <p className="text-gray-500">Reporting features will be implemented here.</p>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-6">System Settings</h2>
      <p className="text-gray-500">Settings management features will be implemented here.</p>
    </div>
  );
}

export default AdminDashboard; 