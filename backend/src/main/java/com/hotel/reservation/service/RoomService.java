package com.hotel.reservation.service;

import com.hotel.reservation.dto.RoomAvailabilityDTO;
import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.model.Room;
import com.hotel.reservation.repository.RoomRepository;
import com.hotel.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
     * Get all rooms with availability status for specific dates.
     * If no dates provided, returns all rooms with general occupancy status.
     *
     * @param checkInDate check-in date (optional)
     * @param checkOutDate check-out date (optional)
     * @param guests number of guests (optional)
     * @return list of rooms with availability information
     */
    public List<RoomAvailabilityDTO> getAllRoomsWithAvailability(
            LocalDate checkInDate, LocalDate checkOutDate, Integer guests) {

        List<Room> allRooms = roomRepository.findAll();

        // Filter by capacity if guests specified
        if (guests != null && guests > 0) {
            allRooms = allRooms.stream()
                    .filter(room -> room.getCapacity() >= guests)
                    .collect(Collectors.toList());
        }

        return allRooms.stream()
                .map(room -> {
                    RoomAvailabilityDTO dto = new RoomAvailabilityDTO();
                    dto.setRoom(room);

                    // Assume totalRooms = 1 for each room (or use room.getTotalRooms() if you have that field)
                    Integer totalRoomsValue = room.getTotalRooms();
                    int totalRooms = (totalRoomsValue != null && totalRoomsValue > 0) ? totalRoomsValue : 1;
                    dto.setTotalRooms(totalRooms);

                    // Check availability for specific dates
                    if (checkInDate != null && checkOutDate != null) {
                        boolean isAvailable = isRoomAvailable(room.getId(), checkInDate, checkOutDate);
                        dto.setAvailable(isAvailable);

                        // Count occupied rooms for this date range
                        List<?> overlappingReservations = reservationRepository
                                .findOverlappingReservations(room.getId(), checkInDate, checkOutDate);
                        int occupiedCount = overlappingReservations.size();
                        dto.setOccupiedCount(occupiedCount);

                        int availableCount = totalRooms - occupiedCount;
                        dto.setAvailableCount(Math.max(0, availableCount));

                        // Determine status and set user-friendly messages
                        if (availableCount <= 0) {
                            dto.setStatus(RoomAvailabilityDTO.AvailabilityStatus.FULLY_BOOKED);
                            dto.setAvailabilityMessage("Fully Booked");
                            dto.setAvailabilityIcon("❌");
                        } else if (availableCount == 1) {
                            dto.setStatus(RoomAvailabilityDTO.AvailabilityStatus.LIMITED);
                            dto.setAvailabilityMessage("Last room available!");
                            dto.setAvailabilityIcon("⚠️");
                        } else if (availableCount == 2) {
                            dto.setStatus(RoomAvailabilityDTO.AvailabilityStatus.LIMITED);
                            dto.setAvailabilityMessage("Only 2 rooms left!");
                            dto.setAvailabilityIcon("⚠️");
                        } else {
                            dto.setStatus(RoomAvailabilityDTO.AvailabilityStatus.AVAILABLE);
                            dto.setAvailabilityMessage("Available");
                            dto.setAvailabilityIcon("✅");
                        }
                    } else {
                        // No dates specified - show general occupancy
                        List<Reservation> allReservations = reservationRepository.findByRoom(room)
                                .stream()
                                .filter(r -> r.getStatus() == Reservation.ReservationStatus.CONFIRMED ||
                                           r.getStatus() == Reservation.ReservationStatus.CHECKED_IN)
                                .collect(Collectors.toList());

                        int occupiedCount = allReservations.size();
                        dto.setOccupiedCount(occupiedCount);

                        int availableCount = totalRooms - occupiedCount;
                        dto.setAvailableCount(Math.max(0, availableCount));
                        dto.setAvailable(availableCount > 0);

                        // Status based on current occupancy (browse mode - no dates)
                        if (availableCount <= 0) {
                            dto.setStatus(RoomAvailabilityDTO.AvailabilityStatus.FULLY_BOOKED);
                            dto.setAvailabilityMessage("Fully Occupied");
                            dto.setAvailabilityIcon("🏨");
                        } else if (availableCount < 3) {
                            dto.setStatus(RoomAvailabilityDTO.AvailabilityStatus.LIMITED);
                            dto.setAvailabilityMessage("Select dates to check availability");
                            dto.setAvailabilityIcon("🏨");
                        } else {
                            dto.setStatus(RoomAvailabilityDTO.AvailabilityStatus.AVAILABLE);
                            dto.setAvailabilityMessage("Select dates to check availability");
                            dto.setAvailabilityIcon("🏨");
                        }
                    }

                    return dto;
                })
                .collect(Collectors.toList());
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
    public Room updateRoom(String id, Room roomDetails) {
        Room room = getRoomById(id);

        room.setName(roomDetails.getName());
        room.setType(roomDetails.getType());
        room.setDescription(roomDetails.getDescription());
        room.setPricePerNight(roomDetails.getPricePerNight());
        room.setCapacity(roomDetails.getCapacity());
        room.setAmenities(roomDetails.getAmenities());
        room.setImageUrl(roomDetails.getImageUrl());
        room.setAdditionalImages(roomDetails.getAdditionalImages());
        room.setAvailable(roomDetails.isAvailable());
        room.setFloorNumber(roomDetails.getFloorNumber());
        room.setSize(roomDetails.getSize());

        return roomRepository.save(room);
    }

    /**
     * Delete a room.
     * Prevents deletion if the room has any active reservations.
     *
     * @param id room ID
     * @throws RuntimeException if room not found or has active reservations
     */
    @Transactional
    public void deleteRoom(String id) {
        Room room = getRoomById(id);

        // Check for any active reservations (PENDING, CONFIRMED, CHECKED_IN)
        List<Reservation> activeReservations = reservationRepository.findByRoom(room)
                .stream()
                .filter(reservation ->
                    reservation.getStatus() == Reservation.ReservationStatus.PENDING ||
                    reservation.getStatus() == Reservation.ReservationStatus.CONFIRMED ||
                    reservation.getStatus() == Reservation.ReservationStatus.CHECKED_IN)
                .collect(Collectors.toList());

        if (!activeReservations.isEmpty()) {
            throw new RuntimeException(
                String.format("Cannot delete room '%s'. It has %d active reservation(s). " +
                             "Please cancel all active reservations before deleting this room.",
                             room.getName(), activeReservations.size())
            );
        }

        // Also check for future reservations (even if checked out in the past)
        List<Reservation> futureReservations = reservationRepository.findByRoom(room)
                .stream()
                .filter(reservation ->
                    (reservation.getStatus() == Reservation.ReservationStatus.CONFIRMED ||
                     reservation.getStatus() == Reservation.ReservationStatus.PENDING) &&
                    reservation.getCheckInDate().isAfter(LocalDate.now()))
                .collect(Collectors.toList());

        if (!futureReservations.isEmpty()) {
            throw new RuntimeException(
                String.format("Cannot delete room '%s'. It has %d future reservation(s). " +
                             "Please cancel all future reservations before deleting this room.",
                             room.getName(), futureReservations.size())
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
    public List<Room> filterRooms(Room.RoomType type, BigDecimal minPrice, BigDecimal maxPrice) {
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
                    boolean passesMinPrice = minPrice == null || room.getPricePerNight().compareTo(minPrice) >= 0;
                    boolean passesMaxPrice = maxPrice == null || room.getPricePerNight().compareTo(maxPrice) <= 0;
                    return passesMinPrice && passesMaxPrice;
                })
                .collect(Collectors.toList());
    }
}
