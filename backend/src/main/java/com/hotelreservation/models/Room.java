package com.hotelreservation.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Room model representing hotel rooms.
 * Maps to the rooms collection in MongoDB.
 */
@Document(collection = "rooms")
public class Room {

    @Id
    private String id;

    private String hotelId;

    private String roomNumber;

    private String roomType;

    private Double basePrice;

    private Double nightlyRate;

    private RoomStatus status;

    private Integer maxCapacity;

    private List<String> amenities;

    private String bedType;

    private List<String> images;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Constructors
    public Room() {
    }

    public Room(String id, String hotelId, String roomNumber, String roomType, Double basePrice, 
                Double nightlyRate, RoomStatus status, Integer maxCapacity, List<String> amenities, 
                String bedType, List<String> images, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.hotelId = hotelId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.basePrice = basePrice;
        this.nightlyRate = nightlyRate;
        this.status = status;
        this.maxCapacity = maxCapacity;
        this.amenities = amenities;
        this.bedType = bedType;
        this.images = images;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Room(String hotelId, String roomNumber, String roomType) {
        this.hotelId = hotelId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getHotelId() {
        return hotelId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public Double getNightlyRate() {
        return nightlyRate;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public String getBedType() {
        return bedType;
    }

    public List<String> getImages() {
        return images;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setHotelId(String hotelId) {
        this.hotelId = hotelId;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public void setNightlyRate(Double nightlyRate) {
        this.nightlyRate = nightlyRate;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public void setBedType(String bedType) {
        this.bedType = bedType;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Room status enumeration
     */
    public enum RoomStatus {
        ACTIVE,
        MAINTENANCE,
        OUT_OF_SERVICE
    }
}

