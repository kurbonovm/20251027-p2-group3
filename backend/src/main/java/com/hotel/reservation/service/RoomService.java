package com.hotel.reservation.service;

import com.hotel.reservation.model.Room;
import com.hotel.reservation.repository.RoomRepository;
import com.hotel.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for room management operations.
 * Handles CRUD operations and room availability checks.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final MongoTemplate mongoTemplate;

    /**
     * Get all rooms.
     *
     * @return list of all rooms
     */
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    /**
     * Get room by ID.
     *
     * @param id room ID
     * @return room entity
     * @throws RuntimeException if room not found
     */
    public Room getRoomById(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
    }

    /**
     * Get available rooms for specific dates.
     *
     * @param checkInDate check-in date
     * @param checkOutDate check-out date
     * @param guests number of guests
     * @return list of available rooms
     */
    public List<Room> getAvailableRooms(LocalDate checkInDate, LocalDate checkOutDate, int guests) {
        List<Room> allRooms = roomRepository.findByCapacityGreaterThanEqual(guests);

        return allRooms.stream()
                .filter(room -> isRoomAvailable(room.getId(), checkInDate, checkOutDate))
                .collect(Collectors.toList());
    }

    /**
     * Check if a room is available for specific dates.
     *
     * @param roomId room ID
     * @param checkInDate check-in date
     * @param checkOutDate check-out date
     * @return true if room is available
     */
    public boolean isRoomAvailable(String roomId, LocalDate checkInDate, LocalDate checkOutDate) {
        List<?> overlappingReservations = reservationRepository
                .findOverlappingReservations(roomId, checkInDate, checkOutDate);
        return overlappingReservations.isEmpty();
    }

    /**
     * Create a new room.
     *
     * @param room room entity
     * @return created room
     */
    @Transactional
    public Room createRoom(Room room) {
        return roomRepository.save(room);
    }

    /**
     * Update an existing room.
     *
     * @param id room ID
     * @param roomDetails updated room details
     * @return updated room
     * @throws RuntimeException if room not found
     */
    @Transactional
    public Room updateRoom(String id, Room roomDetails, java.util.Set<String> providedFields) {
        System.out.println("=== RoomService.updateRoom ===");
        System.out.println("Room ID: " + id);
        System.out.println("Room details received - Price: " + roomDetails.getPricePerNight());
        System.out.println("Fields provided in request: " + providedFields);
        
        Room existingRoom = getRoomById(id);
        System.out.println("Existing room - Price: " + existingRoom.getPricePerNight());

        // Use MongoTemplate to ensure pricePerNight is stored correctly as int
        Query query = new Query(Criteria.where("_id").is(id));
        Update update = new Update();
        boolean hasUpdates = false;

        // Build update object with only changed fields that were explicitly provided
        if (providedFields.contains("name") && roomDetails.getName() != null) {
            update.set("name", roomDetails.getName());
            hasUpdates = true;
            System.out.println("Adding name to update: " + roomDetails.getName());
        }
        if (providedFields.contains("type") && roomDetails.getType() != null) {
            update.set("type", roomDetails.getType().name());
            hasUpdates = true;
            System.out.println("Adding type to update: " + roomDetails.getType().name());
        }
        if (providedFields.contains("description") && roomDetails.getDescription() != null) {
            update.set("description", roomDetails.getDescription());
            hasUpdates = true;
        }
        // pricePerNight is now int (primitive)
        // Only update if pricePerNight was explicitly provided in the request
        if (providedFields.contains("pricePerNight")) {
            int newPrice = roomDetails.getPricePerNight();
            int existingPrice = existingRoom.getPricePerNight();
            System.out.println("=== PRICE UPDATE CHECK ===");
            System.out.println("Existing price: " + existingPrice);
            System.out.println("New price from request: " + newPrice);
            System.out.println("Price has changed: " + (newPrice != existingPrice));
            
            // Only update if price is > 0 and different from existing
            if (newPrice > 0 && newPrice != existingPrice) {
                System.out.println("✓ Adding pricePerNight to update: " + newPrice + " (type: int, changed from " + existingPrice + ")");
                System.out.println("  MongoDB property: 'pricePerNight'");
                System.out.println("  MongoDB value: " + Integer.valueOf(newPrice) + " (Integer)");
                // Use $set with explicit integer to ensure MongoDB stores it as a number (not string)
                // CRITICAL: Property name must be exactly "pricePerNight" as in the database
                update.set("pricePerNight", Integer.valueOf(newPrice));
                hasUpdates = true;
            } else if (newPrice <= 0) {
                System.out.println("✗ WARNING: pricePerNight is 0 or negative: " + newPrice + " (not updating)");
            } else {
                System.out.println("✗ Price unchanged: " + newPrice + " (skipping update)");
            }
        } else {
            System.out.println("✗ pricePerNight NOT in provided fields - skipping update");
        }
        // Only update capacity if it was provided in the request
        if (providedFields.contains("capacity") && roomDetails.getCapacity() > 0) {
            update.set("capacity", roomDetails.getCapacity());
            hasUpdates = true;
        }
        // Only update amenities if it was explicitly provided (not default empty list)
        if (providedFields.contains("amenities") && roomDetails.getAmenities() != null) {
            update.set("amenities", roomDetails.getAmenities());
            hasUpdates = true;
            System.out.println("Adding amenities to update: " + roomDetails.getAmenities());
        }
        if (providedFields.contains("imageUrl") && roomDetails.getImageUrl() != null) {
            update.set("imageUrl", roomDetails.getImageUrl());
            hasUpdates = true;
        }
        if (providedFields.contains("additionalImages") && roomDetails.getAdditionalImages() != null) {
            update.set("additionalImages", roomDetails.getAdditionalImages());
            hasUpdates = true;
        }
        // Only update available if it was explicitly provided in the request
        if (providedFields.contains("available")) {
            update.set("available", roomDetails.isAvailable());
            hasUpdates = true;
            System.out.println("Adding available to update: " + roomDetails.isAvailable());
        }
        if (providedFields.contains("floorNumber") && roomDetails.getFloorNumber() > 0) {
            update.set("floorNumber", roomDetails.getFloorNumber());
            hasUpdates = true;
        }
        if (providedFields.contains("size") && roomDetails.getSize() > 0) {
            update.set("size", roomDetails.getSize());
            hasUpdates = true;
        }
        if (providedFields.contains("totalRooms") && roomDetails.getTotalRooms() > 0) {
            update.set("totalRooms", roomDetails.getTotalRooms());
            hasUpdates = true;
        }

        if (!hasUpdates) {
            System.out.println("WARNING: No fields to update!");
            return existingRoom;
        }

        // Set updatedAt timestamp - convert LocalDateTime to Instant then to Date for MongoDB
        java.time.Instant now = java.time.Instant.now();
        java.util.Date updatedAtDate = java.util.Date.from(now);
        update.set("updatedAt", updatedAtDate);

        System.out.println("Executing MongoDB update with MongoTemplate...");
        System.out.println("Update object: " + update);
        System.out.println("Update document JSON: " + update.getUpdateObject().toJson());
        
        // Execute update using MongoTemplate to ensure proper type storage
        com.mongodb.client.result.UpdateResult updateResult = mongoTemplate.updateFirst(query, update, Room.class);
        System.out.println("MongoDB update executed - Matched: " + updateResult.getMatchedCount() + ", Modified: " + updateResult.getModifiedCount());
        
        // ALWAYS force update price if it was explicitly provided and different from existing
        // This ensures the price is definitely saved, even if the first update had issues
        if (providedFields.contains("pricePerNight") && roomDetails.getPricePerNight() > 0) {
            int targetPrice = roomDetails.getPricePerNight();
            int currentPrice = existingRoom.getPricePerNight();
            
            if (targetPrice != currentPrice) {
                System.out.println("=== FORCING PRICE UPDATE ===");
                System.out.println("Current price: " + currentPrice);
                System.out.println("Target price: " + targetPrice);
                
                // Use raw MongoDB operation to force update the price
                // Ensure we're using the correct collection name "rooms" and property "pricePerNight"
                org.bson.Document filterDoc = new org.bson.Document("_id", new org.bson.types.ObjectId(id));
                org.bson.Document updateDoc = new org.bson.Document("$set", 
                    new org.bson.Document("pricePerNight", Integer.valueOf(targetPrice)));
                
                System.out.println("MongoDB Update Details:");
                System.out.println("  Collection: rooms");
                System.out.println("  Filter: " + filterDoc.toJson());
                System.out.println("  Update: " + updateDoc.toJson());
                System.out.println("  Property: pricePerNight");
                System.out.println("  Value: " + targetPrice + " (type: int)");
                
                com.mongodb.client.result.UpdateResult forceUpdateResult = mongoTemplate.getCollection("rooms").updateOne(filterDoc, updateDoc);
                System.out.println("Forced update result - Matched: " + forceUpdateResult.getMatchedCount() + ", Modified: " + forceUpdateResult.getModifiedCount());
                
                if (forceUpdateResult.getMatchedCount() == 0) {
                    System.err.println("ERROR: No document matched the filter! Room ID: " + id);
                }
                
                if (forceUpdateResult.getModifiedCount() == 0) {
                    System.err.println("WARNING: Forced price update did not modify any documents!");
                }
                
                // Verify the price was saved immediately
                org.bson.Document roomDoc = mongoTemplate.getCollection("rooms")
                        .find(new org.bson.Document("_id", new org.bson.types.ObjectId(id)))
                        .first();
                if (roomDoc != null) {
                    Object priceInDb = roomDoc.get("pricePerNight");
                    System.out.println("Price in MongoDB after forced update: " + priceInDb + " (type: " + (priceInDb != null ? priceInDb.getClass().getName() : "null") + ")");
                    if (priceInDb == null || !priceInDb.equals(Integer.valueOf(targetPrice))) {
                        System.err.println("ERROR: Price still not updated! Expected: " + targetPrice + ", Got: " + priceInDb);
                        // Try one more time with a different approach
                        System.err.println("Attempting one more forced update...");
                        mongoTemplate.getCollection("rooms").updateOne(filterDoc, updateDoc);
                    } else {
                        System.out.println("✓ Price successfully updated to: " + targetPrice);
                    }
                }
            } else {
                System.out.println("Price unchanged, skipping forced update");
            }
        }

        // Fetch and return the updated room directly from MongoDB using MongoTemplate
        // Use raw query to ensure we get the latest data after all updates
        org.bson.Document roomDocAfterUpdate = mongoTemplate.getCollection("rooms")
                .find(new org.bson.Document("_id", new org.bson.types.ObjectId(id)))
                .first();
        
        System.out.println("=== AFTER UPDATE - RAW DOCUMENT ===");
        if (roomDocAfterUpdate != null) {
            Object priceInDb = roomDocAfterUpdate.get("pricePerNight");
            System.out.println("Price in raw document: " + priceInDb + " (type: " + (priceInDb != null ? priceInDb.getClass().getName() : "null") + ")");
        }
        
        // If price was updated, ensure we fetch the room AFTER the forced update
        // Add a small delay to ensure MongoDB has committed the update
        if (providedFields.contains("pricePerNight") && roomDetails.getPricePerNight() > 0) {
            try {
                Thread.sleep(100); // Small delay to ensure MongoDB commit
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        Room savedRoom = mongoTemplate.findById(id, Room.class);
        if (savedRoom == null) {
            throw new RuntimeException("Room not found after update: " + id);
        }

        System.out.println("=== AFTER SAVE ===");
        System.out.println("Saved room price: " + savedRoom.getPricePerNight());
        System.out.println("Saved room price type: int");
        
        // Final verification - query directly from MongoDB
        org.bson.Document finalRoomDoc = mongoTemplate.getCollection("rooms")
                .find(new org.bson.Document("_id", new org.bson.types.ObjectId(id)))
                .first();
        if (finalRoomDoc != null && providedFields.contains("pricePerNight")) {
            Object finalPrice = finalRoomDoc.get("pricePerNight");
            System.out.println("FINAL VERIFICATION - Price in MongoDB: " + finalPrice);
            if (finalPrice != null && !finalPrice.equals(Integer.valueOf(roomDetails.getPricePerNight()))) {
                System.err.println("CRITICAL ERROR: Price mismatch in final verification!");
                System.err.println("Expected: " + roomDetails.getPricePerNight() + ", Got: " + finalPrice);
            }
        }
        
        // Verify by querying MongoDB directly
        org.bson.Document roomDoc = mongoTemplate.getCollection("rooms")
                .find(new org.bson.Document("_id", new org.bson.types.ObjectId(id)))
                .first();
        if (roomDoc != null) {
            Object priceInDb = roomDoc.get("pricePerNight");
            System.out.println("Price in MongoDB document: " + priceInDb);
            System.out.println("Price type in MongoDB: " + (priceInDb != null ? priceInDb.getClass().getName() : "null"));
        }

        return savedRoom;
    }

    /**
     * Delete a room.
     *
     * @param id room ID
     * @throws RuntimeException if room not found
     */
    @Transactional
    public void deleteRoom(String id) {
        Room room = getRoomById(id);
        roomRepository.delete(room);
    }

    /**
     * Filter rooms by criteria.
     *
     * @param type room type (optional)
     * @param minPrice minimum price (optional)
     * @param maxPrice maximum price (optional)
     * @return list of filtered rooms
     */
    public List<Room> filterRooms(Room.RoomType type, Integer minPrice, Integer maxPrice) {
        // Start with all available rooms or rooms of specific type
        List<Room> rooms;
        if (type != null) {
            rooms = roomRepository.findByTypeAndAvailable(type, true);
        } else {
            rooms = roomRepository.findByAvailable(true);
        }

        // Apply price filters
        return rooms.stream()
                .filter(room -> {
                    int roomPrice = room.getPricePerNight();
                    boolean passesMinPrice = minPrice == null || roomPrice >= minPrice;
                    boolean passesMaxPrice = maxPrice == null || roomPrice <= maxPrice;
                    return passesMinPrice && passesMaxPrice;
                })
                .collect(Collectors.toList());
    }
}
