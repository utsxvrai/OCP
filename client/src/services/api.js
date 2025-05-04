import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const token = localStorage.getItem('token');
        
        // If token exists and is expired, try to refresh
        if (token && isTokenExpired(token)) {
          // Call refresh token endpoint
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            token
          });
          
          // Update token in localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Update Auth header with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Define API methods
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (loginData) => api.post('/auth/login', loginData),
  getProfile: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
  refreshToken: (token) => api.post('/auth/refresh-token', { token }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data)
};

export const officerAPI = {
  register: (officerData) => api.post('/officers/register', officerData),
  getProfile: () => api.get('/officers/profile'),
  updateProfile: (profileData) => api.put('/officers/profile', profileData),
  updateAvailability: (availabilityData) => api.put('/officers/availability', availabilityData),
  getAll: () => api.get('/officers'),
  getById: (id) => api.get(`/officers/${id}`),
};

export const complaintAPI = {
  getAll: () => api.get('/complaints'),
  getById: (id) => api.get(`/complaints/${id}`),
  getMyComplaints: () => api.get('/complaints/my-complaints'),
  getAssigned: () => api.get('/complaints/assigned'),
  trackById: (complaintId) => api.get(`/complaints/track/${complaintId}`),
  track: (trackingId) => api.get(`/complaints/track/${trackingId}`),
  submit: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/complaints', formData, config);
  },
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  updateStatus: (id, status, statusDetails) => api.put(`/complaints/${id}/status`, { status, statusDetails }),
  addUpdate: (id, updateText) => api.post(`/complaints/${id}/updates`, { updateText }),
  submitFeedback: (id, feedback) => api.post(`/complaints/${id}/feedback`, feedback),
  reopenComplaint: (id) => api.post(`/complaints/${id}/reopen`)
};

export default api; 