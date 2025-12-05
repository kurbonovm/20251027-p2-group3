package com.hotelreservation.controllers;

import com.hotelreservation.dtos.room.RoomResponse;
import com.hotelreservation.models.Hotel;
import com.hotelreservation.models.Room2;
import com.hotelreservation.services.HotelService;
import com.hotelreservation.services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for hotel management endpoints.
 */
@RestController
@RequestMapping("/api/v1/hotels")
@CrossOrigin(origins = "*")
public class HotelController {
    
    private final HotelService hotelService;
    private final RoomService roomService;
    
    @Autowired
    public HotelController(HotelService hotelService, RoomService roomService) {
        this.hotelService = hotelService;
        this.roomService = roomService;
    }
    
    /**
     * Get all hotels.
     * @return List of hotels
     */
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }
    
    /**
     * Get hotel by ID.
     * @param hotelId hotel ID
     * @return Hotel
     */
    @GetMapping("/{hotelId}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable String hotelId) {
        return ResponseEntity.ok(hotelService.getHotelById(hotelId));
    }
    
    /**
     * Create a new hotel (Admin only).
     * @param hotel hotel to create
     * @return Created hotel
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Hotel> createHotel(@RequestBody Hotel hotel) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hotelService.createHotel(hotel));
    }
    
    /**
     * Update hotel (Admin only).
     * @param hotelId hotel ID
     * @param hotel updated hotel data
     * @return Updated hotel
     */
    @PutMapping("/{hotelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Hotel> updateHotel(@PathVariable String hotelId, @RequestBody Hotel hotel) {
        return ResponseEntity.ok(hotelService.updateHotel(hotelId, hotel));
    }
    
    /**
     * Delete hotel (Admin only).
     * @param hotelId hotel ID
     * @return No content
     */
    @DeleteMapping("/{hotelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHotel(@PathVariable String hotelId) {
        hotelService.deleteHotel(hotelId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get all rooms for a hotel.
     * @param hotelId hotel ID
     * @return List of rooms
     */
    @GetMapping("/{hotelId}/rooms")
    public ResponseEntity<List<RoomResponse>> getRooms(@PathVariable String hotelId) {
        List<Room2> rooms = roomService.getRoomsByHotelId(hotelId);
        List<RoomResponse> responses = rooms.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Get available rooms for a hotel (Public).
     * @param hotelId hotel ID
     * @return List of available rooms
     */
    @GetMapping("/{hotelId}/rooms/available")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms(@PathVariable String hotelId) {
        List<Room2> rooms = roomService.getAvailableRooms(hotelId);
        List<RoomResponse> responses = rooms.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    private RoomResponse convertToResponse(Room2 room) {
        RoomResponse response = new RoomResponse();
        response.setId(room.getId());
        response.setHotelId(room.getHotelId());
        response.setRoomNumber(room.getRoomNumber());
        response.setRoomType(room.getRoomType());
        response.setBasePrice(room.getBasePrice());
        response.setNightlyRate(room.getNightlyRate());
        response.setStatus(room.getStatus());
        response.setMaxCapacity(room.getMaxCapacity());
        response.setAmenities(room.getAmenities());
        response.setBedType(room.getBedType());
        response.setImages(room.getImages());
        response.setCreatedAt(room.getCreatedAt());
        response.setUpdatedAt(room.getUpdatedAt());
        return response;
    }
}

