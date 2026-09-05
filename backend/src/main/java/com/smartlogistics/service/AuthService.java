package com.smartlogistics.service;

import com.smartlogistics.dto.*;
import com.smartlogistics.entity.User;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse register(RegisterRequest request);
    CustomerResponse getCustomerProfile(Long userId);
    DriverResponse getDriverProfile(Long userId);
    User getUserById(Long userId);
    User getCurrentAuthenticatedUser();
    void updateProfile(Long userId, UserProfileUpdateRequest request);
}
