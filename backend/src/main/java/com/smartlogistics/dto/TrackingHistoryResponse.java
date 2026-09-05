package com.smartlogistics.dto;

import com.smartlogistics.enums.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingHistoryResponse {
    private Long id;
    private ShipmentStatus status;
    private String location;
    private String description;
    private LocalDateTime timestamp;
}
