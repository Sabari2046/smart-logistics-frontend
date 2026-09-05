package com.smartlogistics.service.impl;

import com.smartlogistics.dto.ShipmentResponse;
import com.smartlogistics.dto.TrackingHistoryResponse;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.TrackingHistoryRepository;
import com.smartlogistics.service.ShipmentService;
import com.smartlogistics.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackingServiceImpl implements TrackingService {

    private final ShipmentService shipmentService;
    private final TrackingHistoryRepository trackingHistoryRepository;

    @Override
    public ShipmentResponse trackShipment(String trackingNumber) {
        if (trackingNumber == null || trackingNumber.isBlank()) {
            throw new ResourceNotFoundException("Tracking number must be provided");
        }
        return shipmentService.getShipmentByTrackingNumber(trackingNumber.trim().toUpperCase());
    }

    @Override
    public List<TrackingHistoryResponse> getTrackingHistory(String trackingNumber) {
        return trackingHistoryRepository.findByShipmentTrackingNumberOrderByTimestampAsc(trackingNumber.trim().toUpperCase()).stream()
                .map(h -> TrackingHistoryResponse.builder()
                        .id(h.getId())
                        .status(h.getStatus())
                        .location(h.getLocation())
                        .description(h.getDescription())
                        .timestamp(h.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }
}
