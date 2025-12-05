package com.hotelreservation.dtos.room;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * DTO for checking room availability.
 */
public class RoomAvailabilityRequest {
    
    @NotBlank(message = "Hotel ID is required")
    private String hotelId;
    
    private String roomType;
    
    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;
    
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;
    
    private Integer numberOfGuests;
    
    public RoomAvailabilityRequest() {
    }
    
    // Getters and Setters
    public String getHotelId() {
        return hotelId;
    }
    
    public void setHotelId(String hotelId) {
        this.hotelId = hotelId;
    }
    
    public String getRoomType() {
        return roomType;
    }
    
    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }
    
    public LocalDate getCheckInDate() {
        return checkInDate;
    }
    
    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }
    
    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }
    
    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }
    
    public Integer getNumberOfGuests() {
        return numberOfGuests;
    }
    
    public void setNumberOfGuests(Integer numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
    }
}

