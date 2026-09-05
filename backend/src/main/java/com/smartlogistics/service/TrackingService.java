package com.smartlogistics.service;

import com.smartlogistics.dto.ShipmentResponse;
import com.smartlogistics.dto.TrackingHistoryResponse;

import java.util.List;

public interface TrackingService {
    ShipmentResponse trackShipment(String trackingNumber);
    List<TrackingHistoryResponse> getTrackingHistory(String trackingNumber);
}
