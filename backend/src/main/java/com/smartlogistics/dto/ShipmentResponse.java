package com.smartlogistics.dto;

import com.smartlogistics.enums.ShipmentPriority;
import com.smartlogistics.enums.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponse {
    private Long id;
    private String trackingNumber;

    // Customer summary
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String companyName;

    // Addresses
    private String pickupAddress;
    private String pickupCity;
    private String pickupState;
    private String pickupPostalCode;

    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryState;
    private String deliveryPostalCode;

    // Package Details
    private String packageDescription;
    private Double weightKg;
    private String packageType;
    private ShipmentPriority priority;
    private Double shippingCost;
    private ShipmentStatus shipmentStatus;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private boolean isDelayed;

    // Vehicle details
    private Long vehicleId;
    private String vehicleNumber;
    private String vehicleType;
    private String vehicleBrandModel;

    // Driver details
    private Long driverId;
    private String driverName;
    private String driverPhone;
    private String driverLicense;
    private Double driverRating;

    // Route details
    private Long routeId;
    private String routeName;
    private String routeSource;
    private String routeDestination;
    private Double routeDistanceKm;

    // Warehouse details
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private String warehouseCity;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Timeline
    private List<TrackingHistoryResponse> trackingHistories;
}
