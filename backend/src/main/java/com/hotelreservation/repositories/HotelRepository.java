package com.hotelreservation.repositories;

import com.hotelreservation.models.Hotel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Hotel entity.
 */
@Repository
public interface HotelRepository extends MongoRepository<Hotel, String> {
    // Basic CRUD operations provided by MongoRepository
}

