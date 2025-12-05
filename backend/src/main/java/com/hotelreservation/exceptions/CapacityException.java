package com.hotelreservation.exceptions;

/**
 * Exception thrown when room capacity limit is exceeded.
 * Returns HTTP 400 status code.
 */
public class CapacityException extends RuntimeException {
    
    public CapacityException(String message) {
        super(message);
    }
    
    public CapacityException(String roomId, Integer requestedGuests, Integer maxCapacity) {
        super(String.format("Room %s cannot accommodate %d guests. Maximum capacity: %d", 
            roomId, requestedGuests, maxCapacity));
    }
}

