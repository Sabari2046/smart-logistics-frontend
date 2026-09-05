package com.smartlogistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignShipmentRequest {
    private Long vehicleId;
    private Long driverId;
    private Long routeId;
    private Long warehouseId;
}
