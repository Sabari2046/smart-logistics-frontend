package com.smartlogistics.service.impl;

import com.smartlogistics.dto.DeliveryResponse;
import com.smartlogistics.dto.DriverRequest;
import com.smartlogistics.dto.DriverResponse;
import com.smartlogistics.dto.ShipmentResponse;
import com.smartlogistics.entity.Delivery;
import com.smartlogistics.entity.Driver;
import com.smartlogistics.entity.User;
import com.smartlogistics.enums.DriverAvailability;
import com.smartlogistics.enums.Role;
import com.smartlogistics.enums.UserStatus;
import com.smartlogistics.exception.BadRequestException;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.DeliveryRepository;
import com.smartlogistics.repository.DriverRepository;
import com.smartlogistics.repository.ShipmentRepository;
import com.smartlogistics.repository.UserRepository;
import com.smartlogistics.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;
    private final DeliveryRepository deliveryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<DriverResponse> getAllDrivers(DriverAvailability status, String search) {
        return driverRepository.findAll().stream()
                .filter(d -> status == null || d.getAvailabilityStatus() == status)
                .filter(d -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return d.getUser().getFullName().toLowerCase().contains(s)
                            || d.getUser().getEmail().toLowerCase().contains(s)
                            || (d.getUser().getPhone() != null && d.getUser().getPhone().toLowerCase().contains(s))
                            || d.getLicenseNumber().toLowerCase().contains(s);
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DriverResponse getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
        return mapToResponse(driver);
    }

    @Override
    public DriverResponse getDriverByUserId(Long userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found for User ID: " + userId));
        return mapToResponse(driver);
    }

    @Override
    @Transactional
    public DriverResponse createDriver(DriverRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists");
        }
        if (driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
            throw new BadRequestException("A driver with license number " + request.getLicenseNumber() + " already exists");
        }

        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword()
                : "Driver@123";

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .phone(request.getPhone())
                .role(Role.ROLE_DRIVER)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        Driver driver = Driver.builder()
                .user(user)
                .licenseNumber(request.getLicenseNumber().toUpperCase().trim())
                .licenseType(request.getLicenseType() != null ? request.getLicenseType() : "Commercial Vehicle")
                .licenseExpiryDate(request.getLicenseExpiryDate())
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 1)
                .availabilityStatus(request.getAvailabilityStatus() != null ? request.getAvailabilityStatus() : DriverAvailability.AVAILABLE)
                .rating(request.getRating() != null ? request.getRating() : 5.0)
                .totalDeliveries(0)
                .build();

        driver = driverRepository.save(driver);
        return mapToResponse(driver);
    }

    @Override
    @Transactional
    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));

        User user = driver.getUser();
        user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);

        driver.setLicenseNumber(request.getLicenseNumber().toUpperCase().trim());
        if (request.getLicenseType() != null) driver.setLicenseType(request.getLicenseType());
        if (request.getLicenseExpiryDate() != null) driver.setLicenseExpiryDate(request.getLicenseExpiryDate());
        if (request.getExperienceYears() != null) driver.setExperienceYears(request.getExperienceYears());
        if (request.getAvailabilityStatus() != null) driver.setAvailabilityStatus(request.getAvailabilityStatus());
        if (request.getRating() != null) driver.setRating(request.getRating());

        driver = driverRepository.save(driver);
        return mapToResponse(driver);
    }

    @Override
    @Transactional
    public void deleteDriver(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
        driverRepository.delete(driver);
        userRepository.delete(driver.getUser());
    }

    @Override
    public List<DriverResponse> getAvailableDrivers() {
        return driverRepository.findByAvailabilityStatus(DriverAvailability.AVAILABLE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShipmentResponse> getDriverShipments(Long driverId) {
        return shipmentRepository.findByDriverIdOrderByCreatedAtDesc(driverId).stream()
                .map(s -> ShipmentResponse.builder()
                        .id(s.getId())
                        .trackingNumber(s.getTrackingNumber())
                        .customerId(s.getCustomer().getId())
                        .customerName(s.getCustomer().getUser().getFullName())
                        .pickupAddress(s.getPickupAddress() + ", " + s.getPickupCity())
                        .deliveryAddress(s.getDeliveryAddress() + ", " + s.getDeliveryCity())
                        .packageDescription(s.getPackageDescription())
                        .weightKg(s.getWeightKg())
                        .priority(s.getPriority())
                        .shipmentStatus(s.getShipmentStatus())
                        .expectedDeliveryDate(s.getExpectedDeliveryDate())
                        .actualDeliveryDate(s.getActualDeliveryDate())
                        .vehicleNumber(s.getVehicle() != null ? s.getVehicle().getVehicleNumber() : null)
                        .driverName(s.getDriver() != null ? s.getDriver().getUser().getFullName() : null)
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<DeliveryResponse> getDriverHistory(Long driverId) {
        return deliveryRepository.findByDriverIdOrderByCreatedAtDesc(driverId).stream()
                .map(this::mapDeliveryToResponse)
                .collect(Collectors.toList());
    }

    private DriverResponse mapToResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .userId(driver.getUser().getId())
                .fullName(driver.getUser().getFullName())
                .email(driver.getUser().getEmail())
                .phone(driver.getUser().getPhone())
                .licenseNumber(driver.getLicenseNumber())
                .licenseType(driver.getLicenseType())
                .licenseExpiryDate(driver.getLicenseExpiryDate())
                .experienceYears(driver.getExperienceYears())
                .availabilityStatus(driver.getAvailabilityStatus())
                .rating(driver.getRating())
                .totalDeliveries(driver.getTotalDeliveries())
                .createdAt(driver.getCreatedAt())
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
