import api from './api';

export const shipmentService = {
  getAll: async (params) => {
    const response = await api.get('/api/shipments', { params });
    return response.data;
  },

  getMyShipments: async () => {
    const response = await api.get('/api/shipments/my');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/shipments/${id}`);
    return response.data;
  },

  getByTrackingNumber: async (trackingNumber) => {
    const response = await api.get(`/api/tracking/${trackingNumber}`);
    return response.data;
  },

  getTrackingHistory: async (trackingNumber) => {
    const response = await api.get(`/api/tracking/${trackingNumber}/history`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/shipments', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/shipments/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/shipments/${id}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.patch(`/api/shipments/${id}/cancel`);
    return response.data;
  },

  assignDriver: async (shipmentId, driverId) => {
    const response = await api.patch(`/api/shipments/${shipmentId}/assign-driver/${driverId}`);
    return response.data;
  },

  assignVehicle: async (shipmentId, vehicleId) => {
    const response = await api.patch(`/api/shipments/${shipmentId}/assign-vehicle/${vehicleId}`);
    return response.data;
  },

  assignBoth: async (shipmentId, data) => {
    const response = await api.patch(`/api/shipments/${shipmentId}/assign`, data);
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.patch(`/api/shipments/${id}/status`, data);
    return response.data;
  },

  getRecommendedVehicles: async (shipmentId) => {
    const response = await api.get(`/api/shipments/${shipmentId}/recommended-vehicles`);
    return response.data;
  },

  getRecommendedDrivers: async (shipmentId) => {
    const response = await api.get(`/api/shipments/${shipmentId}/recommended-drivers`);
    return response.data;
  },

  getDelayed: async () => {
    const response = await api.get('/api/admin/delayed-shipments');
    return response.data;
  },
};
