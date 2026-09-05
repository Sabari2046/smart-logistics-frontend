package com.smartlogistics.service;

import com.smartlogistics.dto.DeliveryResponse;
import com.smartlogistics.dto.DriverRequest;
import com.smartlogistics.dto.DriverResponse;
import com.smartlogistics.dto.ShipmentResponse;
import com.smartlogistics.enums.DriverAvailability;

import java.util.List;

public interface DriverService {
    List<DriverResponse> getAllDrivers(DriverAvailability status, String search);
    DriverResponse getDriverById(Long id);
    DriverResponse getDriverByUserId(Long userId);
    DriverResponse createDriver(DriverRequest request);
    DriverResponse updateDriver(Long id, DriverRequest request);
    void deleteDriver(Long id);
    List<DriverResponse> getAvailableDrivers();
    List<ShipmentResponse> getDriverShipments(Long driverId);
    List<DeliveryResponse> getDriverHistory(Long driverId);
}
