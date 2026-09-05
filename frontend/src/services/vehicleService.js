import api from './api';

export const vehicleService = {
  getAll: async (params) => {
    const response = await api.get('/api/vehicles', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/vehicles/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/vehicles', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/vehicles/${id}`);
    return response.data;
  },

  getAvailable: async () => {
    const response = await api.get('/api/vehicles/available');
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get('/api/vehicles/alerts');
    return response.data;
  },
};
