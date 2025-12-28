import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, Box, Button, Chip, useTheme } from '@mui/material';
import { AccessTime, Payment } from '@mui/icons-material';
import { useGetUserReservationsQuery } from '../features/reservations/reservationsApi';

interface PendingReservationsBannerProps {
  excludeReservationId?: string;
}

/**
 * Banner component that displays active pending reservations
 * Shows count, expiration time, and quick action buttons
 */
const PendingReservationsBanner: React.FC<PendingReservationsBannerProps> = ({ excludeReservationId }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { data: userReservations } = useGetUserReservationsQuery();
  const [pendingReservations, setPendingReservations] = useState<any[]>([]);

  useEffect(() => {
    if (userReservations) {
      const now = new Date();
      const activePending = userReservations.filter((r: any) =>
        r.status === 'PENDING' &&
        r.expiresAt &&
        new Date(r.expiresAt) > now &&
        r.id !== excludeReservationId
      );
      setPendingReservations(activePending);
    }
  }, [userReservations, excludeReservationId]);

  // Don't show banner if no pending reservations
  if (pendingReservations.length === 0) {
    return null;
  }

  // Get the oldest pending reservation (most urgent)
  const oldestPending = pendingReservations.sort((a, b) =>
    new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
  )[0];

  const timeRemaining = Math.max(
    0,
    Math.floor((new Date(oldestPending.expiresAt).getTime() - Date.now()) / 1000)
  );
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;

  return (
    <Alert
      severity="warning"
      sx={{
        mb: 3,
        backgroundColor: isDarkMode ? 'rgba(255,193,7,0.1)' : 'rgba(255,193,7,0.1)',
        color: isDarkMode ? '#FFD700' : '#ff9800',
        border: '1px solid',
        borderColor: isDarkMode ? 'rgba(255,215,0,0.3)' : 'rgba(255,152,0,0.3)',
        '& .MuiAlert-icon': {
          color: isDarkMode ? '#FFD700' : '#ff9800',
        },
      }}
    >
      <AlertTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTime fontSize="small" />
        You have {pendingReservations.length} pending reservation{pendingReservations.length > 1 ? 's' : ''}
      </AlertTitle>

      <Box sx={{ mt: 1, mb: 2 }}>
        {pendingReservations.length === 1 ? (
          <Box>
            Reservation for <strong>{oldestPending.room.name}</strong> will expire in{' '}
            <Chip
              label={`${minutesRemaining}:${secondsRemaining.toString().padStart(2, '0')}`}
              size="small"
              sx={{
                backgroundColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'rgba(255,152,0,0.2)',
                color: isDarkMode ? '#FFD700' : '#ff9800',
                fontWeight: 700,
                mx: 0.5,
              }}
            />
          </Box>
        ) : (
          <Box>
            Your oldest reservation expires in{' '}
            <Chip
              label={`${minutesRemaining}:${secondsRemaining.toString().padStart(2, '0')}`}
              size="small"
              sx={{
                backgroundColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'rgba(255,152,0,0.2)',
                color: isDarkMode ? '#FFD700' : '#ff9800',
                fontWeight: 700,
                mx: 0.5,
              }}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<Payment />}
          onClick={() => navigate(`/resume-payment/${oldestPending.id}`)}
          sx={{
            background: isDarkMode ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: isDarkMode ? '#000' : '#fff',
            fontWeight: 600,
            '&:hover': {
              background: isDarkMode ? 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)' : 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
            },
          }}
        >
          Pay Now
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate('/reservations')}
          sx={{
            color: isDarkMode ? '#FFD700' : '#ff9800',
            borderColor: isDarkMode ? '#FFD700' : '#ff9800',
            '&:hover': {
              borderColor: isDarkMode ? '#FFA500' : '#f57c00',
              backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(255,152,0,0.1)',
            },
          }}
        >
          View All ({pendingReservations.length})
        </Button>
      </Box>
    </Alert>
  );
};

export default PendingReservationsBanner;
