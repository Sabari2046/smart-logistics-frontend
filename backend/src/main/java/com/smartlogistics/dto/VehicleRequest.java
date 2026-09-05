package com.smartlogistics.dto;

import com.smartlogistics.enums.FuelType;
import com.smartlogistics.enums.VehicleStatus;
import com.smartlogistics.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    private String brand;

    private String model;

    private Integer manufacturingYear;

    @NotNull(message = "Capacity in Kg is required")
    @Positive(message = "Capacity must be greater than 0")
    private Double capacityKg;

    @NotNull(message = "Fuel type is required")
    private FuelType fuelType;

    private VehicleStatus status;

    private String currentLocation;

    private Double odometerKm;

    private LocalDate insuranceExpiryDate;

    private LocalDate registrationExpiryDate;

    private LocalDate lastServiceDate;

    private LocalDate nextServiceDate;
}
