import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Box,
  Paper,
} from '@mui/material';
import {
  useGetAllRoomsAdminQuery,
  useGetRoomStatisticsQuery,
  useGetAllReservationsAdminQuery,
} from '../../features/admin/adminApi';
import AdminLayout from '../../layouts/AdminLayout';
import Loading from '../../components/Loading';
import { Room, RoomStatistics } from '../../types';

const AdminRooms: React.FC = () => {
  const { data: rooms, isLoading: roomsLoading } = useGetAllRoomsAdminQuery();
  const { data: stats, isLoading: statsLoading } = useGetRoomStatisticsQuery();
  const { data: reservations, isLoading: reservationsLoading } = useGetAllReservationsAdminQuery();

  if (roomsLoading || statsLoading || reservationsLoading) return <Loading message="Loading rooms..." />;

  // Get set of occupied room IDs (rooms with CONFIRMED or CHECKED_IN reservations)
  const occupiedRoomIds = new Set(
    reservations
      ?.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
      .map(r => r.room.id) || []
  );

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Room Management
      </Typography>

      {stats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Total Rooms</Typography>
              <Typography variant="h4">{stats.totalRooms}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Available</Typography>
              <Typography variant="h4" color="success.main">
                {stats.availableRooms}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Occupied</Typography>
              <Typography variant="h4" color="warning.main">
                {stats.occupiedRooms}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {rooms?.map((room: Room) => {
          const isOccupied = occupiedRoomIds.has(room.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={room.imageUrl || 'https://via.placeholder.com/400x200?text=Room'}
                  alt={room.name}
                />
                <CardContent>
                  <Typography variant="h6">{room.name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {room.type}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="h6" color="primary">
                      ${room.pricePerNight}/night
                    </Typography>
                    <Chip
                      label={isOccupied ? 'Occupied' : 'Available'}
                      color={isOccupied ? 'error' : 'success'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Capacity: {room.capacity} guests | Floor: {room.floorNumber}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </AdminLayout>
  );
};

export default AdminRooms;
