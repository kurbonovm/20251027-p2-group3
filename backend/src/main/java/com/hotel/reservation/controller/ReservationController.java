package com.hotel.reservation.controller;

import com.hotel.reservation.dto.CancellationRequest;
import com.hotel.reservation.dto.CancellationResponse;
import com.hotel.reservation.dto.RefundCalculation;
import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.model.User;
import com.hotel.reservation.repository.UserRepository;
import com.hotel.reservation.security.UserPrincipal;
import com.hotel.reservation.service.CancellationService;
import com.hotel.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST controller for reservation management endpoints.
 * Handles reservation CRUD operations with authorization.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;
    private final CancellationService cancellationService;

    /**
     * Get all reservations (Admin/Manager only).
     *
     * @return list of all reservations
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    /**
     * Get user's own reservations.
     *
     * @param userPrincipal authenticated user
     * @return list of user's reservations
     */
    @GetMapping("/my-reservations")
    public ResponseEntity<List<Reservation>> getUserReservations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Reservation> reservations = reservationService.getUserReservations(userPrincipal.getId());
        return ResponseEntity.ok(reservations);
    }

    /**
     * Get user's current pending reservation (if any).
     * Returns the first active pending reservation that hasn't expired.
     *
     * @param userPrincipal authenticated user
     * @return pending reservation or 204 No Content if none exists
     */
    @GetMapping("/my-pending")
    public ResponseEntity<Reservation> getUserPendingReservation(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Reservation> pendingReservations = reservationService.getUserReservations(userPrincipal.getId())
                .stream()
                .filter(r -> r.getStatus() == Reservation.ReservationStatus.PENDING)
                .filter(r -> r.getExpiresAt() != null && r.getExpiresAt().isAfter(java.time.LocalDateTime.now()))
                .toList();

        if (pendingReservations.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(pendingReservations.get(0));
    }

    /**
     * Get reservation by ID.
     *
     * @param id reservation ID
     * @param userPrincipal authenticated user
     * @return reservation entity
     */
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Reservation reservation = reservationService.getReservationById(id);

        // Check if user is admin/manager from security context
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                        a.getAuthority().equals("ROLE_MANAGER"));

        boolean isOwner = false;
        if (userPrincipal != null && reservation.getUser() != null) {
            String userId = userPrincipal.getId();
            if (userId != null) {
                isOwner = userId.equals(reservation.getUser().getId());
            }
        }

        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(reservation);
    }

    /**
     * Create a new reservation.
     *
     * @param userPrincipal authenticated user
     * @param reservationData reservation details
     * @return created reservation
     */
    @PostMapping
    public ResponseEntity<Reservation> createReservation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Object> reservationData) {

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Input validation
        String roomId = (String) reservationData.get("roomId");
        if (roomId == null || roomId.trim().isEmpty()) {
            throw new IllegalArgumentException("Room ID is required");
        }

        LocalDate checkInDate = LocalDate.parse((String) reservationData.get("checkInDate"));
        LocalDate checkOutDate = LocalDate.parse((String) reservationData.get("checkOutDate"));

        // Validate dates - allow bookings from today onwards
        // Use minusDays(1) to be lenient with timezone differences between client and server
        LocalDate yesterday = LocalDate.now().minusDays(1);
        if (checkInDate.isBefore(yesterday)) {
            throw new IllegalArgumentException("Check-in date cannot be in the past");
        }
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
        if (checkInDate.isAfter(LocalDate.now().plusYears(2))) {
            throw new IllegalArgumentException("Check-in date cannot be more than 2 years in the future");
        }

        int numberOfGuests = (int) reservationData.get("numberOfGuests");
        if (numberOfGuests < 1 || numberOfGuests > 10) {
            throw new IllegalArgumentException("Number of guests must be between 1 and 10");
        }

        String specialRequests = (String) reservationData.getOrDefault("specialRequests", "");
        if (specialRequests.length() > 500) {
            throw new IllegalArgumentException("Special requests cannot exceed 500 characters");
        }

        Reservation reservation = reservationService.createReservation(
                user, roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests);

        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    /**
     * Update a reservation.
     *
     * @param id reservation ID
     * @param userPrincipal authenticated user
     * @param reservationData updated reservation details
     * @return updated reservation
     */
    @PutMapping("/{id}")
    public ResponseEntity<Reservation> updateReservation(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Object> reservationData) {

        Reservation existing = reservationService.getReservationById(id);

        if (!existing.getUser().getId().equals(userPrincipal.getId()) &&
                !userPrincipal.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                a.getAuthority().equals("ROLE_MANAGER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        LocalDate checkInDate = LocalDate.parse((String) reservationData.get("checkInDate"));
        LocalDate checkOutDate = LocalDate.parse((String) reservationData.get("checkOutDate"));
        int numberOfGuests = (int) reservationData.get("numberOfGuests");

        Reservation updated = reservationService.updateReservation(id, checkInDate, checkOutDate, numberOfGuests);
        return ResponseEntity.ok(updated);
    }

    /**
     * Cancel a reservation.
     *
     * @param id reservation ID
     * @param userPrincipal authenticated user
     * @param cancellationData cancellation details
     * @return cancelled reservation
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservation(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) Map<String, String> cancellationData) {

        Reservation existing = reservationService.getReservationById(id);

        if (!existing.getUser().getId().equals(userPrincipal.getId()) &&
                !userPrincipal.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                a.getAuthority().equals("ROLE_MANAGER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String reason = cancellationData != null ?
                cancellationData.getOrDefault("reason", "User requested cancellation") :
                "User requested cancellation";

        Reservation cancelled = reservationService.cancelReservation(id, reason);
        return ResponseEntity.ok(cancelled);
    }

    /**
     * Calculate refund for a reservation (shows what user will get if they cancel).
     * This endpoint allows users to preview cancellation costs before confirming.
     *
     * @param id reservation ID
     * @param userPrincipal authenticated user
     * @return refund calculation details
     */
    @GetMapping("/{id}/cancellation-preview")
    public ResponseEntity<RefundCalculation> getCancellationPreview(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Reservation existing = reservationService.getReservationById(id);

        // Authorization check
        if (!existing.getUser().getId().equals(userPrincipal.getId()) &&
                !userPrincipal.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                a.getAuthority().equals("ROLE_MANAGER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        RefundCalculation calculation = cancellationService.calculateRefund(id);
        return ResponseEntity.ok(calculation);
    }

    /**
     * Process cancellation with policy-based refund.
     * Requires user to acknowledge the cancellation policy.
     *
     * @param id reservation ID
     * @param userPrincipal authenticated user
     * @param request cancellation request with reason and policy acknowledgement
     * @return cancellation response with refund details
     */
    @PostMapping("/{id}/cancel-with-refund")
    public ResponseEntity<CancellationResponse> cancelWithRefund(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CancellationRequest request) {

        Reservation existing = reservationService.getReservationById(id);

        // Authorization check
        if (!existing.getUser().getId().equals(userPrincipal.getId()) &&
                !userPrincipal.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                a.getAuthority().equals("ROLE_MANAGER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        CancellationResponse response = cancellationService.processCancellation(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get reservations by date range (Admin/Manager only).
     *
     * @param startDate start date
     * @param endDate end date
     * @return list of reservations in date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Reservation>> getReservationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<Reservation> reservations = reservationService.getReservationsByDateRange(startDate, endDate);
        return ResponseEntity.ok(reservations);
    }

    /**
     * Get reservation by payment link token (Public endpoint for customer payment).
     * This endpoint is used for manager-assisted bookings where customers
     * receive a secure payment link via email or other communication.
     *
     * @param token the unique payment link token
     * @return reservation details if token is valid and not expired
     */
    @GetMapping("/payment-link/{token}")
    public ResponseEntity<?> getReservationByPaymentLink(@PathVariable String token) {
        Reservation reservation = reservationService.getReservationByPaymentToken(token);

        if (reservation == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Invalid or expired payment link"));
        }

        // Check if reservation is still pending
        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "This reservation has already been processed"));
        }

        // Check if payment link has expired
        if (reservation.getExpiresAt() != null &&
            reservation.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("error", "Payment link has expired"));
        }

        return ResponseEntity.ok(reservation);
    }
}
