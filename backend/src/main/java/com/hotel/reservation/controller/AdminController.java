package com.hotel.reservation.controller;

import com.hotel.reservation.dto.ManagerBookingRequest;
import com.hotel.reservation.dto.ManagerBookingResponse;
import com.hotel.reservation.dto.TokenBookingRequest;
import com.hotel.reservation.dto.UserDto;
import com.hotel.reservation.model.Payment;
import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.model.Room;
import com.hotel.reservation.model.User;
import com.hotel.reservation.repository.ReservationRepository;
import com.hotel.reservation.repository.RoomRepository;
import com.hotel.reservation.repository.UserRepository;
import com.hotel.reservation.service.PaymentService;
import com.hotel.reservation.service.ReservationService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;
    private final PaymentService paymentService;
    private final PasswordEncoder passwordEncoder;

    // Dashboard Overview
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        log.info("Getting dashboard overview");

        // Calculate total rooms by summing up totalRooms field from all room types
        List<Room> allRooms = roomRepository.findAll();
        long totalRooms = allRooms.stream()
                .mapToLong(Room::getTotalRooms)
                .sum();

        // Calculate active reservations (currently ongoing)
        LocalDate today = LocalDate.now();
        List<Reservation> activeReservationsList = reservationRepository.findByStatus(Reservation.ReservationStatus.CONFIRMED);
        activeReservationsList.addAll(reservationRepository.findByStatus(Reservation.ReservationStatus.CHECKED_IN));

        // Filter to only include reservations active today (check-in <= today < check-out)
        activeReservationsList = activeReservationsList.stream()
                .filter(r -> !r.getCheckInDate().isAfter(today) && r.getCheckOutDate().isAfter(today))
                .collect(Collectors.toList());

        long activeReservations = activeReservationsList.size();

        // Calculate occupied rooms by counting active reservations for today
        long occupiedRooms = activeReservations;

        long availableRooms = totalRooms - occupiedRooms;
        double occupancyRate = totalRooms > 0 ? ((double)occupiedRooms / totalRooms) * 100 : 0;

        long totalUsers = userRepository.count();

        // Calculate monthly revenue (current month)
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        List<Reservation> monthlyReservations = reservationRepository
                .findByCreatedAtBetween(startOfMonth.atStartOfDay(), now.atTime(23, 59, 59));

        BigDecimal monthlyRevenue = monthlyReservations.stream()
                .filter(r -> r.getStatus() == Reservation.ReservationStatus.CONFIRMED ||
                            r.getStatus() == Reservation.ReservationStatus.CHECKED_IN ||
                            r.getStatus() == Reservation.ReservationStatus.CHECKED_OUT)
                .map(Reservation::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalRooms", totalRooms);
        dashboard.put("availableRooms", availableRooms);
        dashboard.put("occupancyRate", Math.round(occupancyRate * 100.0) / 100.0);
        dashboard.put("activeReservations", activeReservations);
        dashboard.put("totalUsers", totalUsers);
        dashboard.put("monthlyRevenue", monthlyRevenue);

        return ResponseEntity.ok(dashboard);
    }

    // User Management
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        log.info("Getting all users");
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id) {
        log.info("Getting user by id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(convertToDto(user));
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> request) {
        log.info("Updating user status: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(request.get("enabled"));
        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(convertToDto(updatedUser));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        log.info("Deleting user: {}", id);
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Room Management
    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Room>> getAllRooms() {
        log.info("Getting all rooms");
        return ResponseEntity.ok(roomRepository.findAll());
    }

    @GetMapping("/rooms/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getRoomStatistics() {
        log.info("Getting room statistics");

        List<Room> allRooms = roomRepository.findAll();

        // Calculate total rooms by summing up totalRooms field from all room types
        long totalRooms = allRooms.stream()
                .mapToLong(Room::getTotalRooms)
                .sum();

        // Calculate occupied rooms based on active reservations for today
        LocalDate today = LocalDate.now();
        List<Reservation> activeReservationsList = reservationRepository.findByStatus(Reservation.ReservationStatus.CONFIRMED);
        activeReservationsList.addAll(reservationRepository.findByStatus(Reservation.ReservationStatus.CHECKED_IN));

        // Filter to only include reservations active today (check-in <= today < check-out)
        activeReservationsList = activeReservationsList.stream()
                .filter(r -> !r.getCheckInDate().isAfter(today) && r.getCheckOutDate().isAfter(today))
                .collect(Collectors.toList());

        long occupiedRooms = activeReservationsList.size();

        long availableRooms = totalRooms - occupiedRooms;
        double occupancyRate = totalRooms > 0 ? ((double) occupiedRooms / totalRooms) * 100 : 0;

        // Count room types by summing totalRooms for each type
        Map<String, Long> roomsByType = allRooms.stream()
                .collect(Collectors.groupingBy(
                        room -> room.getType().name(),
                        Collectors.summingLong(Room::getTotalRooms)
                ));

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalRooms", totalRooms);
        statistics.put("availableRooms", availableRooms);
        statistics.put("occupiedRooms", occupiedRooms);
        statistics.put("occupancyRate", Math.round(occupancyRate * 100.0) / 100.0);
        statistics.put("roomsByType", roomsByType);

        return ResponseEntity.ok(statistics);
    }

    // Reservation Management
    @GetMapping("/reservations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        log.info("Getting all reservations");
        return ResponseEntity.ok(reservationRepository.findAll());
    }

    @GetMapping("/reservations/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Reservation>> getReservationsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        log.info("Getting reservations by date range: {} to {}", startDate, endDate);

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        List<Reservation> reservations = reservationRepository
                .findByCheckInDateBetween(start, end);

        return ResponseEntity.ok(reservations);
    }

    @PutMapping("/reservations/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Reservation> updateReservationStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        log.info("Updating reservation status: {}", id);

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        String statusStr = request.get("status");
        Reservation.ReservationStatus status = Reservation.ReservationStatus.valueOf(statusStr);

        reservation.setStatus(status);
        Reservation updatedReservation = reservationRepository.save(reservation);

        return ResponseEntity.ok(updatedReservation);
    }

    @GetMapping("/reservations/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getReservationStatistics() {
        log.info("Getting reservation statistics");

        List<Reservation> allReservations = reservationRepository.findAll();
        long totalReservations = allReservations.size();

        Map<String, Long> reservationsByStatus = allReservations.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStatus().name(),
                        Collectors.counting()
                ));

        BigDecimal totalRevenue = allReservations.stream()
                .filter(r -> r.getStatus() == Reservation.ReservationStatus.CONFIRMED ||
                            r.getStatus() == Reservation.ReservationStatus.CHECKED_IN ||
                            r.getStatus() == Reservation.ReservationStatus.CHECKED_OUT)
                .map(Reservation::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalReservations", totalReservations);
        statistics.put("reservationsByStatus", reservationsByStatus);
        statistics.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(statistics);
    }

    // Manager-Assisted Booking (Token-Based - SECURE)
    /**
     * Create a booking on behalf of a customer using a Stripe payment method token.
     * This is the SECURE, PCI-compliant way - card data is tokenized client-side.
     *
     * @param request booking request with customer details and payment method token
     * @return booking response with reservation and payment details
     */
    @PostMapping("/bookings/assisted-token")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> createAssistedBookingWithToken(@jakarta.validation.Valid @RequestBody TokenBookingRequest request) {
        log.info("Manager creating token-based assisted booking for customer: {}", request.getCustomerEmail());

        // Business logic validation
        LocalDate today = LocalDate.now();

        // Validate dates
        if (request.getCheckInDate().isBefore(today)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Check-in date cannot be in the past"
                    ));
        }

        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Check-out date must be after check-in date"
                    ));
        }

        if (request.getCheckInDate().isAfter(today.plusYears(2))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Check-in date cannot be more than 2 years in the future"
                    ));
        }

        // Validate special requests length
        if (request.getSpecialRequests() != null && request.getSpecialRequests().length() > 500) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Special requests cannot exceed 500 characters"
                    ));
        }

        try {
            // Find or create customer user
            User customer = userRepository.findByEmail(request.getCustomerEmail())
                    .orElseGet(() -> {
                        log.info("Creating new customer account for: {}", request.getCustomerEmail());
                        User newUser = new User();
                        newUser.setEmail(request.getCustomerEmail());
                        newUser.setFirstName(request.getCustomerFirstName());
                        newUser.setLastName(request.getCustomerLastName());
                        newUser.setPhoneNumber(request.getCustomerPhoneNumber());
                        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
                        newUser.setRoles(Set.of(User.Role.GUEST));
                        newUser.setProvider("local");
                        newUser.setEnabled(true);
                        return userRepository.save(newUser);
                    });

            // Create reservation
            Reservation reservation = reservationService.createReservation(
                    customer,
                    request.getRoomId(),
                    request.getCheckInDate(),
                    request.getCheckOutDate(),
                    request.getNumberOfGuests(),
                    request.getSpecialRequests()
            );

            // Process payment with token (SECURE - card data never touched server)
            Payment payment = paymentService.processTokenPayment(
                    reservation,
                    request.getPaymentMethodId()
            );

            // Build response
            ManagerBookingResponse response = new ManagerBookingResponse();
            response.setReservation(reservation);
            response.setPayment(payment);
            response.setCustomerId(customer.getId());
            response.setMessage("Booking created successfully and payment processed securely");

            log.info("Token-based assisted booking completed successfully. Reservation ID: {}, Payment ID: {}",
                    reservation.getId(), payment.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (StripeException e) {
            log.error("Payment processing failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body(Map.of(
                            "error", "Payment failed",
                            "message", e.getMessage()
                    ));
        } catch (RuntimeException e) {
            log.error("Booking creation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Booking failed",
                            "message", e.getMessage()
                    ));
        }
    }

    // Manager-Assisted Booking (Legacy - Direct Card Data)
    /**
     * Create a booking on behalf of a customer and charge their card.
     * This endpoint allows managers to book rooms for customers and process payment
     * using the customer's card details.
     *
     * @deprecated Use {@link #createAssistedBookingWithToken(TokenBookingRequest)} instead.
     *             This method handles raw card data which requires PCI-DSS Level 1 compliance.
     *
     * @param request booking request with customer and payment details
     * @return booking response with reservation and payment details
     */
    @Deprecated
    @PostMapping("/bookings/assisted")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> createAssistedBooking(@jakarta.validation.Valid @RequestBody ManagerBookingRequest request) {
        log.info("Manager creating assisted booking for customer: {}", request.getCustomerEmail());

        // Additional business logic validation
        LocalDate today = LocalDate.now();

        // Validate dates
        if (request.getCheckInDate().isBefore(today)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Check-in date cannot be in the past"
                    ));
        }

        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Check-out date must be after check-in date"
                    ));
        }

        if (request.getCheckInDate().isAfter(today.plusYears(2))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Check-in date cannot be more than 2 years in the future"
                    ));
        }

        // Validate card expiry date is not in the past
        LocalDate cardExpiry = LocalDate.of(request.getCardExpiryYear(), request.getCardExpiryMonth(), 1);
        LocalDate firstOfCurrentMonth = LocalDate.of(today.getYear(), today.getMonth(), 1);
        if (cardExpiry.isBefore(firstOfCurrentMonth)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Card expiry date cannot be in the past"
                    ));
        }

        // Sanitize and validate inputs
        if (request.getSpecialRequests() != null && request.getSpecialRequests().length() > 500) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Special requests cannot exceed 500 characters"
                    ));
        }

        try {
            // Find or create customer user
            User customer = userRepository.findByEmail(request.getCustomerEmail())
                    .orElseGet(() -> {
                        log.info("Creating new customer account for: {}", request.getCustomerEmail());
                        User newUser = new User();
                        newUser.setEmail(request.getCustomerEmail());
                        newUser.setFirstName(request.getCustomerFirstName());
                        newUser.setLastName(request.getCustomerLastName());
                        newUser.setPhoneNumber(request.getCustomerPhoneNumber());
                        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
                        newUser.setRoles(Set.of(User.Role.GUEST));
                        newUser.setProvider("local");
                        newUser.setEnabled(true);
                        return userRepository.save(newUser);
                    });

            // Create reservation
            Reservation reservation = reservationService.createReservation(
                    customer,
                    request.getRoomId(),
                    request.getCheckInDate(),
                    request.getCheckOutDate(),
                    request.getNumberOfGuests(),
                    request.getSpecialRequests()
            );

            // Process payment with card details
            Payment payment = paymentService.processDirectCardPayment(
                    reservation,
                    request.getCardNumber(),
                    request.getCardExpiryMonth(),
                    request.getCardExpiryYear(),
                    request.getCardCvc(),
                    request.getCardholderName(),
                    request.getBillingAddressLine1(),
                    request.getBillingCity(),
                    request.getBillingState(),
                    request.getBillingPostalCode(),
                    request.getBillingCountry()
            );

            // Build response
            ManagerBookingResponse response = new ManagerBookingResponse();
            response.setReservation(reservation);
            response.setPayment(payment);
            response.setCustomerId(customer.getId());
            response.setMessage("Booking created successfully and payment processed");

            log.info("Assisted booking completed successfully. Reservation ID: {}, Payment ID: {}",
                    reservation.getId(), payment.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (StripeException e) {
            log.error("Payment processing failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body(Map.of(
                            "error", "Payment failed",
                            "message", e.getMessage()
                    ));
        } catch (RuntimeException e) {
            log.error("Booking creation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Booking failed",
                            "message", e.getMessage()
                    ));
        }
    }

    // Helper method to convert User to UserDto
    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRoles(user.getRoles());
        dto.setAvatar(user.getAvatar());
        dto.setProvider(user.getProvider());
        dto.setEnabled(user.isEnabled());
        return dto;
    }
}
