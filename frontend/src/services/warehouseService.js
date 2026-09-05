import api from './api';

export const warehouseService = {
  getAll: async (params) => {
    const response = await api.get('/api/warehouses', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/warehouses/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/warehouses', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/warehouses/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/warehouses/${id}`);
    return response.data;
  },
};
