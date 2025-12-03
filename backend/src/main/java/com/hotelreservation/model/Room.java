package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Room model representing hotel rooms.
 * Stores room details including type, amenities, pricing, and capacity.
 */
@Document(collection = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    private String id;

    private String roomNumber;

    private RoomType roomType;

    private int capacity;

    private double pricePerNight;

    private String description;

    private List<String> amenities;

    private List<String> images;

    private boolean available;

    private String floor;

    private String view;

    /**
     * Room types available in the hotel
     */
    public enum RoomType {
        SINGLE,
        DOUBLE,
        SUITE,
        DELUXE,
        PRESIDENTIAL
    }
}
