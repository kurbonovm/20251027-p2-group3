package com.hotelreservation.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * UserProfile model for storing extended user information.
 * Manages user preferences, saved payment methods, and booking history.
 */
@Document(collection = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    private String id;

    private String userId;

    private String bio;

    private String address;

    private String city;

    private String state;

    private String postalCode;

    private String country;

    private String dateOfBirth;

    private String nationality;

    private String passportNumber;

    private boolean marketingOptIn;

    private String preferredLanguage;

    private String timezone;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
