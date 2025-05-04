import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, officerAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true; // Token is invalid or cannot be decoded
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await authAPI.refreshToken(token);
      
      // Update token and user in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Update state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      return response.data.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      throw error;
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Try to refresh token
        refreshToken()
          .then(() => {
            loadUser();
          })
          .catch((error) => {
            console.error('Failed to refresh token:', error);
            logout();
            setLoading(false);
          });
      } else {
        loadUser();
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Load user from token
  const loadUser = async () => {
    setLoading(true);
    try {
      // Check the stored user role to determine which API to use
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      let response;
      
      if (storedUser.role === 'officer' || storedUser.role === 'admin') {
        response = await officerAPI.getProfile();
      } else {
        response = await authAPI.getProfile();
      }
      
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user:', error);
      // Check if error is due to token expiration
      if (error.response && error.response.status === 401) {
        try {
          // Try to refresh token
          await refreshToken();
          // Try loading user again
          await loadUser();
        } catch (refreshError) {
          // If refresh also fails, logout
          logout();
        }
      } else {
        // For other errors, log out
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (loginData) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      // Use the appropriate login endpoint based on user role
      if (loginData.role === 'officer' || loginData.role === 'admin') {
        // Use officer login endpoint
        response = await authAPI.login(loginData);
      } else {
        // Use citizen login endpoint
        response = await authAPI.login(loginData);
      }
      
      // Store token and user info
      localStorage.setItem('token', response.data.token);
      
      // Add role to user object if it doesn't exist
      const userData = {
        ...response.data.user,
        role: response.data.user.role || loginData.role
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      if (user?.role === 'officer' || user?.role === 'admin') {
        response = await officerAPI.updateProfile(userData);
      } else {
        response = await authAPI.updateProfile(userData);
      }
      
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwords) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.changePassword(passwords);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user info (used by other functions)
  const updateUserInfo = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    updateUserInfo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 