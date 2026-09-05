import api from './api';

export const driverService = {
  getAll: async (params) => {
    const response = await api.get('/api/drivers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/drivers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/drivers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/drivers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/drivers/${id}`);
    return response.data;
  },

  getAvailable: async () => {
    const response = await api.get('/api/drivers/available');
    return response.data;
  },

  getShipments: async (id) => {
    const response = await api.get(`/api/drivers/${id}/shipments`);
    return response.data;
  },

  getHistory: async (id) => {
    const response = await api.get(`/api/drivers/${id}/history`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/api/drivers/dashboard');
    return response.data;
  },
};
