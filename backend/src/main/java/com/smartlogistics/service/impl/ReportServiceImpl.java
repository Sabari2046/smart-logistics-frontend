package com.smartlogistics.service.impl;

import com.smartlogistics.dto.DriverResponse;
import com.smartlogistics.dto.ReportResponse;
import com.smartlogistics.dto.VehicleResponse;
import com.smartlogistics.entity.Shipment;
import com.smartlogistics.enums.ShipmentPriority;
import com.smartlogistics.enums.ShipmentStatus;
import com.smartlogistics.repository.*;
import com.smartlogistics.service.DriverService;
import com.smartlogistics.service.ReportService;
import com.smartlogistics.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ShipmentRepository shipmentRepository;
    private final DriverService driverService;
    private final VehicleService vehicleService;
    private final VehicleMaintenanceRepository maintenanceRepository;

    @Override
    public ReportResponse generateReport(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime start = fromDate != null ? fromDate.atStartOfDay() : LocalDate.now().minusMonths(6).atStartOfDay();
        LocalDateTime end = toDate != null ? toDate.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);

        List<Shipment> shipments = shipmentRepository.findShipmentsBetween(start, end);

        long total = shipments.size();
        long delivered = shipments.stream().filter(s -> s.getShipmentStatus() == ShipmentStatus.DELIVERED).count();
        long cancelled = shipments.stream().filter(s -> s.getShipmentStatus() == ShipmentStatus.CANCELLED).count();
        long delayed = shipments.stream().filter(s -> s.getExpectedDeliveryDate() != null
                && s.getActualDeliveryDate() != null
                && s.getActualDeliveryDate().isAfter(s.getExpectedDeliveryDate())).count();

        double successRate = total > 0 ? ((double) delivered / total) * 100.0 : 100.0;

        // Calculate average delivery time in hours for completed shipments
        double totalHours = 0.0;
        int completedCount = 0;
        for (Shipment s : shipments) {
            if (s.getShipmentStatus() == ShipmentStatus.DELIVERED && s.getCreatedAt() != null && s.getActualDeliveryDate() != null) {
                long minutes = Duration.between(s.getCreatedAt(), s.getActualDeliveryDate()).toMinutes();
                totalHours += (minutes / 60.0);
                completedCount++;
            }
        }
        double avgHours = completedCount > 0 ? totalHours / completedCount : 24.0;

        double totalRevenue = shipments.stream()
                .filter(s -> s.getShipmentStatus() != ShipmentStatus.CANCELLED)
                .mapToDouble(s -> s.getShippingCost() != null ? s.getShippingCost() : 0.0)
                .sum();

        Double maintenanceCost = maintenanceRepository.getTotalMaintenanceCost();
        double totalMaintenanceCost = maintenanceCost != null ? maintenanceCost : 0.0;

        // Monthly trends
        Map<String, Long> monthly = new LinkedHashMap<>();
        LocalDate cur = start.toLocalDate();
        while (!cur.isAfter(end.toLocalDate())) {
            String monthKey = cur.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + cur.getYear();
            final LocalDate monthTarget = cur;
            long count = shipments.stream().filter(s -> s.getCreatedAt() != null
                    && s.getCreatedAt().getYear() == monthTarget.getYear()
                    && s.getCreatedAt().getMonth() == monthTarget.getMonth()).count();
            monthly.put(monthKey, count);
            cur = cur.plusMonths(1);
        }

        // Status Distribution
        Map<String, Long> statusDist = new LinkedHashMap<>();
        for (ShipmentStatus s : ShipmentStatus.values()) {
            long count = shipments.stream().filter(sh -> sh.getShipmentStatus() == s).count();
            statusDist.put(s.name(), count);
        }

        // Priority Distribution
        Map<String, Long> priorityDist = new LinkedHashMap<>();
        for (ShipmentPriority p : ShipmentPriority.values()) {
            long count = shipments.stream().filter(sh -> sh.getPriority() == p).count();
            priorityDist.put(p.name(), count);
        }

        // Top 5 drivers
        List<DriverResponse> topDrivers = driverService.getAllDrivers(null, null).stream()
                .sorted(Comparator.comparing(DriverResponse::getTotalDeliveries, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(DriverResponse::getRating, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .collect(Collectors.toList());

        // Fleet utilization summary
        List<VehicleResponse> vehicles = vehicleService.getAllVehicles(null, null, null, null);

        return ReportResponse.builder()
                .totalDeliveries(total)
                .successfulDeliveries(delivered)
                .delayedDeliveries(delayed)
                .cancelledDeliveries(cancelled)
                .successRatePercent(Math.round(successRate * 10.0) / 10.0)
                .averageDeliveryTimeHours(Math.round(avgHours * 10.0) / 10.0)
                .totalRevenue(Math.round(totalRevenue * 100.0) / 100.0)
                .totalMaintenanceCost(Math.round(totalMaintenanceCost * 100.0) / 100.0)
                .deliveriesByMonth(monthly)
                .statusDistribution(statusDist)
                .priorityDistribution(priorityDist)
                .topDrivers(topDrivers)
                .fleetUtilization(vehicles)
                .build();
    }
}
