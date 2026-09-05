package com.smartlogistics.dto;

import com.smartlogistics.enums.DriverAvailability;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverRequest {

    @NotBlank(message = "Driver name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String password;

    private String phone;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    private String licenseType;

    private LocalDate licenseExpiryDate;

    private Integer experienceYears;

    @NotNull(message = "Availability status is required")
    private DriverAvailability availabilityStatus;

    private Double rating;
}
