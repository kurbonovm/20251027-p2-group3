package com.hotelreservation.controllers;

import com.hotelreservation.dtos.payment.PaymentConfirmRequest;
import com.hotelreservation.dtos.payment.PaymentIntentRequest;
import com.hotelreservation.dtos.payment.RefundRequest;
import com.hotelreservation.services.PaymentService;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for payment processing endpoints.
 */
@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    
    /**
     * Create payment intent (Stripe).
     * @param request payment intent request
     * @return Payment intent ID
     */
    @PostMapping("/intent")
    @PreAuthorize("hasAnyRole('GUEST', 'CUSTOMER')")
    public ResponseEntity<Map<String, String>> createPaymentIntent(
            @Valid @RequestBody PaymentIntentRequest request) {
        String paymentIntentId = paymentService.createPaymentIntent(
                request.getReservationId(),
                request.getAmount(),
                request.getCurrency()
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("paymentIntentId", paymentIntentId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Confirm payment.
     * @param request payment confirm request
     * @return Payment intent status
     */
    @PostMapping("/confirm")
    @PreAuthorize("hasAnyRole('GUEST', 'CUSTOMER')")
    public ResponseEntity<Map<String, String>> confirmPayment(
            @Valid @RequestBody PaymentConfirmRequest request) {
        PaymentIntent paymentIntent = paymentService.confirmPayment(request.getPaymentIntentId());
        
        Map<String, String> response = new HashMap<>();
        response.put("status", paymentIntent.getStatus());
        response.put("paymentIntentId", paymentIntent.getId());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Process refund (Admin/Manager).
     * @param request refund request
     * @return Refund details
     */
    @PostMapping("/refund")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> processRefund(
            @Valid @RequestBody RefundRequest request) {
        Refund refund = paymentService.processRefund(request.getPaymentId(), request.getAmount());
        
        Map<String, Object> response = new HashMap<>();
        response.put("refundId", refund.getId());
        response.put("amount", refund.getAmount() / 100.0);
        response.put("status", refund.getStatus());
        return ResponseEntity.ok(response);
    }
}

