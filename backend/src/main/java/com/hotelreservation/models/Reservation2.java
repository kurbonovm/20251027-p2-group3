package com.hotelreservation.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Reservation2 model representing hotel reservations.
 * Maps to the reservations collection in MongoDB.
 */
@Document(collection = "reservations")
public class Reservation2 {

    @Id
    private String id;

    private String userId;

    private String hotelId;

    private String roomId;

    private LocalDate checkInDate;

    private LocalDate checkOutDate;

    private Integer numberOfGuests;

    private Double totalPrice;

    private ReservationStatus status;

    private Payment payment;

    private LocalDateTime bookingDate;

    // Constructors
    public Reservation2() {
    }

    public Reservation2(String id, String userId, String hotelId, String roomId, LocalDate checkInDate,
                       LocalDate checkOutDate, Integer numberOfGuests, Double totalPrice, ReservationStatus status,
                       Payment payment, LocalDateTime bookingDate) {
        this.id = id;
        this.userId = userId;
        this.hotelId = hotelId;
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfGuests = numberOfGuests;
        this.totalPrice = totalPrice;
        this.status = status;
        this.payment = payment;
        this.bookingDate = bookingDate;
    }

    public Reservation2(String userId, String hotelId, String roomId, LocalDate checkInDate,
                       LocalDate checkOutDate, Integer numberOfGuests) {
        this.userId = userId;
        this.hotelId = hotelId;
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfGuests = numberOfGuests;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getHotelId() {
        return hotelId;
    }

    public String getRoomId() {
        return roomId;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public Integer getNumberOfGuests() {
        return numberOfGuests;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public Payment getPayment() {
        return payment;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setHotelId(String hotelId) {
        this.hotelId = hotelId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public void setNumberOfGuests(Integer numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    /**
     * Reservation status enumeration
     */
    public enum ReservationStatus {
        CONFIRMED,
        CANCELED
    }

    /**
     * Payment information for the reservation
     */
    public static class Payment {
        private String paymentId;
        private String status;
        private Double amountPaid;

        public Payment() {
        }

        public Payment(String paymentId, String status, Double amountPaid) {
            this.paymentId = paymentId;
            this.status = status;
            this.amountPaid = amountPaid;
        }

        // Getters
        public String getPaymentId() {
            return paymentId;
        }

        public String getStatus() {
            return status;
        }

        public Double getAmountPaid() {
            return amountPaid;
        }

        // Setters
        public void setPaymentId(String paymentId) {
            this.paymentId = paymentId;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public void setAmountPaid(Double amountPaid) {
            this.amountPaid = amountPaid;
        }
    }
}

