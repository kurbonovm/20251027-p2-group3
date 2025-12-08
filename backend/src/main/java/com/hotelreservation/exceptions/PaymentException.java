package com.hotelreservation.exceptions;

/**
 * Exception thrown when payment processing fails.
 * Returns HTTP 422 or 503 status code depending on the error type.
 */
public class PaymentException extends RuntimeException {
    
    public PaymentException(String message) {
        super(message);
    }
    
    public PaymentException(String message, Throwable cause) {
        super(message, cause);
    }
}

