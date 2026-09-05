package com.smartlogistics.controller;

import com.smartlogistics.dto.ShipmentResponse;
import com.smartlogistics.dto.TrackingHistoryResponse;
import com.smartlogistics.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping("/{trackingNumber}")
    public ResponseEntity<ShipmentResponse> trackShipment(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(trackingService.trackShipment(trackingNumber));
    }

    @GetMapping("/{trackingNumber}/history")
    public ResponseEntity<List<TrackingHistoryResponse>> getTrackingHistory(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(trackingService.getTrackingHistory(trackingNumber));
    }
}
