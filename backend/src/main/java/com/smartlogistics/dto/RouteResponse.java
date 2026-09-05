package com.smartlogistics.dto;

import com.smartlogistics.enums.RouteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponse {
    private Long id;
    private String routeName;
    private String source;
    private String destination;
    private Double distanceKm;
    private Integer estimatedDurationMinutes;
    private Double estimatedFuelCost;
    private Double tollCost;
    private RouteStatus routeStatus;
    private LocalDateTime createdAt;
}
