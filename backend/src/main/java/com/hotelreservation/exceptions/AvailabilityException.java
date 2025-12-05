package com.hotelreservation.exceptions;

/**
 * Exception thrown when room availability check fails.
 * Returns HTTP 409 status code.
 */
public class AvailabilityException extends RuntimeException {
    
    public AvailabilityException(String message) {
        super(message);
    }
    
    public AvailabilityException(String message, Throwable cause) {
        super(message, cause);
    }
}

