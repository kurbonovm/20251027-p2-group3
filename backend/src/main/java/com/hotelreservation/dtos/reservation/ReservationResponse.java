package com.hotelreservation.dtos.reservation;

import com.hotelreservation.models.Reservation2;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for reservation response.
 */
public class ReservationResponse {
    
    private String id;
    private String userId;
    private String hotelId;
    private String roomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private Double totalPrice;
    private Reservation2.ReservationStatus status;
    private PaymentInfo payment;
    private LocalDateTime bookingDate;
    
    public ReservationResponse() {
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public Double getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public Reservation2.ReservationStatus getStatus() {
        return status;
    }
    
    public void setStatus(Reservation2.ReservationStatus status) {
        this.status = status;
    }
    
    public PaymentInfo getPayment() {
        return payment;
    }
    
    public void setPayment(PaymentInfo payment) {
        this.payment = payment;
    }
    
    public LocalDateTime getBookingDate() {
        return bookingDate;
    }
    
    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }
    
    public static class PaymentInfo {
        private String paymentId;
        private String status;
        private Double amountPaid;
        
        // Getters and Setters
        public String getPaymentId() {
            return paymentId;
        }
        
        public void setPaymentId(String paymentId) {
            this.paymentId = paymentId;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public Double getAmountPaid() {
            return amountPaid;
        }
        
        public void setAmountPaid(Double amountPaid) {
            this.amountPaid = amountPaid;
        }
    }
}

