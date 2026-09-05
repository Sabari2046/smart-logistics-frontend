package com.smartlogistics.dto;

import com.smartlogistics.enums.DriverAvailability;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String licenseNumber;
    private String licenseType;
    private LocalDate licenseExpiryDate;
    private Integer experienceYears;
    private DriverAvailability availabilityStatus;
    private Double rating;
    private Integer totalDeliveries;
    private LocalDateTime createdAt;
}
