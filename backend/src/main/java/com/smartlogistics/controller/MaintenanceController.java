package com.smartlogistics.controller;

import com.smartlogistics.dto.MaintenanceRequest;
import com.smartlogistics.dto.MaintenanceResponse;
import com.smartlogistics.enums.MaintenanceStatus;
import com.smartlogistics.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<List<MaintenanceResponse>> getAllMaintenance(
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) Long vehicleId
    ) {
        return ResponseEntity.ok(maintenanceService.getAllMaintenance(status, vehicleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceResponse> getMaintenanceById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceById(id));
    }

    @PostMapping
    public ResponseEntity<MaintenanceResponse> scheduleMaintenance(@Valid @RequestBody MaintenanceRequest request) {
        return new ResponseEntity<>(maintenanceService.scheduleMaintenance(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceResponse> updateMaintenance(@PathVariable Long id, @Valid @RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceService.updateMaintenance(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMaintenance(@PathVariable Long id) {
        maintenanceService.deleteMaintenance(id);
        return ResponseEntity.ok("Maintenance record deleted successfully");
    }

    @GetMapping("/due")
    public ResponseEntity<List<MaintenanceResponse>> getUpcomingDueMaintenance() {
        return ResponseEntity.ok(maintenanceService.getUpcomingDueMaintenance());
    }
}
