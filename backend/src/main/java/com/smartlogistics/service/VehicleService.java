package com.smartlogistics.service;

import com.smartlogistics.dto.VehicleRequest;
import com.smartlogistics.dto.VehicleResponse;
import com.smartlogistics.enums.FuelType;
import com.smartlogistics.enums.VehicleStatus;
import com.smartlogistics.enums.VehicleType;

import java.util.List;

public interface VehicleService {
    List<VehicleResponse> getAllVehicles(VehicleType type, VehicleStatus status, FuelType fuelType, String search);
    VehicleResponse getVehicleById(Long id);
    VehicleResponse createVehicle(VehicleRequest request);
    VehicleResponse updateVehicle(Long id, VehicleRequest request);
    void deleteVehicle(Long id);
    List<VehicleResponse> getAvailableVehicles();
    List<VehicleResponse> getVehiclesByStatus(VehicleStatus status);
    List<VehicleResponse> getMaintenanceAlerts();
}
