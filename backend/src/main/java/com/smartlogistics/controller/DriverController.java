package com.smartlogistics.controller;

import com.smartlogistics.dto.*;
import com.smartlogistics.entity.User;
import com.smartlogistics.enums.DriverAvailability;
import com.smartlogistics.service.AuthService;
import com.smartlogistics.service.DashboardService;
import com.smartlogistics.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final DashboardService dashboardService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<DriverResponse>> getAllDrivers(
            @RequestParam(required = false) DriverAvailability status,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(driverService.getAllDrivers(status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody DriverRequest request) {
        return new ResponseEntity<>(driverService.createDriver(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<DriverResponse> updateDriver(@PathVariable Long id, @Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok("Driver deleted successfully");
    }

    @GetMapping("/available")
    public ResponseEntity<List<DriverResponse>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }

    @GetMapping("/{id}/shipments")
    public ResponseEntity<List<ShipmentResponse>> getDriverShipments(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverShipments(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<DeliveryResponse>> getDriverHistory(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverHistory(id));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DashboardStatsResponse> getDriverDashboard() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(dashboardService.getDriverDashboardStats(user.getId()));
    }
}
