package com.hotel.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for refund calculation details.
 * Shown to user before they confirm cancellation.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundCalculation {

    /**
     * Original booking amount
     */
    private BigDecimal originalAmount;

    /**
     * Refund amount to be returned
     */
    private BigDecimal refundAmount;

    /**
     * Cancellation fee (if applicable)
     */
    private BigDecimal cancellationFee;

    /**
     * Refund percentage (0-100)
     */
    private int refundPercentage;

    /**
     * Days until check-in
     */
    private long daysUntilCheckIn;

    /**
     * Policy tier description
     */
    private String policyDescription;

    /**
     * Whether full refund is available
     */
    private boolean isFullRefund;

    /**
     * Whether this is a no-refund case
     */
    private boolean isNoRefund;

    /**
     * Detailed explanation
     */
    private String explanation;
}
