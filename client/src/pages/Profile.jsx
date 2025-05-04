import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, updateUserInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pinCode: '',
    aadhaarNumber: ''
  });
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        pinCode: user.pinCode || '',
        aadhaarNumber: user.aadhaarNumber || ''
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate phone number
      if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        throw new Error('Phone number must be 10 digits');
      }
      
      // Validate PIN code
      if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
        throw new Error('PIN code must be 6 digits');
      }
      
      // Validate Aadhaar number
      if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
        throw new Error('Aadhaar number must be 12 digits');
      }
      
      await userAPI.updateProfile(formData);
      
      // Update local user info
      updateUserInfo({
        ...user,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        pinCode: formData.pinCode,
        aadhaarNumber: formData.aadhaarNumber
      });
      
      setIsEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const updatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      if (passwordData.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('Password updated successfully');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-primary to-primary-dark"></div>
            <div className="absolute inset-x-0 bottom-0 h-36 flex items-end px-6">
              <div className="flex items-center">
                <div className="h-24 w-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-primary">
                  <span className="text-4xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-4 mb-4">
                  <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                  <p className="text-white opacity-90">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-4">
                <p className="text-green-700">{success}</p>
              </div>
            )}
            
            {isEditing ? (
              <form onSubmit={updateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      className="input"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      title="Phone number must be 10 digits"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      className="input"
                      value={formData.address}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code
                    </label>
                    <input
                      id="pinCode"
                      name="pinCode"
                      type="text"
                      className="input"
                      value={formData.pinCode}
                      onChange={handleChange}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      title="PIN code must be 6 digits"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      id="aadhaarNumber"
                      name="aadhaarNumber"
                      type="text"
                      className="input"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      maxLength={12}
                      pattern="[0-9]{12}"
                      title="Aadhaar number must be 12 digits"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      You can use your Aadhaar number to log in to your account
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium">{user?.name || 'Not provided'}</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium">{user?.email || 'Not provided'}</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium">{user?.phone || 'Not provided'}</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">PIN Code</p>
                    <p className="font-medium">{user?.pinCode || 'Not provided'}</p>
                  </div>
                  
                  <div className="md:col-span-2 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="font-medium">{user?.address || 'Not provided'}</p>
                  </div>
                  
                  {user?.aadhaarNumber && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Aadhaar Number</p>
                      <p className="font-medium">
                        {user.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                  >
                    {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Password Change Form */}
            {showPasswordChange && !isEditing && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <form onSubmit={updatePassword}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        className="input"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        className="input"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        minLength={6}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Must be at least 6 characters
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="input"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 