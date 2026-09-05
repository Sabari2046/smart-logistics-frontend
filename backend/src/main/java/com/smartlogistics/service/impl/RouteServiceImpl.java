package com.smartlogistics.service.impl;

import com.smartlogistics.dto.RouteRequest;
import com.smartlogistics.dto.RouteResponse;
import com.smartlogistics.entity.Route;
import com.smartlogistics.enums.RouteStatus;
import com.smartlogistics.exception.ResourceNotFoundException;
import com.smartlogistics.repository.RouteRepository;
import com.smartlogistics.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteServiceImpl implements RouteService {

    private final RouteRepository routeRepository;

    @Override
    public List<RouteResponse> getAllRoutes(RouteStatus status, String search) {
        return routeRepository.findAll().stream()
                .filter(r -> status == null || r.getRouteStatus() == status)
                .filter(r -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return r.getRouteName().toLowerCase().contains(s)
                            || r.getSource().toLowerCase().contains(s)
                            || r.getDestination().toLowerCase().contains(s);
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RouteResponse getRouteById(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + id));
        return mapToResponse(route);
    }

    @Override
    @Transactional
    public RouteResponse createRoute(RouteRequest request) {
        Route route = Route.builder()
                .routeName(request.getRouteName())
                .source(request.getSource())
                .destination(request.getDestination())
                .distanceKm(request.getDistanceKm() != null ? request.getDistanceKm() : 100.0)
                .estimatedDurationMinutes(request.getEstimatedDurationMinutes() != null ? request.getEstimatedDurationMinutes() : 120)
                .estimatedFuelCost(request.getEstimatedFuelCost() != null ? request.getEstimatedFuelCost() : 1500.0)
                .tollCost(request.getTollCost() != null ? request.getTollCost() : 0.0)
                .routeStatus(request.getRouteStatus() != null ? request.getRouteStatus() : RouteStatus.ACTIVE)
                .build();

        route = routeRepository.save(route);
        return mapToResponse(route);
    }

    @Override
    @Transactional
    public RouteResponse updateRoute(Long id, RouteRequest request) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + id));

        route.setRouteName(request.getRouteName());
        route.setSource(request.getSource());
        route.setDestination(request.getDestination());
        if (request.getDistanceKm() != null) route.setDistanceKm(request.getDistanceKm());
        if (request.getEstimatedDurationMinutes() != null) route.setEstimatedDurationMinutes(request.getEstimatedDurationMinutes());
        if (request.getEstimatedFuelCost() != null) route.setEstimatedFuelCost(request.getEstimatedFuelCost());
        if (request.getTollCost() != null) route.setTollCost(request.getTollCost());
        if (request.getRouteStatus() != null) route.setRouteStatus(request.getRouteStatus());

        route = routeRepository.save(route);
        return mapToResponse(route);
    }

    @Override
    @Transactional
    public void deleteRoute(Long id) {
        if (!routeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Route not found with ID: " + id);
        }
        routeRepository.deleteById(id);
    }

    private RouteResponse mapToResponse(Route r) {
        return RouteResponse.builder()
                .id(r.getId())
                .routeName(r.getRouteName())
                .source(r.getSource())
                .destination(r.getDestination())
                .distanceKm(r.getDistanceKm())
                .estimatedDurationMinutes(r.getEstimatedDurationMinutes())
                .estimatedFuelCost(r.getEstimatedFuelCost())
                .tollCost(r.getTollCost())
                .routeStatus(r.getRouteStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
