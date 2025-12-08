package com.hotelreservation.services;

import com.hotelreservation.dtos.room.RoomAvailabilityRequest;
import com.hotelreservation.models.Room;
import com.hotelreservation.models.RoomAvailabilitySnapshot;
import com.hotelreservation.repositories.RoomRepository;
import com.hotelreservation.repositories.RoomAvailabilitySnapshotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for room availability management.
 */
@Service
public class AvailabilityService {
    
    private final RoomRepository roomRepository;
    private final RoomAvailabilitySnapshotRepository snapshotRepository;
    private final ReservationService reservationService;
    
    @Autowired
    public AvailabilityService(RoomRepository roomRepository,
                               RoomAvailabilitySnapshotRepository snapshotRepository,
                               @org.springframework.context.annotation.Lazy ReservationService reservationService) {
        this.roomRepository = roomRepository;
        this.snapshotRepository = snapshotRepository;
        this.reservationService = reservationService;
    }
    
    /**
     * Check room availability for given dates.
     * @param request availability request
     * @return List of available rooms
     */
    public List<Room> checkAvailability(RoomAvailabilityRequest request) {
        List<Room> rooms;
        
        if (request.getRoomType() != null) {
            rooms = roomRepository.findByHotelIdAndRoomTypeAndStatus(
                    request.getHotelId(), request.getRoomType(), Room.RoomStatus.ACTIVE);
        } else {
            rooms = roomRepository.findByHotelIdAndStatus(request.getHotelId(), Room.RoomStatus.ACTIVE);
        }
        
        // Filter by capacity if specified
        if (request.getNumberOfGuests() != null) {
            rooms = rooms.stream()
                    .filter(room -> room.getMaxCapacity() >= request.getNumberOfGuests())
                    .collect(Collectors.toList());
        }
        
        // TODO: Check actual availability against reservations
        // This would involve checking ReservationRepository for overlapping reservations
        
        return rooms;
    }
    
    /**
     * Create or update availability snapshot.
     * @param hotelId hotel ID
     * @param roomType room type
     * @param date date
     * @param totalRooms total rooms
     * @param roomsBooked rooms booked
     * @return Snapshot
     */
    public RoomAvailabilitySnapshot createSnapshot(String hotelId, String roomType, LocalDate date,
                                                   Integer totalRooms, Integer roomsBooked) {
        RoomAvailabilitySnapshot snapshot = snapshotRepository
                .findByHotelIdAndRoomTypeAndDate(hotelId, roomType, date)
                .orElse(new RoomAvailabilitySnapshot());
        
        snapshot.setHotelId(hotelId);
        snapshot.setRoomType(roomType);
        snapshot.setDate(date);
        snapshot.setTotalRooms(totalRooms);
        snapshot.setRoomsBooked(roomsBooked);
        snapshot.setRoomsAvailable(totalRooms - roomsBooked);
        
        return snapshotRepository.save(snapshot);
    }
}

