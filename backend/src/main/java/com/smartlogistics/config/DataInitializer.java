package com.smartlogistics.config;

import com.smartlogistics.entity.*;
import com.smartlogistics.enums.*;
import com.smartlogistics.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
        if (shipmentRepository.count() > 0) {
            log.info("Database already contains shipments. Skipping initial data setup.");
            return;
        }

        log.info("Seeding initial demo data for Smart Logistics & Fleet Management System...");

        // 1. Create Admin User
        User adminUser = userRepository.findByEmail("admin@smartlogistics.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("System Administrator")
                        .email("admin@smartlogistics.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .phone("9876543210")
                        .role(Role.ROLE_ADMIN)
                        .status(UserStatus.ACTIVE)
                        .build())
        );

        // 2. Create Drivers
        User driverUser1 = userRepository.findByEmail("driver.arun@smartlogistics.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Arun Kumar")
                        .email("driver.arun@smartlogistics.com")
                        .password(passwordEncoder.encode("Driver@123"))
                        .phone("9876500001")
                        .role(Role.ROLE_DRIVER)
                        .status(UserStatus.ACTIVE)
                        .build())
        );

        Driver driver1 = driverRepository.findByLicenseNumber("TN-38-2018-009871").orElseGet(() ->
                driverRepository.save(Driver.builder()
                        .user(driverUser1)
                        .licenseNumber("TN-38-2018-009871")
                        .licenseType("Heavy Commercial Vehicle (HCV)")
                        .licenseExpiryDate(LocalDate.now().plusYears(4))
                        .experienceYears(6)
                        .availabilityStatus(DriverAvailability.AVAILABLE)
                        .rating(4.9)
                        .totalDeliveries(142)
                        .build())
        );

        User driverUser2 = userRepository.findByEmail("driver.vikram@smartlogistics.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Vikram Singh")
                        .email("driver.vikram@smartlogistics.com")
                        .password(passwordEncoder.encode("Driver@123"))
                        .phone("9876500002")
                        .role(Role.ROLE_DRIVER)
                        .status(UserStatus.ACTIVE)
                        .build())
        );

        Driver driver2 = driverRepository.findByLicenseNumber("KA-01-2020-004321").orElseGet(() ->
                driverRepository.save(Driver.builder()
                        .user(driverUser2)
                        .licenseNumber("KA-01-2020-004321")
                        .licenseType("Light Commercial Vehicle (LCV)")
                        .licenseExpiryDate(LocalDate.now().plusYears(3))
                        .experienceYears(4)
                        .availabilityStatus(DriverAvailability.AVAILABLE)
                        .rating(4.8)
                        .totalDeliveries(98)
                        .build())
        );

        User driverUser3 = userRepository.findByEmail("driver.priya@smartlogistics.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Priya Sharma")
                        .email("driver.priya@smartlogistics.com")
                        .password(passwordEncoder.encode("Driver@123"))
                        .phone("9876500003")
                        .role(Role.ROLE_DRIVER)
                        .status(UserStatus.ACTIVE)
                        .build())
        );

        Driver driver3 = driverRepository.findByLicenseNumber("MH-12-2016-008765").orElseGet(() ->
                driverRepository.save(Driver.builder()
                        .user(driverUser3)
                        .licenseNumber("MH-12-2016-008765")
                        .licenseType("Medium Freight Transport (MCV)")
                        .licenseExpiryDate(LocalDate.now().plusYears(5))
                        .experienceYears(8)
                        .availabilityStatus(DriverAvailability.AVAILABLE)
                        .rating(4.95)
                        .totalDeliveries(210)
                        .build())
        );

        // 3. Create Customers
        User customerUser1 = userRepository.findByEmail("customer.rahul@gmail.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Rahul Menon")
                        .email("customer.rahul@gmail.com")
                        .password(passwordEncoder.encode("Customer@123"))
                        .phone("9840011223")
                        .role(Role.ROLE_CUSTOMER)
                        .status(UserStatus.ACTIVE)
                        .build())
        );

        Customer customer1 = customerRepository.findByUserId(customerUser1.getId()).orElseGet(() ->
                customerRepository.save(Customer.builder()
                        .user(customerUser1)
                        .address("45 Industrial Estate, Guindy")
                        .city("Chennai")
                        .state("Tamil Nadu")
                        .postalCode("600032")
                        .companyName("Apex Global Technologies")
                        .build())
        );

        User customerUser2 = userRepository.findByEmail("customer.anita@gmail.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Anita Roy")
                        .email("customer.anita@gmail.com")
                        .password(passwordEncoder.encode("Customer@123"))
                        .phone("9880022334")
                        .role(Role.ROLE_CUSTOMER)
                        .status(UserStatus.ACTIVE)
                        .build())
        );

        Customer customer2 = customerRepository.findByUserId(customerUser2.getId()).orElseGet(() ->
                customerRepository.save(Customer.builder()
                        .user(customerUser2)
                        .address("12 Electronic City Phase 1")
                        .city("Bengaluru")
                        .state("Karnataka")
                        .postalCode("560100")
                        .companyName("Horizon Retail Group")
                        .build())
        );

        // 4. Create Vehicles
        Vehicle v1 = vehicleRepository.findByVehicleNumber("TN38AB4556").orElseGet(() ->
                vehicleRepository.save(Vehicle.builder()
                        .vehicleNumber("TN38AB4556")
                        .vehicleType(VehicleType.MINI_TRUCK)
                        .brand("Tata Motors")
                        .model("Ace Gold Diesel")
                        .manufacturingYear(2023)
                        .capacityKg(750.0)
                        .fuelType(FuelType.DIESEL)
                        .status(VehicleStatus.AVAILABLE)
                        .currentLocation("Coimbatore")
                        .odometerKm(28400.0)
                        .insuranceExpiryDate(LocalDate.now().plusMonths(8))
                        .registrationExpiryDate(LocalDate.now().plusYears(4))
                        .lastServiceDate(LocalDate.now().minusMonths(2))
                        .nextServiceDate(LocalDate.now().plusMonths(4))
                        .build())
        );

        Vehicle v2 = vehicleRepository.findByVehicleNumber("KA01CD7890").orElseGet(() ->
                vehicleRepository.save(Vehicle.builder()
                        .vehicleNumber("KA01CD7890")
                        .vehicleType(VehicleType.VAN)
                        .brand("Force Motors")
                        .model("Urbania Express Cargo")
                        .manufacturingYear(2024)
                        .capacityKg(1200.0)
                        .fuelType(FuelType.DIESEL)
                        .status(VehicleStatus.AVAILABLE)
                        .currentLocation("Bengaluru")
                        .odometerKm(14500.0)
                        .insuranceExpiryDate(LocalDate.now().plusMonths(11))
                        .registrationExpiryDate(LocalDate.now().plusYears(5))
                        .lastServiceDate(LocalDate.now().minusMonths(1))
                        .nextServiceDate(LocalDate.now().plusMonths(5))
                        .build())
        );

        Vehicle v3 = vehicleRepository.findByVehicleNumber("TN09EF1234").orElseGet(() ->
                vehicleRepository.save(Vehicle.builder()
                        .vehicleNumber("TN09EF1234")
                        .vehicleType(VehicleType.TRUCK)
                        .brand("BharatBenz")
                        .model("1217R Medium Freight")
                        .manufacturingYear(2022)
                        .capacityKg(5000.0)
                        .fuelType(FuelType.DIESEL)
                        .status(VehicleStatus.AVAILABLE)
                        .currentLocation("Chennai")
                        .odometerKm(68200.0)
                        .insuranceExpiryDate(LocalDate.now().plusDays(10))
                        .registrationExpiryDate(LocalDate.now().plusYears(2))
                        .lastServiceDate(LocalDate.now().minusMonths(5))
                        .nextServiceDate(LocalDate.now().plusDays(5))
                        .build())
        );

        Vehicle v4 = vehicleRepository.findByVehicleNumber("MH12GH5678").orElseGet(() ->
                vehicleRepository.save(Vehicle.builder()
                        .vehicleNumber("MH12GH5678")
                        .vehicleType(VehicleType.HEAVY_TRUCK)
                        .brand("Ashok Leyland")
                        .model("AVTR 4220 Multi-Axle")
                        .manufacturingYear(2023)
                        .capacityKg(20000.0)
                        .fuelType(FuelType.DIESEL)
                        .status(VehicleStatus.AVAILABLE)
                        .currentLocation("Mumbai")
                        .odometerKm(84300.0)
                        .insuranceExpiryDate(LocalDate.now().plusMonths(9))
                        .registrationExpiryDate(LocalDate.now().plusYears(4))
                        .lastServiceDate(LocalDate.now().minusMonths(3))
                        .nextServiceDate(LocalDate.now().plusMonths(3))
                        .build())
        );

        Vehicle v5 = vehicleRepository.findByVehicleNumber("TN07JK9012").orElseGet(() ->
                vehicleRepository.save(Vehicle.builder()
                        .vehicleNumber("TN07JK9012")
                        .vehicleType(VehicleType.BIKE)
                        .brand("Ather Energy")
                        .model("450X Cargo Edition")
                        .manufacturingYear(2024)
                        .capacityKg(50.0)
                        .fuelType(FuelType.ELECTRIC)
                        .status(VehicleStatus.AVAILABLE)
                        .currentLocation("Chennai")
                        .odometerKm(4200.0)
                        .insuranceExpiryDate(LocalDate.now().plusMonths(10))
                        .registrationExpiryDate(LocalDate.now().plusYears(5))
                        .lastServiceDate(LocalDate.now().minusMonths(1))
                        .nextServiceDate(LocalDate.now().plusMonths(5))
                        .build())
        );

        // 5. Create Warehouses
        Warehouse wh1 = warehouseRepository.findByCode("WH-CHN-01").orElseGet(() ->
                warehouseRepository.save(Warehouse.builder()
                        .name("Chennai Central Logistics Hub")
                        .code("WH-CHN-01")
                        .address("Plot 18, SIPCOT Logistics Park, Sriperumbudur")
                        .city("Chennai")
                        .state("Tamil Nadu")
                        .postalCode("602105")
                        .capacity(50000.0)
                        .currentStock(28500.0)
                        .managerName("Gopalakrishnan N.")
                        .phone("9444012345")
                        .status(WarehouseStatus.ACTIVE)
                        .build())
        );

        Warehouse wh2 = warehouseRepository.findByCode("WH-BLR-02").orElseGet(() ->
                warehouseRepository.save(Warehouse.builder()
                        .name("Bengaluru Silicon Valley Hub")
                        .code("WH-BLR-02")
                        .address("Survey 82, Hosur Main Road, Electronic City")
                        .city("Bengaluru")
                        .state("Karnataka")
                        .postalCode("560100")
                        .capacity(60000.0)
                        .currentStock(34200.0)
                        .managerName("Venkatesh Rao")
                        .phone("9444054321")
                        .status(WarehouseStatus.ACTIVE)
                        .build())
        );

        Warehouse wh3 = warehouseRepository.findByCode("WH-BOM-03").orElseGet(() ->
                warehouseRepository.save(Warehouse.builder()
                        .name("Mumbai Western Gateway Hub")
                        .code("WH-BOM-03")
                        .address("Gate 4, JNPT Logistic Enclave, Navi Mumbai")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400707")
                        .capacity(80000.0)
                        .currentStock(51000.0)
                        .managerName("Manish Kulkarni")
                        .phone("9444088990")
                        .status(WarehouseStatus.ACTIVE)
                        .build())
        );

        // 6. Create Routes
        Route r1 = routeRepository.save(Route.builder()
                .routeName("Chennai - Bengaluru Express Corridor")
                .source("Chennai Central Hub")
                .destination("Bengaluru Electronic City Hub")
                .distanceKm(345.0)
                .estimatedDurationMinutes(330)
                .estimatedFuelCost(4200.0)
                .tollCost(480.0)
                .routeStatus(RouteStatus.ACTIVE)
                .build());

        Route r2 = routeRepository.save(Route.builder()
                .routeName("Bengaluru - Hyderabad Highway")
                .source("Bengaluru Electronic City Hub")
                .destination("Hyderabad Gachibowli Terminal")
                .distanceKm(570.0)
                .estimatedDurationMinutes(540)
                .estimatedFuelCost(6800.0)
                .tollCost(750.0)
                .routeStatus(RouteStatus.ACTIVE)
                .build());

        Route r3 = routeRepository.save(Route.builder()
                .routeName("Chennai - Coimbatore Central Line")
                .source("Chennai Central Hub")
                .destination("Coimbatore Peelamedu Depot")
                .distanceKm(505.0)
                .estimatedDurationMinutes(480)
                .estimatedFuelCost(6100.0)
                .tollCost(620.0)
                .routeStatus(RouteStatus.ACTIVE)
                .build());

        // 7. Create Shipments with Lifecycle Histories
        // Shipment 1: DELIVERED
        Shipment s1 = Shipment.builder()
                .trackingNumber("SLF202610001")
                .customer(customer1)
                .pickupAddress("45 Industrial Estate, Guindy")
                .pickupCity("Chennai")
                .pickupState("Tamil Nadu")
                .pickupPostalCode("600032")
                .deliveryAddress("12 Electronic City Phase 1")
                .deliveryCity("Bengaluru")
                .deliveryState("Karnataka")
                .deliveryPostalCode("560100")
                .packageDescription("Precision Electronics Components & Sensors")
                .weightKg(450.0)
                .packageType("Fragile Industrial Goods")
                .priority(ShipmentPriority.EXPRESS)
                .shippingCost(11400.0)
                .shipmentStatus(ShipmentStatus.DELIVERED)
                .expectedDeliveryDate(LocalDateTime.now().minusDays(1))
                .actualDeliveryDate(LocalDateTime.now().minusHours(2))
                .vehicle(v1)
                .driver(driver1)
                .route(r1)
                .warehouse(wh1)
                .build();
        s1 = shipmentRepository.save(s1);

        Delivery d1 = Delivery.builder()
                .shipment(s1)
                .driver(driver1)
                .vehicle(v1)
                .pickupTime(LocalDateTime.now().minusDays(2))
                .startTime(LocalDateTime.now().minusDays(2).plusHours(2))
                .deliveryTime(LocalDateTime.now().minusHours(2))
                .deliveryStatus(DeliveryStatus.COMPLETED)
                .recipientName("Anita Roy")
                .deliveryNotes("Delivered in pristine condition with signed manifest.")
                .proofOfDelivery("POD-SLF202610001.pdf")
                .build();
        deliveryRepository.save(d1);

        createTracking(s1, ShipmentStatus.PENDING, "Chennai", "Order placed by Apex Global Technologies.", LocalDateTime.now().minusDays(3));
        createTracking(s1, ShipmentStatus.ASSIGNED, "Chennai", "Vehicle TN38AB4556 and Driver Arun Kumar assigned.", LocalDateTime.now().minusDays(2).minusHours(4));
        createTracking(s1, ShipmentStatus.PICKED_UP, "Chennai", "Package securely picked up from Guindy sender.", LocalDateTime.now().minusDays(2));
        createTracking(s1, ShipmentStatus.IN_TRANSIT, "Vellore Tollway", "Package in transit on NH48 corridor.", LocalDateTime.now().minusDays(1).minusHours(6));
        createTracking(s1, ShipmentStatus.OUT_FOR_DELIVERY, "Bengaluru", "Out for final delivery from Electronic City hub.", LocalDateTime.now().minusHours(5));
        createTracking(s1, ShipmentStatus.DELIVERED, "Bengaluru", "Package delivered and received by Anita Roy.", LocalDateTime.now().minusHours(2));

        // Shipment 2: IN_TRANSIT
        Shipment s2 = Shipment.builder()
                .trackingNumber("SLF202610002")
                .customer(customer2)
                .pickupAddress("88 Whitefield Main Road")
                .pickupCity("Bengaluru")
                .pickupState("Karnataka")
                .pickupPostalCode("560066")
                .deliveryAddress("204 Anna Salai, Thousand Lights")
                .deliveryCity("Chennai")
                .deliveryState("Tamil Nadu")
                .deliveryPostalCode("600006")
                .packageDescription("Server Hardware & Network Switches")
                .weightKg(320.0)
                .packageType("IT Equipment")
                .priority(ShipmentPriority.NORMAL)
                .shippingCost(8150.0)
                .shipmentStatus(ShipmentStatus.IN_TRANSIT)
                .expectedDeliveryDate(LocalDateTime.now().plusDays(1))
                .vehicle(v2)
                .driver(driver2)
                .route(r1)
                .warehouse(wh2)
                .build();
        s2 = shipmentRepository.save(s2);

        Delivery d2 = Delivery.builder()
                .shipment(s2)
                .driver(driver2)
                .vehicle(v2)
                .pickupTime(LocalDateTime.now().minusHours(8))
                .startTime(LocalDateTime.now().minusHours(6))
                .deliveryStatus(DeliveryStatus.IN_PROGRESS)
                .build();
        deliveryRepository.save(d2);

        createTracking(s2, ShipmentStatus.PENDING, "Bengaluru", "Order placed.", LocalDateTime.now().minusDays(1));
        createTracking(s2, ShipmentStatus.ASSIGNED, "Bengaluru", "Assigned to Force Urbania (KA01CD7890) and driver Vikram Singh.", LocalDateTime.now().minusHours(12));
        createTracking(s2, ShipmentStatus.PICKED_UP, "Bengaluru", "Picked up from Whitefield warehouse.", LocalDateTime.now().minusHours(8));
        createTracking(s2, ShipmentStatus.IN_TRANSIT, "Hosur Border", "Shipment currently in transit crossing state checkpoint.", LocalDateTime.now().minusHours(4));

        // Shipment 3: PENDING (Ready for Admin Smart Assignment demo)
        Shipment s3 = Shipment.builder()
                .trackingNumber("SLF202610003")
                .customer(customer1)
                .pickupAddress("Plot 5, Guindy Industrial Estate")
                .pickupCity("Chennai")
                .pickupState("Tamil Nadu")
                .pickupPostalCode("600032")
                .deliveryAddress("44 Race Course Road")
                .deliveryCity("Coimbatore")
                .deliveryState("Tamil Nadu")
                .deliveryPostalCode("641018")
                .packageDescription("Industrial Machinery Spare Parts")
                .weightKg(450.0)
                .packageType("Heavy Spares")
                .priority(ShipmentPriority.NORMAL)
                .shippingCost(11400.0)
                .shipmentStatus(ShipmentStatus.PENDING)
                .expectedDeliveryDate(LocalDateTime.now().plusDays(2))
                .warehouse(wh1)
                .route(r3)
                .build();
        s3 = shipmentRepository.save(s3);
        createTracking(s3, ShipmentStatus.PENDING, "Chennai", "Shipment requested by customer. Awaiting review.", LocalDateTime.now().minusHours(3));

        // Shipment 4: ASSIGNED / PICKUP_SCHEDULED (Ready for Driver demo)
        Shipment s4 = Shipment.builder()
                .trackingNumber("SLF202610004")
                .customer(customer2)
                .pickupAddress("15 Koramangala 4th Block")
                .pickupCity("Bengaluru")
                .pickupState("Karnataka")
                .pickupPostalCode("560034")
                .deliveryAddress("90 Mount Road")
                .deliveryCity("Chennai")
                .deliveryState("Tamil Nadu")
                .deliveryPostalCode("600002")
                .packageDescription("E-Commerce Apparel Consignment")
                .weightKg(600.0)
                .packageType("Boxed Apparel")
                .priority(ShipmentPriority.URGENT)
                .shippingCost(15150.0)
                .shipmentStatus(ShipmentStatus.ASSIGNED)
                .expectedDeliveryDate(LocalDateTime.now().plusDays(1))
                .vehicle(v1)
                .driver(driver1)
                .route(r1)
                .warehouse(wh2)
                .build();
        s4 = shipmentRepository.save(s4);

        Delivery d4 = Delivery.builder()
                .shipment(s4)
                .driver(driver1)
                .vehicle(v1)
                .deliveryStatus(DeliveryStatus.NOT_STARTED)
                .build();
        deliveryRepository.save(d4);

        createTracking(s4, ShipmentStatus.PENDING, "Bengaluru", "Shipment booked.", LocalDateTime.now().minusHours(6));
        createTracking(s4, ShipmentStatus.ASSIGNED, "Bengaluru", "Driver Arun Kumar scheduled for pickup.", LocalDateTime.now().minusHours(2));

        // Shipment 5: DELAYED (to test delay detection alert)
        Shipment s5 = Shipment.builder()
                .trackingNumber("SLF202610005")
                .customer(customer1)
                .pickupAddress("Old Port Gate 2")
                .pickupCity("Chennai")
                .pickupState("Tamil Nadu")
                .pickupPostalCode("600001")
                .deliveryAddress("MIDC Industrial Area")
                .deliveryCity("Mumbai")
                .deliveryState("Maharashtra")
                .deliveryPostalCode("400093")
                .packageDescription("High Precision Calibration Instruments")
                .weightKg(850.0)
                .packageType("Fragile Instruments")
                .priority(ShipmentPriority.NORMAL)
                .shippingCost(21400.0)
                .shipmentStatus(ShipmentStatus.IN_TRANSIT)
                .expectedDeliveryDate(LocalDateTime.now().minusHours(12))
                .vehicle(v3)
                .driver(driver3)
                .warehouse(wh1)
                .build();
        s5 = shipmentRepository.save(s5);

        Delivery d5 = Delivery.builder()
                .shipment(s5)
                .driver(driver3)
                .vehicle(v3)
                .pickupTime(LocalDateTime.now().minusDays(3))
                .startTime(LocalDateTime.now().minusDays(2))
                .deliveryStatus(DeliveryStatus.IN_PROGRESS)
                .build();
        deliveryRepository.save(d5);

        createTracking(s5, ShipmentStatus.PENDING, "Chennai", "Shipment created.", LocalDateTime.now().minusDays(4));
        createTracking(s5, ShipmentStatus.ASSIGNED, "Chennai", "Assigned to BharatBenz (TN09EF1234).", LocalDateTime.now().minusDays(3));
        createTracking(s5, ShipmentStatus.IN_TRANSIT, "Solapur Hub", "Shipment delayed due to heavy weather on western highway.", LocalDateTime.now().minusHours(10));

        // 8. Create Vehicle Maintenance records
        VehicleMaintenance vm1 = VehicleMaintenance.builder()
                .vehicle(v3)
                .maintenanceType(MaintenanceType.GENERAL_SERVICE)
                .description("Routine 50,000 km periodic overhaul and fluid replenishment.")
                .serviceDate(LocalDate.now().plusDays(5))
                .nextServiceDate(LocalDate.now().plusMonths(6))
                .cost(8500.0)
                .serviceCenter("BharatBenz Authorized Service Chennai")
                .status(MaintenanceStatus.SCHEDULED)
                .build();

        VehicleMaintenance vm2 = VehicleMaintenance.builder()
                .vehicle(v1)
                .maintenanceType(MaintenanceType.TYRE_CHANGE)
                .description("All 4 radial tyres replaced and wheel balancing performed.")
                .serviceDate(LocalDate.now().minusMonths(2))
                .nextServiceDate(LocalDate.now().plusMonths(10))
                .cost(18200.0)
                .serviceCenter("Tata Commercial Service Hub")
                .status(MaintenanceStatus.COMPLETED)
                .build();

        maintenanceRepository.saveAll(List.of(vm1, vm2));

        log.info("Demo data seeding completed successfully! Admin: admin@smartlogistics.com / Admin@123");
    }

    private void createTracking(Shipment s, ShipmentStatus status, String location, String desc, LocalDateTime time) {
        TrackingHistory th = TrackingHistory.builder()
                .shipment(s)
                .status(status)
                .location(location)
                .description(desc)
                .timestamp(time)
                .build();
        trackingHistoryRepository.save(th);
    }
}
