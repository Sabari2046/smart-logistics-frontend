package com.smartlogistics.controller;

import com.smartlogistics.dto.*;
import com.smartlogistics.entity.User;
import com.smartlogistics.enums.Role;
import com.smartlogistics.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        if (user.getRole() == Role.ROLE_CUSTOMER) {
            return ResponseEntity.ok(authService.getCustomerProfile(user.getId()));
        } else if (user.getRole() == Role.ROLE_DRIVER) {
            return ResponseEntity.ok(authService.getDriverProfile(user.getId()));
        }
        return ResponseEntity.ok(LoginResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(@RequestBody UserProfileUpdateRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        authService.updateProfile(user.getId(), request);
        return ResponseEntity.ok("Profile updated successfully");
    }
}
