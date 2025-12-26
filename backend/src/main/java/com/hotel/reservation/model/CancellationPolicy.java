package com.hotel.reservation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Cancellation policy defining refund rules based on timing.
 * Industry-standard tiered refund system.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancellationPolicy {

    /**
     * Full refund if cancelled more than X days before check-in
     */
    @Builder.Default
    private int fullRefundDays = 7;

    /**
     * Partial refund percentage (0-100) if cancelled between
     * fullRefundDays and partialRefundDays before check-in
     */
    @Builder.Default
    private int partialRefundPercentage = 50;

    /**
     * Days before check-in for partial refund eligibility
     */
    @Builder.Default
    private int partialRefundDays = 3;

    /**
     * Cancellation fee charged for late cancellations (fixed amount)
     */
    @Builder.Default
    private BigDecimal lateCancellationFee = BigDecimal.valueOf(25.00);

    /**
     * No refund if cancelled within X days of check-in
     * (after this point, only lateCancellationFee is charged)
     */
    @Builder.Default
    private int noRefundDays = 1;

    /**
     * Default hotel cancellation policy
     */
    public static CancellationPolicy getDefaultPolicy() {
        return CancellationPolicy.builder()
                .fullRefundDays(7)           // 100% refund if cancelled 7+ days before
                .partialRefundPercentage(50) // 50% refund if cancelled 3-7 days before
                .partialRefundDays(3)        // Partial refund cutoff
                .lateCancellationFee(BigDecimal.valueOf(25.00)) // $25 fee for very late cancellations
                .noRefundDays(1)             // No refund if cancelled within 24 hours
                .build();
    }

    /**
     * Flexible cancellation policy (more customer-friendly)
     */
    public static CancellationPolicy getFlexiblePolicy() {
        return CancellationPolicy.builder()
                .fullRefundDays(3)           // 100% refund if cancelled 3+ days before
                .partialRefundPercentage(75) // 75% refund if cancelled 1-3 days before
                .partialRefundDays(1)        // Partial refund cutoff
                .lateCancellationFee(BigDecimal.valueOf(15.00)) // $15 fee for very late cancellations
                .noRefundDays(0)             // No refund only on check-in day
                .build();
    }

    /**
     * Strict cancellation policy (non-refundable with exceptions)
     */
    public static CancellationPolicy getStrictPolicy() {
        return CancellationPolicy.builder()
                .fullRefundDays(14)          // 100% refund if cancelled 14+ days before
                .partialRefundPercentage(25) // 25% refund if cancelled 7-14 days before
                .partialRefundDays(7)        // Partial refund cutoff
                .lateCancellationFee(BigDecimal.valueOf(50.00)) // $50 fee for very late cancellations
                .noRefundDays(3)             // No refund if cancelled within 3 days
                .build();
    }
}
