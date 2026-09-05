package com.smartlogistics.dto;

import com.smartlogistics.enums.FuelType;
import com.smartlogistics.enums.VehicleStatus;
import com.smartlogistics.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedVehicleResponse {
    private Long id;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String brand;
    private String model;
    private Double capacityKg;
    private FuelType fuelType;
    private VehicleStatus status;
    private String currentLocation;
    private Double capacityDifference;
    private boolean isBestMatch;
    private String matchReason;
}
