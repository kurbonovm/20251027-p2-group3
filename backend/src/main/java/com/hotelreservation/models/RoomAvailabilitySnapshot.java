package com.hotelreservation.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

/**
 * RoomAvailabilitySnapshot model representing room availability snapshots.
 * Maps to the roomAvailabilitySnapshots collection in MongoDB.
 */
@Document(collection = "roomAvailabilitySnapshots")
public class RoomAvailabilitySnapshot {

    @Id
    private String id;

    private String hotelId;

    private String roomType;

    private LocalDate date;

    private Integer totalRooms;

    private Integer roomsBooked;

    private Integer roomsAvailable;

    // Constructors
    public RoomAvailabilitySnapshot() {
    }

    public RoomAvailabilitySnapshot(String id, String hotelId, String roomType, LocalDate date,
                                   Integer totalRooms, Integer roomsBooked, Integer roomsAvailable) {
        this.id = id;
        this.hotelId = hotelId;
        this.roomType = roomType;
        this.date = date;
        this.totalRooms = totalRooms;
        this.roomsBooked = roomsBooked;
        this.roomsAvailable = roomsAvailable;
    }

    public RoomAvailabilitySnapshot(String hotelId, String roomType, LocalDate date,
                                   Integer totalRooms, Integer roomsBooked, Integer roomsAvailable) {
        this.hotelId = hotelId;
        this.roomType = roomType;
        this.date = date;
        this.totalRooms = totalRooms;
        this.roomsBooked = roomsBooked;
        this.roomsAvailable = roomsAvailable;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getHotelId() {
        return hotelId;
    }

    public String getRoomType() {
        return roomType;
    }

    public LocalDate getDate() {
        return date;
    }

    public Integer getTotalRooms() {
        return totalRooms;
    }

    public Integer getRoomsBooked() {
        return roomsBooked;
    }

    public Integer getRoomsAvailable() {
        return roomsAvailable;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setHotelId(String hotelId) {
        this.hotelId = hotelId;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setTotalRooms(Integer totalRooms) {
        this.totalRooms = totalRooms;
    }

    public void setRoomsBooked(Integer roomsBooked) {
        this.roomsBooked = roomsBooked;
    }

    public void setRoomsAvailable(Integer roomsAvailable) {
        this.roomsAvailable = roomsAvailable;
    }
}

