import axios from 'axios';
import { message } from '../utils/antdApp';

const API_BASE_URL = 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handling and 401 redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const errorMsg = error.response?.data?.message || 'An unexpected error occurred';

    if (status === 401) {
      // If unauthorized, clear auth and redirect to login if not already on public route
      const publicPaths = ['/login', '/register', '/track', '/'];
      const currentPath = window.location.pathname;
      const isPublic = publicPaths.some(p => currentPath === p || currentPath.startsWith('/track/'));

      if (!isPublic) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        message.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error('Access Denied: You do not have permission for this action.');
    }

    return Promise.reject(error);
  }
);

export default api;
