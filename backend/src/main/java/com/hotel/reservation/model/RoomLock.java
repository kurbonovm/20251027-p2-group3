package com.hotel.reservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Room lock entity for preventing concurrent bookings.
 * Uses MongoDB's unique index to ensure only one reservation can lock a room for given dates.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "room_locks")
@CompoundIndexes({
    @CompoundIndex(name = "room_dates_unique_idx",
                   def = "{'roomId': 1, 'checkInDate': 1, 'checkOutDate': 1}",
                   unique = true)
})
public class RoomLock {

    @Id
    private String id;

    private String roomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String reservationId;

    @Indexed(expireAfterSeconds = 600) // Auto-delete after 10 minutes
    private LocalDateTime createdAt;

    public RoomLock(String roomId, LocalDate checkInDate, LocalDate checkOutDate, String reservationId) {
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.reservationId = reservationId;
        this.createdAt = LocalDateTime.now();
    }
}
