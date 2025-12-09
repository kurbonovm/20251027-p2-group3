// MongoDB script to update room quantities
// Run this in MongoDB Compass or mongosh

// Connect to your database first:
// use hotel_reservation

// Example: Update specific rooms to have multiple instances
db.rooms.updateOne(
  { name: "Standard Single Room" },
  { $set: { totalRooms: 20 } }
);

db.rooms.updateOne(
  { name: "Standard Double Room" },
  { $set: { totalRooms: 15 } }
);

db.rooms.updateOne(
  { name: "Deluxe Queen Room" },
  { $set: { totalRooms: 10 } }
);

db.rooms.updateOne(
  { name: "Deluxe King Room" },
  { $set: { totalRooms: 10 } }
);

db.rooms.updateOne(
  { name: "Junior Suite" },
  { $set: { totalRooms: 8 } }
);

db.rooms.updateOne(
  { name: "Executive Suite" },
  { $set: { totalRooms: 5 } }
);

db.rooms.updateOne(
  { name: "Penthouse Suite" },
  { $set: { totalRooms: 3 } }
);

db.rooms.updateOne(
  { name: "Presidential Suite" },
  { $set: { totalRooms: 2 } }
);

// Verify the updates
db.rooms.find({}, { name: 1, totalRooms: 1 });
