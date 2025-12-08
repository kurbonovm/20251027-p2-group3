package com.hotelreservation.services;

import com.hotelreservation.dtos.reservation.ReservationModifyRequest;
import com.hotelreservation.dtos.reservation.ReservationRequest;
import com.hotelreservation.exceptions.AvailabilityException;
import com.hotelreservation.exceptions.CapacityException;
import com.hotelreservation.exceptions.ResourceNotFoundException;
import com.hotelreservation.models.Reservation;
import com.hotelreservation.models.Room;
import com.hotelreservation.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for reservation management operations.
 */
@Service
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    private final RoomService roomService;
    private final AvailabilityService availabilityService;
    
    @Autowired
    public ReservationService(ReservationRepository reservationRepository,
                             RoomService roomService,
                             AvailabilityService availabilityService) {
        this.reservationRepository = reservationRepository;
        this.roomService = roomService;
        this.availabilityService = availabilityService;
    }
    
    /**
     * Create a new reservation with availability and capacity validation.
     * @param request reservation request
     * @return Created reservation
     */
    @Transactional
    public Reservation createReservation(ReservationRequest request) {
        // Validate dates
        if (request.getCheckInDate().isAfter(request.getCheckOutDate()) ||
            request.getCheckInDate().isEqual(request.getCheckOutDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
        
        if (request.getCheckInDate().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Check-in date cannot be in the past");
        }
        
        // Get room and validate capacity
        Room room = roomService.getRoomById(request.getHotelId(), request.getRoomId());
        if (request.getNumberOfGuests() > room.getMaxCapacity()) {
            throw new CapacityException(request.getRoomId(), request.getNumberOfGuests(), room.getMaxCapacity());
        }
        
        // Check availability
        List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                request.getRoomId(), request.getCheckInDate(), request.getCheckOutDate());
        if (!overlapping.isEmpty()) {
            throw new AvailabilityException("Room is not available for the selected dates");
        }
        
        // Create reservation
        Reservation reservation = new Reservation();
        reservation.setUserId(request.getUserId());
        reservation.setHotelId(request.getHotelId());
        reservation.setRoomId(request.getRoomId());
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setNumberOfGuests(request.getNumberOfGuests());
        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);
        reservation.setBookingDate(LocalDateTime.now());
        
        // Calculate total price (simplified - should use nightly rate * nights)
        // This would be calculated based on room nightly rate and number of nights
        reservation.setTotalPrice(0.0); // Will be set after payment
        
        return reservationRepository.save(reservation);
    }
    
    /**
     * Get reservation by ID.
     * @param reservationId reservation ID
     * @return Reservation
     */
    public Reservation getReservationById(String reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));
    }
    
    /**
     * Get all reservations for a user.
     * @param userId user ID
     * @return List of reservations
     */
    public List<Reservation> getReservationsByUserId(String userId) {
        return reservationRepository.findByUserId(userId);
    }
    
    /**
     * Modify an existing reservation.
     * @param reservationId reservation ID
     * @param request modification request
     * @return Updated reservation
     */
    @Transactional
    public Reservation modifyReservation(String reservationId, ReservationModifyRequest request) {
        Reservation reservation = getReservationById(reservationId);
        
        // Validate new dates if provided
        if (request.getCheckInDate() != null && request.getCheckOutDate() != null) {
            if (request.getCheckInDate().isAfter(request.getCheckOutDate())) {
                throw new IllegalArgumentException("Check-out date must be after check-in date");
            }
            
            // Check availability for new dates
            List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                    reservation.getRoomId(), request.getCheckInDate(), request.getCheckOutDate());
            overlapping.removeIf(r -> r.getId().equals(reservationId)); // Exclude current reservation
            if (!overlapping.isEmpty()) {
                throw new AvailabilityException("Room is not available for the selected dates");
            }
            
            reservation.setCheckInDate(request.getCheckInDate());
            reservation.setCheckOutDate(request.getCheckOutDate());
        }
        
        // Validate capacity if guests changed
        if (request.getNumberOfGuests() != null) {
            Room room = roomService.getRoomById(reservation.getHotelId(), reservation.getRoomId());
            if (request.getNumberOfGuests() > room.getMaxCapacity()) {
                throw new CapacityException(reservation.getRoomId(), request.getNumberOfGuests(), room.getMaxCapacity());
            }
            reservation.setNumberOfGuests(request.getNumberOfGuests());
        }
        
        // Update room if changed
        if (request.getRoomId() != null) {
            // Validate new room availability
            List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                    request.getRoomId(), 
                    request.getCheckInDate() != null ? request.getCheckInDate() : reservation.getCheckInDate(),
                    request.getCheckOutDate() != null ? request.getCheckOutDate() : reservation.getCheckOutDate());
            if (!overlapping.isEmpty()) {
                throw new AvailabilityException("New room is not available for the selected dates");
            }
            reservation.setRoomId(request.getRoomId());
        }
        
        return reservationRepository.save(reservation);
    }
    
    /**
     * Cancel a reservation.
     * @param reservationId reservation ID
     */
    public void cancelReservation(String reservationId) {
        Reservation reservation = getReservationById(reservationId);
        reservation.setStatus(Reservation.ReservationStatus.CANCELED);
        reservationRepository.save(reservation);
    }
    
    /**
     * Get all reservations (for admin/manager).
     * @return List of all reservations
     */
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }
}

