// MongoDB seed data script for Hotel Reservation System
// Run with: mongosh hotel_reservation seed-data.js

// Clear existing data (optional - comment out if you want to keep existing data)
db.users.deleteMany({});
db.rooms.deleteMany({});
db.reservations.deleteMany({});
db.payments.deleteMany({});

print('Clearing existing data...');

// Create sample users
// Password for all users: "password123" (hashed with BCrypt)
const users = [
  {
    email: "admin@hotel.com",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // password123
    firstName: "Admin",
    lastName: "User",
    phoneNumber: "+1234567890",
    roles: ["ADMIN", "MANAGER", "GUEST"],
    provider: null,
    providerId: null,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: "manager@hotel.com",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // password123
    firstName: "Manager",
    lastName: "User",
    phoneNumber: "+1234567891",
    roles: ["MANAGER", "GUEST"],
    provider: null,
    providerId: null,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: "guest@hotel.com",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // password123
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+1234567892",
    roles: ["GUEST"],
    provider: null,
    providerId: null,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: "jane.smith@gmail.com",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // password123
    firstName: "Jane",
    lastName: "Smith",
    phoneNumber: "+1234567893",
    roles: ["GUEST"],
    provider: null,
    providerId: null,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

print('Inserting users...');
const insertedUsers = db.users.insertMany(users);
print(`Inserted ${insertedUsers.insertedIds.length} users`);

// Create sample rooms
const rooms = [
  {
    roomNumber: "101",
    name: "Deluxe Ocean View Suite",
    type: "DELUXE",
    description: "Spacious suite with breathtaking ocean views, king-size bed, and modern amenities. Perfect for a romantic getaway or business travel.",
    pricePerNight: NumberDecimal("299.99"),
    capacity: 2,
    size: 450,
    floorNumber: 1,
    available: true,
    amenities: ["WiFi", "TV", "Mini Bar", "Ocean View", "Balcony", "Air Conditioning", "Safe", "Coffee Maker"],
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomNumber: "102",
    name: "Standard Double Room",
    type: "STANDARD",
    description: "Comfortable room with two double beds, ideal for families or friends traveling together. Clean and cozy accommodations.",
    pricePerNight: NumberDecimal("149.99"),
    capacity: 4,
    size: 350,
    floorNumber: 1,
    available: true,
    amenities: ["WiFi", "TV", "Air Conditioning", "Coffee Maker", "Work Desk"],
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomNumber: "201",
    name: "Executive Suite",
    type: "SUITE",
    description: "Luxurious two-room suite with separate living area, workspace, and premium amenities. Perfect for extended stays.",
    pricePerNight: NumberDecimal("449.99"),
    capacity: 3,
    size: 650,
    floorNumber: 2,
    available: true,
    amenities: ["WiFi", "TV", "Mini Bar", "City View", "Living Room", "Air Conditioning", "Safe", "Coffee Maker", "Work Desk", "Jacuzzi"],
    imageUrl: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomNumber: "202",
    name: "Premium King Room",
    type: "PREMIUM",
    description: "Elegant room featuring a plush king-size bed, modern decor, and premium furnishings for ultimate comfort.",
    pricePerNight: NumberDecimal("249.99"),
    capacity: 2,
    size: 400,
    floorNumber: 2,
    available: true,
    amenities: ["WiFi", "TV", "Mini Bar", "City View", "Air Conditioning", "Safe", "Coffee Maker", "Bathrobes"],
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomNumber: "301",
    name: "Penthouse Suite",
    type: "SUITE",
    description: "Our most luxurious accommodation with panoramic views, private terrace, and exclusive amenities. The pinnacle of luxury.",
    pricePerNight: NumberDecimal("799.99"),
    capacity: 4,
    size: 1200,
    floorNumber: 3,
    available: true,
    amenities: ["WiFi", "TV", "Mini Bar", "Ocean View", "Balcony", "Air Conditioning", "Safe", "Coffee Maker", "Jacuzzi", "Private Terrace", "Kitchen", "Dining Area", "Premium Toiletries"],
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomNumber: "302",
    name: "Standard Single Room",
    type: "STANDARD",
    description: "Cozy single room perfect for solo travelers. Compact yet comfortable with all essential amenities.",
    pricePerNight: NumberDecimal("99.99"),
    capacity: 1,
    size: 250,
    floorNumber: 3,
    available: true,
    amenities: ["WiFi", "TV", "Air Conditioning", "Coffee Maker", "Work Desk"],
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
    additionalImages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomNumber: "303",
    name: "Family Room",
    type: "DELUXE",
    description: "Spacious family room with multiple beds and extra space for children. Family-friendly amenities included.",
    pricePerNight: NumberDecimal("349.99"),
    capacity: 5,
    size: 550,
    floorNumber: 3,
    available: true,
    amenities: ["WiFi", "TV", "Mini Fridge", "Air Conditioning", "Coffee Maker", "Extra Beds", "Game Console"],
    imageUrl: "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=400"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomNumber: "401",
    name: "Business Class Room",
    type: "PREMIUM",
    description: "Designed for business travelers with large workspace, ergonomic chair, and high-speed internet. Quiet and professional.",
    pricePerNight: NumberDecimal("199.99"),
    capacity: 2,
    size: 380,
    floorNumber: 4,
    available: true,
    amenities: ["WiFi", "TV", "Work Desk", "Air Conditioning", "Coffee Maker", "Safe", "Printer Access", "Iron"],
    imageUrl: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800",
    additionalImages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomNumber: "402",
    name: "Honeymoon Suite",
    type: "SUITE",
    description: "Romantic suite with luxurious amenities, champagne on arrival, and stunning views. Perfect for newlyweds.",
    pricePerNight: NumberDecimal("599.99"),
    capacity: 2,
    size: 700,
    floorNumber: 4,
    available: true,
    amenities: ["WiFi", "TV", "Mini Bar", "Ocean View", "Balcony", "Air Conditioning", "Safe", "Coffee Maker", "Jacuzzi", "Rose Petals", "Champagne", "Bathrobes", "Premium Toiletries"],
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    additionalImages: [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400",
      "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=400"
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomNumber: "501",
    name: "Garden View Room",
    type: "STANDARD",
    description: "Peaceful room overlooking our beautiful gardens. Wake up to the sounds of nature and enjoy a tranquil stay.",
    pricePerNight: NumberDecimal("129.99"),
    capacity: 2,
    size: 320,
    floorNumber: 5,
    available: true,
    amenities: ["WiFi", "TV", "Garden View", "Air Conditioning", "Coffee Maker", "Balcony"],
    imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800",
    additionalImages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

print('Inserting rooms...');
const insertedRooms = db.rooms.insertMany(rooms);
print(`Inserted ${insertedRooms.insertedIds.length} rooms`);

print('\n=== Database Seeding Complete ===');
print(`Total Users: ${db.users.countDocuments()}`);
print(`Total Rooms: ${db.rooms.countDocuments()}`);
print('\nTest Credentials:');
print('Admin: admin@hotel.com / password123');
print('Manager: manager@hotel.com / password123');
print('Guest: guest@hotel.com / password123');
print('Guest 2: jane.smith@gmail.com / password123');
