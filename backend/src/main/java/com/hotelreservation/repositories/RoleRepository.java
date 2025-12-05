package com.hotelreservation.repositories;

import com.hotelreservation.models.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Role entity.
 */
@Repository
public interface RoleRepository extends MongoRepository<Role, String> {
    
    /**
     * Find role by name.
     * @param name role name
     * @return Optional Role
     */
    Optional<Role> findByName(String name);
    
    /**
     * Check if role exists by name.
     * @param name role name
     * @return true if exists
     */
    boolean existsByName(String name);
}

