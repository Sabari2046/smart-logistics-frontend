package com.smartlogistics.repository;

import com.smartlogistics.entity.Warehouse;
import com.smartlogistics.enums.WarehouseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByCode(String code);
    List<Warehouse> findByStatus(WarehouseStatus status);
    List<Warehouse> findByCityIgnoreCase(String city);
}
