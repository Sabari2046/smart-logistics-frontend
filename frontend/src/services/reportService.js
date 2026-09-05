import api from './api';

export const reportService = {
  getReport: async (fromDate, toDate) => {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await api.get('/api/reports', { params });
    return response.data;
  },
};
