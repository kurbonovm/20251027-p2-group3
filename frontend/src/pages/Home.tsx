import React, { useState } from 'react';
import { Box, Container, Grid, CircularProgress, Alert, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SearchParams } from '../components/SearchBar';
import RoomCard from '../components/RoomCard';
import BottomNavigation from '../components/BottomNavigation';
import { useGetRoomsQuery } from '../features/rooms/roomsApi';
import { Room } from '../types';

/**
 * Home page component - displays room listings
 * Header is handled by MainLayout (AuthenticatedHeader or GuestHeader)
 */
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  // Fetch rooms from database using RTK Query
  const { data: rooms, isLoading, error } = useGetRoomsQuery(
    searchParams.roomType ? { type: searchParams.roomType } : undefined
  );

  // Filter and display rooms from database
  const displayedRooms = (rooms || [])
    .filter((room) => {
      // Filter by room type if search params are provided
      if (searchParams.roomType) {
        return room.type === searchParams.roomType;
      }
      // Show all rooms (no availability filter)
      return true;
    });

  return (
      <Box
        sx={{
        minHeight: 'calc(100vh - 200px)',
        backgroundColor: '#000000',
        color: '#ffffff',
        pb: { xs: 8, md: 0 }, // Space for bottom navigation on mobile
        display: 'flex',
        flexDirection: 'column',
        }}
      >
      {/* Room Listings - Scrollable only if content exceeds viewport */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
            },
          },
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 2, sm: 3, md: 3 }, 
            py: { xs: 3, md: 3 },
          }}
        >
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
              <CircularProgress sx={{ color: '#1976d2' }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }}>
              Failed to load rooms. Please try again later.
            </Alert>
          ) : displayedRooms.length === 0 ? (
            <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' }}>
              No available rooms found.
            </Alert>
          ) : (
            <Grid 
              container 
              spacing={{ xs: 2, sm: 2, md: 2.5 }} 
              sx={{ 
                justifyContent: 'flex-start',
              }}
            >
              {displayedRooms.map((room: Room) => (
                <Grid item xs={12} sm={6} md={3} lg={3} key={room.id}>
                  <RoomCard room={room} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavigation />
    </Box>
  );
};

export default Home;
