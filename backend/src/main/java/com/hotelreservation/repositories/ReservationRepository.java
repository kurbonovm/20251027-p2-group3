package com.hotelreservation.repositories;

import com.hotelreservation.models.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Reservation entity.
 */
@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {
    
    /**
     * Find all reservations by user ID.
     * @param userId user ID
     * @return List of reservations
     */
    List<Reservation> findByUserId(String userId);
    
    /**
     * Find all reservations by hotel ID.
     * @param hotelId hotel ID
     * @return List of reservations
     */
    List<Reservation> findByHotelId(String hotelId);
    
    /**
     * Find all reservations by room ID.
     * @param roomId room ID
     * @return List of reservations
     */
    List<Reservation> findByRoomId(String roomId);
    
    /**
     * Find reservations by status.
     * @param status reservation status
     * @return List of reservations
     */
    List<Reservation> findByStatus(Reservation.ReservationStatus status);
    
    /**
     * Find reservations that overlap with given date range.
     * @param roomId room ID
     * @param checkInDate check-in date
     * @param checkOutDate check-out date
     * @return List of overlapping reservations
     */
    @Query("{'roomId': ?0, 'status': 'CONFIRMED', $or: [" +
           "{'checkInDate': {$lte: ?2}, 'checkOutDate': {$gte: ?1}}," +
           "{'checkInDate': {$gte: ?1, $lte: ?2}}," +
           "{'checkOutDate': {$gte: ?1, $lte: ?2}}" +
           "]}")
    List<Reservation> findOverlappingReservations(String roomId, LocalDate checkInDate, LocalDate checkOutDate);
    
    /**
     * Find reservations by date range.
     * @param startDate start date
     * @param endDate end date
     * @return List of reservations
     */
    @Query("{'checkInDate': {$gte: ?0}, 'checkOutDate': {$lte: ?1}}")
    List<Reservation> findByDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find reservations by hotel ID and date range.
     * @param hotelId hotel ID
     * @param startDate start date
     * @param endDate end date
     * @return List of reservations
     */
    @Query("{'hotelId': ?0, 'checkInDate': {$gte: ?1}, 'checkOutDate': {$lte: ?2}}")
    List<Reservation> findByHotelIdAndDateRange(String hotelId, LocalDate startDate, LocalDate endDate);
}

