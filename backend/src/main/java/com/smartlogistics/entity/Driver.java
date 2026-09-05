package com.smartlogistics.entity;

import com.smartlogistics.enums.DriverAvailability;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true)
    private String licenseNumber;

    private String licenseType;

    private LocalDate licenseExpiryDate;

    private Integer experienceYears;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DriverAvailability availabilityStatus = DriverAvailability.AVAILABLE;

    @Builder.Default
    private Double rating = 5.0;

    @Builder.Default
    private Integer totalDeliveries = 0;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
