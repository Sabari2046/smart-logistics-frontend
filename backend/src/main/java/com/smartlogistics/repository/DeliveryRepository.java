package com.smartlogistics.repository;

import com.smartlogistics.entity.Delivery;
import com.smartlogistics.entity.Shipment;
import com.smartlogistics.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByShipment(Shipment shipment);
    Optional<Delivery> findByShipmentId(Long shipmentId);
    List<Delivery> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<Delivery> findByVehicleId(Long vehicleId);
    List<Delivery> findByDeliveryStatus(DeliveryStatus deliveryStatus);
}
