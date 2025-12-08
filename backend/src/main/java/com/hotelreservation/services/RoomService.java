package com.hotelreservation.services;

import com.hotelreservation.dtos.room.RoomRequest;
import com.hotelreservation.exceptions.ResourceNotFoundException;
import com.hotelreservation.models.Room;
import com.hotelreservation.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for room management operations.
 */
@Service
public class RoomService {
    
    private final RoomRepository roomRepository;
    private final HotelService hotelService;
    
    @Autowired
    public RoomService(RoomRepository roomRepository, HotelService hotelService) {
        this.roomRepository = roomRepository;
        this.hotelService = hotelService;
    }
    
    /**
     * Get all rooms for a hotel.
     * @param hotelId hotel ID
     * @return List of rooms
     */
    public List<Room> getRoomsByHotelId(String hotelId) {
        hotelService.getHotelById(hotelId); // Validate hotel exists
        return roomRepository.findByHotelId(hotelId);
    }
    
    /**
     * Get room by ID.
     * @param hotelId hotel ID
     * @param roomId room ID
     * @return Room
     * @throws ResourceNotFoundException if room not found
     */
    public Room getRoomById(String hotelId, String roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));
        if (!room.getHotelId().equals(hotelId)) {
            throw new ResourceNotFoundException("Room", "id", roomId);
        }
        return room;
    }
    
    /**
     * Create a new room.
     * @param hotelId hotel ID
     * @param roomRequest room request DTO
     * @return Created room
     */
    public Room createRoom(String hotelId, RoomRequest roomRequest) {
        hotelService.getHotelById(hotelId); // Validate hotel exists
        
        Room room = new Room();
        room.setHotelId(hotelId);
        room.setRoomNumber(roomRequest.getRoomNumber());
        room.setRoomType(roomRequest.getRoomType());
        room.setBasePrice(roomRequest.getBasePrice());
        room.setNightlyRate(roomRequest.getNightlyRate());
        room.setStatus(roomRequest.getStatus());
        room.setMaxCapacity(roomRequest.getMaxCapacity());
        room.setAmenities(roomRequest.getAmenities());
        room.setBedType(roomRequest.getBedType());
        room.setImages(roomRequest.getImages());
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());
        
        return roomRepository.save(room);
    }
    
    /**
     * Update an existing room.
     * @param hotelId hotel ID
     * @param roomId room ID
     * @param roomRequest updated room data
     * @return Updated room
     */
    public Room updateRoom(String hotelId, String roomId, RoomRequest roomRequest) {
        Room existingRoom = getRoomById(hotelId, roomId);
        
        existingRoom.setRoomNumber(roomRequest.getRoomNumber());
        existingRoom.setRoomType(roomRequest.getRoomType());
        existingRoom.setBasePrice(roomRequest.getBasePrice());
        existingRoom.setNightlyRate(roomRequest.getNightlyRate());
        existingRoom.setStatus(roomRequest.getStatus());
        existingRoom.setMaxCapacity(roomRequest.getMaxCapacity());
        existingRoom.setAmenities(roomRequest.getAmenities());
        existingRoom.setBedType(roomRequest.getBedType());
        existingRoom.setImages(roomRequest.getImages());
        existingRoom.setUpdatedAt(LocalDateTime.now());
        
        return roomRepository.save(existingRoom);
    }
    
    /**
     * Delete a room.
     * @param hotelId hotel ID
     * @param roomId room ID
     */
    public void deleteRoom(String hotelId, String roomId) {
        Room room = getRoomById(hotelId, roomId);
        roomRepository.delete(room);
    }
    
    /**
     * Get available rooms for a hotel.
     * @param hotelId hotel ID
     * @return List of available rooms
     */
    public List<Room> getAvailableRooms(String hotelId) {
        hotelService.getHotelById(hotelId); // Validate hotel exists
        return roomRepository.findByHotelIdAndStatus(hotelId, Room.RoomStatus.ACTIVE);
    }
}

