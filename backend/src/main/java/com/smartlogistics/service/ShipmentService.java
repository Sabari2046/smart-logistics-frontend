package com.smartlogistics.service;

import com.smartlogistics.dto.*;
import com.smartlogistics.enums.ShipmentPriority;
import com.smartlogistics.enums.ShipmentStatus;

import java.util.List;

public interface ShipmentService {
    ShipmentResponse createShipment(ShipmentRequest request, Long customerUserId);
    List<ShipmentResponse> getAllShipments(ShipmentStatus status, ShipmentPriority priority, String search);
    ShipmentResponse getShipmentById(Long id);
    ShipmentResponse getShipmentByTrackingNumber(String trackingNumber);
    List<ShipmentResponse> getCustomerShipments(Long customerId);
    List<ShipmentResponse> getMyShipments();
    ShipmentResponse updateShipment(Long id, ShipmentRequest request);
    void deleteShipment(Long id);
    ShipmentResponse cancelShipment(Long id);
    ShipmentResponse assignDriver(Long shipmentId, Long driverId);
    ShipmentResponse assignVehicle(Long shipmentId, Long vehicleId);
    ShipmentResponse assignShipment(Long shipmentId, AssignShipmentRequest request);
    ShipmentResponse updateStatus(Long shipmentId, StatusUpdateRequest request);
    List<RecommendedVehicleResponse> getRecommendedVehicles(Long shipmentId);
    List<RecommendedDriverResponse> getRecommendedDrivers(Long shipmentId);
    List<ShipmentResponse> getDelayedShipments();
}
