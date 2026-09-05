package com.smartlogistics.dto;

import com.smartlogistics.enums.WarehouseStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseRequest {

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Warehouse code is required")
    private String code;

    private String address;
    private String city;
    private String state;
    private String postalCode;
    private Double capacity;
    private Double currentStock;
    private String managerName;
    private String phone;
    private WarehouseStatus status;
}
