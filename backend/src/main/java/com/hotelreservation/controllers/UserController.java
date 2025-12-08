package com.hotelreservation.controllers;

import com.hotelreservation.dtos.user.UserProfileRequest;
import com.hotelreservation.dtos.user.UserProfileResponse;
import com.hotelreservation.models.User;
import com.hotelreservation.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user profile endpoints.
 */
@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserService userService;
    
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * Get current user profile.
     * @param authentication authentication context
     * @return User profile
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(Authentication authentication) {
        // TODO: Extract user ID from authentication
        String userId = authentication.getName(); // This would need to be configured properly
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(convertToResponse(user));
    }
    
    /**
     * Update current user profile.
     * @param authentication authentication context
     * @param request profile update request
     * @return Updated user profile
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateCurrentUserProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileRequest request) {
        String userId = authentication.getName();
        User user = userService.updateUserProfile(userId, request);
        return ResponseEntity.ok(convertToResponse(user));
    }
    
    private UserProfileResponse convertToResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setPhone(user.getPhone());
        response.setRoleIds(user.getRoleIds());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        // Convert payment methods if needed
        // response.setPaymentMethods(...);
        
        return response;
    }
}

