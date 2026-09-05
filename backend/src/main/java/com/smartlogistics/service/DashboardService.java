package com.smartlogistics.service;

import com.smartlogistics.dto.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getAdminDashboardStats();
    DashboardStatsResponse getDriverDashboardStats(Long userId);
    DashboardStatsResponse getCustomerDashboardStats(Long userId);
}
