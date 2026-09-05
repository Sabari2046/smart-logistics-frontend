package com.smartlogistics.service.impl;

import com.smartlogistics.dto.WarehouseRequest;
import com.smartlogistics.dto.WarehouseResponse;
import com.smartlogistics.entity.Warehouse;
import com.smartlogistics.enums.WarehouseStatus;
import com.smartlogistics.exception.BadRequestException;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.WarehouseRepository;
import com.smartlogistics.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Override
    public List<WarehouseResponse> getAllWarehouses(WarehouseStatus status, String search) {
        return warehouseRepository.findAll().stream()
                .filter(w -> status == null || w.getStatus() == status)
                .filter(w -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return w.getName().toLowerCase().contains(s)
                            || w.getCode().toLowerCase().contains(s)
                            || (w.getCity() != null && w.getCity().toLowerCase().contains(s))
                            || (w.getManagerName() != null && w.getManagerName().toLowerCase().contains(s));
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WarehouseResponse getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));
        return mapToResponse(warehouse);
    }

    @Override
    @Transactional
    public WarehouseResponse createWarehouse(WarehouseRequest request) {
        if (warehouseRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Warehouse code " + request.getCode() + " already exists");
        }

        Warehouse warehouse = Warehouse.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase().trim())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 10000.0)
                .currentStock(request.getCurrentStock() != null ? request.getCurrentStock() : 0.0)
                .managerName(request.getManagerName())
                .phone(request.getPhone())
                .status(request.getStatus() != null ? request.getStatus() : WarehouseStatus.ACTIVE)
                .build();

        warehouse = warehouseRepository.save(warehouse);
        return mapToResponse(warehouse);
    }

    @Override
    @Transactional
    public WarehouseResponse updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));

        warehouse.setName(request.getName());
        warehouse.setCode(request.getCode().toUpperCase().trim());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setPostalCode(request.getPostalCode());
        if (request.getCapacity() != null) warehouse.setCapacity(request.getCapacity());
        if (request.getCurrentStock() != null) warehouse.setCurrentStock(request.getCurrentStock());
        warehouse.setManagerName(request.getManagerName());
        warehouse.setPhone(request.getPhone());
        if (request.getStatus() != null) warehouse.setStatus(request.getStatus());

        warehouse = warehouseRepository.save(warehouse);
        return mapToResponse(warehouse);
    }

    @Override
    @Transactional
    public void deleteWarehouse(Long id) {
        if (!warehouseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Warehouse not found with ID: " + id);
        }
        warehouseRepository.deleteById(id);
    }

    private WarehouseResponse mapToResponse(Warehouse w) {
        return WarehouseResponse.builder()
                .id(w.getId())
                .name(w.getName())
                .code(w.getCode())
                .address(w.getAddress())
                .city(w.getCity())
                .state(w.getState())
                .postalCode(w.getPostalCode())
                .capacity(w.getCapacity())
                .currentStock(w.getCurrentStock())
                .managerName(w.getManagerName())
                .phone(w.getPhone())
                .status(w.getStatus())
                .createdAt(w.getCreatedAt())
                .build();
    }
}
