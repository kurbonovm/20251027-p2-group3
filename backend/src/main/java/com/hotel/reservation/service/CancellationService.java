package com.hotel.reservation.service;

import com.hotel.reservation.dto.CancellationRequest;
import com.hotel.reservation.dto.CancellationResponse;
import com.hotel.reservation.dto.RefundCalculation;
import com.hotel.reservation.model.CancellationPolicy;
import com.hotel.reservation.model.Payment;
import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.repository.PaymentRepository;
import com.hotel.reservation.repository.ReservationRepository;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Service for handling reservation cancellations with policy-based refunds.
 * Implements industry-standard tiered refund system.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CancellationService {

    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    /**
     * Calculate potential refund for a reservation.
     * This allows users to see what they'll get before confirming cancellation.
     *
     * @param reservationId reservation ID
     * @return refund calculation details
     * @throws RuntimeException if reservation not found
     */
    public RefundCalculation calculateRefund(String reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() == Reservation.ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled");
        }

        if (reservation.getStatus() == Reservation.ReservationStatus.CHECKED_OUT) {
            throw new RuntimeException("Cannot cancel completed reservation");
        }

        // Get cancellation policy (can be customized per room type in future)
        CancellationPolicy policy = CancellationPolicy.getDefaultPolicy();

        // Calculate days until check-in
        long daysUntilCheckIn = ChronoUnit.DAYS.between(LocalDate.now(), reservation.getCheckInDate());

        // Calculate refund based on policy
        BigDecimal originalAmount = reservation.getTotalAmount();
        BigDecimal refundAmount;
        BigDecimal cancellationFee = BigDecimal.ZERO;
        int refundPercentage;
        String policyDescription;
        String explanation;
        boolean isFullRefund = false;
        boolean isNoRefund = false;

        if (daysUntilCheckIn >= policy.getFullRefundDays()) {
            // Full refund - cancelled well in advance
            refundAmount = originalAmount;
            refundPercentage = 100;
            isFullRefund = true;
            policyDescription = String.format("Free cancellation (%d+ days before check-in)", policy.getFullRefundDays());
            explanation = String.format(
                    "You will receive a full refund of $%.2f because you're cancelling more than %d days before check-in.",
                    originalAmount, policy.getFullRefundDays()
            );

        } else if (daysUntilCheckIn >= policy.getPartialRefundDays()) {
            // Partial refund - cancelled with some notice
            refundPercentage = policy.getPartialRefundPercentage();
            refundAmount = originalAmount
                    .multiply(BigDecimal.valueOf(refundPercentage))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            policyDescription = String.format("Partial refund (%d%% refund, %d-%d days before check-in)",
                    refundPercentage, policy.getPartialRefundDays(), policy.getFullRefundDays());
            explanation = String.format(
                    "You will receive a %d%% refund of $%.2f (original: $%.2f) because you're cancelling %d-%d days before check-in.",
                    refundPercentage, refundAmount, originalAmount,
                    policy.getPartialRefundDays(), policy.getFullRefundDays()
            );

        } else if (daysUntilCheckIn >= policy.getNoRefundDays()) {
            // Late cancellation - only fee deducted
            cancellationFee = policy.getLateCancellationFee();
            refundAmount = originalAmount.subtract(cancellationFee);
            if (refundAmount.compareTo(BigDecimal.ZERO) < 0) {
                refundAmount = BigDecimal.ZERO;
            }
            refundPercentage = refundAmount
                    .multiply(BigDecimal.valueOf(100))
                    .divide(originalAmount, 0, RoundingMode.HALF_UP)
                    .intValue();
            policyDescription = String.format("Late cancellation (cancellation fee: $%.2f)", cancellationFee);
            explanation = String.format(
                    "You will receive $%.2f after a cancellation fee of $%.2f (original: $%.2f) because you're cancelling %d-%d days before check-in.",
                    refundAmount, cancellationFee, originalAmount,
                    policy.getNoRefundDays(), policy.getPartialRefundDays()
            );

        } else {
            // No refund - too close to check-in
            refundAmount = BigDecimal.ZERO;
            refundPercentage = 0;
            cancellationFee = originalAmount;
            isNoRefund = true;
            policyDescription = String.format("No refund (within %d days of check-in)", policy.getNoRefundDays());
            explanation = String.format(
                    "Unfortunately, no refund is available because you're cancelling within %d day(s) of check-in. The full amount of $%.2f will be forfeited.",
                    policy.getNoRefundDays(), originalAmount
            );
        }

        return RefundCalculation.builder()
                .originalAmount(originalAmount)
                .refundAmount(refundAmount)
                .cancellationFee(cancellationFee)
                .refundPercentage(refundPercentage)
                .daysUntilCheckIn(daysUntilCheckIn)
                .policyDescription(policyDescription)
                .isFullRefund(isFullRefund)
                .isNoRefund(isNoRefund)
                .explanation(explanation)
                .build();
    }

    /**
     * Process cancellation with refund based on policy.
     *
     * @param reservationId reservation ID
     * @param request cancellation request with reason and acknowledgement
     * @return cancellation response with refund details
     * @throws RuntimeException if reservation not found or policy not acknowledged
     */
    @Transactional
    public CancellationResponse processCancellation(String reservationId, CancellationRequest request) {
        // Validate policy acknowledgement
        if (!request.isAcknowledgePolicy()) {
            throw new RuntimeException("You must acknowledge the cancellation policy before proceeding");
        }

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() == Reservation.ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled");
        }

        if (reservation.getStatus() == Reservation.ReservationStatus.CHECKED_OUT) {
            throw new RuntimeException("Cannot cancel completed reservation");
        }

        // Calculate refund
        RefundCalculation refundCalc = calculateRefund(reservationId);

        // Update reservation status
        LocalDateTime cancelledAt = LocalDateTime.now();
        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        reservation.setCancellationReason(request.getReason());
        reservation.setCancelledAt(cancelledAt);
        reservationRepository.save(reservation);

        log.info("Reservation {} cancelled. Refund amount: ${}, Original: ${}",
                reservationId, refundCalc.getRefundAmount(), refundCalc.getOriginalAmount());

        // Process refund if payment exists and refund amount > 0
        String refundStatus = "N/A";
        if (refundCalc.getRefundAmount().compareTo(BigDecimal.ZERO) > 0) {
            Payment payment = paymentRepository.findByReservationId(reservationId).orElse(null);

            if (payment != null && payment.getStatus() == Payment.PaymentStatus.SUCCEEDED) {
                try {
                    paymentService.processRefund(
                            payment.getId(),
                            refundCalc.getRefundAmount(),
                            request.getReason()
                    );
                    refundStatus = "PROCESSING";
                    log.info("Refund initiated for payment {} - Amount: ${}", payment.getId(), refundCalc.getRefundAmount());
                } catch (StripeException e) {
                    log.error("Stripe refund failed for reservation {}: {}", reservationId, e.getMessage(), e);
                    refundStatus = "FAILED";
                    throw new RuntimeException("Cancellation succeeded but refund processing failed. Please contact support for manual refund. Error: " + e.getMessage());
                }
            } else if (payment == null) {
                log.warn("No payment found for reservation {}. Cancellation processed without refund.", reservationId);
                refundStatus = "NO_PAYMENT_FOUND";
            } else {
                log.warn("Payment {} not in SUCCEEDED status (status: {}). Cannot process refund.", payment.getId(), payment.getStatus());
                refundStatus = "PAYMENT_NOT_ELIGIBLE";
            }
        } else {
            refundStatus = "NO_REFUND_DUE";
        }

        // Build response message
        String message = buildCancellationMessage(refundCalc, refundStatus);

        return CancellationResponse.builder()
                .reservationId(reservationId)
                .status("CANCELLED")
                .originalAmount(refundCalc.getOriginalAmount())
                .refundAmount(refundCalc.getRefundAmount())
                .cancellationFee(refundCalc.getCancellationFee())
                .refundPercentage(refundCalc.getRefundPercentage())
                .daysBeforeCheckIn(refundCalc.getDaysUntilCheckIn())
                .refundStatus(refundStatus)
                .estimatedRefundTime("5-10 business days")
                .cancelledAt(cancelledAt)
                .message(message)
                .build();
    }

    /**
     * Build user-friendly cancellation message.
     */
    private String buildCancellationMessage(RefundCalculation refundCalc, String refundStatus) {
        StringBuilder message = new StringBuilder();
        message.append("Your reservation has been successfully cancelled. ");

        if (refundCalc.isFullRefund()) {
            message.append(String.format("You will receive a full refund of $%.2f within 5-10 business days.", refundCalc.getRefundAmount()));
        } else if (refundCalc.isNoRefund()) {
            message.append("Unfortunately, no refund is available due to the cancellation timing.");
        } else {
            message.append(String.format("You will receive a refund of $%.2f (%d%% of the original amount) within 5-10 business days.",
                    refundCalc.getRefundAmount(), refundCalc.getRefundPercentage()));
            if (refundCalc.getCancellationFee().compareTo(BigDecimal.ZERO) > 0) {
                message.append(String.format(" A cancellation fee of $%.2f has been applied.", refundCalc.getCancellationFee()));
            }
        }

        if ("FAILED".equals(refundStatus)) {
            message.append(" Please contact customer support to process your refund manually.");
        }

        return message.toString();
    }
}
