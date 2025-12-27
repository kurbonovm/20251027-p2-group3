package com.hotel.reservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User preferences entity representing a user's saved preferences and settings.
 * This includes notification settings, room preferences, accessibility options, and more.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_preferences")
public class UserPreferences {

    /**
     * Unique identifier for the preferences
     */
    @Id
    private String id;

    /**
     * Reference to the user ID
     */
    @Indexed(unique = true)
    private String userId;

    // Notification Preferences
    /**
     * Whether to receive email notifications
     */
    private boolean emailNotificationsEnabled = true;

    /**
     * Whether to receive SMS notifications
     */
    private boolean smsNotificationsEnabled = false;

    /**
     * Whether to receive booking confirmation emails
     */
    private boolean bookingConfirmationEmails = true;

    /**
     * Whether to receive promotional emails
     */
    private boolean promotionalEmails = true;

    /**
     * Whether to receive booking reminder emails
     */
    private boolean bookingReminderEmails = true;

    // Room Preferences
    /**
     * Preferred bed type (e.g., "king", "queen", "twin")
     */
    private String preferredBedType;

    /**
     * Preferred floor level (e.g., "high", "low", "middle")
     */
    private String preferredFloorLevel;

    /**
     * Preferred room view (e.g., "ocean", "city", "garden", "mountain")
     */
    private String preferredRoomView;

    /**
     * Preferred room type (e.g., "standard", "deluxe", "suite")
     */
    private String preferredRoomType;

    /**
     * Whether to prefer quiet rooms
     */
    private boolean preferQuietRoom = false;

    /**
     * Preferred check-in time
     */
    private LocalTime preferredCheckInTime;

    /**
     * Preferred check-out time
     */
    private LocalTime preferredCheckOutTime;

    // Accessibility Preferences
    /**
     * Whether wheelchair accessibility is required
     */
    private boolean wheelchairAccessible = false;

    /**
     * Whether hearing accessibility is required
     */
    private boolean hearingAccessible = false;

    /**
     * Whether visual accessibility is required
     */
    private boolean visualAccessible = false;

    /**
     * Other accessibility requirements
     */
    private String otherAccessibilityNeeds;

    // Dietary & Special Requests
    /**
     * List of dietary restrictions (e.g., "vegetarian", "vegan", "gluten-free", "halal", "kosher")
     */
    private List<String> dietaryRestrictions = new ArrayList<>();

    /**
     * List of allergies
     */
    private List<String> allergies = new ArrayList<>();

    /**
     * Default special requests to include in bookings
     */
    private String defaultSpecialRequests;

    // Language & Regional Preferences
    /**
     * Preferred language (e.g., "en", "es", "fr", "de")
     */
    private String preferredLanguage = "en";

    /**
     * Preferred currency (e.g., "USD", "EUR", "GBP")
     */
    private String preferredCurrency = "USD";

    /**
     * Preferred date format (e.g., "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD")
     */
    private String preferredDateFormat = "MM/DD/YYYY";

    /**
     * Preferred time format (e.g., "12h", "24h")
     */
    private String preferredTimeFormat = "12h";

    // UI/UX Preferences
    /**
     * Preferred theme mode (e.g., "light", "dark", "auto")
     */
    private String themeMode = "light";

    // Timestamps
    /**
     * Preferences creation timestamp
     */
    @CreatedDate
    private LocalDateTime createdAt;

    /**
     * Preferences last modification timestamp
     */
    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * Enum for bed types
     */
    public enum BedType {
        KING, QUEEN, DOUBLE, TWIN, SINGLE
    }

    /**
     * Enum for floor levels
     */
    public enum FloorLevel {
        HIGH, MIDDLE, LOW, GROUND
    }

    /**
     * Enum for room views
     */
    public enum RoomView {
        OCEAN, CITY, GARDEN, MOUNTAIN, POOL, COURTYARD
    }
}
