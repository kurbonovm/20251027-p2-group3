package com.hotel.reservation.dto;

import com.hotel.reservation.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

/**
 * DTO for creating a user with specific roles (admin-only).
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
public class CreateUserRequest {

    /**
     * User's first name
     */
    @NotBlank(message = "First name is required")
    private String firstName;

    /**
     * User's last name
     */
    @NotBlank(message = "Last name is required")
    private String lastName;

    /**
     * User's email address
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /**
     * User's password
     */
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    /**
     * User's phone number
     */
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    /**
     * User's roles (ADMIN, MANAGER, GUEST)
     */
    @NotNull(message = "At least one role is required")
    private Set<User.Role> roles;

    /**
     * Whether the account is enabled
     */
    private boolean enabled = true;
}

