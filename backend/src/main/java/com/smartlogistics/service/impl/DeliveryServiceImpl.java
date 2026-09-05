package com.smartlogistics.service.impl;

import com.smartlogistics.dto.DeliveryResponse;
import com.smartlogistics.dto.StatusUpdateRequest;
import com.smartlogistics.entity.Delivery;
import com.smartlogistics.entity.Driver;
import com.smartlogistics.entity.User;
import com.smartlogistics.enums.ShipmentStatus;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.DeliveryRepository;
import com.smartlogistics.repository.DriverRepository;
import com.smartlogistics.service.AuthService;
import com.smartlogistics.service.DeliveryService;
import com.smartlogistics.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;
    private final ShipmentService shipmentService;
    private final AuthService authService;

    @Override
    public DeliveryResponse getDeliveryById(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery record not found with ID: " + id));
        return mapToResponse(delivery);
    }

    @Override
    public DeliveryResponse getDeliveryByShipmentId(Long shipmentId) {
        Delivery delivery = deliveryRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery record not found for shipment ID: " + shipmentId));
        return mapToResponse(delivery);
    }

    @Override
    public List<DeliveryResponse> getMyDeliveries() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Driver driver = driverRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));

        return deliveryRepository.findByDriverIdOrderByCreatedAtDesc(driver.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DeliveryResponse updateDeliveryProgress(Long shipmentId, StatusUpdateRequest request) {
        shipmentService.updateStatus(shipmentId, request);
        return getDeliveryByShipmentId(shipmentId);
    }

    @Override
    @Transactional
    public DeliveryResponse markPickedUp(Long shipmentId) {
        StatusUpdateRequest request = StatusUpdateRequest.builder()
                .status(ShipmentStatus.PICKED_UP)
                .description("Driver picked up the parcel from origin location")
                .build();
        shipmentService.updateStatus(shipmentId, request);
        return getDeliveryByShipmentId(shipmentId);
    }

    @Override
    @Transactional
    public DeliveryResponse startDelivery(Long shipmentId) {
        StatusUpdateRequest request = StatusUpdateRequest.builder()
                .status(ShipmentStatus.IN_TRANSIT)
                .description("Vehicle departed hub and shipment is now in transit")
                .build();
        shipmentService.updateStatus(shipmentId, request);
        return getDeliveryByShipmentId(shipmentId);
    }

    @Override
    @Transactional
    public DeliveryResponse markOutForDelivery(Long shipmentId) {
        StatusUpdateRequest request = StatusUpdateRequest.builder()
                .status(ShipmentStatus.OUT_FOR_DELIVERY)
                .description("Shipment has reached destination city hub and is out for delivery")
                .build();
        shipmentService.updateStatus(shipmentId, request);
        return getDeliveryByShipmentId(shipmentId);
    }

    @Override
    @Transactional
    public DeliveryResponse markDelivered(Long shipmentId, StatusUpdateRequest request) {
        request.setStatus(ShipmentStatus.DELIVERED);
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            request.setDescription("Package successfully handed over to recipient");
        }
        shipmentService.updateStatus(shipmentId, request);
        return getDeliveryByShipmentId(shipmentId);
    }

    private DeliveryResponse mapToResponse(Delivery d) {
        return DeliveryResponse.builder()
                .id(d.getId())
                .shipmentId(d.getShipment().getId())
                .trackingNumber(d.getShipment().getTrackingNumber())
                .driverId(d.getDriver() != null ? d.getDriver().getId() : null)
                .driverName(d.getDriver() != null ? d.getDriver().getUser().getFullName() : null)
                .vehicleId(d.getVehicle() != null ? d.getVehicle().getId() : null)
                .vehicleNumber(d.getVehicle() != null ? d.getVehicle().getVehicleNumber() : null)
                .vehicleType(d.getVehicle() != null ? d.getVehicle().getVehicleType().name() : null)
                .pickupAddress(d.getShipment().getPickupAddress() + ", " + d.getShipment().getPickupCity())
                .deliveryAddress(d.getShipment().getDeliveryAddress() + ", " + d.getShipment().getDeliveryCity())
                .packageDescription(d.getShipment().getPackageDescription())
                .weightKg(d.getShipment().getWeightKg())
                .pickupTime(d.getPickupTime())
                .startTime(d.getStartTime())
                .deliveryTime(d.getDeliveryTime())
                .deliveryStatus(d.getDeliveryStatus())
                .shipmentStatus(d.getShipment() != null ? d.getShipment().getShipmentStatus() : null)
                .recipientName(d.getRecipientName())
                .deliveryNotes(d.getDeliveryNotes())
                .proofOfDelivery(d.getProofOfDelivery())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
