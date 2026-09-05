package com.smartlogistics.dto;

import com.smartlogistics.enums.MaintenanceStatus;
import com.smartlogistics.enums.MaintenanceType;
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
public class MaintenanceResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String vehicleBrandModel;
    private MaintenanceType maintenanceType;
    private String description;
    private LocalDate serviceDate;
    private LocalDate nextServiceDate;
    private Double cost;
    private String serviceCenter;
    private MaintenanceStatus status;
    private LocalDateTime createdAt;
}
