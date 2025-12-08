package com.hotelreservation.dtos.room;

import com.hotelreservation.models.Room;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

/**
 * DTO for creating or updating a room.
 */
public class RoomRequest {
    
    @NotBlank(message = "Hotel ID is required")
    private String hotelId;
    
    @NotBlank(message = "Room number is required")
    private String roomNumber;
    
    @NotBlank(message = "Room type is required")
    private String roomType;
    
    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    private Double basePrice;
    
    @NotNull(message = "Nightly rate is required")
    @Positive(message = "Nightly rate must be positive")
    private Double nightlyRate;
    
    @NotNull(message = "Status is required")
    private Room.RoomStatus status;
    
    @NotNull(message = "Max capacity is required")
    @Min(value = 1, message = "Max capacity must be at least 1")
    private Integer maxCapacity;
    
    private List<String> amenities;
    
    private String bedType;
    
    private List<String> images;
    
    public RoomRequest() {
    }
    
    // Getters and Setters
    public String getHotelId() {
        return hotelId;
    }
    
    public void setHotelId(String hotelId) {
        this.hotelId = hotelId;
    }
    
    public String getRoomNumber() {
        return roomNumber;
    }
    
    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
    
    public String getRoomType() {
        return roomType;
    }
    
    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }
    
    public Double getBasePrice() {
        return basePrice;
    }
    
    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }
    
    public Double getNightlyRate() {
        return nightlyRate;
    }
    
    public void setNightlyRate(Double nightlyRate) {
        this.nightlyRate = nightlyRate;
    }
    
    public Room.RoomStatus getStatus() {
        return status;
    }
    
    public void setStatus(Room.RoomStatus status) {
        this.status = status;
    }
    
    public Integer getMaxCapacity() {
        return maxCapacity;
    }
    
    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }
    
    public List<String> getAmenities() {
        return amenities;
    }
    
    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }
    
    public String getBedType() {
        return bedType;
    }
    
    public void setBedType(String bedType) {
        this.bedType = bedType;
    }
    
    public List<String> getImages() {
        return images;
    }
    
    public void setImages(List<String> images) {
        this.images = images;
    }
}

