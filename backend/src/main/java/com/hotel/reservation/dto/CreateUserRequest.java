package com.hotel.reservation.dto;

import com.hotel.reservation.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s-]+$", message = "First name can only contain letters, spaces, and hyphens")
    private String firstName;

    /**
     * User's last name
     */
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s-]+$", message = "Last name can only contain letters, spaces, and hyphens")
    private String lastName;

    /**
     * User's email address
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /**
     * User's password
     * Must be at least 8 characters
     */
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    /**
     * User's phone number (optional)
     */
    @Pattern(regexp = "^$|^[\\d\\s\\-\\+\\(\\)]{10,20}$", 
             message = "Phone number must be between 10 and 20 digits")
    private String phoneNumber;

    /**
     * User's roles (ADMIN, MANAGER, CUSTOMER/GUEST)
     */
    @NotNull(message = "At least one role is required")
    private Set<User.Role> roles;

    /**
     * Whether the account is enabled
     */
    private boolean enabled = true;
}

