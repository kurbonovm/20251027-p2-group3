import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  CalendarToday,
  Email,
  Star,
  People,
  Bed,
  NightsStay,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useGetReservationByIdQuery } from '../features/reservations/reservationsApi';
import { selectCurrentUser } from '../features/auth/authSlice';
import { Reservation } from '../types';

/**
 * Helper function to parse date string without timezone conversion
 */
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format date as "Oct 12" format
 */
const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format reservation number (e.g., "HST - 88293")
 */
const formatReservationNumber = (id: string): string => {
  // Use first 3 characters and last 5 characters of the ID
  const prefix = id.substring(0, 3).toUpperCase();
  const suffix = id.substring(id.length - 5);
  return `${prefix} - ${suffix}`;
};

/**
 * Calculate number of nights between check-in and check-out
 */
const calculateNights = (checkInDate: string, checkOutDate: string): number => {
  const start = parseDate(checkInDate);
  const end = parseDate(checkOutDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Booking Confirmation page component
 * Displays confirmation details after successful booking
 */
const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  // Get reservation ID from location state
  const reservationId = (location.state as { reservationId?: string })?.reservationId;

  // Fetch reservation details using RTK Query
  const { data: reservation, isLoading, error } = useGetReservationByIdQuery(
    reservationId || '',
    { skip: !reservationId }
  );

  // Redirect if no reservation ID
  if (!reservationId && !reservation) {
    navigate('/reservations');
    return null;
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          backgroundColor: '#000000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ color: '#ffffff' }}>Loading confirmation...</Typography>
      </Box>
    );
  }

  if (error || !reservation) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          backgroundColor: '#000000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ color: '#f44336' }}>Failed to load reservation details.</Typography>
      </Box>
    );
  }

  const checkInDate = parseDate(reservation.checkInDate);
  const checkOutDate = parseDate(reservation.checkOutDate);
  const nights = calculateNights(reservation.checkInDate, reservation.checkOutDate);

  // Generate a consistent rating (same logic as RoomCard)
  const stringToHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const generateRating = (roomId: string): string => {
    const hash = stringToHash(roomId);
    const baseRating = 4.0;
    const ratingRange = 0.9;
    const rating = baseRating + (hash % 100) / 100 * ratingRange;
    return rating.toFixed(1);
  };

  const rating = generateRating(reservation.room.id);
  const reviewCount = stringToHash(reservation.room.id) % 200 + 50; // Random between 50-250

  const handleClose = () => {
    navigate('/reservations');
  };

  const handleAddToCalendar = () => {
    // TODO: Implement calendar integration
    console.log('Add to calendar clicked');
  };

  const handleEmailReceipt = () => {
    // TODO: Implement email receipt functionality
    console.log('Email receipt clicked');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
            }}
          >
            Confirmation
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Confirmation Icon and Message */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          {/* Large Green Checkmark Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: '50%',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                zIndex: -1,
              },
            }}
          >
            <CheckCircle sx={{ fontSize: 60, color: '#ffffff' }} />
          </Box>

          {/* Booking Confirmed Title */}
          <Typography
            variant="h3"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Booking Confirmed!
          </Typography>

          {/* Thank You Message */}
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              maxWidth: 500,
            }}
          >
            Thank you for your reservation. We have sent a confirmation email to{' '}
            <Box component="span" sx={{ color: '#ffffff', fontWeight: 600 }}>
              {user?.email || 'your email'}
            </Box>
            .
          </Typography>
        </Box>

        {/* Reservation Number Card */}
        <Card
          sx={{
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            mb: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                mb: 1,
                display: 'block',
              }}
            >
              RESERVATION NUMBER
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {formatReservationNumber(reservation.id)}
            </Typography>
          </CardContent>
        </Card>

        {/* Reservation Details Card */}
        <Card
          sx={{
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            mb: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Header with Title and Paid Badge */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                }}
              >
                Reservation Details
              </Typography>
              <Chip
                icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffffff', ml: 0.5 }} />}
                label="Paid"
                sx={{
                  backgroundColor: '#4caf50',
                  color: '#ffffff',
                  fontWeight: 600,
                  borderRadius: '20px',
                  px: 1,
                }}
              />
            </Box>

            {/* Room Information */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {/* Room Image */}
              <Box
                component="img"
                src={reservation.room.imageUrl || 'https://via.placeholder.com/120x120?text=Room'}
                alt={reservation.room.name}
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />

              {/* Room Details */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {reservation.room.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Star sx={{ fontSize: 18, color: '#1976d2' }} />
                  <Typography
                    sx={{
                      color: '#1976d2',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    {rating}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                    }}
                  >
                    ({reviewCount} reviews)
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                  }}
                >
                  Santa Monica, CA
                </Typography>
              </Box>
            </Box>

            {/* Check-in and Check-out Dates */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Card
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Check-in
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {formatShortDate(checkInDate)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    3:00 PM
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Check-out
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {formatShortDate(checkOutDate)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    11:00 AM
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Guest, Bed, Nights Summary */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontSize: '0.9rem' }}>
                  {reservation.numberOfGuests} Guests
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '1px',
                  height: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bed sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontSize: '0.9rem' }}>
                  1 King Bed
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '1px',
                  height: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NightsStay sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontSize: '0.9rem' }}>
                  {nights} Night{nights > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Total Paid */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '1rem',
                }}
              >
                Total Paid
              </Typography>
              <Typography
                sx={{
                  color: '#1976d2',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                }}
              >
                ${reservation.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<CalendarToday sx={{ fontSize: 24 }} />}
              onClick={handleAddToCalendar}
              sx={{
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                borderRadius: 2,
                py: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                '&:hover': {
                  backgroundColor: '#252525',
                },
                '& .MuiButton-startIcon': {
                  margin: 0,
                },
              }}
            >
              <CalendarToday sx={{ fontSize: 24, color: '#1976d2' }} />
              <Typography sx={{ color: '#ffffff', fontSize: '0.9rem' }}>
                Add to Calendar
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Email sx={{ fontSize: 24 }} />}
              onClick={handleEmailReceipt}
              sx={{
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                borderRadius: 2,
                py: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                '&:hover': {
                  backgroundColor: '#252525',
                },
                '& .MuiButton-startIcon': {
                  margin: 0,
                },
              }}
            >
              <Email sx={{ fontSize: 24, color: '#9c27b0' }} />
              <Typography sx={{ color: '#ffffff', fontSize: '0.9rem' }}>
                Email Receipt
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BookingConfirmation;

