package com.hotelreservation.services;

import com.hotelreservation.dtos.user.UserProfileRequest;
import com.hotelreservation.exceptions.ResourceNotFoundException;
import com.hotelreservation.models.User2;
import com.hotelreservation.repositories.User2Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for user management operations.
 */
@Service
public class UserService {
    
    private final User2Repository userRepository;
    
    @Autowired
    public UserService(User2Repository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * Get user by ID.
     * @param userId user ID
     * @return User
     */
    public User2 getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
    
    /**
     * Get user by email.
     * @param email user email
     * @return User
     */
    public User2 getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
    
    /**
     * Update user profile.
     * @param userId user ID
     * @param request profile update request
     * @return Updated user
     */
    public User2 updateUserProfile(String userId, UserProfileRequest request) {
        User2 user = getUserById(userId);
        
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    /**
     * Get all users (Admin only).
     * @return List of users
     */
    public List<User2> getAllUsers() {
        return userRepository.findAll();
    }
}

