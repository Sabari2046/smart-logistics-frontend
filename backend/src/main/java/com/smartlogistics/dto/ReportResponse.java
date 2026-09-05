package com.smartlogistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private long totalDeliveries;
    private long successfulDeliveries;
    private long delayedDeliveries;
    private long cancelledDeliveries;
    private double successRatePercent;
    private double averageDeliveryTimeHours;
    private double totalRevenue;
    private double totalMaintenanceCost;

    private Map<String, Long> deliveriesByMonth;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> priorityDistribution;
    private List<DriverResponse> topDrivers;
    private List<VehicleResponse> fleetUtilization;
}
