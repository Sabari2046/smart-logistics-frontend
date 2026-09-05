package com.smartlogistics.service.impl;

import com.smartlogistics.dto.CustomerResponse;
import com.smartlogistics.entity.Customer;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.CustomerRepository;
import com.smartlogistics.repository.UserRepository;
import com.smartlogistics.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Override
    public List<CustomerResponse> getAllCustomers(String search) {
        return customerRepository.findAll().stream()
                .filter(c -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return c.getUser().getFullName().toLowerCase().contains(s)
                            || c.getUser().getEmail().toLowerCase().contains(s)
                            || (c.getUser().getPhone() != null && c.getUser().getPhone().toLowerCase().contains(s))
                            || (c.getCompanyName() != null && c.getCompanyName().toLowerCase().contains(s))
                            || (c.getCity() != null && c.getCity().toLowerCase().contains(s));
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return mapToResponse(customer);
    }

    @Override
    public CustomerResponse getCustomerByUserId(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user ID: " + userId));
        return mapToResponse(customer);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        customerRepository.delete(customer);
        userRepository.delete(customer.getUser());
    }

    private CustomerResponse mapToResponse(Customer customer) {
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
}
