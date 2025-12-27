package com.hotel.reservation.controller;

import com.hotel.reservation.model.UserPreferences;
import com.hotel.reservation.security.UserPrincipal;
import com.hotel.reservation.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for user preferences endpoints.
 * Handles CRUD operations for user preferences.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;

    /**
     * Get current user's preferences.
     *
     * @param userPrincipal authenticated user principal
     * @return user preferences
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPreferences> getMyPreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new org.springframework.security.core.AuthenticationException("User not authenticated") {};
        }
        UserPreferences preferences = preferencesService.getUserPreferences(userPrincipal.getId());
        return ResponseEntity.ok(preferences);
    }

    /**
     * Get preferences for a specific user (Admin/Manager only).
     *
     * @param userId the user ID
     * @return user preferences
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserPreferences> getUserPreferences(@PathVariable String userId) {
        UserPreferences preferences = preferencesService.getUserPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    /**
     * Update current user's preferences.
     *
     * @param userPrincipal authenticated user principal
     * @param preferences updated preferences
     * @return updated user preferences
     */
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPreferences> updateMyPreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UserPreferences preferences) {
        if (userPrincipal == null) {
            throw new org.springframework.security.core.AuthenticationException("User not authenticated") {};
        }
        UserPreferences updated = preferencesService.updateUserPreferences(
                userPrincipal.getId(), preferences);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update preferences for a specific user (Admin/Manager only).
     *
     * @param userId the user ID
     * @param preferences updated preferences
     * @return updated user preferences
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserPreferences> updateUserPreferences(
            @PathVariable String userId,
            @RequestBody UserPreferences preferences) {
        UserPreferences updated = preferencesService.updateUserPreferences(userId, preferences);
        return ResponseEntity.ok(updated);
    }

    /**
     * Reset current user's preferences to defaults.
     *
     * @param userPrincipal authenticated user principal
     * @return reset preferences
     */
    @PostMapping("/reset")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPreferences> resetMyPreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new org.springframework.security.core.AuthenticationException("User not authenticated") {};
        }
        UserPreferences reset = preferencesService.resetToDefaults(userPrincipal.getId());
        return ResponseEntity.ok(reset);
    }

    /**
     * Delete current user's preferences.
     *
     * @param userPrincipal authenticated user principal
     * @return no content response
     */
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteMyPreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new org.springframework.security.core.AuthenticationException("User not authenticated") {};
        }
        preferencesService.deleteUserPreferences(userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
