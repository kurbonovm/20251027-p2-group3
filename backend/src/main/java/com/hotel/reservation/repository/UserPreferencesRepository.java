package com.hotel.reservation.repository;

import com.hotel.reservation.model.UserPreferences;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for UserPreferences entity.
 * Provides database operations for user preferences management.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Repository
public interface UserPreferencesRepository extends MongoRepository<UserPreferences, String> {

    /**
     * Find user preferences by user ID.
     *
     * @param userId the user ID to search for
     * @return Optional containing the user preferences if found
     */
    Optional<UserPreferences> findByUserId(String userId);

    /**
     * Delete user preferences by user ID.
     *
     * @param userId the user ID to delete preferences for
     */
    void deleteByUserId(String userId);

    /**
     * Check if preferences exist for a given user ID.
     *
     * @param userId the user ID to check
     * @return true if preferences exist for this user
     */
    boolean existsByUserId(String userId);
}
