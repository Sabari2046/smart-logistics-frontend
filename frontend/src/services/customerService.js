import api from './api';

export const customerService = {
  getAll: async (params) => {
    const response = await api.get('/api/customers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/customers/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/customers/${id}`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/api/customers/dashboard');
    return response.data;
  },
};
