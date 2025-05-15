import { useState, useEffect } from 'react';
import { complaintAPI, officerAPI } from '../services/api';

function AdminReports() {
  const [reportType, setReportType] = useState('complaints');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // Fetch data for reports
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get complaints
      const complaintsResponse = await complaintAPI.getAll();
      let complaints = complaintsResponse.data.complaints || [];
      
      // Filter by date range
      complaints = complaints.filter(complaint => {
        const complaintDate = new Date(complaint.created_at);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // Include all complaints from the end date
        
        return complaintDate >= startDate && complaintDate <= endDate;
      });
      
      setComplaints(complaints);
      
      // Get officers if needed
      if (reportType === 'officers' || reportType === 'performance') {
        const officersResponse = await officerAPI.getAll();
        setOfficers(officersResponse.data.officers || []);
      }
      
      setShowReport(true);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle report type change
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setShowReport(false);
  };

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
    setShowReport(false);
  };

  // Generate report
  const handleGenerateReport = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  // Complaints report data
  const complaintsReport = {
    total: complaints.length,
    byStatus: {
      pending: complaints.filter(c => c.status === 'pending').length,
      assigned: complaints.filter(c => c.status === 'assigned').length,
      inProgress: complaints.filter(c => c.status === 'in-progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      closed: complaints.filter(c => c.status === 'closed').length,
      reopened: complaints.filter(c => c.status === 'reopened').length
    },
    averageResolutionTime: calculateAverageResolutionTime(complaints)
  };

  // Officers report data
  const officersReport = {
    total: officers.length,
    available: officers.filter(o => o.availability_status === 'available').length,
    unavailable: officers.filter(o => o.availability_status !== 'available').length,
    withMostComplaints: getOfficersWithMostComplaints(officers, complaints),
    withBestResolutionTime: getOfficersWithBestResolutionTime(officers, complaints)
  };

  // Calculate average resolution time in days
  function calculateAverageResolutionTime(complaints) {
    const resolvedComplaints = complaints.filter(c => 
      c.status === 'resolved' || c.status === 'closed'
    );
    
    if (resolvedComplaints.length === 0) return 'N/A';
    
    const totalTime = resolvedComplaints.reduce((sum, complaint) => {
      const createdDate = new Date(complaint.created_at);
      const resolvedDate = new Date(complaint.updated_at);
      const timeDiff = resolvedDate - createdDate;
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return sum + daysDiff;
    }, 0);
    
    return (totalTime / resolvedComplaints.length).toFixed(1);
  }

  // Get top officers with most complaints
  function getOfficersWithMostComplaints(officers, complaints) {
    const officerComplaintCounts = {};
    
    // Count complaints per officer
    complaints.forEach(complaint => {
      if (complaint.officer_id) {
        officerComplaintCounts[complaint.officer_id] = (officerComplaintCounts[complaint.officer_id] || 0) + 1;
      }
    });
    
    // Map officer IDs to officer objects with complaint counts
    const officersWithCounts = officers.map(officer => ({
      ...officer,
      complaintCount: officerComplaintCounts[officer.id] || 0
    }));
    
    // Sort by complaint count descending
    return officersWithCounts
      .sort((a, b) => b.complaintCount - a.complaintCount)
      .slice(0, 5); // Get top 5
  }

  // Get top officers with best resolution time
  function getOfficersWithBestResolutionTime(officers, complaints) {
    const officerResolutionTimes = {};
    const officerResolvedCounts = {};
    
    // Calculate total resolution time per officer
    complaints.forEach(complaint => {
      if (complaint.officer_id && (complaint.status === 'resolved' || complaint.status === 'closed')) {
        const createdDate = new Date(complaint.created_at);
        const resolvedDate = new Date(complaint.updated_at);
        const timeDiff = resolvedDate - createdDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        officerResolutionTimes[complaint.officer_id] = (officerResolutionTimes[complaint.officer_id] || 0) + daysDiff;
        officerResolvedCounts[complaint.officer_id] = (officerResolvedCounts[complaint.officer_id] || 0) + 1;
      }
    });
    
    // Calculate average resolution time per officer
    const officersWithAvgTimes = officers
      .filter(officer => officerResolvedCounts[officer.id] > 0)
      .map(officer => ({
        ...officer,
        avgResolutionTime: (officerResolutionTimes[officer.id] / officerResolvedCounts[officer.id]).toFixed(1),
        resolvedCount: officerResolvedCounts[officer.id] || 0
      }));
    
    // Sort by average resolution time ascending (faster is better)
    return officersWithAvgTimes
      .sort((a, b) => a.avgResolutionTime - b.avgResolutionTime)
      .slice(0, 5); // Get top 5
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <form onSubmit={handleGenerateReport}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={handleReportTypeChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="complaints">Complaints Summary</option>
                  <option value="officers">Officers Summary</option>
                  <option value="performance">Performance Analysis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {showReport && (
        <>
          {reportType === 'complaints' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Complaints Summary Report</h2>
                <p className="text-sm text-gray-500">
                  {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Total Complaints</h3>
                    <p className="text-3xl font-bold text-blue-600">{complaintsReport.total}</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Pending/In Progress</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                      {complaintsReport.byStatus.pending + complaintsReport.byStatus.assigned + complaintsReport.byStatus.inProgress}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Resolved/Closed</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {complaintsReport.byStatus.resolved + complaintsReport.byStatus.closed}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Resolution Time</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {complaintsReport.averageResolutionTime === 'N/A' 
                        ? 'N/A' 
                        : `${complaintsReport.averageResolutionTime} days`}
                    </p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-4">Complaints by Status</h3>
                
                <div className="relative h-10 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div className="flex h-full">
                    <div 
                      style={{ width: `${complaintsReport.total ? (complaintsReport.byStatus.pending / complaintsReport.total) * 100 : 0}%` }} 
                      className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white"
                    >
                      Pending
                    </div>
                    <div 
                      style={{ width: `${complaintsReport.total ? (complaintsReport.byStatus.assigned / complaintsReport.total) * 100 : 0}%` }} 
                      className="bg-blue-500 h-full flex items-center justify-center text-xs text-white"
                    >
                      Assigned
                    </div>
                    <div 
                      style={{ width: `${complaintsReport.total ? (complaintsReport.byStatus.inProgress / complaintsReport.total) * 100 : 0}%` }} 
                      className="bg-indigo-500 h-full flex items-center justify-center text-xs text-white"
                    >
                      In Progress
                    </div>
                    <div 
                      style={{ width: `${complaintsReport.total ? (complaintsReport.byStatus.resolved / complaintsReport.total) * 100 : 0}%` }} 
                      className="bg-green-500 h-full flex items-center justify-center text-xs text-white"
                    >
                      Resolved
                    </div>
                    <div 
                      style={{ width: `${complaintsReport.total ? (complaintsReport.byStatus.closed / complaintsReport.total) * 100 : 0}%` }} 
                      className="bg-gray-500 h-full flex items-center justify-center text-xs text-white"
                    >
                      Closed
                    </div>
                    <div 
                      style={{ width: `${complaintsReport.total ? (complaintsReport.byStatus.reopened / complaintsReport.total) * 100 : 0}%` }} 
                      className="bg-red-500 h-full flex items-center justify-center text-xs text-white"
                    >
                      Reopened
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-sm">
                  <div>
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                    <p>Pending: {complaintsReport.byStatus.pending}</p>
                  </div>
                  <div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-1"></div>
                    <p>Assigned: {complaintsReport.byStatus.assigned}</p>
                  </div>
                  <div>
                    <div className="w-4 h-4 bg-indigo-500 rounded-full mx-auto mb-1"></div>
                    <p>In Progress: {complaintsReport.byStatus.inProgress}</p>
                  </div>
                  <div>
                    <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
                    <p>Resolved: {complaintsReport.byStatus.resolved}</p>
                  </div>
                  <div>
                    <div className="w-4 h-4 bg-gray-500 rounded-full mx-auto mb-1"></div>
                    <p>Closed: {complaintsReport.byStatus.closed}</p>
                  </div>
                  <div>
                    <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
                    <p>Reopened: {complaintsReport.byStatus.reopened}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {reportType === 'officers' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Officers Summary Report</h2>
                <p className="text-sm text-gray-500">
                  {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Total Officers</h3>
                    <p className="text-3xl font-bold text-blue-600">{officersReport.total}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Available Officers</h3>
                    <p className="text-3xl font-bold text-green-600">{officersReport.available}</p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Unavailable Officers</h3>
                    <p className="text-3xl font-bold text-red-600">{officersReport.unavailable}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Officers by Complaint Volume</h3>
                
                <div className="overflow-x-auto mb-8">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Officer Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Complaints Handled
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {officersReport.withMostComplaints.map((officer, index) => (
                        <tr key={officer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {officer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {officer.department || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {officer.complaintCount}
                          </td>
                        </tr>
                      ))}
                      {officersReport.withMostComplaints.length === 0 && (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {reportType === 'performance' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Officer Performance Report</h2>
                <p className="text-sm text-gray-500">
                  {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Officers (by Resolution Time)</h3>
                
                <div className="overflow-x-auto mb-8">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Officer Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Complaints Resolved
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Resolution Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {officersReport.withBestResolutionTime.map((officer, index) => (
                        <tr key={officer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {officer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {officer.department || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {officer.resolvedCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {officer.avgResolutionTime} days
                          </td>
                        </tr>
                      ))}
                      {officersReport.withBestResolutionTime.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Key Performance Indicators</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Average Resolution Rate</h4>
                      <p className="text-2xl font-bold text-gray-900">
                        {complaints.length 
                          ? `${Math.round((complaintsReport.byStatus.resolved + complaintsReport.byStatus.closed) / complaints.length * 100)}%` 
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Percentage of complaints that have been resolved in the given period
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Average Response Time</h4>
                      <p className="text-2xl font-bold text-gray-900">
                        {complaintsReport.averageResolutionTime === 'N/A' 
                          ? 'N/A' 
                          : `${complaintsReport.averageResolutionTime} days`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Average time from complaint creation to resolution
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Complaints per Officer</h4>
                      <p className="text-2xl font-bold text-gray-900">
                        {officersReport.total 
                          ? (complaints.length / officersReport.total).toFixed(1) 
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Average number of complaints handled per officer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminReports; 