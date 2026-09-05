import api from './api';

export const deliveryService = {
  getById: async (id) => {
    const response = await api.get(`/api/deliveries/${id}`);
    return response.data;
  },

  getByShipmentId: async (shipmentId) => {
    const response = await api.get(`/api/deliveries/shipment/${shipmentId}`);
    return response.data;
  },

  getMyDeliveries: async () => {
    const response = await api.get('/api/deliveries/my-deliveries');
    return response.data;
  },

  markPickedUp: async (shipmentId) => {
    const response = await api.patch(`/api/deliveries/shipment/${shipmentId}/pickup`);
    return response.data;
  },

  startDelivery: async (shipmentId) => {
    const response = await api.patch(`/api/deliveries/shipment/${shipmentId}/start-delivery`);
    return response.data;
  },

  markOutForDelivery: async (shipmentId) => {
    const response = await api.patch(`/api/deliveries/shipment/${shipmentId}/out-for-delivery`);
    return response.data;
  },

  markDelivered: async (shipmentId, deliveryData) => {
    const response = await api.patch(`/api/deliveries/shipment/${shipmentId}/delivered`, deliveryData);
    return response.data;
  },

  updateProgress: async (shipmentId, data) => {
    const response = await api.patch(`/api/deliveries/shipment/${shipmentId}/progress`, data);
    return response.data;
  },
};
