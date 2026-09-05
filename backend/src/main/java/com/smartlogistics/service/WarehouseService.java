package com.smartlogistics.service;

import com.smartlogistics.dto.WarehouseRequest;
import com.smartlogistics.dto.WarehouseResponse;
import com.smartlogistics.enums.WarehouseStatus;

import java.util.List;

public interface WarehouseService {
    List<WarehouseResponse> getAllWarehouses(WarehouseStatus status, String search);
    WarehouseResponse getWarehouseById(Long id);
    WarehouseResponse createWarehouse(WarehouseRequest request);
    WarehouseResponse updateWarehouse(Long id, WarehouseRequest request);
    void deleteWarehouse(Long id);
}
