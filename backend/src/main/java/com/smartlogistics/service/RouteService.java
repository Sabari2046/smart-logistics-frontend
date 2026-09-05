package com.smartlogistics.service;

import com.smartlogistics.dto.RouteRequest;
import com.smartlogistics.dto.RouteResponse;
import com.smartlogistics.enums.RouteStatus;

import java.util.List;

public interface RouteService {
    List<RouteResponse> getAllRoutes(RouteStatus status, String search);
    RouteResponse getRouteById(Long id);
    RouteResponse createRoute(RouteRequest request);
    RouteResponse updateRoute(Long id, RouteRequest request);
    void deleteRoute(Long id);
}
