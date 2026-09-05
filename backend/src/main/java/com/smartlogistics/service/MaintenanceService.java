package com.smartlogistics.service;

import com.smartlogistics.dto.MaintenanceRequest;
import com.smartlogistics.dto.MaintenanceResponse;
import com.smartlogistics.enums.MaintenanceStatus;

import java.util.List;

public interface MaintenanceService {
    List<MaintenanceResponse> getAllMaintenance(MaintenanceStatus status, Long vehicleId);
    MaintenanceResponse getMaintenanceById(Long id);
    MaintenanceResponse scheduleMaintenance(MaintenanceRequest request);
    MaintenanceResponse updateMaintenance(Long id, MaintenanceRequest request);
    void deleteMaintenance(Long id);
    List<MaintenanceResponse> getUpcomingDueMaintenance();
}
