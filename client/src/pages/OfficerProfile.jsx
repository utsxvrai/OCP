import { useState, useEffect } from 'react';
import { officerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function OfficerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await officerAPI.getProfile();
        setProfile(response.data.officer);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Officer Profile</h2>
      {profile ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-medium text-lg">{profile.name}</h3>
              <p className="text-gray-500">{profile.designation}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {profile.availability_status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Officer ID</p>
              <p className="font-medium">{profile.officer_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{profile.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PIN Codes Assigned</p>
              <p className="font-medium">{profile.pin_codes}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Complaints Solved</p>
              <p className="font-medium">{profile.complaints_solved}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Profile information not available</p>
      )}
    </div>
  );
}

export default OfficerProfile; 