package com.hotelreservation.dtos.room;

import com.hotelreservation.models.Room2;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for room response.
 */
public class RoomResponse {
    
    private String id;
    private String hotelId;
    private String roomNumber;
    private String roomType;
    private Double basePrice;
    private Double nightlyRate;
    private Room2.RoomStatus status;
    private Integer maxCapacity;
    private List<String> amenities;
    private String bedType;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public RoomResponse() {
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public Room2.RoomStatus getStatus() {
        return status;
    }
    
    public void setStatus(Room2.RoomStatus status) {
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

