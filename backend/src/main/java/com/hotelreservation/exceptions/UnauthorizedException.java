package com.hotelreservation.exceptions;

/**
 * Exception thrown when authentication is required or authentication fails.
 * Returns HTTP 401 status code.
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}

