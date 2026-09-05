package com.smartlogistics.service.impl;

import com.smartlogistics.dto.MaintenanceRequest;
import com.smartlogistics.dto.MaintenanceResponse;
import com.smartlogistics.entity.Vehicle;
import com.smartlogistics.entity.VehicleMaintenance;
import com.smartlogistics.enums.MaintenanceStatus;
import com.smartlogistics.enums.VehicleStatus;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.VehicleMaintenanceRepository;
import com.smartlogistics.repository.VehicleRepository;
import com.smartlogistics.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

    private final VehicleMaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    public List<MaintenanceResponse> getAllMaintenance(MaintenanceStatus status, Long vehicleId) {
        return maintenanceRepository.findAll().stream()
                .filter(m -> status == null || m.getStatus() == status)
                .filter(m -> vehicleId == null || m.getVehicle().getId().equals(vehicleId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaintenanceResponse getMaintenanceById(Long id) {
        VehicleMaintenance m = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));
        return mapToResponse(m);
    }

    @Override
    @Transactional
    public MaintenanceResponse scheduleMaintenance(MaintenanceRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));

        MaintenanceStatus status = request.getStatus() != null ? request.getStatus() : MaintenanceStatus.SCHEDULED;

        if (status == MaintenanceStatus.IN_PROGRESS) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
            vehicleRepository.save(vehicle);
        }

        VehicleMaintenance maintenance = VehicleMaintenance.builder()
                .vehicle(vehicle)
                .maintenanceType(request.getMaintenanceType())
                .description(request.getDescription())
                .serviceDate(request.getServiceDate() != null ? request.getServiceDate() : LocalDate.now())
                .nextServiceDate(request.getNextServiceDate() != null ? request.getNextServiceDate() : LocalDate.now().plusMonths(6))
                .cost(request.getCost() != null ? request.getCost() : 0.0)
                .serviceCenter(request.getServiceCenter())
                .status(status)
                .build();

        maintenance = maintenanceRepository.save(maintenance);
        return mapToResponse(maintenance);
    }

    @Override
    @Transactional
    public MaintenanceResponse updateMaintenance(Long id, MaintenanceRequest request) {
        VehicleMaintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));

        Vehicle vehicle = maintenance.getVehicle();
        if (request.getVehicleId() != null && !request.getVehicleId().equals(vehicle.getId())) {
            vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));
            maintenance.setVehicle(vehicle);
        }

        MaintenanceStatus oldStatus = maintenance.getStatus();
        MaintenanceStatus newStatus = request.getStatus() != null ? request.getStatus() : oldStatus;

        maintenance.setMaintenanceType(request.getMaintenanceType());
        maintenance.setDescription(request.getDescription());
        if (request.getServiceDate() != null) maintenance.setServiceDate(request.getServiceDate());
        if (request.getNextServiceDate() != null) maintenance.setNextServiceDate(request.getNextServiceDate());
        if (request.getCost() != null) maintenance.setCost(request.getCost());
        if (request.getServiceCenter() != null) maintenance.setServiceCenter(request.getServiceCenter());
        maintenance.setStatus(newStatus);

        // State changes for vehicle
        if (newStatus == MaintenanceStatus.IN_PROGRESS) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
            vehicleRepository.save(vehicle);
        } else if (newStatus == MaintenanceStatus.COMPLETED && oldStatus != MaintenanceStatus.COMPLETED) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicle.setLastServiceDate(maintenance.getServiceDate());
            if (maintenance.getNextServiceDate() != null) {
                vehicle.setNextServiceDate(maintenance.getNextServiceDate());
            } else {
                vehicle.setNextServiceDate(LocalDate.now().plusMonths(6));
            }
            vehicleRepository.save(vehicle);
        }

        maintenance = maintenanceRepository.save(maintenance);
        return mapToResponse(maintenance);
    }

    @Override
    @Transactional
    public void deleteMaintenance(Long id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Maintenance record not found with ID: " + id);
        }
        maintenanceRepository.deleteById(id);
    }

    @Override
    public List<MaintenanceResponse> getUpcomingDueMaintenance() {
        LocalDate threshold = LocalDate.now().plusDays(7);
        return maintenanceRepository.findUpcomingDueMaintenance(threshold).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MaintenanceResponse mapToResponse(VehicleMaintenance m) {
        return MaintenanceResponse.builder()
                .id(m.getId())
                .vehicleId(m.getVehicle().getId())
                .vehicleNumber(m.getVehicle().getVehicleNumber())
                .vehicleType(m.getVehicle().getVehicleType())
                .vehicleBrandModel(m.getVehicle().getBrand() + " " + m.getVehicle().getModel())
                .maintenanceType(m.getMaintenanceType())
                .description(m.getDescription())
                .serviceDate(m.getServiceDate())
                .nextServiceDate(m.getNextServiceDate())
                .cost(m.getCost())
                .serviceCenter(m.getServiceCenter())
                .status(m.getStatus())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
