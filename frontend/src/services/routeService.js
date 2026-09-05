import api from './api';

export const routeService = {
  getAll: async (params) => {
    const response = await api.get('/api/routes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/routes/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/routes', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/routes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/routes/${id}`);
    return response.data;
  },
};
