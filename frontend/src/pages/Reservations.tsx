import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  Cancel,
  CheckCircle,
  Schedule,
  EventAvailable,
  Close,
  History,
} from '@mui/icons-material';
import { useGetUserReservationsQuery, useCancelReservationMutation } from '../features/reservations/reservationsApi';
import { Reservation, ReservationStatus } from '../types';
import CancellationDialog from '../components/CancellationDialog';
import { CountdownTimer } from '../components/CountdownTimer';

/**
 * Helper function to parse date string without timezone conversion
 */
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Reservations page component to view user's reservations
 */
const Reservations: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { data: reservations, isLoading, error } = useGetUserReservationsQuery();
  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation();
  const [cancelError, setCancelError] = useState<string>('');
  const [cancelSuccess, setCancelSuccess] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

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

  // Simple cancellation handler for unpaid PENDING reservations
  const handleQuickCancel = async (reservation: Reservation) => {
    // Check if this is an unpaid PENDING reservation
    if (reservation.status !== 'PENDING' || reservation.paymentId) {
      // If it has a payment or is not PENDING, use the full dialog
      setSelectedReservation(reservation);
      setCancellationDialogOpen(true);
      return;
    }

    // Show simple confirmation for unpaid PENDING reservations
    const confirmed = window.confirm(
      'Cancel this reservation? No payment was made, so you can cancel at any time without charges.'
    );

    if (!confirmed) return;

    setCancelError('');
    setCancelSuccess('');

    try {
      await cancelReservation(reservation.id).unwrap();
      setCancelSuccess('Reservation cancelled successfully!');
    } catch (err: any) {
      setCancelError(err.data?.message || 'Failed to cancel reservation.');
    }
  };

  const getStatusColor = (status: string | undefined): 'success' | 'warning' | 'error' | 'default' => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string | undefined): React.ReactNode => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle />;
      case 'pending':
        return <Schedule />;
      case 'cancelled':
        return <Cancel />;
      default:
        return null;
    }
  };

  // Filter and categorize reservations
  const categorizeReservations = (): { active: Reservation[]; past: Reservation[]; cancelled: Reservation[] } => {
    if (!reservations) return { active: [], past: [], cancelled: [] };

    const now = new Date();
    const active: Reservation[] = [];
    const past: Reservation[] = [];
    const cancelled: Reservation[] = [];

    reservations.forEach((reservation) => {
      // Handle cancelled reservations
      if (reservation.status?.toLowerCase() === 'cancelled') {
        cancelled.push(reservation);
        return;
      }

      // Create checkout datetime by combining date and time
      const checkOutDate = parseDate(reservation.checkOutDate);
      // Set checkout time to 11:00 AM (default checkout time)
      const checkOutTime = reservation.checkOutTime || '11:00';
      const [hours, minutes] = checkOutTime.split(':');
      checkOutDate.setHours(parseInt(hours), parseInt(minutes || '0'), 0, 0);

      // Reservation is past if checkout datetime has passed and status is CHECKED_OUT
      if (reservation.status?.toUpperCase() === 'CHECKED_OUT' ||
          (checkOutDate < now &&
           (reservation.status?.toUpperCase() === 'CONFIRMED' ||
            reservation.status?.toUpperCase() === 'CHECKED_IN'))) {
        past.push(reservation);
      } else {
        // Otherwise it's active (PENDING, CONFIRMED, or CHECKED_IN with future checkout)
        active.push(reservation);
      }
    });

    // Sort by creation date (most recently created first)
    const sortByCreatedAt = (a: Reservation, b: Reservation) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    };

    active.sort(sortByCreatedAt);
    past.sort(sortByCreatedAt);
    cancelled.sort(sortByCreatedAt);

    return { active, past, cancelled };
  };

  const { active, past, cancelled } = categorizeReservations();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">Failed to load reservations. Please try again later.</Alert>
      </Container>
    );
  }

  const renderReservations = (reservationList: Reservation[]) => {
    if (reservationList.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No reservations found in this category.
        </Alert>
      );
    }

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, mt: 1 }}>
        {reservationList.map((reservation) => (
            <Box key={reservation.id}>
              <Card
                sx={{
                  bgcolor: isDarkMode ? 'rgba(26,26,26,0.95)' : 'background.paper',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        wordBreak: 'break-all',
                        flexShrink: 1,
                        minWidth: 0,
                        color: isDarkMode ? '#FFD700' : 'primary.main',
                        fontWeight: 600,
                      }}
                    >
                      Reservation #{reservation.id}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(reservation.status)}
                      label={reservation.status}
                      color={getStatusColor(reservation.status)}
                      sx={{ fontWeight: 'bold', flexShrink: 0 }}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography variant="body1" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                        <strong>Room:</strong> {reservation.room?.name}
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                        <strong>Room Type:</strong> {reservation.room?.type}
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                        <strong>Check-in:</strong>{' '}
                        {parseDate(reservation.checkInDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                        <strong>Check-out:</strong>{' '}
                        {parseDate(reservation.checkOutDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                        <strong>Guests:</strong> {reservation.numberOfGuests}
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                        <strong>Total Amount:</strong> ${reservation.totalAmount}
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                        <strong>Booked on:</strong>{' '}
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider' }} />

                  {reservation.status?.toLowerCase() === 'confirmed' && (
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="medium"
                        startIcon={<Close />}
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setCancellationDialogOpen(true);
                        }}
                        sx={{
                          borderWidth: 2,
                          color: '#ff6b6b',
                          borderColor: 'rgba(211,47,47,0.5)',
                          '&:hover': {
                            borderWidth: 2,
                            backgroundColor: isDarkMode ? 'rgba(211,47,47,0.2)' : 'rgba(211,47,47,0.1)',
                            borderColor: '#ff6b6b',
                          },
                        }}
                      >
                        Cancel Reservation
                      </Button>
                    </Box>
                  )}

                  {reservation.status?.toLowerCase() === 'pending' && (
                    <Box>
                      <Alert
                        severity="warning"
                        sx={{
                          mb: 2,
                          backgroundColor: isDarkMode ? 'rgba(255,152,0,0.1)' : 'rgba(255,152,0,0.05)',
                          color: isDarkMode ? '#ffb74d' : '#f57c00',
                          border: '1px solid',
                          borderColor: isDarkMode ? 'rgba(255,152,0,0.3)' : 'rgba(255,152,0,0.2)',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Payment Incomplete
                        </Typography>
                        <Typography variant="caption">
                          Complete your payment to confirm this reservation, or cancel it to free up the room.
                        </Typography>
                        {reservation.expiresAt && (
                          <Box sx={{ mt: 1 }}>
                            <CountdownTimer
                              expiresAt={reservation.expiresAt}
                              onExpired={() => {
                                // Optionally trigger a refetch when expired
                                window.location.reload();
                              }}
                            />
                          </Box>
                        )}
                      </Alert>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="medium"
                          startIcon={<CheckCircle />}
                          onClick={() => {
                            // Navigate to payment page for this reservation
                            navigate(`/resume-payment/${reservation.id}`);
                          }}
                          sx={{
                            background: isDarkMode ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: isDarkMode ? '#000' : '#fff',
                            fontWeight: 600,
                            '&:hover': {
                              background: isDarkMode ? 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)' : 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: isDarkMode ? '0 8px 20px rgba(255,215,0,0.3)' : '0 8px 20px rgba(25,118,210,0.3)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Complete Payment
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="medium"
                          startIcon={<Close />}
                          onClick={() => handleQuickCancel(reservation)}
                          sx={{
                            borderWidth: 2,
                            color: '#ff6b6b',
                            borderColor: 'rgba(211,47,47,0.5)',
                            '&:hover': {
                              borderWidth: 2,
                              backgroundColor: isDarkMode ? 'rgba(211,47,47,0.2)' : 'rgba(211,47,47,0.1)',
                              borderColor: '#ff6b6b',
                            },
                          }}
                        >
                          Cancel Reservation
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {reservation.status?.toLowerCase() === 'cancelled' && (
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Alert
                        severity="error"
                        sx={{
                          flex: 1,
                          backgroundColor: 'rgba(211,47,47,0.1)',
                          color: '#ff6b6b',
                          border: '1px solid rgba(211,47,47,0.3)',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          This reservation has been cancelled
                        </Typography>
                        {reservation.cancelledAt && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                            Cancelled on {new Date(reservation.cancelledAt).toLocaleDateString()} at{' '}
                            {new Date(reservation.cancelledAt).toLocaleTimeString()}
                          </Typography>
                        )}
                        {reservation.cancellationReason && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
                            Reason: {reservation.cancellationReason}
                          </Typography>
                        )}
                        {reservation.paymentId && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                            Refund processed in 5-10 business days
                          </Typography>
                        )}
                      </Alert>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          mb: 3,
          background: isDarkMode ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
        }}
      >
        My Reservations
      </Typography>

      {cancelError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            backgroundColor: 'rgba(211,47,47,0.1)',
            color: '#ff6b6b',
            border: '1px solid rgba(211,47,47,0.3)',
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
            backgroundColor: 'rgba(46,125,50,0.1)',
            color: '#66bb6a',
            border: '1px solid rgba(46,125,50,0.3)',
          }}
          onClose={() => setCancelSuccess('')}
        >
          {cancelSuccess}
        </Alert>
      )}

      {reservations && reservations.length === 0 ? (
        <Alert severity="info">You don't have any reservations yet.</Alert>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="reservation tabs"
              sx={{
                '& .MuiTab-root': {
                  color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  '&.Mui-selected': {
                    color: isDarkMode ? '#FFD700' : 'primary.main',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: isDarkMode ? '#FFD700' : 'primary.main',
                },
              }}
            >
              <Tab
                icon={<EventAvailable />}
                iconPosition="start"
                label={`Active (${active.length})`}
              />
              <Tab
                icon={<History />}
                iconPosition="start"
                label={`Past (${past.length})`}
              />
              <Tab
                icon={<Cancel />}
                iconPosition="start"
                label={`Cancelled (${cancelled.length})`}
              />
            </Tabs>
          </Box>

          {tabValue === 0 && renderReservations(active)}
          {tabValue === 1 && renderReservations(past)}
          {tabValue === 2 && renderReservations(cancelled)}
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
            bgcolor: isDarkMode ? 'rgba(26,26,26,0.95)' : 'background.paper',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
          },
        }}
      >
        <DialogTitle
          id="cancel-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: isDarkMode ? '#FFD700' : 'primary.main',
            fontWeight: 600,
          }}
        >
          <Cancel sx={{ color: '#ff6b6b' }} />
          Cancel Reservation
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="cancel-dialog-description"
            sx={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}
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
            startIcon={<EventAvailable />}
            sx={{
              color: isDarkMode ? '#FFD700' : 'primary.main',
              borderColor: isDarkMode ? 'rgba(255,215,0,0.3)' : 'divider',
              '&:hover': {
                borderColor: isDarkMode ? '#FFD700' : 'primary.main',
                backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(25,118,210,0.05)',
              },
            }}
          >
            Keep Reservation
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            disabled={isCancelling}
            size="large"
            startIcon={isCancelling ? <CircularProgress size={20} color="inherit" /> : <Close />}
            autoFocus
            sx={{
              background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              },
            }}
          >
            {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Cancellation Dialog with Refund Policy */}
      <CancellationDialog
        open={cancellationDialogOpen}
        onClose={() => {
          setCancellationDialogOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        onSuccess={() => {
          setCancelSuccess('Reservation cancelled successfully!');
        }}
      />
    </Container>
  );
};

export default Reservations;
