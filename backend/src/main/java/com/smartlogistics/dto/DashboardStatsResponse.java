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
public class DashboardStatsResponse {

    // Shipment Metrics
    private long totalShipments;
    private long activeShipments;
    private long deliveredShipments;
    private long delayedShipments;
    private long pendingShipments;
    private long cancelledShipments;

    // Vehicle Metrics
    private long totalVehicles;
    private long availableVehicles;
    private long inTransitVehicles;
    private long maintenanceVehicles;

    // Driver Metrics
    private long totalDrivers;
    private long availableDrivers;
    private long onDeliveryDrivers;
    private long offDutyDrivers;

    // Entity Totals
    private long totalCustomers;
    private long totalWarehouses;
    private long totalRoutes;

    // Aggregates & Charts Data
    private Map<String, Long> shipmentStatusDistribution;
    private Map<String, Long> shipmentPriorityDistribution;
    private Map<String, Long> monthlyDeliveries;
    private Map<String, Long> vehicleTypeDistribution;
    private Map<String, Long> vehicleStatusDistribution;

    // Tables & Alerts
    private List<ShipmentResponse> recentShipments;
    private List<VehicleResponse> maintenanceAlerts;
    private List<ShipmentResponse> delayedShipmentsList;

    // Driver-specific dashboard fields
    private DeliveryResponse activeDelivery;
    private List<DeliveryResponse> assignedDeliveries;
    private long todayDeliveriesCount;
    private long completedDeliveriesCount;
}
