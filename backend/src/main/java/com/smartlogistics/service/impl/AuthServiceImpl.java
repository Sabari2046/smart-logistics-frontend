package com.smartlogistics.service.impl;

import com.smartlogistics.dto.*;
import com.smartlogistics.entity.Customer;
import com.smartlogistics.entity.Driver;
import com.smartlogistics.entity.User;
import com.smartlogistics.enums.DriverAvailability;
import com.smartlogistics.enums.Role;
import com.smartlogistics.enums.UserStatus;
import com.smartlogistics.exception.BadRequestException;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.exception.UnauthorizedException;
import com.smartlogistics.repository.CustomerRepository;
import com.smartlogistics.repository.DriverRepository;
import com.smartlogistics.repository.UserRepository;
import com.smartlogistics.security.JwtService;
import com.smartlogistics.security.UserPrincipal;
import com.smartlogistics.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Your account is inactive. Please contact support.");
        }

        String token = jwtService.generateToken(principal);

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .build();
    }

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER;

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        if (role == Role.ROLE_CUSTOMER) {
            Customer customer = Customer.builder()
                    .user(user)
                    .address(request.getAddress())
                    .city(request.getCity())
                    .state(request.getState())
                    .postalCode(request.getPostalCode())
                    .companyName(request.getCompanyName())
                    .build();
            customerRepository.save(customer);
        } else if (role == Role.ROLE_DRIVER) {
            Driver driver = Driver.builder()
                    .user(user)
                    .licenseNumber("LIC-" + System.currentTimeMillis() % 1000000)
                    .licenseType("Commercial Heavy/Light")
                    .licenseExpiryDate(LocalDate.now().plusYears(3))
                    .experienceYears(2)
                    .availabilityStatus(DriverAvailability.AVAILABLE)
                    .rating(5.0)
                    .totalDeliveries(0)
                    .build();
            driverRepository.save(driver);
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = jwtService.generateToken(userPrincipal);

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .build();
    }

    @Override
    public CustomerResponse getCustomerProfile(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user ID: " + userId));

        return CustomerResponse.builder()
                .id(customer.getId())
                .userId(customer.getUser().getId())
                .fullName(customer.getUser().getFullName())
                .email(customer.getUser().getEmail())
                .phone(customer.getUser().getPhone())
                .address(customer.getAddress())
                .city(customer.getCity())
                .state(customer.getState())
                .postalCode(customer.getPostalCode())
                .companyName(customer.getCompanyName())
                .createdAt(customer.getCreatedAt())
                .build();
    }

    @Override
    public DriverResponse getDriverProfile(Long userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found for user ID: " + userId));

        return DriverResponse.builder()
                .id(driver.getId())
                .userId(driver.getUser().getId())
                .fullName(driver.getUser().getFullName())
                .email(driver.getUser().getEmail())
                .phone(driver.getUser().getPhone())
                .licenseNumber(driver.getLicenseNumber())
                .licenseType(driver.getLicenseType())
                .licenseExpiryDate(driver.getLicenseExpiryDate())
                .experienceYears(driver.getExperienceYears())
                .availabilityStatus(driver.getAvailabilityStatus())
                .rating(driver.getRating())
                .totalDeliveries(driver.getTotalDeliveries())
                .createdAt(driver.getCreatedAt())
                .build();
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

    @Override
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User is not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
    }

    @Override
    @Transactional
    public void updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = getUserById(userId);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Current password does not match");
            }
            if (request.getNewPassword().length() < 6) {
                throw new BadRequestException("New password must be at least 6 characters");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);

        if (user.getRole() == Role.ROLE_CUSTOMER) {
            customerRepository.findByUserId(userId).ifPresent(customer -> {
                if (request.getAddress() != null) customer.setAddress(request.getAddress());
                if (request.getCity() != null) customer.setCity(request.getCity());
                if (request.getState() != null) customer.setState(request.getState());
                if (request.getPostalCode() != null) customer.setPostalCode(request.getPostalCode());
                if (request.getCompanyName() != null) customer.setCompanyName(request.getCompanyName());
                customerRepository.save(customer);
            });
        }
    }
}
