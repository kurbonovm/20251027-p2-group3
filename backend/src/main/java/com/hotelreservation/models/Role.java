package com.hotelreservation.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Role model representing user roles and their permissions.
 * Maps to the roles collection in MongoDB.
 */
@Document(collection = "roles")
public class Role {

    @Id
    private String id; // e.g. "64f0c2a0b1c2d3e4f5a6b7c1"

    private String name; // ADMIN, MANAGER, GUEST, CUSTOMER, etc.

    private List<String> permissions; // e.g. ["CREATE_ROOM", "VIEW_ROOM", ...]

    // Constructors
    public Role() {
    }

    public Role(String id, String name, List<String> permissions) {
        this.id = id;
        this.name = name;
        this.permissions = permissions;
    }

    public Role(String name, List<String> permissions) {
        this.name = name;
        this.permissions = permissions;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }
}

