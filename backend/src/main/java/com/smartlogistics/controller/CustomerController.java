package com.smartlogistics.controller;

import com.smartlogistics.dto.CustomerResponse;
import com.smartlogistics.dto.DashboardStatsResponse;
import com.smartlogistics.entity.User;
import com.smartlogistics.service.AuthService;
import com.smartlogistics.service.CustomerService;
import com.smartlogistics.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final DashboardService dashboardService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(customerService.getAllCustomers(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok("Customer deleted successfully");
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<DashboardStatsResponse> getCustomerDashboard() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(dashboardService.getCustomerDashboardStats(user.getId()));
    }
}
