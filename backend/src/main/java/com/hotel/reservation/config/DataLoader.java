package com.hotel.reservation.config;

import com.hotel.reservation.model.Room;
import com.hotel.reservation.model.User;
import com.hotel.reservation.repository.RoomRepository;
import com.hotel.reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Data loader to initialize the database with sample data.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Starting data initialization...");

        // Only load data if database is empty
        if (roomRepository.count() == 0) {
            loadRooms();
            log.info("Sample rooms loaded successfully!");
        } else {
            log.info("Database already contains data. Skipping initialization.");
        }

        // Create default users if not exist
        if (userRepository.findByEmail("admin@hotel.com").isEmpty()) {
            createAdminUser();
            log.info("Default admin user created!");
        }

        if (userRepository.findByEmail("manager@hotel.com").isEmpty()) {
            createManagerUser();
            log.info("Default manager user created!");
        }

        if (userRepository.findByEmail("guest@hotel.com").isEmpty()) {
            createGuestUser();
            log.info("Default guest user created!");
        }
    }

    private void loadRooms() {
        List<Room> rooms = Arrays.asList(
            // ============ STANDARD ROOMS (10) ============
            createRoom("Standard Ocean Breeze", "STANDARD",
                "Comfortable room with ocean views and modern amenities. Perfect for budget-conscious travelers.",
                149.99, 2, 40,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
                ),
                Arrays.asList("Queen Bed", "Ocean View", "Free WiFi", "Air Conditioning", "TV", "Private Bathroom"),
                "QUEEN", "OCEAN", 3, 5, true, false, false),

            createRoom("Standard City Lights", "STANDARD",
                "Modern room with stunning city views. Ideal for business travelers.",
                139.99, 2, 38,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("King Bed", "City View", "Work Desk", "Free WiFi", "Coffee Maker", "TV"),
                "KING", "CITY", 5, 4, false, true, false),

            createRoom("Standard Garden Paradise", "STANDARD",
                "Peaceful room overlooking lush gardens. Great for relaxation.",
                129.99, 2, 35,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
                ),
                Arrays.asList("Double Bed", "Garden View", "Free WiFi", "Mini Fridge", "Air Conditioning"),
                "DOUBLE", "GARDEN", 2, 6, false, false, true),

            createRoom("Standard Twin Comfort", "STANDARD",
                "Perfect for friends or colleagues. Two comfortable single beds.",
                159.99, 2, 42,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
                ),
                Arrays.asList("Twin Beds", "City View", "Work Desk", "Free WiFi", "TV", "Private Bathroom"),
                "TWIN", "CITY", 4, 5, true, true, false),

            createRoom("Standard Mountain View", "STANDARD",
                "Breathtaking mountain views from your window. Cozy and affordable.",
                144.99, 2, 40,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
                ),
                Arrays.asList("Queen Bed", "Mountain View", "Free WiFi", "Air Conditioning", "Coffee Maker"),
                "QUEEN", "MOUNTAIN", 6, 4, false, false, false),

            createRoom("Standard Pool View", "STANDARD",
                "Overlooks the hotel pool area. Lively atmosphere.",
                134.99, 2, 36,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("King Bed", "Pool View", "Free WiFi", "TV", "Mini Bar", "Air Conditioning"),
                "KING", "POOL", 2, 5, false, false, false),

            createRoom("Standard Courtyard Retreat", "STANDARD",
                "Quiet courtyard views. Perfect for a peaceful stay.",
                124.99, 2, 34,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
                ),
                Arrays.asList("Double Bed", "Courtyard View", "Free WiFi", "TV", "Work Desk"),
                "DOUBLE", "COURTYARD", 1, 6, true, false, true),

            createRoom("Standard Single Traveler", "STANDARD",
                "Compact and cozy for solo travelers. Budget-friendly.",
                89.99, 1, 25,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
                ),
                Arrays.asList("Single Bed", "City View", "Free WiFi", "TV", "Work Desk"),
                "SINGLE", "CITY", 3, 8, false, true, false),

            createRoom("Standard Triple Share", "STANDARD",
                "Great for small groups. Three beds in spacious room.",
                189.99, 3, 48,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
                ),
                Arrays.asList("Three Single Beds", "Garden View", "Free WiFi", "TV", "Mini Fridge", "Air Conditioning"),
                "TWIN", "GARDEN", 2, 4, false, false, false),

            createRoom("Standard Accessible Plus", "STANDARD",
                "Fully accessible room with all modern amenities.",
                154.99, 2, 45,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
                ),
                Arrays.asList("Queen Bed", "Ocean View", "Wheelchair Accessible", "Grab Bars", "Wide Doorways", "Roll-in Shower"),
                "QUEEN", "OCEAN", 1, 3, true, true, true),

            // ============ DELUXE ROOMS (10) ============
            createRoom("Deluxe Ocean Paradise", "DELUXE",
                "Luxurious ocean-front room with private balcony and premium amenities.",
                299.99, 4, 85,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                ),
                Arrays.asList("King Bed", "Ocean View", "Private Balcony", "Mini Bar", "Smart TV", "Premium Toiletries", "Room Service"),
                "KING", "OCEAN", 8, 4, false, false, false),

            createRoom("Deluxe Executive Suite", "DELUXE",
                "Perfect for business travelers with work area and city views.",
                279.99, 2, 75,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("Queen Bed", "City View", "Work Desk", "Ergonomic Chair", "Coffee Maker", "Smart TV", "High-Speed WiFi"),
                "QUEEN", "CITY", 10, 3, false, true, false),

            createRoom("Deluxe Garden Oasis", "DELUXE",
                "Elegant room with garden terrace access. Peaceful and luxurious.",
                269.99, 2, 70,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("King Bed", "Garden View", "Terrace Access", "Mini Bar", "Bathtub", "Premium Bedding"),
                "KING", "GARDEN", 1, 4, true, false, false),

            createRoom("Deluxe Honeymoon Suite", "DELUXE",
                "Romantic suite with champagne, rose petals, and jacuzzi tub.",
                349.99, 2, 95,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("King Bed", "Ocean View", "Jacuzzi Tub", "Champagne", "Rose Petals", "Fireplace", "Private Balcony"),
                "KING", "OCEAN", 12, 2, false, false, false),

            createRoom("Deluxe Mountain Retreat", "DELUXE",
                "Stunning mountain views with cozy fireplace and premium comfort.",
                289.99, 3, 80,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                ),
                Arrays.asList("King Bed", "Mountain View", "Fireplace", "Balcony", "Mini Bar", "Premium Bedding"),
                "KING", "MOUNTAIN", 9, 3, false, false, false),

            createRoom("Deluxe Pool View Luxury", "DELUXE",
                "Overlooks infinity pool with direct pool access. Ultimate relaxation.",
                274.99, 2, 72,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("Queen Bed", "Pool View", "Direct Pool Access", "Smart TV", "Mini Bar", "Bathrobe & Slippers"),
                "QUEEN", "POOL", 1, 4, false, false, false),

            createRoom("Deluxe Twin Elegance", "DELUXE",
                "Spacious deluxe room with twin beds. Perfect for friends traveling together.",
                284.99, 2, 78,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                ),
                Arrays.asList("Twin Beds", "City View", "Work Desk", "Mini Bar", "Smart TV", "Premium Toiletries"),
                "TWIN", "CITY", 7, 3, false, true, false),

            createRoom("Deluxe Courtyard Serenity", "DELUXE",
                "Private courtyard access with zen garden views. Tranquil escape.",
                264.99, 2, 68,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("King Bed", "Courtyard View", "Private Garden Access", "Tea Set", "Smart TV", "Premium Bedding"),
                "KING", "COURTYARD", 1, 3, true, false, true),

            createRoom("Deluxe Accessible Premium", "DELUXE",
                "Luxury accessible room with all premium amenities and features.",
                309.99, 2, 88,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("Queen Bed", "Ocean View", "Wheelchair Accessible", "Roll-in Shower", "Grab Bars", "Emergency Call System", "Wide Doorways"),
                "QUEEN", "OCEAN", 1, 2, true, true, true),

            createRoom("Deluxe Double Comfort Plus", "DELUXE",
                "Enhanced comfort with premium bedding and modern amenities.",
                259.99, 2, 65,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                ),
                Arrays.asList("Double Bed", "Garden View", "Mini Bar", "Smart TV", "Coffee Maker", "Premium Toiletries"),
                "DOUBLE", "GARDEN", 4, 4, false, false, false),

            // ============ SUITE ROOMS (10) ============
            createRoom("Presidential Suite", "SUITE",
                "The ultimate luxury. Spacious living area, dining room, and panoramic ocean views.",
                599.99, 6, 180,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                ),
                Arrays.asList("King Bed", "Living Room", "Dining Area", "Full Kitchen", "Panoramic Ocean View", "Jacuzzi", "Private Balcony", "Butler Service", "Premium Bar"),
                "KING", "OCEAN", 15, 1, false, false, false),

            createRoom("Family Paradise Suite", "SUITE",
                "Perfect for families. Multiple bedrooms and kid-friendly amenities.",
                399.99, 6, 140,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800"
                ),
                Arrays.asList("King Bed", "Sofa Bed", "Kids Room", "Living Room", "Kitchenette", "Two Bathrooms", "Kids Welcome Pack", "Family Games", "Ocean View"),
                "KING", "OCEAN", 10, 2, false, false, false),

            createRoom("Penthouse Sky Suite", "SUITE",
                "Top floor luxury with private elevator and rooftop terrace.",
                799.99, 4, 220,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1571508601936-4e3f0d229c47?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("King Bed", "Private Elevator", "Rooftop Terrace", "Full Kitchen", "Wine Cellar", "Home Theater", "Gym", "360° City View"),
                "KING", "CITY", 20, 1, false, false, false),

            createRoom("Executive Business Suite", "SUITE",
                "Luxury suite designed for business executives with office space.",
                449.99, 3, 120,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("King Bed", "Private Office", "Meeting Area", "Kitchenette", "City View", "Executive Desk", "High-Speed WiFi", "Printer"),
                "KING", "CITY", 12, 2, false, true, false),

            createRoom("Garden Villa Suite", "SUITE",
                "Private garden villa with direct garden access and outdoor patio.",
                479.99, 4, 160,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("King Bed", "Living Room", "Garden Access", "Outdoor Patio", "BBQ Grill", "Kitchenette", "Garden View", "Private Entrance"),
                "KING", "GARDEN", 1, 2, true, false, false),

            createRoom("Romantic Honeymoon Suite", "SUITE",
                "Ultimate romantic getaway with ocean views and private hot tub.",
                529.99, 2, 130,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("King Bed", "Ocean View", "Private Hot Tub", "Champagne Bar", "Rose Service", "Fireplace", "Sound System", "Private Balcony"),
                "KING", "OCEAN", 14, 2, false, false, false),

            createRoom("Mountain View Grand Suite", "SUITE",
                "Spectacular mountain views with fireplace and luxury amenities.",
                469.99, 4, 145,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                ),
                Arrays.asList("King Bed", "Living Room", "Mountain View", "Fireplace", "Balcony", "Kitchenette", "Dining Area", "Premium Bar"),
                "KING", "MOUNTAIN", 11, 2, false, false, false),

            createRoom("Pool Villa Suite", "SUITE",
                "Private pool villa with direct pool access and outdoor living.",
                549.99, 4, 170,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("King Bed", "Living Room", "Private Pool", "Outdoor Lounge", "Pool View", "BBQ Area", "Full Kitchen", "Sun Deck"),
                "KING", "POOL", 1, 2, false, false, false),

            createRoom("Courtyard Luxury Suite", "SUITE",
                "Serene courtyard suite with zen garden and meditation area.",
                429.99, 3, 125,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("Queen Bed", "Living Room", "Courtyard View", "Zen Garden", "Meditation Area", "Tea Room", "Kitchenette", "Private Patio"),
                "QUEEN", "COURTYARD", 2, 2, true, false, true),

            createRoom("Accessible Grand Suite", "SUITE",
                "Fully accessible luxury suite with all modern conveniences.",
                489.99, 4, 155,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("King Bed", "Living Room", "Ocean View", "Wheelchair Accessible", "Roll-in Shower", "Wide Doorways", "Lowered Counters", "Emergency System", "Kitchenette"),
                "KING", "OCEAN", 1, 1, true, true, true),

            // ============ PRESIDENTIAL ROOMS (10) ============
            createRoom("Royal Presidential Suite", "PRESIDENTIAL",
                "The crown jewel. Multi-room suite with butler, chef, and limousine service.",
                1299.99, 8, 350,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                ),
                Arrays.asList("2 King Beds", "Master Suite", "3 Bathrooms", "Full Kitchen", "Dining Room", "Cinema Room", "Gym", "Sauna", "Butler Service", "Private Chef", "Limousine"),
                "KING", "OCEAN", 25, 1, false, false, false),

            createRoom("Imperial Penthouse", "PRESIDENTIAL",
                "Unmatched luxury on the top floor with helicopter pad access.",
                1599.99, 10, 400,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1571508601936-4e3f0d229c47?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("3 King Beds", "4 Bathrooms", "Living Room", "Dining Room", "Full Kitchen", "Wine Cellar", "Library", "Home Theater", "Private Gym", "Helipad Access"),
                "KING", "CITY", 30, 1, false, false, false),

            createRoom("Grand Diplomatic Suite", "PRESIDENTIAL",
                "Designed for diplomats and VIPs. Enhanced security and privacy.",
                1199.99, 6, 320,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("2 King Beds", "Living Room", "Conference Room", "Dining Area", "Full Kitchen", "Butler Service", "Security Features", "Private Elevator", "City View"),
                "KING", "CITY", 22, 1, false, true, false),

            createRoom("Celebrity Paradise Suite", "PRESIDENTIAL",
                "Ultimate privacy with ocean views and celebrity-grade amenities.",
                1399.99, 6, 340,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("2 King Beds", "Ocean View", "Private Pool", "Recording Studio", "Home Theater", "Full Kitchen", "Butler", "Private Chef", "Spa Room"),
                "KING", "OCEAN", 26, 1, false, false, false),

            createRoom("Executive Tower Suite", "PRESIDENTIAL",
                "Business luxury at its finest with office space and meeting rooms.",
                1099.99, 6, 300,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("King Bed", "Queen Bed", "Private Office", "Board Room", "Full Kitchen", "City View", "Butler Service", "Business Center", "High-Speed WiFi"),
                "KING", "CITY", 20, 1, false, true, false),

            createRoom("Garden Palace Suite", "PRESIDENTIAL",
                "Private garden estate with outdoor pavilion and tropical views.",
                1249.99, 8, 360,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("2 King Beds", "Garden View", "Private Garden", "Outdoor Pavilion", "BBQ Area", "Full Kitchen", "Butler Service", "Spa Bath", "Private Entrance"),
                "KING", "GARDEN", 1, 1, true, false, false),

            createRoom("Royal Mountain Villa", "PRESIDENTIAL",
                "Mountain-top luxury with panoramic views and private cable car.",
                1349.99, 7, 330,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                ),
                Arrays.asList("2 King Beds", "Mountain View", "Private Cable Car", "Fireplace", "Full Kitchen", "Wine Cellar", "Butler Service", "Outdoor Terrace", "Hot Tub"),
                "KING", "MOUNTAIN", 15, 1, false, false, false),

            createRoom("Infinity Pool Villa", "PRESIDENTIAL",
                "Private infinity pool with ocean views and luxury outdoor living.",
                1449.99, 6, 370,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("2 King Beds", "Ocean View", "Private Infinity Pool", "Outdoor Kitchen", "Sun Deck", "Full Kitchen", "Butler Service", "Beach Access", "Cabana"),
                "KING", "OCEAN", 1, 1, false, false, false),

            createRoom("Wellness Presidential Suite", "PRESIDENTIAL",
                "Health-focused luxury with gym, yoga studio, and spa.",
                1179.99, 6, 310,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                ),
                Arrays.asList("King Bed", "Queen Bed", "Private Gym", "Yoga Studio", "Spa Room", "Sauna", "Full Kitchen", "Garden View", "Butler Service", "Personal Trainer"),
                "KING", "GARDEN", 3, 1, true, false, true),

            createRoom("Ultimate Accessible Presidential", "PRESIDENTIAL",
                "Fully accessible presidential suite with all luxury amenities.",
                1299.99, 6, 345,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"
                ),
                Arrays.asList("2 King Beds", "Ocean View", "Wheelchair Accessible", "Roll-in Shower", "Wide Doorways", "Lowered Features", "Emergency System", "Full Kitchen", "Butler Service", "Private Elevator"),
                "KING", "OCEAN", 1, 1, true, true, true)
        );

        roomRepository.saveAll(rooms);
    }

    private Room createRoom(String name, String type, String description, double price,
                          int capacity, double size, List<String> images, List<String> amenities,
                          String bedType, String viewType, int floorNumber, int totalRooms,
                          boolean wheelchairAccessible, boolean hearingAccessible, boolean visualAccessible) {
        Room room = new Room();
        room.setName(name);
        room.setType(Room.RoomType.valueOf(type));
        room.setDescription(description);
        room.setPricePerNight(java.math.BigDecimal.valueOf(price));
        room.setCapacity(capacity);
        room.setSize((int) size);
        room.setImageUrl(images.get(0)); // First image as primary
        room.setAdditionalImages(images.subList(1, images.size())); // Rest as additional
        room.setAmenities(amenities);
        room.setAvailable(true);
        room.setBedType(bedType);
        room.setViewType(viewType);
        room.setFloorNumber(floorNumber);
        room.setTotalRooms(totalRooms);
        room.setWheelchairAccessible(wheelchairAccessible);
        room.setHearingAccessible(hearingAccessible);
        room.setVisualAccessible(visualAccessible);
        return room;
    }

    private void createAdminUser() {
        User admin = new User();
        admin.setEmail("admin@hotel.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setPhoneNumber("+1234567890");
        admin.setEnabled(true);
        admin.getRoles().add(User.Role.ADMIN);
        userRepository.save(admin);

        log.info("=".repeat(60));
        log.info("Default Admin User Created:");
        log.info("Email: admin@hotel.com");
        log.info("Password: admin123");
        log.info("=".repeat(60));
    }

    private void createManagerUser() {
        User manager = new User();
        manager.setEmail("manager@hotel.com");
        manager.setPassword(passwordEncoder.encode("manager123"));
        manager.setFirstName("Manager");
        manager.setLastName("User");
        manager.setPhoneNumber("+1234567891");
        manager.setEnabled(true);
        manager.getRoles().add(User.Role.MANAGER);
        userRepository.save(manager);

        log.info("=".repeat(60));
        log.info("Default Manager User Created:");
        log.info("Email: manager@hotel.com");
        log.info("Password: manager123");
        log.info("=".repeat(60));
    }

    private void createGuestUser() {
        User guest = new User();
        guest.setEmail("guest@hotel.com");
        guest.setPassword(passwordEncoder.encode("guest123"));
        guest.setFirstName("Guest");
        guest.setLastName("User");
        guest.setPhoneNumber("+1234567892");
        guest.setEnabled(true);
        guest.getRoles().add(User.Role.GUEST);
        userRepository.save(guest);

        log.info("=".repeat(60));
        log.info("Default Guest User Created:");
        log.info("Email: guest@hotel.com");
        log.info("Password: guest123");
        log.info("=".repeat(60));
    }
}
