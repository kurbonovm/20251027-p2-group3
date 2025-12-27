package com.hotel.reservation.service;

import com.hotel.reservation.model.UserPreferences;
import com.hotel.reservation.repository.UserPreferencesRepository;
import com.hotel.reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service class for user preferences operations.
 * Handles creating, updating, and retrieving user preferences.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;

    /**
     * Get user preferences by user ID.
     * If preferences don't exist, creates default preferences for the user.
     *
     * @param userId the user ID
     * @return user preferences
     * @throws RuntimeException if user not found
     */
    public UserPreferences getUserPreferences(String userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Get or create preferences
        return preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
    }

    /**
     * Update user preferences.
     *
     * @param userId the user ID
     * @param updatedPreferences the updated preferences
     * @return updated user preferences
     * @throws RuntimeException if user not found
     */
    @Transactional
    public UserPreferences updateUserPreferences(String userId, UserPreferences updatedPreferences) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        UserPreferences existing = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        // Update all fields
        existing.setEmailNotificationsEnabled(updatedPreferences.isEmailNotificationsEnabled());
        existing.setSmsNotificationsEnabled(updatedPreferences.isSmsNotificationsEnabled());
        existing.setBookingConfirmationEmails(updatedPreferences.isBookingConfirmationEmails());
        existing.setPromotionalEmails(updatedPreferences.isPromotionalEmails());
        existing.setBookingReminderEmails(updatedPreferences.isBookingReminderEmails());

        existing.setPreferredBedType(updatedPreferences.getPreferredBedType());
        existing.setPreferredFloorLevel(updatedPreferences.getPreferredFloorLevel());
        existing.setPreferredRoomView(updatedPreferences.getPreferredRoomView());
        existing.setPreferredRoomType(updatedPreferences.getPreferredRoomType());
        existing.setPreferQuietRoom(updatedPreferences.isPreferQuietRoom());
        existing.setPreferredCheckInTime(updatedPreferences.getPreferredCheckInTime());
        existing.setPreferredCheckOutTime(updatedPreferences.getPreferredCheckOutTime());

        existing.setWheelchairAccessible(updatedPreferences.isWheelchairAccessible());
        existing.setHearingAccessible(updatedPreferences.isHearingAccessible());
        existing.setVisualAccessible(updatedPreferences.isVisualAccessible());
        existing.setOtherAccessibilityNeeds(updatedPreferences.getOtherAccessibilityNeeds());

        existing.setDietaryRestrictions(updatedPreferences.getDietaryRestrictions());
        existing.setAllergies(updatedPreferences.getAllergies());
        existing.setDefaultSpecialRequests(updatedPreferences.getDefaultSpecialRequests());

        existing.setPreferredLanguage(updatedPreferences.getPreferredLanguage());
        existing.setPreferredCurrency(updatedPreferences.getPreferredCurrency());
        existing.setPreferredDateFormat(updatedPreferences.getPreferredDateFormat());
        existing.setPreferredTimeFormat(updatedPreferences.getPreferredTimeFormat());

        existing.setThemeMode(updatedPreferences.getThemeMode());
        existing.setUpdatedAt(LocalDateTime.now());

        return preferencesRepository.save(existing);
    }

    /**
     * Delete user preferences.
     *
     * @param userId the user ID
     * @throws RuntimeException if preferences not found
     */
    @Transactional
    public void deleteUserPreferences(String userId) {
        if (!preferencesRepository.existsByUserId(userId)) {
            throw new RuntimeException("Preferences not found for user id: " + userId);
        }
        preferencesRepository.deleteByUserId(userId);
    }

    /**
     * Reset user preferences to defaults.
     *
     * @param userId the user ID
     * @return reset preferences
     */
    @Transactional
    public UserPreferences resetToDefaults(String userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Delete existing preferences if any
        if (preferencesRepository.existsByUserId(userId)) {
            preferencesRepository.deleteByUserId(userId);
        }

        // Create new default preferences
        return createDefaultPreferences(userId);
    }

    /**
     * Create default preferences for a user.
     *
     * @param userId the user ID
     * @return newly created default preferences
     */
    private UserPreferences createDefaultPreferences(String userId) {
        UserPreferences preferences = new UserPreferences();
        preferences.setUserId(userId);
        preferences.setCreatedAt(LocalDateTime.now());
        preferences.setUpdatedAt(LocalDateTime.now());
        return preferencesRepository.save(preferences);
    }
}
