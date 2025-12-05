package com.hotelreservation.dtos.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for user login request.
 */
public class LoginRequest {
    
    @NotBlank(message = "Email is required")
    private String email;
    
    private String password; // Optional for OAuth2
    
    private String provider; // OAuth2 provider (google, facebook)
    
    private String providerToken; // OAuth2 token
    
    public LoginRequest() {
    }
    
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }
    
    // Getters and Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getProvider() {
        return provider;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    public String getProviderToken() {
        return providerToken;
    }
    
    public void setProviderToken(String providerToken) {
        this.providerToken = providerToken;
    }
}

