package com.hotel.reservation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Main application class for the Hotel Reservation System.
 * This class bootstraps the Spring Boot application.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@SpringBootApplication
@EnableMongoAuditing
public class HotelReservationApplication {

    /**
     * Main entry point for the application.
     *
     * @param args command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(HotelReservationApplication.class, args);
    }
}
