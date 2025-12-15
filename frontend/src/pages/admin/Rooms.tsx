import React, { useState } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Box,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Wifi,
  AcUnit,
  Tv,
  Build as BuildIcon,
} from '@mui/icons-material';
import {
  useGetAllRoomsAdminQuery,
  useGetRoomStatisticsQuery,
  useGetAllReservationsAdminQuery,
  useDeleteRoomMutation,
} from '../../features/admin/adminApi';
import AdminLayout from '../../layouts/AdminLayout';
import Loading from '../../components/Loading';
import EditRoomModal from '../../components/EditRoomModal';
import { Room, RoomStatistics } from '../../types';

const AdminRooms: React.FC = () => {
  const { data: rooms, isLoading: roomsLoading, error: roomsError, refetch: refetchRooms } = useGetAllRoomsAdminQuery();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useGetRoomStatisticsQuery();
  const { data: reservations, isLoading: reservationsLoading, error: reservationsError } = useGetAllReservationsAdminQuery();
  const [deleteRoom] = useDeleteRoomMutation();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  if (roomsLoading || statsLoading || reservationsLoading) return <Loading message="Loading rooms..." />;

  // Default stats if not available
  const displayStats = stats || {
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    roomsByType: {},
  };

  // Count how many reservations exist for each room
  const roomOccupancyCount = new Map<string, number>();
  reservations
    ?.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
    .forEach(r => {
      const count = roomOccupancyCount.get(r.room.id) || 0;
      roomOccupancyCount.set(r.room.id, count + 1);
    });

  // Helper function to get room status
  const getRoomStatus = (room: Room): { label: string; color: 'success' | 'error' | 'warning' } => {
    const occupiedCount = roomOccupancyCount.get(room.id) || 0;
    const totalRooms = room.totalRooms || 1;
    const availableCount = totalRooms - occupiedCount;

    // If room is marked as not available, it's in maintenance
    if (!room.available) {
      return { label: 'Maintenance', color: 'warning' };
    }

    // If all rooms are occupied
    if (availableCount <= 0) {
      return { label: 'Occupied', color: 'error' };
    }

    // Otherwise available
    return { label: 'Available', color: 'success' };
  };

  // Helper function to extract room number from name
  const getRoomNumber = (roomName: string | null | undefined): string => {
    if (!roomName) {
      return 'Room';
    }
    const match = roomName.match(/\d+/);
    return match ? `Room ${match[0]}` : roomName;
  };

  // Helper function to format room type
  const formatRoomType = (type: string | null | undefined): string => {
    if (!type) {
      return 'Standard';
    }
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('wi-fi')) {
      return <Wifi sx={{ fontSize: 18 }} />;
    }
    if (lowerAmenity.includes('ac') || lowerAmenity.includes('air')) {
      return <AcUnit sx={{ fontSize: 18 }} />;
    }
    if (lowerAmenity.includes('tv') || lowerAmenity.includes('television')) {
      return <Tv sx={{ fontSize: 18 }} />;
    }
    return null;
  };

  // Helper function to hash room ID to a natural integer
  const hashRoomId = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to positive integer and keep it in a reasonable range (100-9999)
    return Math.abs(hash) % 9900 + 100;
  };

  const handleEditClick = (room: Room) => {
    setSelectedRoom(room);
    setEditModalOpen(true);
  };

  const handleDeleteClick = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(roomId).unwrap();
      } catch (error) {
        console.error('Failed to delete room:', error);
        alert('Failed to delete room. Please try again.');
      }
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedRoom(null);
  };

  const handleUpdateSuccess = async () => {
    // Refetch rooms and stats to ensure UI reflects database state
    await Promise.all([
      refetchRooms(),
      refetchStats(),
    ]);
  };

  return (
    <AdminLayout>
      {/* Title */}
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: '#ffffff', 
          fontWeight: 700,
          mb: 4,
        }}
      >
        Room Inventory Management
      </Typography>

      {/* Stats Section */}
      <Box sx={{ mb: 5 }}>
        {statsError && (
          <Typography sx={{ color: '#f44336', mb: 2 }}>
            Error loading statistics. Showing default values.
          </Typography>
        )}
        <Grid container spacing={3}>
          {/* Total Rooms Card */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: '#1f1f1f',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  Total Rooms
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  {displayStats.totalRooms}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Available Rooms Card */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(76, 175, 80, 0.5)',
                  backgroundColor: '#1f1f1f',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  Available Rooms
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#4caf50',
                    fontWeight: 700,
                  }}
                >
                  {displayStats.availableRooms}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Occupied Rooms Card */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(244, 67, 54, 0.5)',
                  backgroundColor: '#1f1f1f',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  Occupied Rooms
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#f44336',
                    fontWeight: 700,
                  }}
                >
                  {displayStats.occupiedRooms}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Room Listings Section */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            mb: 3,
          }}
        >
          Room Listings
        </Typography>

        <Grid container spacing={2}>
          {rooms?.map((room: Room) => {
            const status = getRoomStatus(room);
            const roomNumber = getRoomNumber(room.name);
            const roomType = formatRoomType(room.type);

            return (
              <Grid item xs={12} key={room.id}>
                <Card
                  sx={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(25, 118, 210, 0.5)',
                      backgroundColor: '#1f1f1f',
                    },
                  }}
                >
                  {/* First Container: Image, Room Name, Status Badge, Room Type, Price */}
                  <CardContent 
                    sx={{ 
                      p: 2, 
                      pb: 1.5, 
                      display: 'flex', 
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    {/* Room Image - Left side (smaller, square) */}
                    <CardMedia
                      component="img"
                      sx={{
                        width: { xs: '100%', md: 120 },
                        height: { xs: 180, md: 120 },
                        objectFit: 'cover',
                        objectPosition: 'center',
                        flexShrink: 0,
                        borderRadius: 2,
                      }}
                      image={room.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=480&fit=crop&q=90'}
                      alt={room.name || 'Room'}
                    />

                    {/* Room Details - Right side */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      {/* Room Number and Status Badge - Horizontal alignment */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            lineHeight: 1.2,
                            flex: 1,
                            mr: 1.5,
                          }}
                        >
                          {roomNumber}
                        </Typography>
                        <Chip
                          label={status.label}
                          sx={{
                            backgroundColor:
                              status.color === 'success'
                                ? '#4caf50'
                                : status.color === 'error'
                                ? '#f44336'
                                : '#ff9800',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 24,
                            borderRadius: '20px',
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      {/* Room ID */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 0.75,
                          fontSize: '0.85rem',
                        }}
                      >
                        Room {hashRoomId(room.id)}
                      </Typography>

                      {/* Price */}
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#1976d2',
                          fontWeight: 600,
                          fontSize: '1rem',
                        }}
                      >
                        ${room.pricePerNight} / night
                      </Typography>
                    </Box>
                  </CardContent>

                    {/* Second Container: Guests, Amenities, Action Buttons */}
                    <Box 
                      sx={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        pt: 1.5,
                        pb: 2,
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        {/* Guest Capacity */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <PeopleIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 18 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.8rem',
                            }}
                          >
                            {room.capacity} Guests
                          </Typography>
                        </Box>

                        {/* Amenities - Limited to 2 */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                          {room.amenities?.slice(0, 2).map((amenity, index) => (
                            <Chip
                              key={index}
                              icon={getAmenityIcon(amenity)}
                              label={amenity}
                              sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.7)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                fontSize: '0.7rem',
                                height: 24,
                                '& .MuiChip-icon': {
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: 16,
                                },
                              }}
                            />
                          ))}
                          {room.amenities && room.amenities.length > 2 && (
                            <Chip
                              label={`+${room.amenities.length - 2} more`}
                              sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: 'rgba(255, 255, 255, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '0.7rem',
                                height: 24,
                              }}
                            />
                          )}
                        </Box>

                        {/* Maintenance Note (if status is Maintenance) */}
                        {status.label === 'Maintenance' && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mb: 1.5,
                              p: 0.75,
                              backgroundColor: 'rgba(255, 152, 0, 0.1)',
                              borderRadius: 1,
                            }}
                          >
                            <BuildIcon sx={{ color: '#ff9800', fontSize: 16 }} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#ff9800',
                                fontSize: '0.75rem',
                              }}
                            >
                              AC Repair
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Action Buttons - Always at bottom */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          gap: 1.5,
                          flexShrink: 0,
                          mt: 'auto',
                        }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          size="small"
                          fullWidth
                          onClick={() => handleEditClick(room)}
                          sx={{
                            color: '#ffffff',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            py: 0.75,
                            '&:hover': {
                              borderColor: '#1976d2',
                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          size="small"
                          fullWidth
                          onClick={() => handleDeleteClick(room.id)}
                          sx={{
                            color: '#f44336',
                            borderColor: 'rgba(244, 67, 54, 0.3)',
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            py: 0.75,
                            '&:hover': {
                              borderColor: '#f44336',
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Edit Room Modal */}
      <EditRoomModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        room={selectedRoom}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </AdminLayout>
  );
};

export default AdminRooms;
