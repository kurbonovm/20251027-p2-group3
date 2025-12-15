package com.hotel.reservation.controller;

import com.hotel.reservation.model.Room;
import com.hotel.reservation.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
     *
     * @param room room details
     * @return created room
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        Room createdRoom = roomService.createRoom(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRoom);
    }

    /**
     * Update an existing room (Manager/Admin only).
     *
     * @param id room ID
     * @param room updated room details
     * @return updated room
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Room> updateRoom(@PathVariable String id, @RequestBody Map<String, Object> roomData) {
        System.out.println("=== UPDATE ROOM REQUEST ===");
        System.out.println("Room ID: " + id);
        System.out.println("Received room data: " + roomData);
        
        try {
            // Track which fields were actually provided in the request
            java.util.Set<String> providedFields = new java.util.HashSet<>(roomData.keySet());
            System.out.println("Fields provided in request: " + providedFields);
            
            // Create a Room object and manually set only the fields that are present
            Room room = new Room();
            
            // Handle pricePerNight conversion to int
            if (roomData.containsKey("pricePerNight")) {
                Object priceObj = roomData.get("pricePerNight");
                System.out.println("=== PRICE IN REQUEST ===");
                System.out.println("Price object type: " + (priceObj != null ? priceObj.getClass().getName() : "null"));
                System.out.println("Price object value: " + priceObj);
                
                int price = 0;
                if (priceObj instanceof Number) {
                    price = ((Number) priceObj).intValue();
                    System.out.println("Price converted from Number to int: " + price);
                } else if (priceObj instanceof String) {
                    try {
                        price = Integer.parseInt((String) priceObj);
                        System.out.println("Price converted from String to int: " + price);
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid price format: " + priceObj);
                    }
                }
                
                if (price > 0) {
                    room.setPricePerNight(price);
                    System.out.println("✓ Price set in Room object: " + room.getPricePerNight() + " (int)");
                } else {
                    System.out.println("✗ WARNING: Price is 0 or negative: " + price + " (not setting)");
                }
            } else {
                System.out.println("✗ pricePerNight NOT in request data");
            }
            
            // Handle other fields
            if (roomData.containsKey("name")) {
                room.setName((String) roomData.get("name"));
            }
            if (roomData.containsKey("type")) {
                String typeStr = (String) roomData.get("type");
                room.setType(Room.RoomType.valueOf(typeStr));
            }
            if (roomData.containsKey("description")) {
                room.setDescription((String) roomData.get("description"));
            }
            if (roomData.containsKey("capacity")) {
                Object capObj = roomData.get("capacity");
                if (capObj instanceof Number) {
                    room.setCapacity(((Number) capObj).intValue());
                }
            }
            if (roomData.containsKey("amenities")) {
                @SuppressWarnings("unchecked")
                List<String> amenities = (List<String>) roomData.get("amenities");
                room.setAmenities(amenities);
            }
            if (roomData.containsKey("imageUrl")) {
                room.setImageUrl((String) roomData.get("imageUrl"));
            }
            if (roomData.containsKey("additionalImages")) {
                @SuppressWarnings("unchecked")
                List<String> additionalImages = (List<String>) roomData.get("additionalImages");
                room.setAdditionalImages(additionalImages);
            }
            if (roomData.containsKey("available")) {
                room.setAvailable((Boolean) roomData.get("available"));
            }
            if (roomData.containsKey("floorNumber")) {
                Object floorObj = roomData.get("floorNumber");
                if (floorObj instanceof Number) {
                    room.setFloorNumber(((Number) floorObj).intValue());
                }
            }
            if (roomData.containsKey("size")) {
                Object sizeObj = roomData.get("size");
                if (sizeObj instanceof Number) {
                    room.setSize(((Number) sizeObj).intValue());
                }
            }
            if (roomData.containsKey("totalRooms")) {
                Object totalObj = roomData.get("totalRooms");
                if (totalObj instanceof Number) {
                    room.setTotalRooms(((Number) totalObj).intValue());
                }
            }
            
            System.out.println("Room object created for service - Price: " + room.getPricePerNight());
            Room updatedRoom = roomService.updateRoom(id, room, providedFields);
            System.out.println("Room updated - Final Price: " + updatedRoom.getPricePerNight());
            return ResponseEntity.ok(updatedRoom);
        } catch (Exception e) {
            System.err.println("ERROR updating room: " + e.getMessage());
            System.err.println("Exception type: " + e.getClass().getName());
            e.printStackTrace();
            
            // Let GlobalExceptionHandler handle the error response
            throw new RuntimeException("Failed to update room: " + e.getMessage(), e);
        }
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
