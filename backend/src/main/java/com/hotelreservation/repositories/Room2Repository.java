package com.hotelreservation.repositories;

import com.hotelreservation.models.Room2;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Room2 entity.
 */
@Repository
public interface Room2Repository extends MongoRepository<Room2, String> {
    
    /**
     * Find all rooms by hotel ID.
     * @param hotelId hotel ID
     * @return List of rooms
     */
    List<Room2> findByHotelId(String hotelId);
    
    /**
     * Find rooms by hotel ID and room type.
     * @param hotelId hotel ID
     * @param roomType room type
     * @return List of rooms
     */
    List<Room2> findByHotelIdAndRoomType(String hotelId, String roomType);
    
    /**
     * Find rooms by hotel ID and status.
     * @param hotelId hotel ID
     * @param status room status
     * @return List of rooms
     */
    List<Room2> findByHotelIdAndStatus(String hotelId, Room2.RoomStatus status);
    
    /**
     * Find available rooms by hotel ID and room type.
     * @param hotelId hotel ID
     * @param roomType room type
     * @param status room status (ACTIVE)
     * @return List of available rooms
     */
    List<Room2> findByHotelIdAndRoomTypeAndStatus(String hotelId, String roomType, Room2.RoomStatus status);
    
    /**
     * Find room by hotel ID and room number.
     * @param hotelId hotel ID
     * @param roomNumber room number
     * @return Optional Room2
     */
    java.util.Optional<Room2> findByHotelIdAndRoomNumber(String hotelId, String roomNumber);
}

