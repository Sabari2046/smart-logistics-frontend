package com.smartlogistics.service;

import com.smartlogistics.dto.DeliveryResponse;
import com.smartlogistics.dto.StatusUpdateRequest;

import java.util.List;

public interface DeliveryService {
    DeliveryResponse getDeliveryById(Long id);
    DeliveryResponse getDeliveryByShipmentId(Long shipmentId);
    List<DeliveryResponse> getMyDeliveries();
    DeliveryResponse updateDeliveryProgress(Long shipmentId, StatusUpdateRequest request);
    DeliveryResponse markPickedUp(Long shipmentId);
    DeliveryResponse startDelivery(Long shipmentId);
    DeliveryResponse markOutForDelivery(Long shipmentId);
    DeliveryResponse markDelivered(Long shipmentId, StatusUpdateRequest request);
}
