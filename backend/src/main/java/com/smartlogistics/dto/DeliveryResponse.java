package com.smartlogistics.dto;

import com.smartlogistics.enums.DeliveryStatus;
import com.smartlogistics.enums.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponse {
    private Long id;
    private Long shipmentId;
    private String trackingNumber;
    private Long driverId;
    private String driverName;
    private Long vehicleId;
    private String vehicleNumber;
    private String vehicleType;
    private String pickupAddress;
    private String deliveryAddress;
    private String packageDescription;
    private Double weightKg;
    private LocalDateTime pickupTime;
    private LocalDateTime startTime;
    private LocalDateTime deliveryTime;
    private DeliveryStatus deliveryStatus;
    private ShipmentStatus shipmentStatus;
    private String recipientName;
    private String deliveryNotes;
    private String proofOfDelivery;
    private LocalDateTime createdAt;
}
