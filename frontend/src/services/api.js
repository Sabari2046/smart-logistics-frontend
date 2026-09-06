import axios from 'axios';
import { message } from '../utils/antdApp';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      const publicPaths = ['/login', '/register', '/track', '/'];
      const currentPath = window.location.pathname;

      const isPublic = publicPaths.some(
        (p) =>
          currentPath === p ||
          currentPath.startsWith('/track/')
      );

      if (!isPublic) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        message.error(
          'Session expired. Please log in again.'
        );

        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error(
        'Access Denied: You do not have permission for this action.'
      );
    }

    return Promise.reject(error);
  }
);

export default api;