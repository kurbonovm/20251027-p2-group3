package com.hotelreservation.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

/**
 * User2 model representing users in the Hotel Reservation System.
 * Maps to the users collection in MongoDB with support for multiple roles,
 * authentication providers, and payment methods.
 */
@Document(collection = "users")
public class User2 {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;   // null if OAuth-only

    private List<AuthProvider> authProviders;

    // Multi-role: list of Role IDs
    private List<String> roleIds;    // ["64f0c2a0b1c2d3e4f5a6b7c1", ...]

    private String name;

    private String phone;

    private List<PaymentMethod> paymentMethods;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Constructors
    public User2() {
    }

    public User2(String id, String email, List<String> roleIds) {
        this.id = id;
        this.email = email;
        this.roleIds = roleIds;
    }

    public User2(String email, List<String> roleIds) {
        this.email = email;
        this.roleIds = roleIds;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public List<AuthProvider> getAuthProviders() {
        return authProviders;
    }

    public List<String> getRoleIds() {
        return roleIds;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public List<PaymentMethod> getPaymentMethods() {
        return paymentMethods;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setAuthProviders(List<AuthProvider> authProviders) {
        this.authProviders = authProviders;
    }

    public void setRoleIds(List<String> roleIds) {
        this.roleIds = roleIds;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setPaymentMethods(List<PaymentMethod> paymentMethods) {
        this.paymentMethods = paymentMethods;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Authentication provider information
     */
    public static class AuthProvider {

        private String provider;    // "google", "facebook"
        private String providerUserId;

        public AuthProvider() {
        }

        public AuthProvider(String provider, String providerUserId) {
            this.provider = provider;
            this.providerUserId = providerUserId;
        }
        
        // Getters
        public String getProvider() {
            return provider;
        }

        public String getProviderUserId() {
            return providerUserId;
        }

        // Setters
        public void setProvider(String provider) {
            this.provider = provider;
        }

        public void setProviderUserId(String providerUserId) {
            this.providerUserId = providerUserId;
        }
    }

    /**
     * Payment method information
     */
    public static class PaymentMethod {


        private String provider;   // "stripe"
        private String paymentMethodId;
        private String brand;  // "visa"
        private String last4;   // "4242"
        private Integer expMonth;
        private Integer expYear;

        public PaymentMethod() {
        }

        public PaymentMethod(String provider, String paymentMethodId, String brand, String last4, Integer expMonth, Integer expYear) {
            this.provider = provider;
            this.paymentMethodId = paymentMethodId;
            this.brand = brand;
            this.last4 = last4;
            this.expMonth = expMonth;
            this.expYear = expYear;
        }
        

        // Getters
        public String getProvider() {
            return provider;
        }

        public String getPaymentMethodId() {
            return paymentMethodId;
        }

        public String getBrand() {
            return brand;
        }

        public String getLast4() {
            return last4;
        }

        public Integer getExpMonth() {
            return expMonth;
        }

        public Integer getExpYear() {
            return expYear;
        }

        // Setters
        public void setProvider(String provider) {
            this.provider = provider;
        }

        public void setPaymentMethodId(String paymentMethodId) {
            this.paymentMethodId = paymentMethodId;
        }

        public void setBrand(String brand) {
            this.brand = brand;
        }

        public void setLast4(String last4) {
            this.last4 = last4;
        }

        public void setExpMonth(Integer expMonth) {
            this.expMonth = expMonth;
        }

        public void setExpYear(Integer expYear) {
            this.expYear = expYear;
        }
    }
}

