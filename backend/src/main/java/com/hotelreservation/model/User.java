package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * User model representing users in the Hotel Reservation System.
 * Supports three roles: GUEST, ADMIN, and HOTEL_MANAGER.
 */
@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private Set<UserRole> roles;

    private String profilePicture;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastLogin;

    /**
     * User roles for role-based access control
     */
    public enum UserRole {
        GUEST,
        ADMIN,
        HOTEL_MANAGER
    }
}
