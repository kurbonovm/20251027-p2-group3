package com.hotel.reservation.controller;

import com.hotel.reservation.dto.CreateUserRequest;
import com.hotel.reservation.dto.UserDto;
import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.model.Room;
import com.hotel.reservation.model.User;
import com.hotel.reservation.repository.ReservationRepository;
import com.hotel.reservation.repository.RoomRepository;
import com.hotel.reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;

    // Dashboard Overview
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        log.info("Getting dashboard overview");

        // Calculate total rooms by summing up totalRooms field from all room types
        List<Room> allRooms = roomRepository.findAll();
        long totalRooms = allRooms.stream()
                .mapToLong(room -> room.getTotalRooms())
                .sum();

        // Calculate active reservations
        long activeReservations = reservationRepository.countByStatus(Reservation.ReservationStatus.CONFIRMED) +
                                 reservationRepository.countByStatus(Reservation.ReservationStatus.CHECKED_IN);

        // Calculate occupied rooms by counting active reservations
        List<Reservation> activeReservationsList = reservationRepository.findByStatus(Reservation.ReservationStatus.CONFIRMED);
        activeReservationsList.addAll(reservationRepository.findByStatus(Reservation.ReservationStatus.CHECKED_IN));

        long occupiedRooms = activeReservationsList.size();

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
                .map(r -> r.getTotalAmount())
                .reduce(BigDecimal.ZERO, (sum, amount) -> sum.add(amount));

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
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest createUserRequest) {
        log.info("Creating new user with email: {}", createUserRequest.getEmail());

        try {
            // Validate email is not already in use
            if (userRepository.existsByEmail(createUserRequest.getEmail())) {
                log.warn("Attempt to create user with existing email: {}", createUserRequest.getEmail());
                throw new RuntimeException("A user with this email address already exists");
            }

            // Validate roles are provided
            if (createUserRequest.getRoles() == null || createUserRequest.getRoles().isEmpty()) {
                log.warn("Attempt to create user without roles");
                throw new RuntimeException("At least one role is required");
            }

            // Trim whitespace from inputs
            String firstName = createUserRequest.getFirstName().trim();
            String lastName = createUserRequest.getLastName().trim();
            String email = createUserRequest.getEmail().trim().toLowerCase();
            String phoneNumber = createUserRequest.getPhoneNumber() != null ? 
                createUserRequest.getPhoneNumber().trim() : null;

            // Create and populate user object
            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(createUserRequest.getPassword()));
            user.setPhoneNumber(phoneNumber);
            user.setRoles(createUserRequest.getRoles());
            user.setEnabled(createUserRequest.isEnabled());

            // Save user to database
            User savedUser = userRepository.save(user);
            log.info("User created successfully with id: {} and roles: {}", 
                savedUser.getId(), savedUser.getRoles());

            return ResponseEntity.ok(convertToDto(savedUser));
        } catch (RuntimeException e) {
            log.error("Error creating user: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating user", e);
            throw new RuntimeException("Failed to create user. Please try again.");
        }
    }

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

        user.setEnabled(request.get("enabled") != null ? request.get("enabled") : true);
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
                .mapToLong(room -> room.getTotalRooms())
                .sum();

        // Calculate occupied rooms based on active reservations count
        List<Reservation> activeReservationsList = reservationRepository.findByStatus(Reservation.ReservationStatus.CONFIRMED);
        activeReservationsList.addAll(reservationRepository.findByStatus(Reservation.ReservationStatus.CHECKED_IN));

        long occupiedRooms = activeReservationsList.size();

        long availableRooms = totalRooms - occupiedRooms;
        double occupancyRate = totalRooms > 0 ? ((double) occupiedRooms / totalRooms) * 100 : 0;

        // Count room types by summing totalRooms for each type
        Map<String, Long> roomsByType = allRooms.stream()
                .collect(Collectors.groupingBy(
                        room -> room.getType() != null ? room.getType().name() : "UNKNOWN",
                        Collectors.summingLong(room -> room.getTotalRooms())
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
                .map(r -> r.getTotalAmount())
                .reduce(BigDecimal.ZERO, (sum, amount) -> sum.add(amount));

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalReservations", totalReservations);
        statistics.put("reservationsByStatus", reservationsByStatus);
        statistics.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/reservations/todays-pulse")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> getTodaysPulse() {
        log.info("Getting today's pulse events");

        try {
            LocalDate today = LocalDate.now();
            List<Map<String, Object>> events = new ArrayList<>();

            // Get today's check-outs (reservations with checkout date = today)
            List<Reservation> checkOuts = reservationRepository.findAll().stream()
                    .filter(r -> r.getCheckOutDate() != null && 
                               today.equals(r.getCheckOutDate()) && 
                               r.getStatus() != null &&
                               (Reservation.ReservationStatus.CHECKED_IN.equals(r.getStatus()) ||
                                Reservation.ReservationStatus.CHECKED_OUT.equals(r.getStatus())))
                    .collect(Collectors.toList());

            // Get today's check-ins (reservations with checkin date = today)
            List<Reservation> checkIns = reservationRepository.findAll().stream()
                    .filter(r -> r.getCheckInDate() != null && 
                               today.equals(r.getCheckInDate()) && 
                               r.getStatus() != null &&
                               (Reservation.ReservationStatus.CONFIRMED.equals(r.getStatus()) ||
                                Reservation.ReservationStatus.CHECKED_IN.equals(r.getStatus())))
                    .collect(Collectors.toList());

            // Add check-out events
            for (Reservation reservation : checkOuts) {
                try {
                    if (reservation.getUser() == null || reservation.getRoom() == null) {
                        log.warn("Skipping reservation {} due to null user or room", reservation.getId());
                        continue;
                    }

                    Map<String, Object> event = new HashMap<>();
                    event.put("id", reservation.getId());
                    event.put("type", "CHECK_OUT");
                    
                    String firstName = reservation.getUser().getFirstName() != null ? reservation.getUser().getFirstName() : "";
                    String lastName = reservation.getUser().getLastName() != null ? reservation.getUser().getLastName() : "";
                    event.put("guestName", (firstName + " " + lastName).trim());
                    
                    String roomName = reservation.getRoom().getName() != null ? reservation.getRoom().getName() : "Unknown Room";
                    event.put("roomNumber", roomName);
                    event.put("roomType", reservation.getRoom().getType() != null ? reservation.getRoom().getType().name() : "STANDARD");
                    event.put("status", reservation.getStatus().name());
                    
                    // Generate dynamic checkout time based on reservation creation or use standard 11:00 AM
                    LocalDateTime checkoutDateTime = reservation.getUpdatedAt() != null ? 
                        reservation.getUpdatedAt() : 
                        reservation.getCreatedAt() != null ? 
                            reservation.getCreatedAt() : 
                            LocalDateTime.of(today, java.time.LocalTime.of(11, 0));
                    
                    String checkoutTime = checkoutDateTime.format(
                        java.time.format.DateTimeFormatter.ofPattern("hh:mm a")
                    );
                    event.put("time", checkoutTime);
                    event.put("date", reservation.getCheckOutDate().toString());
                    
                    // Determine additional status (without room number - it's already in roomNumber field)
                    String additionalStatus = "Housekeeping Pending";
                    if (reservation.getStatus() == Reservation.ReservationStatus.CHECKED_OUT) {
                        additionalStatus = "Completed";
                    }
                    event.put("additionalStatus", additionalStatus);
                    
                    events.add(event);
                } catch (Exception e) {
                    log.error("Error processing check-out reservation {}: {}", reservation.getId(), e.getMessage());
                }
            }

            // Add check-in events
            for (Reservation reservation : checkIns) {
                try {
                    if (reservation.getUser() == null || reservation.getRoom() == null) {
                        log.warn("Skipping reservation {} due to null user or room", reservation.getId());
                        continue;
                    }

                    Map<String, Object> event = new HashMap<>();
                    event.put("id", reservation.getId());
                    event.put("type", "CHECK_IN");
                    
                    String firstName = reservation.getUser().getFirstName() != null ? reservation.getUser().getFirstName() : "";
                    String lastName = reservation.getUser().getLastName() != null ? reservation.getUser().getLastName() : "";
                    event.put("guestName", (firstName + " " + lastName).trim());
                    
                    String roomName = reservation.getRoom().getName() != null ? reservation.getRoom().getName() : "Unknown Room";
                    event.put("roomNumber", roomName);
                    event.put("roomType", reservation.getRoom().getType() != null ? reservation.getRoom().getType().name() : "STANDARD");
                    event.put("status", reservation.getStatus().name());
                    
                    // Generate dynamic checkin time based on reservation creation or use standard 2:00 PM
                    LocalDateTime checkinDateTime = reservation.getUpdatedAt() != null ? 
                        reservation.getUpdatedAt() : 
                        reservation.getCreatedAt() != null ? 
                            reservation.getCreatedAt() : 
                            LocalDateTime.of(today, java.time.LocalTime.of(14, 0));
                    
                    String checkinTime = checkinDateTime.format(
                        java.time.format.DateTimeFormatter.ofPattern("hh:mm a")
                    );
                    event.put("time", checkinTime);
                    event.put("date", reservation.getCheckInDate().toString());
                    
                    // Determine additional status (without room number - it's already in roomNumber field)
                    String roomTypeFormatted = "Standard";
                    if (reservation.getRoom().getType() != null) {
                        String typeName = reservation.getRoom().getType().name();
                        roomTypeFormatted = typeName.substring(0, 1).toUpperCase() + 
                            typeName.substring(1).toLowerCase().replace("_", " ");
                    }
                    
                    String additionalStatus = roomTypeFormatted;
                    if (reservation.getStatus() == Reservation.ReservationStatus.CHECKED_IN) {
                        additionalStatus = "Checked In";
                    }
                    event.put("additionalStatus", additionalStatus);
                    
                    events.add(event);
                } catch (Exception e) {
                    log.error("Error processing check-in reservation {}: {}", reservation.getId(), e.getMessage());
                }
            }

            // Sort events by time (check-outs first at 11 AM, then check-ins at 2 PM)
            events.sort((e1, e2) -> {
                String time1 = (String) e1.get("time");
                String time2 = (String) e2.get("time");
                return time1.compareTo(time2);
            });

            log.info("Returning {} pulse events", events.size());
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            log.error("Error getting today's pulse events: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ArrayList<>()); // Return empty list instead of error
        }
    }

    @GetMapping("/reservations/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> getRecentReservations() {
        log.info("Getting recent reservations");

        try {
            // Get all reservations sorted by creation date (most recent first)
            List<Reservation> recentReservations = reservationRepository.findAll().stream()
                    .filter(r -> r.getUser() != null && r.getRoom() != null)
                    .sorted((r1, r2) -> {
                        LocalDateTime time1 = r1.getCreatedAt() != null ? r1.getCreatedAt() : LocalDateTime.MIN;
                        LocalDateTime time2 = r2.getCreatedAt() != null ? r2.getCreatedAt() : LocalDateTime.MIN;
                        return time2.compareTo(time1); // Most recent first
                    })
                    .limit(10) // Get last 10 reservations
                    .collect(Collectors.toList());

            List<Map<String, Object>> reservationList = new ArrayList<>();

            for (Reservation reservation : recentReservations) {
                try {
                    Map<String, Object> reservationData = new HashMap<>();
                    
                    // User information
                    reservationData.put("id", reservation.getId());
                    String firstName = reservation.getUser().getFirstName() != null ? reservation.getUser().getFirstName() : "";
                    String lastName = reservation.getUser().getLastName() != null ? reservation.getUser().getLastName() : "";
                    reservationData.put("userName", (firstName + " " + lastName).trim());
                    reservationData.put("userAvatar", reservation.getUser().getAvatar() != null ? reservation.getUser().getAvatar() : "");
                    
                    // Room information
                    String roomName = reservation.getRoom().getName() != null ? reservation.getRoom().getName() : "Unknown Room";
                    String roomType = reservation.getRoom().getType() != null ? reservation.getRoom().getType().name() : "STANDARD";
                    
                    // Format room type nicely
                    String roomTypeFormatted = roomType.substring(0, 1).toUpperCase() + 
                        roomType.substring(1).toLowerCase().replace("_", " ");
                    
                    reservationData.put("roomName", roomName);
                    reservationData.put("roomType", roomTypeFormatted);
                    
                    // Calculate number of nights
                    long nights = 1;
                    if (reservation.getCheckInDate() != null && reservation.getCheckOutDate() != null) {
                        nights = java.time.temporal.ChronoUnit.DAYS.between(
                            reservation.getCheckInDate(), 
                            reservation.getCheckOutDate()
                        );
                        if (nights < 1) nights = 1;
                    }
                    reservationData.put("nights", nights);
                    
                    // Status
                    String status = reservation.getStatus() != null ? reservation.getStatus().name() : "PENDING";
                    reservationData.put("status", status);
                    
                    // Time ago calculation
                    String timeAgo = "Just now";
                    if (reservation.getCreatedAt() != null) {
                        LocalDateTime now = LocalDateTime.now();
                        LocalDateTime createdAt = reservation.getCreatedAt();
                        
                        long minutesAgo = java.time.temporal.ChronoUnit.MINUTES.between(createdAt, now);
                        long hoursAgo = java.time.temporal.ChronoUnit.HOURS.between(createdAt, now);
                        long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(createdAt, now);
                        
                        if (minutesAgo < 1) {
                            timeAgo = "Just now";
                        } else if (minutesAgo < 60) {
                            timeAgo = minutesAgo + "m ago";
                        } else if (hoursAgo < 24) {
                            timeAgo = hoursAgo + "h ago";
                        } else {
                            timeAgo = daysAgo + "d ago";
                        }
                    }
                    reservationData.put("timeAgo", timeAgo);
                    reservationData.put("createdAt", reservation.getCreatedAt() != null ? reservation.getCreatedAt().toString() : "");
                    
                    reservationList.add(reservationData);
                } catch (Exception e) {
                    log.error("Error processing reservation {}: {}", reservation.getId(), e.getMessage());
                }
            }

            log.info("Returning {} recent reservations", reservationList.size());
            return ResponseEntity.ok(reservationList);
        } catch (Exception e) {
            log.error("Error getting recent reservations: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ArrayList<>());
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
