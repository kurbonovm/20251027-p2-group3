package com.hotelreservation.controllers;

import com.hotelreservation.dtos.reservation.ReservationModifyRequest;
import com.hotelreservation.dtos.reservation.ReservationRequest;
import com.hotelreservation.dtos.reservation.ReservationResponse;
import com.hotelreservation.models.Reservation2;
import com.hotelreservation.services.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for reservation management endpoints.
 */
@RestController
@RequestMapping("/api/v1/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {
    
    private final ReservationService reservationService;
    
    @Autowired
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }
    
    /**
     * Get user's reservations or all reservations (Admin/Manager).
     * @param authentication authentication context
     * @return List of reservations
     */
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getReservations(Authentication authentication) {
        // TODO: Extract user ID from authentication and check roles
        // For now, return all reservations for admin/manager, user's for guests
        List<Reservation2> reservations = reservationService.getAllReservations();
        List<ReservationResponse> responses = reservations.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Get reservation by ID.
     * @param reservationId reservation ID
     * @return Reservation
     */
    @GetMapping("/{reservationId}")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable String reservationId) {
        Reservation2 reservation = reservationService.getReservationById(reservationId);
        return ResponseEntity.ok(convertToResponse(reservation));
    }
    
    /**
     * Create a new reservation (Guest).
     * @param request reservation request
     * @return Created reservation
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('GUEST', 'CUSTOMER')")
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody ReservationRequest request) {
        Reservation2 reservation = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(reservation));
    }
    
    /**
     * Modify reservation (Guest/Admin).
     * @param reservationId reservation ID
     * @param request modification request
     * @return Updated reservation
     */
    @PutMapping("/{reservationId}")
    @PreAuthorize("hasAnyRole('GUEST', 'CUSTOMER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ReservationResponse> modifyReservation(
            @PathVariable String reservationId,
            @Valid @RequestBody ReservationModifyRequest request) {
        Reservation2 reservation = reservationService.modifyReservation(reservationId, request);
        return ResponseEntity.ok(convertToResponse(reservation));
    }
    
    /**
     * Cancel reservation (Guest/Admin).
     * @param reservationId reservation ID
     * @return No content
     */
    @DeleteMapping("/{reservationId}")
    @PreAuthorize("hasAnyRole('GUEST', 'CUSTOMER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> cancelReservation(@PathVariable String reservationId) {
        reservationService.cancelReservation(reservationId);
        return ResponseEntity.noContent().build();
    }
    
    private ReservationResponse convertToResponse(Reservation2 reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setUserId(reservation.getUserId());
        response.setHotelId(reservation.getHotelId());
        response.setRoomId(reservation.getRoomId());
        response.setCheckInDate(reservation.getCheckInDate());
        response.setCheckOutDate(reservation.getCheckOutDate());
        response.setNumberOfGuests(reservation.getNumberOfGuests());
        response.setTotalPrice(reservation.getTotalPrice());
        response.setStatus(reservation.getStatus());
        response.setBookingDate(reservation.getBookingDate());
        
        if (reservation.getPayment() != null) {
            ReservationResponse.PaymentInfo paymentInfo = new ReservationResponse.PaymentInfo();
            paymentInfo.setPaymentId(reservation.getPayment().getPaymentId());
            paymentInfo.setStatus(reservation.getPayment().getStatus());
            paymentInfo.setAmountPaid(reservation.getPayment().getAmountPaid());
            response.setPayment(paymentInfo);
        }
        
        return response;
    }
}

