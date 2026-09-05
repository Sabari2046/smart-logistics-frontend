package com.smartlogistics.dto;

import com.smartlogistics.enums.ShipmentPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentRequest {

    // Pickup Information
    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotBlank(message = "Pickup city is required")
    private String pickupCity;

    @NotBlank(message = "Pickup state is required")
    private String pickupState;

    @NotBlank(message = "Pickup postal code is required")
    private String pickupPostalCode;

    // Delivery Destination Information
    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @NotBlank(message = "Delivery city is required")
    private String deliveryCity;

    @NotBlank(message = "Delivery state is required")
    private String deliveryState;

    @NotBlank(message = "Delivery postal code is required")
    private String deliveryPostalCode;

    // Package Details
    private String packageDescription;

    @NotNull(message = "Package weight is required")
    @Positive(message = "Weight must be greater than 0")
    private Double weightKg;

    private String packageType;

    private ShipmentPriority priority;

    private LocalDateTime expectedDeliveryDate;

    // Optional admin-assigned details during creation
    private Long customerId;
    private Long warehouseId;
    private Long routeId;
    private Long vehicleId;
    private Long driverId;
    private Double shippingCost;
}
