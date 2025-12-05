package com.hotelreservation.dtos.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for adding a payment method.
 */
public class PaymentMethodRequest {
    
    @NotBlank(message = "Payment method ID is required")
    private String paymentMethodId; // Stripe payment method ID
    
    @NotBlank(message = "Provider is required")
    private String provider;
    
    private String brand;
    
    private String last4;
    
    @NotNull(message = "Expiration month is required")
    private Integer expMonth;
    
    @NotNull(message = "Expiration year is required")
    private Integer expYear;
    
    public PaymentMethodRequest() {
    }
    
    // Getters and Setters
    public String getPaymentMethodId() {
        return paymentMethodId;
    }
    
    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
    
    public String getProvider() {
        return provider;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    public String getBrand() {
        return brand;
    }
    
    public void setBrand(String brand) {
        this.brand = brand;
    }
    
    public String getLast4() {
        return last4;
    }
    
    public void setLast4(String last4) {
        this.last4 = last4;
    }
    
    public Integer getExpMonth() {
        return expMonth;
    }
    
    public void setExpMonth(Integer expMonth) {
        this.expMonth = expMonth;
    }
    
    public Integer getExpYear() {
        return expYear;
    }
    
    public void setExpYear(Integer expYear) {
        this.expYear = expYear;
    }
}

