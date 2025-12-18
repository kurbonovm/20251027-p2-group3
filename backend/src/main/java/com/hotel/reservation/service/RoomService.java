package com.hotel.reservation.service;

import com.hotel.reservation.dto.UpdateRoomRequest;
import com.hotel.reservation.model.Room;
import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.repository.RoomRepository;
import com.hotel.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
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
     * Uses a simple approach: fetch, modify, save.
     * Validation is handled by @Valid annotation in controller.
     *
     * @param id room ID
     * @param updateRequest DTO containing fields to update (only non-null fields will be updated)
     * @return updated room
     * @throws RuntimeException if room not found
     */
    @Transactional
    public Room updateRoom(String id, UpdateRoomRequest updateRequest) {
        // Fetch existing room
        Room existingRoom = getRoomById(id);

        // Update only the fields that are provided (non-null)
        if (updateRequest.getName() != null) {
            existingRoom.setName(updateRequest.getName());
        }
        if (updateRequest.getType() != null) {
            existingRoom.setType(updateRequest.getType());
        }
        if (updateRequest.getDescription() != null) {
            existingRoom.setDescription(updateRequest.getDescription());
        }
        if (updateRequest.getPricePerNight() != null) {
            existingRoom.setPricePerNight(updateRequest.getPricePerNight());
        }
        if (updateRequest.getCapacity() != null) {
            existingRoom.setCapacity(updateRequest.getCapacity());
        }
        if (updateRequest.getAmenities() != null) {
            existingRoom.setAmenities(updateRequest.getAmenities());
        }
        if (updateRequest.getImageUrl() != null) {
            existingRoom.setImageUrl(updateRequest.getImageUrl());
        }
        if (updateRequest.getAdditionalImages() != null) {
            existingRoom.setAdditionalImages(updateRequest.getAdditionalImages());
        }
        if (updateRequest.getAvailable() != null) {
            existingRoom.setAvailable(updateRequest.getAvailable());
        }
        if (updateRequest.getFloorNumber() != null) {
            existingRoom.setFloorNumber(updateRequest.getFloorNumber());
        }
        if (updateRequest.getSize() != null) {
            existingRoom.setSize(updateRequest.getSize());
        }
        if (updateRequest.getTotalRooms() != null) {
            existingRoom.setTotalRooms(updateRequest.getTotalRooms());
        }

        // Update timestamp
        existingRoom.setUpdatedAt(java.time.LocalDateTime.now());

        // Save and return
        return roomRepository.save(existingRoom);
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
        
        // Check if room has active reservations
        List<Reservation> activeReservations = reservationRepository.findAll().stream()
            .filter(reservation -> {
                if (reservation.getRoom() == null) return false;
                return reservation.getRoom().getId().equals(id) && 
                       (reservation.getStatus() == Reservation.ReservationStatus.PENDING ||
                        reservation.getStatus() == Reservation.ReservationStatus.CONFIRMED ||
                        reservation.getStatus() == Reservation.ReservationStatus.CHECKED_IN);
            })
            .collect(Collectors.toList());
        
        if (!activeReservations.isEmpty()) {
            throw new IllegalStateException(
                "Cannot delete room with active reservations. " +
                "This room has " + activeReservations.size() + " active reservation(s). " +
                "Please wait until all active reservations are completed or cancelled."
            );
        }
        
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
