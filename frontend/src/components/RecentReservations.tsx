import React from 'react';
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material';
import { useGetRecentReservationsQuery } from '../features/admin/adminApi';
import Loading from './Loading';
import type { RecentReservation } from '../types';

/**
 * RecentReservations component displays the latest reservation activity
 * with user avatars, booking details, and status indicators.
 */
const RecentReservations: React.FC = () => {
  const { data: reservations, isLoading, error } = useGetRecentReservationsQuery();

  if (isLoading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            mb: 2,
          }}
        >
          Recent Reservations
        </Typography>
        <Loading message="Loading recent reservations..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            mb: 2,
          }}
        >
          Recent Reservations
        </Typography>
        <Typography color="error">Failed to load recent reservations</Typography>
      </Box>
    );
  }

  // Helper function to get status color and label
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { color: '#4caf50', bgColor: 'rgba(76, 175, 80, 0.15)', label: 'CONFIRMED' };
      case 'PENDING':
        return { color: '#ff9800', bgColor: 'rgba(255, 152, 0, 0.15)', label: 'PENDING' };
      case 'CHECKED_IN':
        return { color: '#2196f3', bgColor: 'rgba(33, 150, 243, 0.15)', label: 'CHECKED IN' };
      case 'CHECKED_OUT':
        return { color: '#9e9e9e', bgColor: 'rgba(158, 158, 158, 0.15)', label: 'CHECKED OUT' };
      case 'CANCELLED':
        return { color: '#f44336', bgColor: 'rgba(244, 67, 54, 0.15)', label: 'CANCELLED' };
      default:
        return { color: '#9e9e9e', bgColor: 'rgba(158, 158, 158, 0.15)', label: status };
    }
  };

  // Helper function to generate initials from name (first letter of first + last name)
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          color: '#ffffff',
          fontWeight: 600,
          mb: 2,
        }}
      >
        Recent Reservations
      </Typography>

      {/* Content Area - Reservations List */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          p: 2,
        }}
      >
        {!reservations || reservations.length === 0 ? (
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              py: 4,
            }}
          >
            No recent reservations
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {reservations.map((reservation: RecentReservation) => {
              const statusConfig = getStatusConfig(reservation.status);

              return (
                <Box
                  key={reservation.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* Left: User Avatar */}
                  <Avatar
                    src={reservation.userAvatar || undefined}
                    alt={reservation.userName}
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: '#1976d2',
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {!reservation.userAvatar && getInitials(reservation.userName)}
                  </Avatar>

                  {/* Center: Reservation Details */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* User Name */}
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '1rem',
                        mb: 0.5,
                      }}
                    >
                      {reservation.userName}
                    </Typography>

                    {/* Room and Nights */}
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {reservation.roomType} • {reservation.nights} {reservation.nights === 1 ? 'Night' : 'Nights'}
                    </Typography>
                  </Box>

                  {/* Right: Status and Time */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 0.5,
                    }}
                  >
                    {/* Status Chip */}
                    <Chip
                      label={statusConfig.label}
                      size="small"
                      sx={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        borderRadius: 1.5,
                        '& .MuiChip-label': {
                          px: 1.5,
                        },
                      }}
                    />

                    {/* Time Ago */}
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {reservation.timeAgo}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default RecentReservations;

