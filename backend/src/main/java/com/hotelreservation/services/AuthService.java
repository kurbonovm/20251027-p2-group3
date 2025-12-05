package com.hotelreservation.services;

import com.hotelreservation.exceptions.UnauthorizedException;
import com.hotelreservation.models.User2;
import com.hotelreservation.repositories.User2Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for authentication operations.
 * Note: This is a simplified implementation. Full OAuth2 integration would require
 * additional Spring Security OAuth2 Client configuration.
 */
@Service
public class AuthService {
    
    private final User2Repository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public AuthService(User2Repository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Authenticate user with email and password.
     * @param email user email
     * @param password user password
     * @return Authenticated user
     * @throws UnauthorizedException if authentication fails
     */
    public User2 authenticate(String email, String password) {
        Optional<User2> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        User2 user = userOpt.get();
        if (user.getPasswordHash() == null || 
            !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    /**
     * Get current authenticated user.
     * @param userId user ID from security context
     * @return User
     */
    public User2 getCurrentUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}

