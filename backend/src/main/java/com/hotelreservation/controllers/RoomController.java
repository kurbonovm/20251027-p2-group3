package com.hotelreservation.controllers;

import com.hotelreservation.dtos.room.RoomAvailabilityRequest;
import com.hotelreservation.dtos.room.RoomRequest;
import com.hotelreservation.dtos.room.RoomResponse;
import com.hotelreservation.models.Room;
import com.hotelreservation.services.AvailabilityService;
import com.hotelreservation.services.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for room management endpoints.
 */
@RestController
@RequestMapping("/api/v1/hotels/{hotelId}/rooms")
@CrossOrigin(origins = "*")
public class RoomController {
    
    private final RoomService roomService;
    private final AvailabilityService availabilityService;
    
    @Autowired
    public RoomController(RoomService roomService, AvailabilityService availabilityService) {
        this.roomService = roomService;
        this.availabilityService = availabilityService;
    }
    
    /**
     * Get room by ID.
     * @param hotelId hotel ID
     * @param roomId room ID
     * @return Room
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(
            @PathVariable String hotelId, @PathVariable String roomId) {
        Room room = roomService.getRoomById(hotelId, roomId);
        return ResponseEntity.ok(convertToResponse(room));
    }
    
    /**
     * Create a new room (Manager/Admin only).
     * @param hotelId hotel ID
     * @param request room request
     * @return Created room
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<RoomResponse> createRoom(
            @PathVariable String hotelId, @Valid @RequestBody RoomRequest request) {
        Room room = roomService.createRoom(hotelId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(room));
    }
    
    /**
     * Update room (Manager/Admin only).
     * @param hotelId hotel ID
     * @param roomId room ID
     * @param request updated room data
     * @return Updated room
     */
    @PutMapping("/{roomId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable String hotelId,
            @PathVariable String roomId,
            @Valid @RequestBody RoomRequest request) {
        Room room = roomService.updateRoom(hotelId, roomId, request);
        return ResponseEntity.ok(convertToResponse(room));
    }
    
    /**
     * Delete room (Manager/Admin only).
     * @param hotelId hotel ID
     * @param roomId room ID
     * @return No content
     */
    @DeleteMapping("/{roomId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable String hotelId, @PathVariable String roomId) {
        roomService.deleteRoom(hotelId, roomId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Check room availability.
     * @param hotelId hotel ID
     * @param request availability request
     * @return List of available rooms
     */
    @PostMapping("/availability/check")
    public ResponseEntity<List<RoomResponse>> checkAvailability(
            @PathVariable String hotelId, @Valid @RequestBody RoomAvailabilityRequest request) {
        request.setHotelId(hotelId);
        List<Room> rooms = availabilityService.checkAvailability(request);
        List<RoomResponse> responses = rooms.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    private RoomResponse convertToResponse(Room room) {
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

