package com.smartlogistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String companyName;

    // Password change fields
    private String currentPassword;
    private String newPassword;
}
