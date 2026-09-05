import api from './api';

export const dashboardService = {
  getAdminStats: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  getDriverStats: async () => {
    const response = await api.get('/api/drivers/dashboard');
    return response.data;
  },

  getCustomerStats: async () => {
    const response = await api.get('/api/customers/dashboard');
    return response.data;
  },
};
