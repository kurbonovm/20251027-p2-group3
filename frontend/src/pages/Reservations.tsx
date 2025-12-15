import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Cancel,
  CheckCircle,
  Schedule,
  CalendarToday,
  Bed,
  Star,
  Edit,
  Visibility,
  Payment,
  RateReview,
  Refresh,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetUserReservationsQuery, useCancelReservationMutation } from '../features/reservations/reservationsApi';
import { Reservation, ReservationStatus } from '../types';

/**
 * Helper function to parse date string without timezone conversion
 */
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format date as "November 12" format
 */
const formatLongDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date range as "November 12 - November 15"
 */
const formatDateRange = (checkIn: Date, checkOut: Date): string => {
  return `${formatLongDate(checkIn)} - ${formatLongDate(checkOut)}`;
};

/**
 * Generate a consistent rating based on room ID (same logic as RoomCard)
 */
const stringToHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const generateRating = (roomId: string): { rating: string; reviewCount: number } => {
  const hash = stringToHash(roomId);
  const baseRating = 4.0;
  const ratingRange = 0.9;
  const rating = (baseRating + (hash % 100) / 100 * ratingRange).toFixed(1);
  const reviewCount = (hash % 200) + 50; // Between 50-250
  return { rating, reviewCount };
};

/**
 * Reservations page component - redesigned to match screenshot
 */
const Reservations: React.FC = () => {
  const navigate = useNavigate();
  const { data: reservations, isLoading, error } = useGetUserReservationsQuery();
  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation();
  const [cancelError, setCancelError] = useState<string>('');
  const [cancelSuccess, setCancelSuccess] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (cancelSuccess) {
      const timer = setTimeout(() => {
        setCancelSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cancelSuccess]);

  const handleOpenDialog = (reservationId: string) => {
    setSelectedReservationId(reservationId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReservationId(null);
  };

  const handleConfirmCancel = async () => {
    setCancelError('');
    setCancelSuccess('');

    try {
      await cancelReservation(selectedReservationId!).unwrap();
      setCancelSuccess('Reservation cancelled successfully!');
      handleCloseDialog();
    } catch (err: any) {
      setCancelError(err.data?.message || 'Failed to cancel reservation.');
      handleCloseDialog();
    }
  };

  // Filter and categorize reservations into Upcoming and Past
  const categorizeReservations = (): { upcoming: Reservation[]; past: Reservation[] } => {
    if (!reservations) return { upcoming: [], past: [] };

    const now = new Date();
    const upcoming: Reservation[] = [];
    const past: Reservation[] = [];

    reservations.forEach((reservation) => {
      // Create checkout datetime
      const checkOutDate = parseDate(reservation.checkOutDate);
      const checkOutTime = reservation.checkOutTime || '11:00';
      const [hours, minutes] = checkOutTime.split(':');
      checkOutDate.setHours(parseInt(hours), parseInt(minutes || '0'), 0, 0);

      // CANCELLED reservations go to Past
      if (reservation.status?.toUpperCase() === 'CANCELLED') {
        past.push(reservation);
      }
      // CHECKED_OUT reservations go to Past
      else if (reservation.status?.toUpperCase() === 'CHECKED_OUT') {
        past.push(reservation);
      }
      // Past if checkout has passed
      else if (checkOutDate < now) {
        past.push(reservation);
      }
      // Otherwise it's upcoming (PENDING, CONFIRMED, CHECKED_IN with future checkout)
      else {
        upcoming.push(reservation);
      }
    });

    // Sort by check-in date (earliest first for upcoming, most recent first for past)
    const sortUpcoming = (a: Reservation, b: Reservation) => {
      const dateA = parseDate(a.checkInDate).getTime();
      const dateB = parseDate(b.checkInDate).getTime();
      return dateA - dateB; // Ascending (earliest first)
    };

    const sortPast = (a: Reservation, b: Reservation) => {
      const dateA = parseDate(a.checkOutDate).getTime();
      const dateB = parseDate(b.checkOutDate).getTime();
      return dateB - dateA; // Descending (most recent first)
    };

    upcoming.sort(sortUpcoming);
    past.sort(sortPast);

    return { upcoming, past };
  };

  const { upcoming, past } = categorizeReservations();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (reservationId: string) => {
    navigate(`/reservation/${reservationId}`);
  };

  const handleManage = (reservation: Reservation) => {
    // Navigate to reservation manage page
    navigate(`/reservation/${reservation.id}/manage`);
  };

  const handlePayNow = (reservation: Reservation) => {
    // Navigate to payment page
    navigate('/booking', {
      state: {
        room: reservation.room,
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
        guests: reservation.numberOfGuests,
        reservationId: reservation.id,
      },
    });
  };

  const handleWriteReview = (reservation: Reservation) => {
    // TODO: Implement review functionality
    console.log('Write review for reservation:', reservation.id);
  };

  const handleReBook = (reservation: Reservation) => {
    navigate(`/rooms/${reservation.room.id}`);
  };

  const handleBookAgain = (reservation: Reservation) => {
    navigate(`/rooms/${reservation.room.id}`);
  };

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
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }}>
            Failed to load reservations. Please try again later.
          </Alert>
        </Container>
      </Box>
    );
  }

  const renderReservationCard = (reservation: Reservation, isPast: boolean) => {
    const checkInDate = parseDate(reservation.checkInDate);
    const checkOutDate = parseDate(reservation.checkOutDate);
    const { rating, reviewCount } = generateRating(reservation.room.id);
    const status = reservation.status?.toUpperCase() || '';

    // Determine status badge
    let statusLabel = '';
    let statusColor = '';
    if (status === 'CONFIRMED') {
      statusLabel = 'Confirmed';
      statusColor = '#4caf50';
    } else if (status === 'PENDING') {
      statusLabel = 'Pending';
      statusColor = '#ff9800';
    } else if (status === 'CHECKED_OUT' || status === 'COMPLETED') {
      statusLabel = 'Completed';
      statusColor = '#9e9e9e';
    } else if (status === 'CANCELLED') {
      statusLabel = 'Cancelled';
      statusColor = '#f44336';
    }

    // Get room image
    const roomImage = reservation.room.imageUrl || 
      `https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200&h=150&fit=crop&q=90`;

    return (
      <Card
        key={reservation.id}
        sx={{
          mb: 2,
          backgroundColor: '#1a1a1a',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
            {/* Room Image */}
            <Box
              component="img"
              src={roomImage}
              alt={reservation.room.name}
              sx={{
                width: 120,
                height: 90,
                borderRadius: 2,
                objectFit: 'cover',
                flexShrink: 0,
                filter: isPast && status !== 'CANCELLED' ? 'grayscale(100%)' : 'none',
              }}
            />

            {/* Reservation Details */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Room Name and Rating */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    mb: 0.5,
                  }}
                >
                  {reservation.room.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ fontSize: 16, color: '#1976d2' }} />
                  <Typography
                    sx={{
                      color: '#1976d2',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    {rating}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.85rem',
                    }}
                  >
                    ({reviewCount} reviews)
                  </Typography>
                </Box>
              </Box>

              {/* Price and Status */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  ${reservation.totalAmount.toFixed(2)} /total
                </Typography>
                {statusLabel && (
                  <Chip
                    label={statusLabel}
                    sx={{
                      backgroundColor: statusColor,
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 24,
                      borderRadius: '12px',
                    }}
                  />
                )}
              </Box>

              {/* Dates and Room Type */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarToday sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {formatDateRange(checkInDate, checkOutDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Bed sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {reservation.room.type.charAt(0) + reservation.room.type.slice(1).toLowerCase()}
                  </Typography>
                </Box>
              </Box>

              {/* Payment Status for Pending */}
              {status === 'PENDING' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Payment sx={{ fontSize: 16, color: '#1976d2' }} />
                  <Typography
                    sx={{
                      color: '#1976d2',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Payment Due
                  </Typography>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                {!isPast && status === 'CONFIRMED' && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => handleManage(reservation)}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      Manage
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleViewDetails(reservation.id)}
                      startIcon={<Visibility />}
                      sx={{
                        backgroundColor: '#1976d2',
                        color: '#ffffff',
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        '&:hover': {
                          backgroundColor: '#1565c0',
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </>
                )}
                {!isPast && status === 'PENDING' && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog(reservation.id)}
                      startIcon={<Cancel />}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#f44336',
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        '&:hover': {
                          borderColor: '#f44336',
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handlePayNow(reservation)}
                      startIcon={<Payment />}
                      sx={{
                        backgroundColor: '#1976d2',
                        color: '#ffffff',
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        '&:hover': {
                          backgroundColor: '#1565c0',
                        },
                      }}
                    >
                      Pay Now
                    </Button>
                  </>
                )}
                {isPast && status === 'CHECKED_OUT' && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => handleWriteReview(reservation)}
                      startIcon={<RateReview />}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      Write Review
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleReBook(reservation)}
                      startIcon={<Refresh />}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      Re-book
                    </Button>
                    <ArrowForward sx={{ color: 'rgba(255, 255, 255, 0.5)', ml: 'auto', cursor: 'pointer' }} />
                  </>
                )}
                {isPast && status === 'CANCELLED' && (
                  <Button
                    variant="outlined"
                    onClick={() => handleBookAgain(reservation)}
                    startIcon={<Refresh />}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: '#ffffff',
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Book Again
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 200px)',
        backgroundColor: '#000000',
        color: '#ffffff',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Page Title */}
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            mb: 4,
          }}
        >
          My Reservations
        </Typography>

        {/* Error/Success Messages */}
        {cancelError && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              color: '#f44336',
            }}
            onClose={() => setCancelError('')}
          >
            {cancelError}
          </Alert>
        )}

        {cancelSuccess && (
          <Alert
            severity="success"
            sx={{
              mb: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              color: '#4caf50',
            }}
            onClose={() => setCancelSuccess('')}
          >
            {cancelSuccess}
          </Alert>
        )}

        {reservations && reservations.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              color: '#2196f3',
            }}
          >
            You don't have any reservations yet.
          </Alert>
        ) : (
          <>
            {/* Tabs */}
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                mb: 3,
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="reservation tabs"
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    minHeight: 48,
                    '&.Mui-selected': {
                      color: '#1976d2',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#1976d2',
                  },
                }}
              >
                <Tab label={`Upcoming (${upcoming.length})`} />
                <Tab label={`Past (${past.length})`} />
              </Tabs>
            </Box>

            {/* Reservation Cards */}
            {tabValue === 0 && (
              <Box>
                {upcoming.length === 0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      color: '#2196f3',
                    }}
                  >
                    No upcoming reservations.
                  </Alert>
                ) : (
                  upcoming.map((reservation) => renderReservationCard(reservation, false))
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                {past.length === 0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      color: '#2196f3',
                    }}
                  >
                    No past reservations.
                  </Alert>
                ) : (
                  past.map((reservation) => renderReservationCard(reservation, true))
                )}
              </Box>
            )}
          </>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="cancel-dialog-title"
          aria-describedby="cancel-dialog-description"
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
            },
          }}
        >
          <DialogTitle
            id="cancel-dialog-title"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: '#ffffff',
            }}
          >
            <Cancel sx={{ color: '#f44336' }} />
            Cancel Reservation
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              id="cancel-dialog-description"
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseDialog}
              disabled={isCancelling}
              variant="outlined"
              size="large"
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              Keep Reservation
            </Button>
            <Button
              onClick={handleConfirmCancel}
              color="error"
              variant="contained"
              disabled={isCancelling}
              size="large"
              startIcon={isCancelling ? <CircularProgress size={20} color="inherit" /> : <Cancel />}
              autoFocus
              sx={{
                backgroundColor: '#f44336',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
              }}
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Reservations;
