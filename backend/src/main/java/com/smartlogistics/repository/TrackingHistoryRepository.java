package com.smartlogistics.repository;

import com.smartlogistics.entity.TrackingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackingHistoryRepository extends JpaRepository<TrackingHistory, Long> {
    List<TrackingHistory> findByShipmentIdOrderByTimestampAsc(Long shipmentId);
    List<TrackingHistory> findByShipmentTrackingNumberOrderByTimestampAsc(String trackingNumber);
}
