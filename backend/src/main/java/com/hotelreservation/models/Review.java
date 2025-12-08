package com.hotelreservation.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Review model for guest feedback on rooms and stays.
 * Stores ratings and comments from guests.
 */
@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    private String id;

    private String reservationId;

    private String guestId;

    private String roomId;

    private int rating;

    private String title;

    private String comment;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private int helpfulCount;

    private boolean verified;
}
