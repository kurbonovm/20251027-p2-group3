package com.hotel.reservation.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for manager-assisted booking requests using Stripe tokens.
 * This is the SECURE way to handle payments - card data never touches the server.
 *
 * @author Hotel Reservation Team
 * @version 2.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenBookingRequest {

    /**
     * Customer email (existing or new customer)
     */
    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    private String customerEmail;

    /**
     * Customer first name (required for new customers)
     */
    @NotBlank(message = "Customer first name is required")
    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "First name can only contain letters, spaces, hyphens, and apostrophes")
    private String customerFirstName;

    /**
     * Customer last name (required for new customers)
     */
    @NotBlank(message = "Customer last name is required")
    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "Last name can only contain letters, spaces, hyphens, and apostrophes")
    private String customerLastName;

    /**
     * Customer phone number (optional)
     */
    @Pattern(regexp = "^[+]?[0-9\\s()-]{7,20}$", message = "Invalid phone number format")
    private String customerPhoneNumber;

    /**
     * Room ID to book
     */
    @NotBlank(message = "Room ID is required")
    private String roomId;

    /**
     * Check-in date
     */
    @NotNull(message = "Check-in date is required")
    @Future(message = "Check-in date must be in the future")
    private LocalDate checkInDate;

    /**
     * Check-out date
     */
    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    private LocalDate checkOutDate;

    /**
     * Number of guests
     */
    @Min(value = 1, message = "Number of guests must be at least 1")
    @Max(value = 10, message = "Number of guests cannot exceed 10")
    private int numberOfGuests;

    /**
     * Special requests (optional)
     */
    @Size(max = 500, message = "Special requests cannot exceed 500 characters")
    private String specialRequests;

    /**
     * Stripe Payment Method ID (created client-side with Stripe.js)
     * Example: "pm_card_visa" or "pm_1A2B3C4D5E6F7G8H"
     *
     * SECURITY: Card data never touches the server - only this token is sent
     */
    @NotBlank(message = "Payment method token is required")
    @Pattern(regexp = "^pm_[a-zA-Z0-9_]+$", message = "Invalid payment method ID format")
    private String paymentMethodId;
}
