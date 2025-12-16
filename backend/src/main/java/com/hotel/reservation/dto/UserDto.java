package com.hotel.reservation.dto;

import com.hotel.reservation.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Set;

/**
 * DTO for User entity to expose user information without sensitive data.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    /**
     * User's unique identifier
     */
    private String id;

    /**
     * User's first name
     */
    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    private String firstName;

    /**
     * User's last name
     */
    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;

    /**
     * User's email address
     */
    private String email;

    /**
     * User's phone number
     */
    @Pattern(regexp = "^$|^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$", 
             message = "Phone number format is invalid")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    /**
     * User's roles
     */
    private Set<User.Role> roles;

    /**
     * User's avatar/profile image URL
     */
    private String avatar;

    /**
     * OAuth2 provider (if applicable)
     */
    private String provider;

    /**
     * User's account status (enabled/disabled)
     */
    private boolean enabled;
}
