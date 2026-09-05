package com.smartlogistics.repository;

import com.smartlogistics.entity.VehicleMaintenance;
import com.smartlogistics.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VehicleMaintenanceRepository extends JpaRepository<VehicleMaintenance, Long> {
    List<VehicleMaintenance> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);
    List<VehicleMaintenance> findByStatus(MaintenanceStatus status);
    long countByStatus(MaintenanceStatus status);

    @Query("SELECT vm FROM VehicleMaintenance vm WHERE vm.nextServiceDate IS NOT NULL AND vm.nextServiceDate <= :threshold AND vm.status != 'COMPLETED'")
    List<VehicleMaintenance> findUpcomingDueMaintenance(@Param("threshold") LocalDate threshold);

    @Query("SELECT SUM(vm.cost) FROM VehicleMaintenance vm WHERE vm.status = 'COMPLETED'")
    Double getTotalMaintenanceCost();
}
