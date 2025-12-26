package com.hotel.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for cancellation response with refund details.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancellationResponse {

    /**
     * Reservation ID that was cancelled
     */
    private String reservationId;

    /**
     * Cancellation status
     */
    private String status;

    /**
     * Original payment amount
     */
    private BigDecimal originalAmount;

    /**
     * Refund amount
     */
    private BigDecimal refundAmount;

    /**
     * Cancellation fee charged
     */
    private BigDecimal cancellationFee;

    /**
     * Refund percentage applied
     */
    private int refundPercentage;

    /**
     * Days before check-in when cancelled
     */
    private long daysBeforeCheckIn;

    /**
     * Refund processing status
     */
    private String refundStatus;

    /**
     * Estimated refund processing time
     */
    private String estimatedRefundTime;

    /**
     * Cancellation timestamp
     */
    private LocalDateTime cancelledAt;

    /**
     * Message to user
     */
    private String message;
}
