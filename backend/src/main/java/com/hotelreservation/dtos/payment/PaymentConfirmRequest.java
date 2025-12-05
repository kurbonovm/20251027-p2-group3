package com.hotelreservation.dtos.payment;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for confirming a payment.
 */
public class PaymentConfirmRequest {
    
    @NotBlank(message = "Payment intent ID is required")
    private String paymentIntentId;
    
    public PaymentConfirmRequest() {
    }
    
    public PaymentConfirmRequest(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }
    
    // Getters and Setters
    public String getPaymentIntentId() {
        return paymentIntentId;
    }
    
    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }
}

