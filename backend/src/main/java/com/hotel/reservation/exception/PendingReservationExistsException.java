package com.hotel.reservation.exception;

import lombok.Getter;

/**
 * Exception thrown when a user attempts to create a new reservation
 * while they already have an active pending reservation.
 * Contains the ID of the existing pending reservation for redirect purposes.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Getter
public class PendingReservationExistsException extends RuntimeException {

    private final String existingReservationId;

    public PendingReservationExistsException(String message, String existingReservationId) {
        super(message);
        this.existingReservationId = existingReservationId;
    }
}
