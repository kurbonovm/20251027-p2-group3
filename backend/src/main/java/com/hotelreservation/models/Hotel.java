package com.hotelreservation.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Hotel model representing hotels in the Hotel Reservation System.
 * Maps to the hotels collection in MongoDB.
 */
@Document(collection = "hotels")
public class Hotel {

    @Id
    private String id;

    private String name;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Constructors
    public Hotel() {
    }

    public Hotel(String id, String name, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Hotel(String name, LocalDateTime createdAt) {
        this.name = name;
        this.createdAt = createdAt;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
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

    public void setName(String name) {
        this.name = name;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

