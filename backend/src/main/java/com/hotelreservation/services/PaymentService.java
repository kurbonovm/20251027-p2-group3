package com.hotelreservation.services;

import com.hotelreservation.exceptions.PaymentException;
import com.hotelreservation.exceptions.ResourceNotFoundException;
import com.hotelreservation.models.Reservation2;
import com.hotelreservation.repositories.Reservation2Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

/**
 * Service for payment processing (Stripe integration).
 */
@Service
public class PaymentService {
    
    private final Reservation2Repository reservationRepository;
    
    @Value("${stripe.secret-key:sk_test_default}")
    private String stripeSecretKey;
    
    @Autowired
    public PaymentService(Reservation2Repository reservationRepository) {
        this.reservationRepository = reservationRepository;
        Stripe.apiKey = stripeSecretKey;
    }
    
    /**
     * Create payment intent for a reservation.
     * @param reservationId reservation ID
     * @param amount amount to charge
     * @param currency currency code
     * @return Payment intent ID
     */
    public String createPaymentIntent(String reservationId, Double amount, String currency) {
        Reservation2 reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));
        
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) (amount * 100)) // Convert to cents
                    .setCurrency(currency)
                    .setMetadata(java.util.Map.of("reservationId", reservationId))
                    .build();
            
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            
            // Update reservation with payment info
            Reservation2.Payment payment = new Reservation2.Payment();
            payment.setPaymentId(paymentIntent.getId());
            payment.setStatus("pending");
            payment.setAmountPaid(0.0);
            reservation.setPayment(payment);
            reservation.setTotalPrice(amount);
            reservationRepository.save(reservation);
            
            return paymentIntent.getId();
        } catch (StripeException e) {
            throw new PaymentException("Failed to create payment intent: " + e.getMessage(), e);
        }
    }
    
    /**
     * Confirm payment.
     * @param paymentIntentId payment intent ID
     * @return Confirmed payment intent
     */
    public PaymentIntent confirmPayment(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            
            if (!"succeeded".equals(paymentIntent.getStatus())) {
                paymentIntent = paymentIntent.confirm();
            }
            
            // Update reservation payment status
            String reservationId = paymentIntent.getMetadata().get("reservationId");
            if (reservationId != null) {
                Reservation2 reservation = reservationRepository.findById(reservationId)
                        .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));
                
                Reservation2.Payment payment = reservation.getPayment();
                if (payment != null) {
                    payment.setStatus(paymentIntent.getStatus());
                    payment.setAmountPaid((double) paymentIntent.getAmount() / 100);
                    reservationRepository.save(reservation);
                }
            }
            
            return paymentIntent;
        } catch (StripeException e) {
            throw new PaymentException("Failed to confirm payment: " + e.getMessage(), e);
        }
    }
    
    /**
     * Process refund.
     * @param paymentId payment ID
     * @param amount refund amount (null for full refund)
     * @return Refund object
     */
    public com.stripe.model.Refund processRefund(String paymentId, Double amount) {
        try {
            com.stripe.param.RefundCreateParams.Builder paramsBuilder = 
                    com.stripe.param.RefundCreateParams.builder()
                            .setPaymentIntent(paymentId);
            
            if (amount != null) {
                paramsBuilder.setAmount((long) (amount * 100));
            }
            
            com.stripe.model.Refund refund = com.stripe.model.Refund.create(paramsBuilder.build());
            
            // Update reservation payment status
            // This would need to find reservation by payment ID
            
            return refund;
        } catch (StripeException e) {
            throw new PaymentException("Failed to process refund: " + e.getMessage(), e);
        }
    }
}

