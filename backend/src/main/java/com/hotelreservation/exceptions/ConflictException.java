package com.hotelreservation.exceptions;

/**
 * Exception thrown when a resource conflict occurs (e.g., overbooking, duplicate).
 * Returns HTTP 409 status code.
 */
public class ConflictException extends RuntimeException {
    
    public ConflictException(String message) {
        super(message);
    }
    
    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}

