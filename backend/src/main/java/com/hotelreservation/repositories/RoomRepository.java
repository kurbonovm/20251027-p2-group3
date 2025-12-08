package com.hotelreservation.repositories;

import com.hotelreservation.models.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Room entity.
 */
@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    
    /**
     * Find all rooms by hotel ID.
     * @param hotelId hotel ID
     * @return List of rooms
     */
    List<Room> findByHotelId(String hotelId);
    
    /**
     * Find rooms by hotel ID and room type.
     * @param hotelId hotel ID
     * @param roomType room type
     * @return List of rooms
     */
    List<Room> findByHotelIdAndRoomType(String hotelId, String roomType);
    
    /**
     * Find rooms by hotel ID and status.
     * @param hotelId hotel ID
     * @param status room status
     * @return List of rooms
     */
    List<Room> findByHotelIdAndStatus(String hotelId, Room.RoomStatus status);
    
    /**
     * Find available rooms by hotel ID and room type.
     * @param hotelId hotel ID
     * @param roomType room type
     * @param status room status (ACTIVE)
     * @return List of available rooms
     */
    List<Room> findByHotelIdAndRoomTypeAndStatus(String hotelId, String roomType, Room.RoomStatus status);
    
    /**
     * Find room by hotel ID and room number.
     * @param hotelId hotel ID
     * @param roomNumber room number
     * @return Optional Room
     */
    java.util.Optional<Room> findByHotelIdAndRoomNumber(String hotelId, String roomNumber);
}

