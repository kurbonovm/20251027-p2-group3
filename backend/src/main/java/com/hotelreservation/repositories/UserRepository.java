package com.hotelreservation.repositories;

import com.hotelreservation.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    /**
     * Find user by email.
     * @param email user email
     * @return Optional User
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if user exists by email.
     * @param email user email
     * @return true if exists
     */
    boolean existsByEmail(String email);
}

