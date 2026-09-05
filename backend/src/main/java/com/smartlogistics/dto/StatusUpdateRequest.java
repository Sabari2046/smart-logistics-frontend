package com.smartlogistics.dto;

import com.smartlogistics.enums.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ShipmentStatus status;

    private String location;

    private String description;

    private String recipientName;

    private String deliveryNotes;

    private String proofOfDelivery;

    private String deliveryOtp;
}
