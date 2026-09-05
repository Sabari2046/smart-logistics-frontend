package com.smartlogistics.controller;

import com.smartlogistics.dto.*;
import com.smartlogistics.entity.User;
import com.smartlogistics.enums.Role;
import com.smartlogistics.enums.ShipmentPriority;
import com.smartlogistics.enums.ShipmentStatus;
import com.smartlogistics.service.AuthService;
import com.smartlogistics.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<ShipmentResponse> createShipment(@Valid @RequestBody ShipmentRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Long customerUserId = (user.getRole() == Role.ROLE_CUSTOMER) ? user.getId() : null;
        return new ResponseEntity<>(shipmentService.createShipment(request, customerUserId), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> getAllShipments(
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) ShipmentPriority priority,
            @RequestParam(required = false) String search
    ) {
        User user = authService.getCurrentAuthenticatedUser();
        if (user.getRole() == Role.ROLE_ADMIN) {
            return ResponseEntity.ok(shipmentService.getAllShipments(status, priority, search));
        }
        return ResponseEntity.ok(shipmentService.getMyShipments());
    }

    @GetMapping("/my")
    public ResponseEntity<List<ShipmentResponse>> getMyShipments() {
        return ResponseEntity.ok(shipmentService.getMyShipments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getShipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<ShipmentResponse> getShipmentByTrackingNumber(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(shipmentService.getShipmentByTrackingNumber(trackingNumber));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER')")
    public ResponseEntity<List<ShipmentResponse>> getCustomerShipments(@PathVariable Long customerId) {
        return ResponseEntity.ok(shipmentService.getCustomerShipments(customerId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentResponse> updateShipment(@PathVariable Long id, @Valid @RequestBody ShipmentRequest request) {
        return ResponseEntity.ok(shipmentService.updateShipment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.ok("Shipment deleted successfully");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ShipmentResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(shipmentService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/assign-driver/{driverId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentResponse> assignDriver(@PathVariable Long id, @PathVariable Long driverId) {
        return ResponseEntity.ok(shipmentService.assignDriver(id, driverId));
    }

    @PatchMapping("/{id}/assign-vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentResponse> assignVehicle(@PathVariable Long id, @PathVariable Long vehicleId) {
        return ResponseEntity.ok(shipmentService.assignVehicle(id, vehicleId));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentResponse> assignShipment(@PathVariable Long id, @RequestBody AssignShipmentRequest request) {
        return ResponseEntity.ok(shipmentService.assignShipment(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ShipmentResponse> cancelShipment(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.cancelShipment(id));
    }

    @GetMapping("/{id}/recommended-vehicles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecommendedVehicleResponse>> getRecommendedVehicles(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getRecommendedVehicles(id));
    }

    @GetMapping("/{id}/recommended-drivers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecommendedDriverResponse>> getRecommendedDrivers(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getRecommendedDrivers(id));
    }
}
