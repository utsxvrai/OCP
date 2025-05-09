import { useState, useEffect } from 'react';
import { complaintAPI, officerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function OfficerReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    feedback: { average: 0, count: 0 }
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // In a real app, we would call a reports API endpoint
        // For now, we'll use the assigned complaints to calculate metrics
        const response = await complaintAPI.getAssigned();
        const complaints = response.data.complaints || [];
        
        setReports({
          totalAssigned: complaints.length,
          pending: complaints.filter(c => c.status === 'assigned' || c.status === 'pending').length,
          inProgress: complaints.filter(c => c.status === 'in-progress' || c.status === 'processing').length,
          resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
          feedback: { average: 4.2, count: 12 } // Mock data
        });
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);
  
  if (loading) {
    return <div className="p-4">Loading reports...</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Performance Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-md text-center">
          <div className="text-3xl font-bold text-blue-600">{reports.totalAssigned}</div>
          <div className="text-sm text-gray-600 mt-1">Total Assigned</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-md text-center">
          <div className="text-3xl font-bold text-orange-600">{reports.pending}</div>
          <div className="text-sm text-gray-600 mt-1">Pending</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-md text-center">
          <div className="text-3xl font-bold text-purple-600">{reports.inProgress}</div>
          <div className="text-sm text-gray-600 mt-1">In Progress</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md text-center">
          <div className="text-3xl font-bold text-green-600">{reports.resolved}</div>
          <div className="text-sm text-gray-600 mt-1">Resolved</div>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Citizen Feedback</h3>
        
        <div className="bg-yellow-50 p-4 rounded-md flex items-center justify-between">
          <div>
            <h4 className="font-medium">Average Rating</h4>
            <p className="text-sm text-gray-600">Based on {reports.feedback.count} reviews</p>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-yellow-600 mr-2">{reports.feedback.average.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star}
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ${star <= Math.round(reports.feedback.average) ? 'text-yellow-500' : 'text-gray-300'}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerReports; 