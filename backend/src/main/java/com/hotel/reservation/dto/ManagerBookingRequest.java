package com.hotel.reservation.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for manager-assisted booking requests.
 * Allows managers to book rooms on behalf of customers and charge their cards.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerBookingRequest {

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
     * Card number for payment
     */
    @NotBlank(message = "Card number is required")
    @Pattern(regexp = "^[0-9]{13,19}$", message = "Card number must be 13-19 digits")
    private String cardNumber;

    /**
     * Card expiration month (1-12)
     */
    @Min(value = 1, message = "Card expiry month must be between 1 and 12")
    @Max(value = 12, message = "Card expiry month must be between 1 and 12")
    private int cardExpiryMonth;

    /**
     * Card expiration year (e.g., 2025)
     */
    @Min(value = 2025, message = "Card expiry year cannot be in the past")
    @Max(value = 2050, message = "Card expiry year is too far in the future")
    private int cardExpiryYear;

    /**
     * Card CVC/CVV code
     */
    @NotBlank(message = "Card CVC is required")
    @Pattern(regexp = "^[0-9]{3,4}$", message = "CVC must be 3 or 4 digits")
    private String cardCvc;

    /**
     * Cardholder name
     */
    @NotBlank(message = "Cardholder name is required")
    @Size(min = 2, max = 100, message = "Cardholder name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "Cardholder name can only contain letters, spaces, hyphens, and apostrophes")
    private String cardholderName;

    /**
     * Billing address - street
     */
    @NotBlank(message = "Billing address is required")
    @Size(min = 5, max = 200, message = "Billing address must be between 5 and 200 characters")
    private String billingAddressLine1;

    /**
     * Billing address - city
     */
    @NotBlank(message = "Billing city is required")
    @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "City name can only contain letters, spaces, hyphens, and apostrophes")
    private String billingCity;

    /**
     * Billing address - state/province
     */
    @NotBlank(message = "Billing state/province is required")
    @Size(min = 2, max = 100, message = "State must be between 2 and 100 characters")
    private String billingState;

    /**
     * Billing address - postal code
     */
    @NotBlank(message = "Billing postal code is required")
    @Pattern(regexp = "^[A-Za-z0-9\\s-]{3,10}$", message = "Invalid postal code format")
    private String billingPostalCode;

    /**
     * Billing address - country code (e.g., "US")
     */
    @NotBlank(message = "Billing country is required")
    @Size(min = 2, max = 2, message = "Country code must be 2 characters (e.g., US)")
    @Pattern(regexp = "^[A-Z]{2}$", message = "Country code must be 2 uppercase letters (e.g., US)")
    private String billingCountry;
}
