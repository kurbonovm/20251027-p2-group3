package com.hotelreservation.repositories;

import com.hotelreservation.models.RoomAvailabilitySnapshot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for RoomAvailabilitySnapshot entity.
 */
@Repository
public interface RoomAvailabilitySnapshotRepository extends MongoRepository<RoomAvailabilitySnapshot, String> {
    
    /**
     * Find snapshot by hotel ID, room type, and date.
     * @param hotelId hotel ID
     * @param roomType room type
     * @param date date
     * @return Optional snapshot
     */
    Optional<RoomAvailabilitySnapshot> findByHotelIdAndRoomTypeAndDate(String hotelId, String roomType, LocalDate date);
    
    /**
     * Find snapshots by hotel ID and room type.
     * @param hotelId hotel ID
     * @param roomType room type
     * @return List of snapshots
     */
    List<RoomAvailabilitySnapshot> findByHotelIdAndRoomType(String hotelId, String roomType);
    
    /**
     * Find snapshots by date range.
     * @param startDate start date
     * @param endDate end date
     * @return List of snapshots
     */
    @Query("{'date': {$gte: ?0, $lte: ?1}}")
    List<RoomAvailabilitySnapshot> findByDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find snapshots by hotel ID, room type, and date range.
     * @param hotelId hotel ID
     * @param roomType room type
     * @param startDate start date
     * @param endDate end date
     * @return List of snapshots
     */
    @Query("{'hotelId': ?0, 'roomType': ?1, 'date': {$gte: ?2, $lte: ?3}}")
    List<RoomAvailabilitySnapshot> findByHotelIdAndRoomTypeAndDateRange(
            String hotelId, String roomType, LocalDate startDate, LocalDate endDate);
}

