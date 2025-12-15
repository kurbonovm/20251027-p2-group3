import React from 'react';
import {
  Box,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { SearchParams } from '../components/SearchBar';
import RoomCard from '../components/RoomCard';
import { useGetRoomsQuery, useGetAvailableRoomsQuery } from '../features/rooms/roomsApi';
import { Room, RoomType } from '../types';

/**
 * Rooms page component - displays filtered rooms based on search criteria
 * Shows rooms matching the selected room type and date range
 */
const Rooms: React.FC = () => {
  const location = useLocation();
  const searchParams = (location.state as { searchParams?: SearchParams })?.searchParams;

  // Extract search parameters
  const roomType = searchParams?.roomType;
  const roomName = searchParams?.roomName;
  const checkInDate = searchParams?.checkIn;
  const checkOutDate = searchParams?.checkOut;

  // Format dates for API (YYYY-MM-DD format)
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Use getAvailableRooms if dates are provided, otherwise use getRooms
  const shouldUseAvailableRooms = checkInDate && checkOutDate;
  
  const availableRoomsQuery = useGetAvailableRoomsQuery(
    shouldUseAvailableRooms && checkInDate && checkOutDate
      ? {
          startDate: formatDateForAPI(checkInDate),
          endDate: formatDateForAPI(checkOutDate),
          guests: 1, // Default to 1 guest, can be enhanced later
        }
      : { startDate: '', endDate: '', guests: 1 },
    { skip: !shouldUseAvailableRooms }
  );

  // If searching by room name, we still need to get all rooms first, then filter
  const roomsQuery = useGetRoomsQuery(undefined, { skip: shouldUseAvailableRooms });

  // Determine which query result to use
  const { data: rooms, isLoading, error } = shouldUseAvailableRooms
    ? availableRoomsQuery
    : roomsQuery;

  // Filter rooms by room name or room type
  const filteredRooms = React.useMemo(() => {
    if (!rooms) return [];
    
    let result = rooms;
    
    // Filter by room name if provided (highest priority)
    if (roomName) {
      result = rooms.filter((room: Room) => 
        room.name.toLowerCase().includes(roomName.toLowerCase())
      );
    }
    // Otherwise filter by room type if provided
    else if (roomType) {
      result = rooms.filter((room: Room) => room.type === roomType);
    }
    
    // Only show available rooms
    return result.filter((room: Room) => room.available !== false);
  }, [rooms, roomName, roomType]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          backgroundColor: '#000000',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 8,
        }}
      >
        <CircularProgress sx={{ color: '#1976d2' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          backgroundColor: '#000000',
          color: '#ffffff',
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }}>
            Failed to load rooms. Please try again later.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 200px)',
        backgroundColor: '#000000',
        color: '#ffffff',
        pb: { xs: 8, md: 0 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Room Listings */}
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
            py: { xs: 3, md: 4 },
          }}
        >
          {/* Search Results Header */}
          {(roomName || roomType) && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {roomName
                  ? `Search results for "${roomName}"`
                  : roomType
                  ? `${roomType.charAt(0) + roomType.slice(1).toLowerCase()} Rooms`
                  : 'Search Results'}
              </Typography>
              {checkInDate && checkOutDate && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Available from {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to{' '}
                  {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Typography>
              )}
            </Box>
          )}

          {filteredRooms.length === 0 ? (
            <Alert
              severity="info"
              sx={{
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                color: '#2196f3',
              }}
            >
              No available rooms found matching your search criteria.
            </Alert>
          ) : (
            <Grid
              container
              spacing={{ xs: 2, sm: 2, md: 2.5 }}
              sx={{
                justifyContent: 'flex-start',
              }}
            >
              {filteredRooms.map((room: Room) => (
                <Grid item xs={12} sm={6} md={3} lg={3} key={room.id}>
                  <RoomCard room={room} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Rooms;
