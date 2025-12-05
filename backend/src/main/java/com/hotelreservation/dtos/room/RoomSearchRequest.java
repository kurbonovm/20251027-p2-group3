package com.hotelreservation.dtos.room;

import com.hotelreservation.models.Room2;

/**
 * DTO for room search with filters.
 */
public class RoomSearchRequest {
    
    private String roomType;
    private Double minPrice;
    private Double maxPrice;
    private String[] amenities;
    private String bedType;
    private Room2.RoomStatus status;
    
    public RoomSearchRequest() {
    }
    
    // Getters and Setters
    public String getRoomType() {
        return roomType;
    }
    
    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }
    
    public Double getMinPrice() {
        return minPrice;
    }
    
    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }
    
    public Double getMaxPrice() {
        return maxPrice;
    }
    
    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }
    
    public String[] getAmenities() {
        return amenities;
    }
    
    public void setAmenities(String[] amenities) {
        this.amenities = amenities;
    }
    
    public String getBedType() {
        return bedType;
    }
    
    public void setBedType(String bedType) {
        this.bedType = bedType;
    }
    
    public Room2.RoomStatus getStatus() {
        return status;
    }
    
    public void setStatus(Room2.RoomStatus status) {
        this.status = status;
    }
}

