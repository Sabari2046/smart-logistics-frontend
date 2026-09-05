package com.smartlogistics.controller;

import com.smartlogistics.dto.DeliveryResponse;
import com.smartlogistics.dto.StatusUpdateRequest;
import com.smartlogistics.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryResponse> getDeliveryById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.getDeliveryById(id));
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<DeliveryResponse> getDeliveryByShipmentId(@PathVariable Long shipmentId) {
        return ResponseEntity.ok(deliveryService.getDeliveryByShipmentId(shipmentId));
    }

    @GetMapping("/my-deliveries")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<DeliveryResponse>> getMyDeliveries() {
        return ResponseEntity.ok(deliveryService.getMyDeliveries());
    }

    @PatchMapping("/shipment/{shipmentId}/pickup")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponse> markPickedUp(@PathVariable Long shipmentId) {
        return ResponseEntity.ok(deliveryService.markPickedUp(shipmentId));
    }

    @PatchMapping("/shipment/{shipmentId}/start-delivery")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponse> startDelivery(@PathVariable Long shipmentId) {
        return ResponseEntity.ok(deliveryService.startDelivery(shipmentId));
    }

    @PatchMapping("/shipment/{shipmentId}/out-for-delivery")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponse> markOutForDelivery(@PathVariable Long shipmentId) {
        return ResponseEntity.ok(deliveryService.markOutForDelivery(shipmentId));
    }

    @PatchMapping("/shipment/{shipmentId}/delivered")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponse> markDelivered(@PathVariable Long shipmentId, @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(deliveryService.markDelivered(shipmentId, request));
    }

    @PatchMapping("/shipment/{shipmentId}/progress")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponse> updateProgress(@PathVariable Long shipmentId, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(deliveryService.updateDeliveryProgress(shipmentId, request));
    }
}
