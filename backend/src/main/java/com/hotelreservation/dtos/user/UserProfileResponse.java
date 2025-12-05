package com.hotelreservation.dtos.user;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for user profile response.
 */
public class UserProfileResponse {
    
    private String id;
    private String email;
    private String name;
    private String phone;
    private List<String> roleIds;
    private List<PaymentMethodResponse> paymentMethods;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public UserProfileResponse() {
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public List<String> getRoleIds() {
        return roleIds;
    }
    
    public void setRoleIds(List<String> roleIds) {
        this.roleIds = roleIds;
    }
    
    public List<PaymentMethodResponse> getPaymentMethods() {
        return paymentMethods;
    }
    
    public void setPaymentMethods(List<PaymentMethodResponse> paymentMethods) {
        this.paymentMethods = paymentMethods;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public static class PaymentMethodResponse {
        private String id;
        private String provider;
        private String brand;
        private String last4;
        private Integer expMonth;
        private Integer expYear;
        
        // Getters and Setters
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
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
}

