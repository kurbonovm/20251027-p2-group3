package com.hotel.reservation.exception;

/**
 * Exception thrown when a room is not available for booking.
 * This includes cases where the room is already booked or currently being booked by another user.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
public class RoomNotAvailableException extends RuntimeException {

    public RoomNotAvailableException(String message) {
        super(message);
    }

    public RoomNotAvailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
