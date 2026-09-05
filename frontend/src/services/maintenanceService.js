import api from './api';

export const maintenanceService = {
  getAll: async (params) => {
    const response = await api.get('/api/maintenance', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/maintenance/${id}`);
    return response.data;
  },

  schedule: async (data) => {
    const response = await api.post('/api/maintenance', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/maintenance/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/maintenance/${id}`);
    return response.data;
  },

  getDue: async () => {
    const response = await api.get('/api/maintenance/due');
    return response.data;
  },
};
