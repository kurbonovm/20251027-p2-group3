package com.hotel.reservation.dto;

import com.hotel.reservation.model.Room;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * DTO for updating a room.
 * Uses nullable types to distinguish between "not provided" and "set to null/0".
 * All fields are optional - only provided fields will be updated.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoomRequest {

    /**
     * Room name/number
     */
    @Size(min = 1, max = 200, message = "Room name must be between 1 and 200 characters")
    private String name;

    /**
     * Room type (Standard, Deluxe, Suite, Presidential)
     */
    private Room.RoomType type;

    /**
     * Detailed description of the room
     */
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    /**
     * Price per night (nullable - null means not provided, value means update)
     */
    @Positive(message = "Price must be greater than 0")
    @Max(value = 1000000, message = "Price cannot exceed $1,000,000 per night")
    private Integer pricePerNight;

    /**
     * Maximum number of guests allowed
     */
    @Min(value = 1, message = "Capacity must be at least 1 guest")
    @Max(value = 20, message = "Capacity cannot exceed 20 guests")
    private Integer capacity;

    /**
     * List of amenities available in the room
     */
    private List<String> amenities;

    /**
     * URL of the room's primary image
     */
    private String imageUrl;

    /**
     * List of additional image URLs
     */
    private List<String> additionalImages;

    /**
     * Whether the room is currently available
     */
    private Boolean available;

    /**
     * Total number of rooms of this type available in the hotel
     */
    @Min(value = 1, message = "Total rooms must be at least 1")
    @Max(value = 1000, message = "Total rooms cannot exceed 1000")
    private Integer totalRooms;

    /**
     * Floor number where the room is located
     */
    @Min(value = 1, message = "Floor number must be at least 1")
    @Max(value = 200, message = "Floor number cannot exceed 200")
    private Integer floorNumber;

    /**
     * Size of the room in square feet
     */
    @Min(value = 0, message = "Size cannot be negative")
    @Max(value = 10000, message = "Size cannot exceed 10,000 sq ft")
    private Integer size;
}

