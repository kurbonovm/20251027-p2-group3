package com.hotel.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for cancellation request.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancellationRequest {

    /**
     * Reason for cancellation
     */
    private String reason;

    /**
     * User confirmation that they understand the refund policy
     */
    private boolean acknowledgePolicy;
}
