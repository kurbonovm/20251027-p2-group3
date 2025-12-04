package com.hotelreservation.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Amenity model representing hotel amenities.
 * Stores amenity information and availability.
 */
@Document(collection = "amenities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Amenity {

    @Id
    private String id;

    private String name;

    private String description;

    private String icon;

    private AmenityCategory category;

    private boolean available;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * Amenity categories
     */
    public enum AmenityCategory {
        BATHROOM,
        BEDROOM,
        KITCHEN,
        ENTERTAINMENT,
        CONNECTIVITY,
        SAFETY,
        CLIMATE,
        OTHER
    }
}
