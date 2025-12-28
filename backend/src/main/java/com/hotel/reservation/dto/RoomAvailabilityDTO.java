package com.hotel.reservation.dto;

import com.hotel.reservation.model.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for room with availability information.
 * Used to display all rooms with their availability status for selected dates.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailabilityDTO {

    /**
     * The room entity
     */
    private Room room;

    /**
     * Whether the room is available for the requested dates
     */
    private boolean available;

    /**
     * Number of this room type currently occupied (for date range if provided)
     */
    private int occupiedCount;

    /**
     * Total number of this room type
     */
    private int totalRooms;

    /**
     * Number of rooms available
     */
    private int availableCount;

    /**
     * Availability status: AVAILABLE, LIMITED, FULLY_BOOKED
     */
    private AvailabilityStatus status;

    /**
     * User-friendly availability message to display
     */
    private String availabilityMessage;

    /**
     * Icon or emoji to represent availability status
     */
    private String availabilityIcon;

    public enum AvailabilityStatus {
        AVAILABLE,      // Rooms available
        LIMITED,        // Less than 3 rooms available
        FULLY_BOOKED    // No rooms available
    }
}
