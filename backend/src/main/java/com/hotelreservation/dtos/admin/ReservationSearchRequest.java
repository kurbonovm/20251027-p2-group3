package com.hotelreservation.dtos.admin;

import com.hotelreservation.models.Reservation;
import java.time.LocalDate;

/**
 * DTO for admin reservation search.
 */
public class ReservationSearchRequest {
    
    private String userId;
    private String hotelId;
    private String roomId;
    private Reservation.ReservationStatus status;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalDate startDate; // For date range
    private LocalDate endDate; // For date range
    
    public ReservationSearchRequest() {
    }
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getHotelId() {
        return hotelId;
    }
    
    public void setHotelId(String hotelId) {
        this.hotelId = hotelId;
    }
    
    public String getRoomId() {
        return roomId;
    }
    
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
    
    public Reservation.ReservationStatus getStatus() {
        return status;
    }
    
    public void setStatus(Reservation.ReservationStatus status) {
        this.status = status;
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
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}

