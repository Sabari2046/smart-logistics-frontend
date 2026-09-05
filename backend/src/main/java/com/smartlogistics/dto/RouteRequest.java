package com.smartlogistics.dto;

import com.smartlogistics.enums.RouteStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequest {

    @NotBlank(message = "Route name is required")
    private String routeName;

    @NotBlank(message = "Source location is required")
    private String source;

    @NotBlank(message = "Destination location is required")
    private String destination;

    private Double distanceKm;
    private Integer estimatedDurationMinutes;
    private Double estimatedFuelCost;
    private Double tollCost;
    private RouteStatus routeStatus;
}
