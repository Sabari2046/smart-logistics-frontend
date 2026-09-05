package com.smartlogistics.service.impl;

import com.smartlogistics.dto.*;
import com.smartlogistics.entity.*;
import com.smartlogistics.enums.*;
import com.smartlogistics.exception.BadRequestException;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.exception.UnauthorizedException;
import com.smartlogistics.repository.*;
import com.smartlogistics.service.AuthService;
import com.smartlogistics.service.ShipmentService;
import com.smartlogistics.util.OtpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final WarehouseRepository warehouseRepository;
    private final RouteRepository routeRepository;
    private final DeliveryRepository deliveryRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final AuthService authService;

    @Override
    @Transactional
    public ShipmentResponse createShipment(ShipmentRequest request, Long customerUserId) {
        Customer customer;
        if (customerUserId != null) {
            customer = customerRepository.findByUserId(customerUserId)
                    .orElseGet(() -> {
                        User user = authService.getUserById(customerUserId);
                        Customer newCust = Customer.builder()
                                .user(user)
                                .address(request.getPickupAddress())
                                .city(request.getPickupCity())
                                .state(request.getPickupState())
                                .postalCode(request.getPickupPostalCode())
                                .companyName("Individual")
                                .build();
                        return customerRepository.save(newCust);
                    });
        } else if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));
        } else {
            User currentUser = authService.getCurrentAuthenticatedUser();
            customer = customerRepository.findByUserId(currentUser.getId())
                    .orElseGet(() -> {
                        List<Customer> allCustomers = customerRepository.findAll();
                        if (!allCustomers.isEmpty()) {
                            return allCustomers.get(0);
                        }
                        Customer newCust = Customer.builder()
                                .user(currentUser)
                                .address(request.getPickupAddress())
                                .city(request.getPickupCity())
                                .state(request.getPickupState())
                                .postalCode(request.getPickupPostalCode())
                                .companyName("Corporate Client")
                                .build();
                        return customerRepository.save(newCust);
                    });
        }

        String trackingNumber = generateUniqueTrackingNumber();

        ShipmentPriority priority = request.getPriority() != null ? request.getPriority() : ShipmentPriority.NORMAL;

        // Calculate shipping cost if not explicitly passed
        double cost = request.getShippingCost() != null ? request.getShippingCost() : calculateShippingCost(request.getWeightKg(), priority);

        // Expected delivery date default
        LocalDateTime expectedDelivery = request.getExpectedDeliveryDate();
        if (expectedDelivery == null) {
            int days = (priority == ShipmentPriority.URGENT) ? 1 : (priority == ShipmentPriority.EXPRESS) ? 2 : 3;
            expectedDelivery = LocalDateTime.now().plusDays(days);
        }

        Shipment shipment = Shipment.builder()
                .trackingNumber(trackingNumber)
                .customer(customer)
                .pickupAddress(request.getPickupAddress())
                .pickupCity(request.getPickupCity())
                .pickupState(request.getPickupState())
                .pickupPostalCode(request.getPickupPostalCode())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryCity(request.getDeliveryCity())
                .deliveryState(request.getDeliveryState())
                .deliveryPostalCode(request.getDeliveryPostalCode())
                .packageDescription(request.getPackageDescription())
                .weightKg(request.getWeightKg())
                .packageType(request.getPackageType() != null ? request.getPackageType() : "Standard Parcel")
                .priority(priority)
                .shippingCost(cost)
                .shipmentStatus(ShipmentStatus.PENDING)
                .expectedDeliveryDate(expectedDelivery)
                .build();

        if (request.getWarehouseId() != null) {
            warehouseRepository.findById(request.getWarehouseId()).ifPresent(shipment::setWarehouse);
        }
        if (request.getRouteId() != null) {
            routeRepository.findById(request.getRouteId()).ifPresent(shipment::setRoute);
        }
        if (request.getVehicleId() != null) {
            vehicleRepository.findById(request.getVehicleId()).ifPresent(shipment::setVehicle);
        }
        if (request.getDriverId() != null) {
            driverRepository.findById(request.getDriverId()).ifPresent(shipment::setDriver);
        }

        shipment = shipmentRepository.save(shipment);

        // Record initial tracking history
        createTrackingEntry(shipment, ShipmentStatus.PENDING, shipment.getPickupCity(), "Shipment order created and received by system. Pending administrative review.");

        return mapToResponse(shipment);
    }

    @Override
    public List<ShipmentResponse> getAllShipments(ShipmentStatus status, ShipmentPriority priority, String search) {
        return shipmentRepository.findAll().stream()
                .filter(s -> status == null || s.getShipmentStatus() == status)
                .filter(s -> priority == null || s.getPriority() == priority)
                .filter(s -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase();
                    return s.getTrackingNumber().toLowerCase().contains(q)
                            || s.getCustomer().getUser().getFullName().toLowerCase().contains(q)
                            || s.getPickupCity().toLowerCase().contains(q)
                            || s.getDeliveryCity().toLowerCase().contains(q);
                })
                .sorted(Comparator.comparing(Shipment::getCreatedAt).reversed())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ShipmentResponse getShipmentById(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));
        return mapToResponse(shipment);
    }

    @Override
    public ShipmentResponse getShipmentByTrackingNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with tracking number: " + trackingNumber));
        return mapToResponse(shipment);
    }

    @Override
    public List<ShipmentResponse> getCustomerShipments(Long customerId) {
        return shipmentRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShipmentResponse> getMyShipments() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return getAllShipments(null, null, null);
        } else if (currentUser.getRole() == Role.ROLE_DRIVER) {
            Driver driver = driverRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));
            return shipmentRepository.findByDriverIdOrderByCreatedAtDesc(driver.getId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else {
            Customer customer = customerRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
            return shipmentRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
    }

    @Override
    @Transactional
    public ShipmentResponse updateShipment(Long id, ShipmentRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));

        shipment.setPickupAddress(request.getPickupAddress());
        shipment.setPickupCity(request.getPickupCity());
        shipment.setPickupState(request.getPickupState());
        shipment.setPickupPostalCode(request.getPickupPostalCode());
        shipment.setDeliveryAddress(request.getDeliveryAddress());
        shipment.setDeliveryCity(request.getDeliveryCity());
        shipment.setDeliveryState(request.getDeliveryState());
        shipment.setDeliveryPostalCode(request.getDeliveryPostalCode());
        shipment.setPackageDescription(request.getPackageDescription());
        shipment.setWeightKg(request.getWeightKg());
        if (request.getPackageType() != null) shipment.setPackageType(request.getPackageType());
        if (request.getPriority() != null) shipment.setPriority(request.getPriority());
        if (request.getExpectedDeliveryDate() != null) shipment.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        if (request.getShippingCost() != null) shipment.setShippingCost(request.getShippingCost());

        shipment = shipmentRepository.save(shipment);
        return mapToResponse(shipment);
    }

    @Override
    @Transactional
    public void deleteShipment(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));

        // Delete associated delivery & tracking histories first
        deliveryRepository.findByShipment(shipment).ifPresent(deliveryRepository::delete);
        List<TrackingHistory> histories = trackingHistoryRepository.findByShipmentIdOrderByTimestampAsc(id);
        trackingHistoryRepository.deleteAll(histories);

        shipmentRepository.delete(shipment);
    }

    @Override
    @Transactional
    public ShipmentResponse cancelShipment(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));

        User currentUser = authService.getCurrentAuthenticatedUser();

        // Customer permission check
        if (currentUser.getRole() == Role.ROLE_CUSTOMER) {
            if (!shipment.getCustomer().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not authorized to cancel this shipment");
            }
            if (shipment.getShipmentStatus() != ShipmentStatus.PENDING && shipment.getShipmentStatus() != ShipmentStatus.APPROVED) {
                throw new BadRequestException("Shipment cannot be cancelled once it is in process (" + shipment.getShipmentStatus() + ")");
            }
        }

        if (shipment.getShipmentStatus() == ShipmentStatus.DELIVERED) {
            throw new BadRequestException("Delivered shipment cannot be cancelled");
        }

        shipment.setShipmentStatus(ShipmentStatus.CANCELLED);

        // Free vehicle and driver if assigned
        if (shipment.getVehicle() != null) {
            Vehicle vehicle = shipment.getVehicle();
            if (vehicle.getStatus() == VehicleStatus.ASSIGNED || vehicle.getStatus() == VehicleStatus.IN_TRANSIT) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(vehicle);
            }
        }
        if (shipment.getDriver() != null) {
            Driver driver = shipment.getDriver();
            if (driver.getAvailabilityStatus() == DriverAvailability.ASSIGNED || driver.getAvailabilityStatus() == DriverAvailability.ON_DELIVERY) {
                driver.setAvailabilityStatus(DriverAvailability.AVAILABLE);
                driverRepository.save(driver);
            }
        }

        shipment = shipmentRepository.save(shipment);

        createTrackingEntry(shipment, ShipmentStatus.CANCELLED, shipment.getPickupCity(), "Shipment was cancelled.");

        return mapToResponse(shipment);
    }

    @Override
    @Transactional
    public ShipmentResponse assignDriver(Long shipmentId, Long driverId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverId));

        if (driver.getAvailabilityStatus() == DriverAvailability.ON_DELIVERY || driver.getAvailabilityStatus() == DriverAvailability.OFF_DUTY) {
            throw new BadRequestException("Driver is not available (Current status: " + driver.getAvailabilityStatus() + ")");
        }

        // Release previously assigned driver if any
        if (shipment.getDriver() != null && !shipment.getDriver().getId().equals(driverId)) {
            Driver oldDriver = shipment.getDriver();
            oldDriver.setAvailabilityStatus(DriverAvailability.AVAILABLE);
            driverRepository.save(oldDriver);
        }

        driver.setAvailabilityStatus(DriverAvailability.ASSIGNED);
        driverRepository.save(driver);

        shipment.setDriver(driver);
        if (shipment.getShipmentStatus() == ShipmentStatus.PENDING) {
            shipment.setShipmentStatus(ShipmentStatus.APPROVED);
        }
        if (shipment.getVehicle() != null) {
            shipment.setShipmentStatus(ShipmentStatus.ASSIGNED);
        }

        shipment = shipmentRepository.save(shipment);

        syncDeliveryRecord(shipment);

        createTrackingEntry(shipment, shipment.getShipmentStatus(), shipment.getPickupCity(),
                "Driver " + driver.getUser().getFullName() + " assigned to shipment.");

        return mapToResponse(shipment);
    }

    @Override
    @Transactional
    public ShipmentResponse assignVehicle(Long shipmentId, Long vehicleId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));

        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE || vehicle.getStatus() == VehicleStatus.INACTIVE || vehicle.getStatus() == VehicleStatus.IN_TRANSIT) {
            throw new BadRequestException("Vehicle is not available (Current status: " + vehicle.getStatus() + ")");
        }

        if (vehicle.getCapacityKg() < shipment.getWeightKg()) {
            throw new BadRequestException("Vehicle capacity (" + vehicle.getCapacityKg() + " kg) is insufficient for shipment weight (" + shipment.getWeightKg() + " kg)");
        }

        // Release previously assigned vehicle if any
        if (shipment.getVehicle() != null && !shipment.getVehicle().getId().equals(vehicleId)) {
            Vehicle oldVehicle = shipment.getVehicle();
            oldVehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(oldVehicle);
        }

        vehicle.setStatus(VehicleStatus.ASSIGNED);
        vehicleRepository.save(vehicle);

        shipment.setVehicle(vehicle);
        if (shipment.getShipmentStatus() == ShipmentStatus.PENDING) {
            shipment.setShipmentStatus(ShipmentStatus.APPROVED);
        }
        if (shipment.getDriver() != null) {
            shipment.setShipmentStatus(ShipmentStatus.ASSIGNED);
        }

        shipment = shipmentRepository.save(shipment);

        syncDeliveryRecord(shipment);

        createTrackingEntry(shipment, shipment.getShipmentStatus(), shipment.getPickupCity(),
                "Vehicle " + vehicle.getVehicleNumber() + " (" + vehicle.getVehicleType() + ") assigned to shipment.");

        return mapToResponse(shipment);
    }

    @Override
    @Transactional
    public ShipmentResponse assignShipment(Long shipmentId, AssignShipmentRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));
            if (vehicle.getCapacityKg() < shipment.getWeightKg()) {
                throw new BadRequestException("Vehicle capacity (" + vehicle.getCapacityKg() + " kg) is less than package weight (" + shipment.getWeightKg() + " kg)");
            }
            vehicle.setStatus(VehicleStatus.ASSIGNED);
            vehicleRepository.save(vehicle);
            shipment.setVehicle(vehicle);
        }

        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + request.getDriverId()));
            driver.setAvailabilityStatus(DriverAvailability.ASSIGNED);
            driverRepository.save(driver);
            shipment.setDriver(driver);
        }

        if (request.getRouteId() != null) {
            routeRepository.findById(request.getRouteId()).ifPresent(shipment::setRoute);
        }

        if (request.getWarehouseId() != null) {
            warehouseRepository.findById(request.getWarehouseId()).ifPresent(shipment::setWarehouse);
        }

        shipment.setShipmentStatus(ShipmentStatus.ASSIGNED);
        shipment = shipmentRepository.save(shipment);

        syncDeliveryRecord(shipment);

        createTrackingEntry(shipment, ShipmentStatus.ASSIGNED, shipment.getPickupCity(),
                "Shipment approved and assigned to vehicle " + (shipment.getVehicle() != null ? shipment.getVehicle().getVehicleNumber() : "") +
                        " and driver " + (shipment.getDriver() != null ? shipment.getDriver().getUser().getFullName() : "") + ".");

        return mapToResponse(shipment);
    }

    @Override
    @Transactional
    public ShipmentResponse updateStatus(Long shipmentId, StatusUpdateRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        ShipmentStatus newStatus = request.getStatus();
        ShipmentStatus oldStatus = shipment.getShipmentStatus();

        if (oldStatus == ShipmentStatus.DELIVERED) {
            throw new BadRequestException("Shipment is already DELIVERED and cannot be modified");
        }
        if (oldStatus == ShipmentStatus.CANCELLED) {
            throw new BadRequestException("Shipment is CANCELLED and cannot be modified");
        }

        // Business rule #42: Driver and vehicle must be assigned before shipment becomes IN_TRANSIT
        if (newStatus == ShipmentStatus.IN_TRANSIT || newStatus == ShipmentStatus.OUT_FOR_DELIVERY || newStatus == ShipmentStatus.DELIVERED) {
            if (shipment.getVehicle() == null || shipment.getDriver() == null) {
                throw new BadRequestException("Vehicle and Driver must be assigned before advancing to " + newStatus);
            }
        }

        shipment.setShipmentStatus(newStatus);

        Delivery delivery = syncDeliveryRecord(shipment);

        // State Machine transitions for Vehicle and Driver
        if (newStatus == ShipmentStatus.PICKED_UP) {
            if (delivery.getPickupTime() == null) delivery.setPickupTime(LocalDateTime.now());
            delivery.setDeliveryStatus(DeliveryStatus.PICKED_UP);
        } else if (newStatus == ShipmentStatus.IN_TRANSIT) {
            if (delivery.getStartTime() == null) delivery.setStartTime(LocalDateTime.now());
            delivery.setDeliveryStatus(DeliveryStatus.IN_PROGRESS);

            if (shipment.getVehicle() != null) {
                shipment.getVehicle().setStatus(VehicleStatus.IN_TRANSIT);
                vehicleRepository.save(shipment.getVehicle());
            }
            if (shipment.getDriver() != null) {
                shipment.getDriver().setAvailabilityStatus(DriverAvailability.ON_DELIVERY);
                driverRepository.save(shipment.getDriver());
            }
        } else if (newStatus == ShipmentStatus.OUT_FOR_DELIVERY) {
            delivery.setDeliveryStatus(DeliveryStatus.OUT_FOR_DELIVERY);
        } else if (newStatus == ShipmentStatus.DELIVERED) {
            String trackingId = shipment.getTrackingNumber() != null ? shipment.getTrackingNumber() : String.valueOf(shipment.getId());
            if (request.getDeliveryOtp() != null && !request.getDeliveryOtp().isBlank()) {
                if (!OtpUtil.validateDeliveryOtp(request.getDeliveryOtp(), trackingId)) {
                    throw new BadRequestException("Invalid Handover OTP! The verification code '" + request.getDeliveryOtp() + "' is incorrect. Please enter the exact 6-digit Delivery OTP displayed on the recipient's tracking screen.");
                }
            }

            LocalDateTime now = LocalDateTime.now();
            shipment.setActualDeliveryDate(now);
            delivery.setDeliveryTime(now);
            delivery.setDeliveryStatus(DeliveryStatus.COMPLETED);

            if (request.getRecipientName() != null) delivery.setRecipientName(request.getRecipientName());
            if (request.getDeliveryNotes() != null) delivery.setDeliveryNotes(request.getDeliveryNotes());
            if (request.getProofOfDelivery() != null) delivery.setProofOfDelivery(request.getProofOfDelivery());

            // Release Vehicle and Driver back to AVAILABLE and increment total deliveries
            if (shipment.getVehicle() != null) {
                shipment.getVehicle().setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(shipment.getVehicle());
            }
            if (shipment.getDriver() != null) {
                Driver driver = shipment.getDriver();
                driver.setAvailabilityStatus(DriverAvailability.AVAILABLE);
                driver.setTotalDeliveries((driver.getTotalDeliveries() != null ? driver.getTotalDeliveries() : 0) + 1);
                driverRepository.save(driver);
            }
        }

        deliveryRepository.save(delivery);
        shipment = shipmentRepository.save(shipment);

        String location = request.getLocation() != null && !request.getLocation().isBlank()
                ? request.getLocation()
                : (newStatus == ShipmentStatus.DELIVERED ? shipment.getDeliveryCity() : shipment.getPickupCity());

        String description = request.getDescription() != null && !request.getDescription().isBlank()
                ? request.getDescription()
                : "Status updated to " + newStatus.name().replace("_", " ");

        createTrackingEntry(shipment, newStatus, location, description);

        return mapToResponse(shipment);
    }

    @Override
    public List<RecommendedVehicleResponse> getRecommendedVehicles(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        double weight = shipment.getWeightKg();

        List<Vehicle> availableVehicles = vehicleRepository.findRecommendedVehicles(weight);

        List<RecommendedVehicleResponse> list = new ArrayList<>();
        boolean isFirst = true;

        for (Vehicle v : availableVehicles) {
            double diff = v.getCapacityKg() - weight;
            String reason = isFirst
                    ? "Optimal fit: Smallest available vehicle with sufficient capacity (+" + String.format("%.1f", diff) + " kg buffer)"
                    : "Suitable: Capacity of " + v.getCapacityKg() + " kg (+" + String.format("%.1f", diff) + " kg buffer)";

            list.add(RecommendedVehicleResponse.builder()
                    .id(v.getId())
                    .vehicleNumber(v.getVehicleNumber())
                    .vehicleType(v.getVehicleType())
                    .brand(v.getBrand())
                    .model(v.getModel())
                    .capacityKg(v.getCapacityKg())
                    .fuelType(v.getFuelType())
                    .status(v.getStatus())
                    .currentLocation(v.getCurrentLocation())
                    .capacityDifference(diff)
                    .isBestMatch(isFirst)
                    .matchReason(reason)
                    .build());

            isFirst = false;
        }

        return list;
    }

    @Override
    public List<RecommendedDriverResponse> getRecommendedDrivers(Long shipmentId) {
        shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        List<Driver> drivers = driverRepository.findRecommendedDrivers();

        List<RecommendedDriverResponse> list = new ArrayList<>();
        boolean isFirst = true;

        for (Driver d : drivers) {
            String reason = isFirst
                    ? "Top rated available driver (★ " + d.getRating() + ", " + d.getExperienceYears() + " yrs exp, " + d.getTotalDeliveries() + " completed)"
                    : "Available: " + d.getExperienceYears() + " yrs exp, rating ★ " + d.getRating();

            list.add(RecommendedDriverResponse.builder()
                    .id(d.getId())
                    .userId(d.getUser().getId())
                    .fullName(d.getUser().getFullName())
                    .email(d.getUser().getEmail())
                    .phone(d.getUser().getPhone())
                    .licenseNumber(d.getLicenseNumber())
                    .licenseType(d.getLicenseType())
                    .experienceYears(d.getExperienceYears())
                    .availabilityStatus(d.getAvailabilityStatus())
                    .rating(d.getRating())
                    .totalDeliveries(d.getTotalDeliveries())
                    .isBestMatch(isFirst)
                    .matchReason(reason)
                    .build());

            isFirst = false;
        }

        return list;
    }

    @Override
    public List<ShipmentResponse> getDelayedShipments() {
        return shipmentRepository.findDelayedShipments(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Delivery syncDeliveryRecord(Shipment shipment) {
        Delivery delivery = deliveryRepository.findByShipment(shipment)
                .orElseGet(() -> Delivery.builder()
                        .shipment(shipment)
                        .deliveryStatus(DeliveryStatus.NOT_STARTED)
                        .build());

        if (shipment.getDriver() != null) delivery.setDriver(shipment.getDriver());
        if (shipment.getVehicle() != null) delivery.setVehicle(shipment.getVehicle());
        return deliveryRepository.save(delivery);
    }

    private void createTrackingEntry(Shipment shipment, ShipmentStatus status, String location, String description) {
        TrackingHistory history = TrackingHistory.builder()
                .shipment(shipment)
                .status(status)
                .location(location != null ? location : "Hub")
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();
        trackingHistoryRepository.save(history);
    }

    private String generateUniqueTrackingNumber() {
        int currentYear = Year.now().getValue();
        String candidate;
        do {
            int seq = ThreadLocalRandom.current().nextInt(10000, 99999);
            candidate = "SLF" + currentYear + seq;
        } while (shipmentRepository.findByTrackingNumber(candidate).isPresent());
        return candidate;
    }

    private double calculateShippingCost(Double weightKg, ShipmentPriority priority) {
        double w = weightKg != null ? weightKg : 1.0;
        double base = 150.0;
        double weightRate = w * 25.0;
        double multiplier = (priority == ShipmentPriority.URGENT) ? 2.0 : (priority == ShipmentPriority.EXPRESS) ? 1.5 : 1.0;
        return Math.round((base + weightRate) * multiplier * 100.0) / 100.0;
    }

    private ShipmentResponse mapToResponse(Shipment s) {
        boolean isDelayed = s.getExpectedDeliveryDate() != null
                && LocalDateTime.now().isAfter(s.getExpectedDeliveryDate())
                && s.getShipmentStatus() != ShipmentStatus.DELIVERED
                && s.getShipmentStatus() != ShipmentStatus.CANCELLED;

        List<TrackingHistoryResponse> histories = trackingHistoryRepository
                .findByShipmentIdOrderByTimestampAsc(s.getId()).stream()
                .map(h -> TrackingHistoryResponse.builder()
                        .id(h.getId())
                        .status(h.getStatus())
                        .location(h.getLocation())
                        .description(h.getDescription())
                        .timestamp(h.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        return ShipmentResponse.builder()
                .id(s.getId())
                .trackingNumber(s.getTrackingNumber())
                .customerId(s.getCustomer().getId())
                .customerName(s.getCustomer().getUser().getFullName())
                .customerEmail(s.getCustomer().getUser().getEmail())
                .customerPhone(s.getCustomer().getUser().getPhone())
                .companyName(s.getCustomer().getCompanyName())
                .pickupAddress(s.getPickupAddress())
                .pickupCity(s.getPickupCity())
                .pickupState(s.getPickupState())
                .pickupPostalCode(s.getPickupPostalCode())
                .deliveryAddress(s.getDeliveryAddress())
                .deliveryCity(s.getDeliveryCity())
                .deliveryState(s.getDeliveryState())
                .deliveryPostalCode(s.getDeliveryPostalCode())
                .packageDescription(s.getPackageDescription())
                .weightKg(s.getWeightKg())
                .packageType(s.getPackageType())
                .priority(s.getPriority())
                .shippingCost(s.getShippingCost())
                .shipmentStatus(s.getShipmentStatus())
                .expectedDeliveryDate(s.getExpectedDeliveryDate())
                .actualDeliveryDate(s.getActualDeliveryDate())
                .isDelayed(isDelayed)
                .vehicleId(s.getVehicle() != null ? s.getVehicle().getId() : null)
                .vehicleNumber(s.getVehicle() != null ? s.getVehicle().getVehicleNumber() : null)
                .vehicleType(s.getVehicle() != null ? s.getVehicle().getVehicleType().name() : null)
                .vehicleBrandModel(s.getVehicle() != null ? s.getVehicle().getBrand() + " " + s.getVehicle().getModel() : null)
                .driverId(s.getDriver() != null ? s.getDriver().getId() : null)
                .driverName(s.getDriver() != null ? s.getDriver().getUser().getFullName() : null)
                .driverPhone(s.getDriver() != null ? s.getDriver().getUser().getPhone() : null)
                .driverLicense(s.getDriver() != null ? s.getDriver().getLicenseNumber() : null)
                .driverRating(s.getDriver() != null ? s.getDriver().getRating() : null)
                .routeId(s.getRoute() != null ? s.getRoute().getId() : null)
                .routeName(s.getRoute() != null ? s.getRoute().getRouteName() : null)
                .routeSource(s.getRoute() != null ? s.getRoute().getSource() : null)
                .routeDestination(s.getRoute() != null ? s.getRoute().getDestination() : null)
                .routeDistanceKm(s.getRoute() != null ? s.getRoute().getDistanceKm() : null)
                .warehouseId(s.getWarehouse() != null ? s.getWarehouse().getId() : null)
                .warehouseName(s.getWarehouse() != null ? s.getWarehouse().getName() : null)
                .warehouseCode(s.getWarehouse() != null ? s.getWarehouse().getCode() : null)
                .warehouseCity(s.getWarehouse() != null ? s.getWarehouse().getCity() : null)
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .trackingHistories(histories)
                .build();
    }
}
