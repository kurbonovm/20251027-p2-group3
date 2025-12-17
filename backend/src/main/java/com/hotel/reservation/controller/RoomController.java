package com.hotel.reservation.controller;

import com.hotel.reservation.dto.UpdateRoomRequest;
import com.hotel.reservation.model.Room;
import com.hotel.reservation.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for room management endpoints.
 * Handles CRUD operations for rooms and availability checks.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RoomController {

    private final RoomService roomService;

    /**
     * Get all rooms with optional filtering.
     *
     * @param type room type filter (optional)
     * @param minPrice minimum price filter (optional)
     * @param maxPrice maximum price filter (optional)
     * @return list of rooms
     */
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms(
            @RequestParam(required = false) Room.RoomType type,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice) {

        List<Room> rooms;
        if (type != null || minPrice != null || maxPrice != null) {
            rooms = roomService.filterRooms(type, minPrice, maxPrice);
        } else {
            rooms = roomService.getAllRooms();
        }

        return ResponseEntity.ok(rooms);
    }

    /**
     * Get room by ID.
     *
     * @param id room ID
     * @return room entity
     */
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable String id) {
        Room room = roomService.getRoomById(id);
        return ResponseEntity.ok(room);
    }

    /**
     * Get available rooms for specific dates.
     *
     * @param checkInDate check-in date
     * @param checkOutDate check-out date
     * @param guests number of guests
     * @return list of available rooms
     */
    @GetMapping("/available")
    public ResponseEntity<List<Room>> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam int guests) {

        List<Room> rooms = roomService.getAvailableRooms(checkInDate, checkOutDate, guests);
        return ResponseEntity.ok(rooms);
    }

    /**
     * Create a new room (Manager/Admin only).
     * Validates all required fields and constraints before creation.
     *
     * @param room room details with validation
     * @return created room
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Room> createRoom(@Valid @RequestBody Room room) {
        Room createdRoom = roomService.createRoom(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRoom);
    }

    /**
     * Update an existing room (Manager/Admin only).
     *
     * @param id room ID
     * @param updateRequest DTO containing fields to update (only provided fields will be updated)
     * @return updated room
     */
    /**
     * Update an existing room (Manager/Admin only).
     * Accepts a nested room object from the frontend: {room: {pricePerNight: 300, ...}}
     *
     * @param id room ID
     * @param rawRequest request body containing room update data (may be nested under 'room' key)
     * @return updated room
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Room> updateRoom(
            @PathVariable String id, 
            @RequestBody java.util.Map<String, Object> rawRequest) {
        
        // Extract the nested 'room' object if present (frontend sends {room: {...}})
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> roomData = rawRequest.containsKey("room") 
            ? (java.util.Map<String, Object>) rawRequest.get("room")
            : rawRequest;
        
        // Convert map to UpdateRoomRequest DTO
        UpdateRoomRequest updateRequest = mapToUpdateRequest(roomData);
        
        // Update the room
        Room updatedRoom = roomService.updateRoom(id, updateRequest);
        return ResponseEntity.ok(updatedRoom);
    }
    
    /**
     * Helper method to convert a map to UpdateRoomRequest DTO.
     * Handles type conversions for numeric fields.
     *
     * @param roomData map containing room update data
     * @return UpdateRoomRequest DTO
     */
    private UpdateRoomRequest mapToUpdateRequest(java.util.Map<String, Object> roomData) {
        UpdateRoomRequest updateRequest = new UpdateRoomRequest();
        
        if (roomData.containsKey("name")) {
            updateRequest.setName((String) roomData.get("name"));
        }
        if (roomData.containsKey("type")) {
            updateRequest.setType(Room.RoomType.valueOf((String) roomData.get("type")));
        }
        if (roomData.containsKey("description")) {
            updateRequest.setDescription((String) roomData.get("description"));
        }
        if (roomData.containsKey("pricePerNight")) {
            updateRequest.setPricePerNight(convertToInteger(roomData.get("pricePerNight")));
        }
        if (roomData.containsKey("capacity")) {
            updateRequest.setCapacity(convertToInteger(roomData.get("capacity")));
        }
        if (roomData.containsKey("amenities")) {
            @SuppressWarnings("unchecked")
            java.util.List<String> amenities = (java.util.List<String>) roomData.get("amenities");
            updateRequest.setAmenities(amenities);
        }
        if (roomData.containsKey("imageUrl")) {
            updateRequest.setImageUrl((String) roomData.get("imageUrl"));
        }
        if (roomData.containsKey("additionalImages")) {
            @SuppressWarnings("unchecked")
            java.util.List<String> additionalImages = (java.util.List<String>) roomData.get("additionalImages");
            updateRequest.setAdditionalImages(additionalImages);
        }
        if (roomData.containsKey("available")) {
            updateRequest.setAvailable((Boolean) roomData.get("available"));
        }
        if (roomData.containsKey("totalRooms")) {
            updateRequest.setTotalRooms(convertToInteger(roomData.get("totalRooms")));
        }
        if (roomData.containsKey("floorNumber")) {
            updateRequest.setFloorNumber(convertToInteger(roomData.get("floorNumber")));
        }
        if (roomData.containsKey("size")) {
            updateRequest.setSize(convertToInteger(roomData.get("size")));
        }
        
        return updateRequest;
    }
    
    /**
     * Helper method to convert various numeric types to Integer.
     *
     * @param value the value to convert
     * @return Integer value or null if conversion fails
     */
    private Integer convertToInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Double) return ((Double) value).intValue();
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Delete a room (Manager/Admin only).
     *
     * @param id room ID
     * @return no content response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
