package com.hotel.reservation.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Room entity representing a hotel room.
 * Contains information about room type, pricing, amenities, and capacity.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
public class Room {

    /**
     * Unique identifier for the room
     */
    @Id
    private String id;

    /**
     * Room name/number
     */
    @NotBlank(message = "Room name is required")
    @Size(min = 1, max = 200, message = "Room name must be between 1 and 200 characters")
    private String name;

    /**
     * Room type (Standard, Deluxe, Suite, Presidential)
     */
    @NotNull(message = "Room type is required")
    private RoomType type;

    /**
     * Detailed description of the room
     */
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    /**
     * Price per night
     */
    @Positive(message = "Price per night must be a positive number")
    @Max(value = 1000000, message = "Price per night cannot exceed $1,000,000")
    private int pricePerNight;

    /**
     * Maximum number of guests allowed
     */
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 20, message = "Capacity cannot exceed 20 guests")
    private int capacity;

    /**
     * List of amenities available in the room
     */
    private List<String> amenities = new ArrayList<>();

    /**
     * URL of the room's primary image
     */
    private String imageUrl;

    /**
     * List of additional image URLs
     */
    private List<String> additionalImages = new ArrayList<>();

    /**
     * Whether the room is currently available
     */
    private boolean available = true;

    /**
     * Total number of rooms of this type available in the hotel
     */
    @Min(value = 1, message = "Total rooms must be at least 1")
    @Max(value = 1000, message = "Total rooms cannot exceed 1000")
    private int totalRooms = 1;

    /**
     * Floor number where the room is located
     */
    @Min(value = 1, message = "Floor number must be at least 1")
    @Max(value = 200, message = "Floor number cannot exceed 200")
    private int floorNumber;

    /**
     * Size of the room in square feet
     */
    @Min(value = 0, message = "Size cannot be negative")
    @Max(value = 10000, message = "Size cannot exceed 10,000 sq ft")
    private int size;

    /**
     * Room creation timestamp
     */
    @CreatedDate
    private LocalDateTime createdAt;

    /**
     * Room last modification timestamp
     */
    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * Room type enumeration
     */
    public enum RoomType {
        STANDARD,
        DELUXE,
        SUITE,
        PRESIDENTIAL
    }
}
