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
} from '@mui/material';
import { useGetUserReservationsQuery, useCancelReservationMutation } from '../features/reservations/reservationsApi';
import { useState } from 'react';

/**
 * Reservations page component to view user's reservations
 * @returns {React.ReactNode} The reservations page
 */
const Reservations = () => {
  const { data: reservations, isLoading, error } = useGetUserReservationsQuery();
  const [cancelReservation] = useCancelReservationMutation();
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  const handleCancelReservation = async (reservationId) => {
    setCancelError('');
    setCancelSuccess('');

    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await cancelReservation(reservationId).unwrap();
      setCancelSuccess('Reservation cancelled successfully!');
    } catch (err) {
      setCancelError(err.data?.message || 'Failed to cancel reservation.');
    }
  };

  const getStatusColor = (status) => {
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

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom>
        My Reservations
      </Typography>

      {cancelError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCancelError('')}>
          {cancelError}
        </Alert>
      )}

      {cancelSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCancelSuccess('')}>
          {cancelSuccess}
        </Alert>
      )}

      {reservations && reservations.length === 0 ? (
        <Alert severity="info">You don't have any reservations yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {reservations?.map((reservation) => (
            <Grid item xs={12} key={reservation.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" component="h2">
                      Reservation #{reservation.id}
                    </Typography>
                    <Chip
                      label={reservation.status}
                      color={getStatusColor(reservation.status)}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" color="text.secondary">
                        <strong>Room:</strong> {reservation.room?.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>Room Type:</strong> {reservation.room?.type}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>Check-in:</strong>{' '}
                        {new Date(reservation.checkInDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>Check-out:</strong>{' '}
                        {new Date(reservation.checkOutDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" color="text.secondary">
                        <strong>Guests:</strong> {reservation.numberOfGuests}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>Total Amount:</strong> ${reservation.totalAmount}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>Booked on:</strong>{' '}
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  {reservation.status?.toLowerCase() === 'confirmed' && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        Cancel Reservation
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Reservations;
