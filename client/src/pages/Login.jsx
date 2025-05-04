import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    aadhaarNumber: '',
    password: '',
    role: 'citizen', // Default to citizen
    loginType: 'email' // Default to email login
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Prepare login data based on login type
      const loginData = {
        password: formData.password,
        role: formData.role
      };
      
      if (formData.loginType === 'email') {
        if (!formData.email) {
          throw new Error('Email is required');
        }
        loginData.email = formData.email;
      } else {
        if (!formData.aadhaarNumber) {
          throw new Error('Aadhaar number is required');
        }
        if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
          throw new Error('Aadhaar number must be 12 digits');
        }
        loginData.aadhaarNumber = formData.aadhaarNumber;
      }
      
      // Pass login data to auth context
      await login(loginData);
      
      // Navigate to home page after successful login, regardless of role
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
              create a new account
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
            {/* Login Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login with
              </label>
              <div className="flex space-x-4 mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="loginType"
                    value="email"
                    checked={formData.loginType === 'email'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-primary"
                  />
                  <span className="ml-2">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="loginType"
                    value="aadhaar"
                    checked={formData.loginType === 'aadhaar'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-primary"
                  />
                  <span className="ml-2">Aadhaar</span>
                </label>
              </div>
            </div>

            {/* Email Field - shown only if loginType is email */}
            {formData.loginType === 'email' && (
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="input"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required={formData.loginType === 'email'}
                />
              </div>
            )}
            
            {/* Aadhaar Field - shown only if loginType is aadhaar */}
            {formData.loginType === 'aadhaar' && (
              <div className="mb-4">
                <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number
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
                  required={formData.loginType === 'aadhaar'}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter your 12-digit Aadhaar number without spaces
                </p>
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login as
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="citizen"
                    checked={formData.role === 'citizen'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-primary"
                  />
                  <span className="ml-2">Citizen</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="officer"
                    checked={formData.role === 'officer'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-primary"
                  />
                  <span className="ml-2">Officer</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-primary"
                  />
                  <span className="ml-2">Admin</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary-dark">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login; 