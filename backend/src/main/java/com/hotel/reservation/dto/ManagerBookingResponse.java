package com.hotel.reservation.dto;

import com.hotel.reservation.model.Payment;
import com.hotel.reservation.model.Reservation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for manager-assisted booking response.
 * Contains reservation and payment details after successful booking.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerBookingResponse {

    /**
     * Created reservation
     */
    private Reservation reservation;

    /**
     * Payment transaction details
     */
    private Payment payment;

    /**
     * Success message
     */
    private String message;

    /**
     * Customer user ID (for tracking)
     */
    private String customerId;
}
