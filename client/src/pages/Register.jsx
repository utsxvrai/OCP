import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, officerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    pinCode: '',
    aadhaarNumber: '',
    userType: 'citizen', // Default to citizen
    officerId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits');
      return false;
    }
    
    if (!formData.pinCode.trim()) {
      setError('PIN Code is required');
      return false;
    }
    
    if (!/^\d{6}$/.test(formData.pinCode)) {
      setError('PIN Code must be a 6-digit number');
      return false;
    }
    
    // Validate Aadhaar if provided
    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
      setError('Aadhaar number must be 12 digits');
      return false;
    }
    
    // Validate officer ID if user type is officer
    if (formData.userType === 'officer') {
      if (!formData.officerId.trim()) {
        setError('Officer ID is required');
        return false;
      }
      
      if (!validateOfficerId(formData.officerId)) {
        setError('Officer ID must follow the format 221bXXX where XXX is between 001 and 501');
        return false;
      }
    }
    
    // Validate email format with simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (formData.userType === 'citizen') {
        // Register as citizen
        const response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          pinCode: formData.pinCode,
          aadhaarNumber: formData.aadhaarNumber || null
        });
        
        // Auto login after registration
        await login({
          email: formData.email,
          password: formData.password,
          role: 'citizen'
        });
        navigate('/');
      } else {
        // Register as officer
        const response = await officerAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          officerId: formData.officerId,
          pinCode: formData.pinCode,
          aadhaarNumber: formData.aadhaarNumber || null
        });
        
        // Auto login after registration
        await login({
          email: formData.email,
          password: formData.password,
          role: 'officer'
        });
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateOfficerId = (id) => {
    // Check if ID follows pattern like 221b001 to 221b501
    const regex = /^221b([0-9]{3})$/;
    const match = id.match(regex);
    
    if (!match) return false;
    
    const num = parseInt(match[1]);
    return num >= 1 && num <= 501;
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              sign in to your account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="input"
                placeholder="Enter your 10-digit phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="2"
                className="input"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code
              </label>
              <input
                id="pinCode"
                name="pinCode"
                type="text"
                required
                className="input"
                placeholder="Enter your 6-digit PIN code"
                value={formData.pinCode}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Aadhaar Number (Optional)
              </label>
              <input
                id="aadhaarNumber"
                name="aadhaarNumber"
                type="text"
                className="input"
                placeholder="Enter your 12-digit Aadhaar number"
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
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Register as
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="citizen"
                    checked={formData.userType === 'citizen'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-primary"
                  />
                  <span className="ml-2">Citizen</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="officer"
                    checked={formData.userType === 'officer'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-primary"
                  />
                  <span className="ml-2">Officer</span>
                </label>
              </div>
            </div>
            
            {formData.userType === 'officer' && (
              <>
                <div className="mb-4">
                  <label htmlFor="officerId" className="block text-sm font-medium text-gray-700 mb-1">
                    Officer ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="officerId"
                    name="officerId"
                    type="text"
                    required
                    className="input"
                    placeholder="Enter your officer ID (e.g., 221b001)"
                    value={formData.officerId}
                    onChange={handleChange}
                  />
                  {formData.officerId && !validateOfficerId(formData.officerId) && (
                    <p className="mt-1 text-sm text-red-600">
                      Invalid officer ID format. Should be between 221b001 and 221b501.
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Officer IDs are in the format 221b001 to 221b501 and are provided by the department.
                  </p>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading || (formData.userType === 'officer' && formData.officerId && !validateOfficerId(formData.officerId))}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            By registering, you agree to our{' '}
            <a href="#" className="font-medium text-primary hover:text-primary-dark">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-primary hover:text-primary-dark">
              Privacy Policy
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register; 