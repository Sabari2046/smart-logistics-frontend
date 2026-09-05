package com.smartlogistics.repository;

import com.smartlogistics.entity.Driver;
import com.smartlogistics.entity.User;
import com.smartlogistics.enums.DriverAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByUser(User user);
    Optional<Driver> findByUserId(Long userId);
    Optional<Driver> findByUserEmail(String email);
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    List<Driver> findByAvailabilityStatus(DriverAvailability availabilityStatus);
    long countByAvailabilityStatus(DriverAvailability availabilityStatus);

    @Query("SELECT d FROM Driver d WHERE d.availabilityStatus = 'AVAILABLE' ORDER BY d.rating DESC, d.experienceYears DESC")
    List<Driver> findRecommendedDrivers();
}
