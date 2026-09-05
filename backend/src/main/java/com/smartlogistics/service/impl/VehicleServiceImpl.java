package com.smartlogistics.service.impl;

import com.smartlogistics.dto.VehicleRequest;
import com.smartlogistics.dto.VehicleResponse;
import com.smartlogistics.entity.Vehicle;
import com.smartlogistics.enums.FuelType;
import com.smartlogistics.enums.VehicleStatus;
import com.smartlogistics.enums.VehicleType;
import com.smartlogistics.exception.BadRequestException;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.VehicleRepository;
import com.smartlogistics.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    public List<VehicleResponse> getAllVehicles(VehicleType type, VehicleStatus status, FuelType fuelType, String search) {
        return vehicleRepository.findAll().stream()
                .filter(v -> type == null || v.getVehicleType() == type)
                .filter(v -> status == null || v.getStatus() == status)
                .filter(v -> fuelType == null || v.getFuelType() == fuelType)
                .filter(v -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return v.getVehicleNumber().toLowerCase().contains(s)
                            || (v.getBrand() != null && v.getBrand().toLowerCase().contains(s))
                            || (v.getModel() != null && v.getModel().toLowerCase().contains(s))
                            || (v.getCurrentLocation() != null && v.getCurrentLocation().toLowerCase().contains(s));
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
        return mapToResponse(vehicle);
    }

    @Override
    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        if (vehicleRepository.findByVehicleNumber(request.getVehicleNumber()).isPresent()) {
            throw new BadRequestException("Vehicle with number " + request.getVehicleNumber() + " already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .vehicleNumber(request.getVehicleNumber().toUpperCase().trim())
                .vehicleType(request.getVehicleType())
                .brand(request.getBrand())
                .model(request.getModel())
                .manufacturingYear(request.getManufacturingYear())
                .capacityKg(request.getCapacityKg())
                .fuelType(request.getFuelType())
                .status(request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE)
                .currentLocation(request.getCurrentLocation() != null ? request.getCurrentLocation() : "Central Hub")
                .odometerKm(request.getOdometerKm() != null ? request.getOdometerKm() : 0.0)
                .insuranceExpiryDate(request.getInsuranceExpiryDate())
                .registrationExpiryDate(request.getRegistrationExpiryDate())
                .lastServiceDate(request.getLastServiceDate())
                .nextServiceDate(request.getNextServiceDate())
                .build();

        vehicle = vehicleRepository.save(vehicle);
        return mapToResponse(vehicle);
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        if (!vehicle.getVehicleNumber().equalsIgnoreCase(request.getVehicleNumber())) {
            vehicleRepository.findByVehicleNumber(request.getVehicleNumber()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new BadRequestException("Vehicle number already in use by another vehicle");
                }
            });
        }

        vehicle.setVehicleNumber(request.getVehicleNumber().toUpperCase().trim());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setCapacityKg(request.getCapacityKg());
        vehicle.setFuelType(request.getFuelType());
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }
        if (request.getCurrentLocation() != null) {
            vehicle.setCurrentLocation(request.getCurrentLocation());
        }
        if (request.getOdometerKm() != null) {
            vehicle.setOdometerKm(request.getOdometerKm());
        }
        vehicle.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        vehicle.setRegistrationExpiryDate(request.getRegistrationExpiryDate());
        vehicle.setLastServiceDate(request.getLastServiceDate());
        vehicle.setNextServiceDate(request.getNextServiceDate());

        vehicle = vehicleRepository.save(vehicle);
        return mapToResponse(vehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found with ID: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    @Override
    public List<VehicleResponse> getAvailableVehicles() {
        return vehicleRepository.findByStatus(VehicleStatus.AVAILABLE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleResponse> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleResponse> getMaintenanceAlerts() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToResponse)
                .filter(v -> v.isServiceDueSoon() || v.isInsuranceExpiringSoon() || v.isExpired())
                .collect(Collectors.toList());
    }

    private VehicleResponse mapToResponse(Vehicle vehicle) {
        LocalDate today = LocalDate.now();
        boolean serviceDueSoon = false;
        boolean insuranceExpiringSoon = false;
        boolean isExpired = false;
        StringBuilder alertMessage = new StringBuilder();

        if (vehicle.getNextServiceDate() != null) {
            if (vehicle.getNextServiceDate().isBefore(today)) {
                isExpired = true;
                alertMessage.append("Service Overdue. ");
            } else if (!vehicle.getNextServiceDate().isAfter(today.plusDays(7))) {
                serviceDueSoon = true;
                alertMessage.append("Service Due Soon (within 7 days). ");
            }
        }

        if (vehicle.getInsuranceExpiryDate() != null) {
            if (vehicle.getInsuranceExpiryDate().isBefore(today)) {
                isExpired = true;
                alertMessage.append("Insurance Expired. ");
            } else if (!vehicle.getInsuranceExpiryDate().isAfter(today.plusDays(15))) {
                insuranceExpiringSoon = true;
                alertMessage.append("Insurance Expiring Soon (within 15 days). ");
            }
        }

        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vehicleNumber(vehicle.getVehicleNumber())
                .vehicleType(vehicle.getVehicleType())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .manufacturingYear(vehicle.getManufacturingYear())
                .capacityKg(vehicle.getCapacityKg())
                .fuelType(vehicle.getFuelType())
                .status(vehicle.getStatus())
                .currentLocation(vehicle.getCurrentLocation())
                .odometerKm(vehicle.getOdometerKm())
                .insuranceExpiryDate(vehicle.getInsuranceExpiryDate())
                .registrationExpiryDate(vehicle.getRegistrationExpiryDate())
                .lastServiceDate(vehicle.getLastServiceDate())
                .nextServiceDate(vehicle.getNextServiceDate())
                .createdAt(vehicle.getCreatedAt())
                .serviceDueSoon(serviceDueSoon)
                .insuranceExpiringSoon(insuranceExpiringSoon)
                .isExpired(isExpired)
                .alertMessage(alertMessage.toString().trim())
                .build();
    }
}
