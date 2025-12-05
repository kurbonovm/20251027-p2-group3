package com.hotelreservation.dtos.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO for creating a payment intent (Stripe).
 */
public class PaymentIntentRequest {
    
    @NotBlank(message = "Reservation ID is required")
    private String reservationId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
    
    @NotBlank(message = "Currency is required")
    private String currency = "usd";
    
    private String paymentMethodId; // Optional, can be attached later
    
    public PaymentIntentRequest() {
    }
    
    // Getters and Setters
    public String getReservationId() {
        return reservationId;
    }
    
    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }
    
    public Double getAmount() {
        return amount;
    }
    
    public void setAmount(Double amount) {
        this.amount = amount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getPaymentMethodId() {
        return paymentMethodId;
    }
    
    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
}

