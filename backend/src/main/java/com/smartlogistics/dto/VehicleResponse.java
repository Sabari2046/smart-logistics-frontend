package com.smartlogistics.dto;

import com.smartlogistics.enums.FuelType;
import com.smartlogistics.enums.VehicleStatus;
import com.smartlogistics.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String brand;
    private String model;
    private Integer manufacturingYear;
    private Double capacityKg;
    private FuelType fuelType;
    private VehicleStatus status;
    private String currentLocation;
    private Double odometerKm;
    private LocalDate insuranceExpiryDate;
    private LocalDate registrationExpiryDate;
    private LocalDate lastServiceDate;
    private LocalDate nextServiceDate;
    private LocalDateTime createdAt;

    // Maintenance alert statuses
    private boolean serviceDueSoon;
    private boolean insuranceExpiringSoon;
    private boolean isExpired;
    private String alertMessage;
}
