package com.smartlogistics.controller;

import com.smartlogistics.dto.DashboardStatsResponse;
import com.smartlogistics.dto.ShipmentResponse;
import com.smartlogistics.entity.User;
import com.smartlogistics.enums.UserStatus;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.UserRepository;
import com.smartlogistics.service.DashboardService;
import com.smartlogistics.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final DashboardService dashboardService;
    private final ShipmentService shipmentService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setStatus(status);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/delayed-shipments")
    public ResponseEntity<List<ShipmentResponse>> getDelayedShipments() {
        return ResponseEntity.ok(shipmentService.getDelayedShipments());
    }
}
