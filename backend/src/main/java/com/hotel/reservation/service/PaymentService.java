package com.hotel.reservation.service;

import com.hotel.reservation.model.Payment;
import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service class for payment processing using Stripe.
 * Handles payment creation, confirmation, and refunds.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationService reservationService;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    /**
     * Initialize Stripe with API key.
     */
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    /**
     * Create a payment intent for a reservation.
     *
     * @param reservation the reservation to create payment for
     * @return payment entity with Stripe payment intent
     * @throws StripeException if Stripe API call fails
     */
    @Transactional
    public Payment createPaymentIntent(Reservation reservation) throws StripeException {
        long amountInCents = reservation.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .putMetadata("reservationId", reservation.getId())
                .putMetadata("userId", reservation.getUser().getId())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setUser(reservation.getUser());
        payment.setAmount(reservation.getTotalAmount());
        payment.setCurrency("USD");
        payment.setStripePaymentIntentId(paymentIntent.getId());
        payment.setStripeClientSecret(paymentIntent.getClientSecret());
        payment.setStatus(Payment.PaymentStatus.PENDING);

        return paymentRepository.save(payment);
    }

    /**
     * Confirm a payment after successful Stripe processing.
     *
     * @param paymentIntentId Stripe payment intent ID
     * @return updated payment entity
     * @throws RuntimeException if payment not found
     */
    @Transactional
    public Payment confirmPayment(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        try {
            // Retrieve payment intent from Stripe to get charge details
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

            // Extract charge ID if available
            if (paymentIntent.getLatestCharge() != null) {
                payment.setStripeChargeId(paymentIntent.getLatestCharge());
            }

            // Extract payment method details if available
            if (paymentIntent.getPaymentMethod() != null) {
                com.stripe.model.PaymentMethod paymentMethod =
                    com.stripe.model.PaymentMethod.retrieve(paymentIntent.getPaymentMethod());

                if (paymentMethod.getCard() != null) {
                    payment.setCardBrand(paymentMethod.getCard().getBrand());
                    payment.setCardLast4(paymentMethod.getCard().getLast4());
                    payment.setPaymentMethod("card");
                }
            }
        } catch (StripeException e) {
            // Log error but don't fail the confirmation
            System.err.println("Failed to retrieve payment details from Stripe: " + e.getMessage());
        }

        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
        Payment savedPayment = paymentRepository.save(payment);

        reservationService.confirmReservation(payment.getReservation().getId());

        return savedPayment;
    }

    /**
     * Process a refund for a payment.
     *
     * @param paymentId payment ID
     * @param amount refund amount
     * @param reason refund reason
     * @return updated payment entity
     * @throws StripeException if Stripe API call fails
     * @throws RuntimeException if payment not found or already refunded
     */
    @Transactional
    public Payment processRefund(String paymentId, BigDecimal amount, String reason) throws StripeException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.SUCCEEDED) {
            throw new RuntimeException("Cannot refund payment that hasn't succeeded");
        }

        long refundAmountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

        Map<String, Object> refundParams = new HashMap<>();
        refundParams.put("payment_intent", payment.getStripePaymentIntentId());
        refundParams.put("amount", refundAmountInCents);
        refundParams.put("reason", "requested_by_customer");

        Refund refund = Refund.create(refundParams);

        payment.setRefundAmount(amount);
        payment.setRefundReason(reason);
        payment.setRefundedAt(java.time.LocalDateTime.now());

        if (amount.compareTo(payment.getAmount()) >= 0) {
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
        } else {
            payment.setStatus(Payment.PaymentStatus.PARTIALLY_REFUNDED);
        }

        return paymentRepository.save(payment);
    }

    /**
     * Get payment history for a user.
     *
     * @param userId user ID
     * @return list of payments
     */
    public List<Payment> getUserPaymentHistory(String userId) {
        return paymentRepository.findByUserId(userId);
    }

    /**
     * Get all payments (Admin only).
     *
     * @return list of all payments
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    /**
     * Get payment by ID.
     *
     * @param id payment ID
     * @return payment entity
     * @throws RuntimeException if payment not found
     */
    public Payment getPaymentById(String id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    /**
     * Process a token-based payment (SECURE - for manager-assisted bookings).
     * Uses Stripe Payment Method ID created client-side to charge the customer.
     * This is PCI-compliant as card data never touches the server.
     *
     * @param reservation the reservation to charge for
     * @param paymentMethodId Stripe Payment Method ID (e.g., "pm_card_visa")
     * @return payment entity with charge details
     * @throws StripeException if payment fails
     */
    @Transactional
    public Payment processTokenPayment(Reservation reservation, String paymentMethodId) throws StripeException {
        long amountInCents = reservation.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        // Create and confirm payment intent using the payment method token
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setPaymentMethod(paymentMethodId)
                .setConfirm(true)
                .setConfirmationMethod(PaymentIntentCreateParams.ConfirmationMethod.MANUAL)
                .putMetadata("reservationId", reservation.getId())
                .putMetadata("userId", reservation.getUser().getId())
                .putMetadata("bookedByManager", "true")
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // Check if payment succeeded
        if (!"succeeded".equals(paymentIntent.getStatus())) {
            throw new RuntimeException("Payment failed with status: " + paymentIntent.getStatus());
        }

        // Retrieve payment method details
        com.stripe.model.PaymentMethod paymentMethod =
            com.stripe.model.PaymentMethod.retrieve(paymentMethodId);

        // Create payment record
        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setUser(reservation.getUser());
        payment.setAmount(reservation.getTotalAmount());
        payment.setCurrency("USD");
        payment.setStripePaymentIntentId(paymentIntent.getId());
        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
        payment.setPaymentMethod("card");

        // Set card details
        if (paymentIntent.getLatestCharge() != null) {
            payment.setStripeChargeId(paymentIntent.getLatestCharge());
        }

        if (paymentMethod.getCard() != null) {
            payment.setCardBrand(paymentMethod.getCard().getBrand());
            payment.setCardLast4(paymentMethod.getCard().getLast4());
        }

        Payment savedPayment = paymentRepository.save(payment);

        // Confirm the reservation
        reservationService.confirmReservation(reservation.getId());

        return savedPayment;
    }

    /**
     * Verify Stripe webhook signature to prevent tampering.
     *
     * @param payload webhook payload
     * @param signature Stripe signature header
     * @return verified Event object
     * @throws com.stripe.exception.SignatureVerificationException if signature is invalid
     */
    public com.stripe.model.Event verifyWebhook(String payload, String signature)
            throws com.stripe.exception.SignatureVerificationException {
        return com.stripe.net.Webhook.constructEvent(payload, signature, webhookSecret);
    }

    /**
     * Handle verified Stripe webhook events.
     *
     * @param event the verified Stripe event
     */
    public void handleWebhookEvent(com.stripe.model.Event event) {
        // Log event type for monitoring
        System.out.println("Received Stripe webhook event: " + event.getType());

        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "payment_intent.payment_failed":
                handlePaymentIntentFailed(event);
                break;
            case "charge.refunded":
                handleChargeRefunded(event);
                break;
            default:
                System.out.println("Unhandled event type: " + event.getType());
        }
    }

    /**
     * Handle successful payment intent webhook.
     */
    private void handlePaymentIntentSucceeded(com.stripe.model.Event event) {
        try {
            com.stripe.model.PaymentIntent paymentIntent =
                (com.stripe.model.PaymentIntent) event.getDataObjectDeserializer()
                    .getObject().orElse(null);

            if (paymentIntent != null) {
                // Update payment status in database
                paymentRepository.findByStripePaymentIntentId(paymentIntent.getId())
                    .ifPresent(payment -> {
                        if (payment.getStatus() != Payment.PaymentStatus.SUCCEEDED) {
                            payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
                            paymentRepository.save(payment);
                            System.out.println("Payment marked as succeeded: " + payment.getId());
                        }
                    });
            }
        } catch (Exception e) {
            System.err.println("Error handling payment_intent.succeeded: " + e.getMessage());
        }
    }

    /**
     * Handle failed payment intent webhook.
     */
    private void handlePaymentIntentFailed(com.stripe.model.Event event) {
        try {
            com.stripe.model.PaymentIntent paymentIntent =
                (com.stripe.model.PaymentIntent) event.getDataObjectDeserializer()
                    .getObject().orElse(null);

            if (paymentIntent != null) {
                paymentRepository.findByStripePaymentIntentId(paymentIntent.getId())
                    .ifPresent(payment -> {
                        payment.setStatus(Payment.PaymentStatus.FAILED);
                        paymentRepository.save(payment);
                        System.out.println("Payment marked as failed: " + payment.getId());
                    });
            }
        } catch (Exception e) {
            System.err.println("Error handling payment_intent.payment_failed: " + e.getMessage());
        }
    }

    /**
     * Handle refund webhook.
     */
    private void handleChargeRefunded(com.stripe.model.Event event) {
        System.out.println("Charge refunded event received");
        // Refunds are already handled by processRefund method
    }
}
