package com.smartlogistics.repository;

import com.smartlogistics.entity.Shipment;
import com.smartlogistics.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    List<Shipment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Shipment> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<Shipment> findByVehicleId(Long vehicleId);
    List<Shipment> findByShipmentStatus(ShipmentStatus shipmentStatus);
    long countByShipmentStatus(ShipmentStatus shipmentStatus);

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.shipmentStatus IN (:statuses)")
    long countByShipmentStatusIn(@Param("statuses") List<ShipmentStatus> statuses);

    @Query("SELECT s FROM Shipment s WHERE s.expectedDeliveryDate < :now AND s.shipmentStatus NOT IN ('DELIVERED', 'CANCELLED')")
    List<Shipment> findDelayedShipments(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(s) FROM Shipment s WHERE s.expectedDeliveryDate < :now AND s.shipmentStatus NOT IN ('DELIVERED', 'CANCELLED')")
    long countDelayedShipments(@Param("now") LocalDateTime now);

    List<Shipment> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT s FROM Shipment s WHERE s.createdAt BETWEEN :startDate AND :endDate ORDER BY s.createdAt ASC")
    List<Shipment> findShipmentsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
