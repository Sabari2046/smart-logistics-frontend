package com.smartlogistics.service.impl;

import com.smartlogistics.dto.DashboardStatsResponse;
import com.smartlogistics.dto.DeliveryResponse;
import com.smartlogistics.dto.ShipmentResponse;
import com.smartlogistics.dto.VehicleResponse;
import com.smartlogistics.entity.Customer;
import com.smartlogistics.entity.Delivery;
import com.smartlogistics.entity.Driver;
import com.smartlogistics.entity.Shipment;
import com.smartlogistics.enums.*;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.*;
import com.smartlogistics.service.DashboardService;
import com.smartlogistics.service.ShipmentService;
import com.smartlogistics.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ShipmentRepository shipmentRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final RouteRepository routeRepository;
    private final DeliveryRepository deliveryRepository;
    private final VehicleService vehicleService;
    private final ShipmentService shipmentService;

    @Override
    public DashboardStatsResponse getAdminDashboardStats() {
        long totalShipments = shipmentRepository.count();
        long deliveredShipments = shipmentRepository.countByShipmentStatus(ShipmentStatus.DELIVERED);
        long pendingShipments = shipmentRepository.countByShipmentStatus(ShipmentStatus.PENDING);
        long cancelledShipments = shipmentRepository.countByShipmentStatus(ShipmentStatus.CANCELLED);
        long activeShipments = totalShipments - deliveredShipments - cancelledShipments - pendingShipments;

        long delayedShipments = shipmentRepository.countDelayedShipments(LocalDateTime.now());

        long totalVehicles = vehicleRepository.count();
        long availableVehicles = vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
        long inTransitVehicles = vehicleRepository.countByStatus(VehicleStatus.IN_TRANSIT);
        long maintenanceVehicles = vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE);

        long totalDrivers = driverRepository.count();
        long availableDrivers = driverRepository.countByAvailabilityStatus(DriverAvailability.AVAILABLE);
        long onDeliveryDrivers = driverRepository.countByAvailabilityStatus(DriverAvailability.ON_DELIVERY);
        long offDutyDrivers = driverRepository.countByAvailabilityStatus(DriverAvailability.OFF_DUTY);

        long totalCustomers = customerRepository.count();
        long totalWarehouses = warehouseRepository.count();
        long totalRoutes = routeRepository.count();

        // Distributions
        List<Shipment> allShipments = shipmentRepository.findAll();

        Map<String, Long> statusDist = new LinkedHashMap<>();
        for (ShipmentStatus s : ShipmentStatus.values()) {
            long count = allShipments.stream().filter(sh -> sh.getShipmentStatus() == s).count();
            statusDist.put(s.name(), count);
        }

        Map<String, Long> priorityDist = new LinkedHashMap<>();
        for (ShipmentPriority p : ShipmentPriority.values()) {
            long count = allShipments.stream().filter(sh -> sh.getPriority() == p).count();
            priorityDist.put(p.name(), count);
        }

        // Monthly Deliveries (Last 6 Months)
        Map<String, Long> monthlyDeliveries = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate targetMonth = now.minusMonths(i);
            String monthName = targetMonth.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            long count = allShipments.stream()
                    .filter(sh -> sh.getCreatedAt() != null
                            && sh.getCreatedAt().getYear() == targetMonth.getYear()
                            && sh.getCreatedAt().getMonth() == targetMonth.getMonth())
                    .count();
            monthlyDeliveries.put(monthName, count);
        }

        // Vehicle Distribution
        Map<String, Long> vehicleTypeDist = new LinkedHashMap<>();
        for (VehicleType vt : VehicleType.values()) {
            long count = vehicleRepository.findByVehicleType(vt).size();
            vehicleTypeDist.put(vt.name(), count);
        }

        Map<String, Long> vehicleStatusDist = new LinkedHashMap<>();
        for (VehicleStatus vs : VehicleStatus.values()) {
            long count = vehicleRepository.findByStatus(vs).size();
            vehicleStatusDist.put(vs.name(), count);
        }

        // Recent 10 Shipments
        List<ShipmentResponse> recentShipments = shipmentRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(s -> shipmentService.getShipmentById(s.getId()))
                .collect(Collectors.toList());

        // Alerts
        List<VehicleResponse> maintenanceAlerts = vehicleService.getMaintenanceAlerts();
        List<ShipmentResponse> delayedShipmentsList = shipmentService.getDelayedShipments();

        return DashboardStatsResponse.builder()
                .totalShipments(totalShipments)
                .activeShipments(activeShipments)
                .deliveredShipments(deliveredShipments)
                .delayedShipments(delayedShipments)
                .pendingShipments(pendingShipments)
                .cancelledShipments(cancelledShipments)
                .totalVehicles(totalVehicles)
                .availableVehicles(availableVehicles)
                .inTransitVehicles(inTransitVehicles)
                .maintenanceVehicles(maintenanceVehicles)
                .totalDrivers(totalDrivers)
                .availableDrivers(availableDrivers)
                .onDeliveryDrivers(onDeliveryDrivers)
                .offDutyDrivers(offDutyDrivers)
                .totalCustomers(totalCustomers)
                .totalWarehouses(totalWarehouses)
                .totalRoutes(totalRoutes)
                .shipmentStatusDistribution(statusDist)
                .shipmentPriorityDistribution(priorityDist)
                .monthlyDeliveries(monthlyDeliveries)
                .vehicleTypeDistribution(vehicleTypeDist)
                .vehicleStatusDistribution(vehicleStatusDist)
                .recentShipments(recentShipments)
                .maintenanceAlerts(maintenanceAlerts)
                .delayedShipmentsList(delayedShipmentsList)
                .build();
    }

    @Override
    public DashboardStatsResponse getDriverDashboardStats(Long userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found for user ID: " + userId));

        List<Delivery> deliveries = deliveryRepository.findByDriverIdOrderByCreatedAtDesc(driver.getId());

        long completedCount = deliveries.stream()
                .filter(d -> d.getDeliveryStatus() == DeliveryStatus.COMPLETED || d.getDeliveryStatus() == DeliveryStatus.DELIVERED)
                .count();

        long todayDeliveries = deliveries.stream()
                .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().toLocalDate().equals(LocalDate.now()))
                .count();

        long pendingCount = deliveries.stream()
                .filter(d -> d.getDeliveryStatus() != DeliveryStatus.COMPLETED 
                        && d.getDeliveryStatus() != DeliveryStatus.DELIVERED 
                        && d.getDeliveryStatus() != DeliveryStatus.FAILED)
                .count();

        Delivery activeDel = deliveries.stream()
                .filter(d -> d.getDeliveryStatus() == DeliveryStatus.OUT_FOR_DELIVERY
                        || d.getDeliveryStatus() == DeliveryStatus.IN_PROGRESS 
                        || d.getDeliveryStatus() == DeliveryStatus.IN_TRANSIT 
                        || d.getDeliveryStatus() == DeliveryStatus.PICKED_UP 
                        || d.getDeliveryStatus() == DeliveryStatus.ASSIGNED
                        || d.getDeliveryStatus() == DeliveryStatus.NOT_STARTED)
                .findFirst()
                .orElse(null);

        DeliveryResponse activeResponse = activeDel != null ? mapDeliveryToResponse(activeDel) : null;
        List<DeliveryResponse> assignedList = deliveries.stream()
                .map(this::mapDeliveryToResponse)
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalDrivers(1)
                .completedDeliveriesCount(completedCount)
                .todayDeliveriesCount(todayDeliveries)
                .pendingShipments(pendingCount)
                .activeDelivery(activeResponse)
                .assignedDeliveries(assignedList)
                .build();
    }

    @Override
    public DashboardStatsResponse getCustomerDashboardStats(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user ID: " + userId));

        List<Shipment> shipments = shipmentRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId());

        long total = shipments.size();
        long pending = shipments.stream().filter(s -> s.getShipmentStatus() == ShipmentStatus.PENDING).count();
        long inTransit = shipments.stream().filter(s -> s.getShipmentStatus() == ShipmentStatus.IN_TRANSIT || s.getShipmentStatus() == ShipmentStatus.OUT_FOR_DELIVERY || s.getShipmentStatus() == ShipmentStatus.PICKED_UP).count();
        long delivered = shipments.stream().filter(s -> s.getShipmentStatus() == ShipmentStatus.DELIVERED).count();
        long cancelled = shipments.stream().filter(s -> s.getShipmentStatus() == ShipmentStatus.CANCELLED).count();

        List<ShipmentResponse> recent = shipments.stream()
                .limit(5)
                .map(s -> shipmentService.getShipmentById(s.getId()))
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalShipments(total)
                .pendingShipments(pending)
                .activeShipments(inTransit)
                .deliveredShipments(delivered)
                .cancelledShipments(cancelled)
                .recentShipments(recent)
                .build();
    }

    private DeliveryResponse mapDeliveryToResponse(Delivery d) {
        return DeliveryResponse.builder()
                .id(d.getId())
                .shipmentId(d.getShipment().getId())
                .trackingNumber(d.getShipment().getTrackingNumber())
                .driverId(d.getDriver() != null ? d.getDriver().getId() : null)
                .driverName(d.getDriver() != null ? d.getDriver().getUser().getFullName() : null)
                .vehicleId(d.getVehicle() != null ? d.getVehicle().getId() : null)
                .vehicleNumber(d.getVehicle() != null ? d.getVehicle().getVehicleNumber() : null)
                .vehicleType(d.getVehicle() != null ? d.getVehicle().getVehicleType().name() : null)
                .pickupAddress(d.getShipment().getPickupAddress() + ", " + d.getShipment().getPickupCity())
                .deliveryAddress(d.getShipment().getDeliveryAddress() + ", " + d.getShipment().getDeliveryCity())
                .packageDescription(d.getShipment().getPackageDescription())
                .weightKg(d.getShipment().getWeightKg())
                .pickupTime(d.getPickupTime())
                .startTime(d.getStartTime())
                .deliveryTime(d.getDeliveryTime())
                .deliveryStatus(d.getDeliveryStatus())
                .shipmentStatus(d.getShipment() != null ? d.getShipment().getShipmentStatus() : null)
                .recipientName(d.getRecipientName())
                .deliveryNotes(d.getDeliveryNotes())
                .proofOfDelivery(d.getProofOfDelivery())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
