package com.smartlogistics.dto;

import com.smartlogistics.enums.DriverAvailability;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedDriverResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String licenseNumber;
    private String licenseType;
    private Integer experienceYears;
    private DriverAvailability availabilityStatus;
    private Double rating;
    private Integer totalDeliveries;
    private boolean isBestMatch;
    private String matchReason;
}
