package com.smartlogistics.entity;

import com.smartlogistics.enums.FuelType;
import com.smartlogistics.enums.VehicleStatus;
import com.smartlogistics.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    private String brand;

    private String model;

    private Integer manufacturingYear;

    @Column(nullable = false)
    private Double capacityKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    private String currentLocation;

    @Builder.Default
    private Double odometerKm = 0.0;

    private LocalDate insuranceExpiryDate;

    private LocalDate registrationExpiryDate;

    private LocalDate lastServiceDate;

    private LocalDate nextServiceDate;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
