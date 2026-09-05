package com.smartlogistics.dto;

import com.smartlogistics.enums.MaintenanceStatus;
import com.smartlogistics.enums.MaintenanceType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Maintenance type is required")
    private MaintenanceType maintenanceType;

    private String description;

    private LocalDate serviceDate;

    private LocalDate nextServiceDate;

    private Double cost;

    private String serviceCenter;

    private MaintenanceStatus status;
}
