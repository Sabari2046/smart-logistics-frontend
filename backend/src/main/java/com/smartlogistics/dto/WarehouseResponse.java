package com.smartlogistics.dto;

import com.smartlogistics.enums.WarehouseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseResponse {
    private Long id;
    private String name;
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
    private LocalDateTime createdAt;
}
