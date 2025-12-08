package com.hotelreservation.services;

import com.hotelreservation.exceptions.ResourceNotFoundException;
import com.hotelreservation.models.Hotel;
import com.hotelreservation.repositories.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for hotel management operations.
 */
@Service
public class HotelService {
    
    private final HotelRepository hotelRepository;
    
    @Autowired
    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }
    
    /**
     * Get all hotels.
     * @return List of hotels
     */
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }
    
    /**
     * Get hotel by ID.
     * @param hotelId hotel ID
     * @return Hotel
     * @throws ResourceNotFoundException if hotel not found
     */
    public Hotel getHotelById(String hotelId) {
        return hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));
    }
    
    /**
     * Create a new hotel.
     * @param hotel hotel to create
     * @return Created hotel
     */
    public Hotel createHotel(Hotel hotel) {
        hotel.setCreatedAt(LocalDateTime.now());
        hotel.setUpdatedAt(LocalDateTime.now());
        return hotelRepository.save(hotel);
    }
    
    /**
     * Update an existing hotel.
     * @param hotelId hotel ID
     * @param hotel updated hotel data
     * @return Updated hotel
     * @throws ResourceNotFoundException if hotel not found
     */
    public Hotel updateHotel(String hotelId, Hotel hotel) {
        Hotel existingHotel = getHotelById(hotelId);
        existingHotel.setName(hotel.getName());
        existingHotel.setUpdatedAt(LocalDateTime.now());
        return hotelRepository.save(existingHotel);
    }
    
    /**
     * Delete a hotel.
     * @param hotelId hotel ID
     * @throws ResourceNotFoundException if hotel not found
     */
    public void deleteHotel(String hotelId) {
        Hotel hotel = getHotelById(hotelId);
        hotelRepository.delete(hotel);
    }
}

