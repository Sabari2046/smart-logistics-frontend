package com.smartlogistics.service;

import com.smartlogistics.dto.ReportResponse;

import java.time.LocalDate;

public interface ReportService {
    ReportResponse generateReport(LocalDate fromDate, LocalDate toDate);
}
