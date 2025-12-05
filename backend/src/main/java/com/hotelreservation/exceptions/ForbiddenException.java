package com.hotelreservation.exceptions;

/**
 * Exception thrown when user doesn't have required permissions.
 * Returns HTTP 403 status code.
 */
public class ForbiddenException extends RuntimeException {
    
    public ForbiddenException(String message) {
        super(message);
    }
}

