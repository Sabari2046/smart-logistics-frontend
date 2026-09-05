package com.smartlogistics.repository;

import com.smartlogistics.entity.Route;
import com.smartlogistics.enums.RouteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByRouteStatus(RouteStatus routeStatus);
    List<Route> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);
}
