package com.hotelreservation.repositories;

import com.hotelreservation.models.User2;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User2 entity.
 */
@Repository
public interface User2Repository extends MongoRepository<User2, String> {
    
    /**
     * Find user by email.
     * @param email user email
     * @return Optional User2
     */
    Optional<User2> findByEmail(String email);
    
    /**
     * Check if user exists by email.
     * @param email user email
     * @return true if exists
     */
    boolean existsByEmail(String email);
}

