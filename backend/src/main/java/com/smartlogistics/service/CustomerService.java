package com.smartlogistics.service;

import com.smartlogistics.dto.CustomerResponse;

import java.util.List;

public interface CustomerService {
    List<CustomerResponse> getAllCustomers(String search);
    CustomerResponse getCustomerById(Long id);
    CustomerResponse getCustomerByUserId(Long userId);
    void deleteCustomer(Long id);
}
