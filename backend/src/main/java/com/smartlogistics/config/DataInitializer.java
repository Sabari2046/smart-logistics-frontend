package com.smartlogistics.config;

import com.smartlogistics.entity.User;
import com.smartlogistics.enums.Role;
import com.smartlogistics.enums.UserStatus;
import com.smartlogistics.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final WarehouseRepository warehouseRepository;
    private final RouteRepository routeRepository;
    private final ShipmentRepository shipmentRepository;
    private final DeliveryRepository deliveryRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final VehicleMaintenanceRepository maintenanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing TransBayX system settings & administrator access...");

        // Clean up legacy demo seed users & dummy records if present from previous runs
        cleanLegacyDemoData();

        // Ensure TransBayX Super Admin account is provisioned
        final String adminEmail = "admintransbayx@gmail.com";
        User adminUser = userRepository.findByEmail(adminEmail).orElse(null);

        if (adminUser == null) {
            adminUser = User.builder()
                    .fullName("TransBayX Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .phone("9876543210")
                    .role(Role.ROLE_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(adminUser);
            log.info("Provisioned new Super Admin account: {}", adminEmail);
        } else {
            // Update password & status to ensure access
            adminUser.setPassword(passwordEncoder.encode("Admin@123"));
            adminUser.setRole(Role.ROLE_ADMIN);
            adminUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(adminUser);
            log.info("Updated existing Super Admin credentials: {}", adminEmail);
        }

        log.info("TransBayX initialization complete. Ready for live operations. Admin: {} / Admin@123", adminEmail);
    }

    private void cleanLegacyDemoData() {
        try {
            List<String> legacyDemoEmails = List.of(
                    "admin@smartlogistics.com",
                    "driver.arun@smartlogistics.com",
                    "driver.vikram@smartlogistics.com",
                    "driver.priya@smartlogistics.com",
                    "customer.rahul@gmail.com",
                    "customer.anita@gmail.com"
            );

            // Delete legacy demo shipments if they were seeded with SLF prefixes
            var demoShipments = shipmentRepository.findAll().stream()
                    .filter(s -> s.getTrackingNumber() != null && s.getTrackingNumber().startsWith("SLF"))
                    .toList();

            for (var shipment : demoShipments) {
                deliveryRepository.findByShipmentId(shipment.getId()).ifPresent(deliveryRepository::delete);
                trackingHistoryRepository.deleteAll(trackingHistoryRepository.findByShipmentIdOrderByTimestampAsc(shipment.getId()));
                shipmentRepository.delete(shipment);
            }

            for (String email : legacyDemoEmails) {
                userRepository.findByEmail(email).ifPresent(user -> {
                    customerRepository.findByUserId(user.getId()).ifPresent(customerRepository::delete);
                    driverRepository.findByUserId(user.getId()).ifPresent(driverRepository::delete);
                    userRepository.delete(user);
                    log.info("Removed legacy demo account: {}", email);
                });
            }
        } catch (Exception e) {
            log.warn("Non-fatal note during legacy demo data cleanup: {}", e.getMessage());
        }
    }
}
