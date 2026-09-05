package com.smartlogistics.repository;

import com.smartlogistics.entity.Vehicle;
import com.smartlogistics.enums.FuelType;
import com.smartlogistics.enums.VehicleStatus;
import com.smartlogistics.enums.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
    List<Vehicle> findByStatus(VehicleStatus status);
    List<Vehicle> findByVehicleType(VehicleType vehicleType);
    List<Vehicle> findByFuelType(FuelType fuelType);
    long countByStatus(VehicleStatus status);

    @Query("SELECT v FROM Vehicle v WHERE v.status = 'AVAILABLE' AND v.capacityKg >= :weight ORDER BY v.capacityKg ASC")
    List<Vehicle> findRecommendedVehicles(@Param("weight") Double weight);

    @Query("SELECT v FROM Vehicle v WHERE v.nextServiceDate IS NOT NULL AND v.nextServiceDate <= :serviceThreshold")
    List<Vehicle> findVehiclesDueForService(@Param("serviceThreshold") LocalDate serviceThreshold);

    @Query("SELECT v FROM Vehicle v WHERE v.insuranceExpiryDate IS NOT NULL AND v.insuranceExpiryDate <= :insuranceThreshold")
    List<Vehicle> findVehiclesWithExpiringInsurance(@Param("insuranceThreshold") LocalDate insuranceThreshold);
}
