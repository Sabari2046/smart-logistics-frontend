package com.smartlogistics.dto;

import com.smartlogistics.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String fullName;
    private String email;
    private Role role;
    private String phone;
}
