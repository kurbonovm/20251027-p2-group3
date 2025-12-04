package com.hotelreservation.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Reservation model representing guest bookings.
 * Manages reservation details, dates, and status tracking.
 */
@Document(collection = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "room_dates_idx", def = "{'roomId': 1, 'checkInDate': 1, 'checkOutDate': 1}")
public class Reservation {

    @Id
    private String id;

    private String guestId;

    private String roomId;

    private LocalDate checkInDate;

    private LocalDate checkOutDate;

    private int numberOfGuests;

    private ReservationStatus status;

    private double totalPrice;

    private String specialRequests;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime cancelledAt;

    private String cancellationReason;

    /**
     * Reservation status tracking
     */
    public enum ReservationStatus {
        PENDING,
        CONFIRMED,
        CHECKED_IN,
        CHECKED_OUT,
        CANCELLED
    }
}
