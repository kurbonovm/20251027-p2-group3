package com.hotel.reservation.repository;

import com.hotel.reservation.model.RoomLock;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for RoomLock entity.
 * Manages room locking for concurrent booking prevention.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Repository
public interface RoomLockRepository extends MongoRepository<RoomLock, String> {

    /**
     * Find overlapping locks for a room.
     * Used to check if a room is locked for the requested dates.
     *
     * @param roomId the room ID
     * @param checkInDate the check-in date
     * @param checkOutDate the check-out date
     * @return list of overlapping locks
     */
    @Query("{ 'roomId': ?0, " +
           "$or: [" +
           "  { 'checkInDate': { $lt: ?2 }, 'checkOutDate': { $gt: ?1 } }, " +
           "  { 'checkInDate': { $gte: ?1, $lt: ?2 } }, " +
           "  { 'checkOutDate': { $gt: ?1, $lte: ?2 } }" +
           "]}")
    List<RoomLock> findOverlappingLocks(String roomId, LocalDate checkInDate, LocalDate checkOutDate);

    /**
     * Delete locks by reservation ID.
     *
     * @param reservationId the reservation ID
     */
    void deleteByReservationId(String reservationId);

    /**
     * Find lock by reservation ID.
     *
     * @param reservationId the reservation ID
     * @return list of locks for the reservation
     */
    List<RoomLock> findByReservationId(String reservationId);
}
