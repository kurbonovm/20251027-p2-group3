import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import { ArrowBack, CalendarMonth, People, AttachMoney } from '@mui/icons-material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useGetReservationByIdQuery } from '../features/reservations/reservationsApi';
import { useCreatePaymentIntentMutation, useConfirmPaymentMutation } from '../features/payments/paymentsApi';
import StripePaymentForm from '../components/StripePaymentForm';
import { PaymentIntent } from '@stripe/stripe-js';

// Load Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;

if (!stripePublicKey || stripePublicKey === 'undefined') {
  console.error('VITE_STRIPE_PUBLIC_KEY is not defined in environment variables');
}

const stripePromise = stripePublicKey && stripePublicKey !== 'undefined'
  ? loadStripe(stripePublicKey)
  : null;

/**
 * Resume Payment page - allows users to complete payment for existing PENDING reservations
 */
const ResumePayment: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const { data: reservation, isLoading: isLoadingReservation, error: reservationError } = useGetReservationByIdQuery(
    reservationId || '',
    { skip: !reservationId }
  );

  const [createPaymentIntent, { isLoading: isCreatingPayment }] = useCreatePaymentIntentMutation();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Create payment intent when reservation is loaded
  useEffect(() => {
    if (reservation && reservation.status === 'PENDING' && !clientSecret) {
      handleCreatePaymentIntent();
    }
  }, [reservation]);

  const handleCreatePaymentIntent = async () => {
    if (!reservation) return;

    try {
      setError(null);
      const paymentIntent = await createPaymentIntent({
        reservationId: reservation.id,
        amount: reservation.totalAmount,
      }).unwrap();

      setClientSecret(paymentIntent.clientSecret);
      setPaymentIntentId(paymentIntent.paymentIntentId);
    } catch (err: any) {
      console.error('Failed to create payment intent:', err);
      setError(err.data?.message || err.message || 'Failed to initialize payment. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentIntent: PaymentIntent) => {
    try {
      await confirmPayment({
        paymentIntentId: paymentIntentId!,
        reservationId: reservationId!,
      }).unwrap();

      setSuccess('Payment processed successfully! Redirecting...');

      setTimeout(() => {
        navigate('/reservations', {
          state: { message: 'Payment completed successfully! Your reservation is now confirmed.' },
        });
      }, 2000);
    } catch (err: any) {
      console.error('Failed to confirm payment:', err);
      setError('Payment succeeded but confirmation failed. Please contact support.');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (isLoadingReservation) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (reservationError || !reservation) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">
          Reservation not found. Please check your reservations and try again.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/reservations')}
          sx={{ mt: 2 }}
        >
          Back to Reservations
        </Button>
      </Container>
    );
  }

  if (reservation.status !== 'PENDING') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="info">
          This reservation is already {reservation.status.toLowerCase()}. Payment is not required.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/reservations')}
          sx={{ mt: 2 }}
        >
          Back to Reservations
        </Button>
      </Container>
    );
  }

  // Calculate number of nights
  const checkIn = new Date(reservation.checkInDate);
  const checkOut = new Date(reservation.checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const elementsOptions: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: isDarkMode ? 'night' : 'stripe',
          variables: {
            colorPrimary: isDarkMode ? '#FFD700' : '#1976d2',
          },
        },
      }
    : undefined;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/reservations')}
          sx={{ mb: 3 }}
        >
          Back to Reservations
        </Button>

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            mb: 4,
            background: isDarkMode ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}
        >
          Complete Your Payment
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Reservation Details */}
          <Card
            elevation={3}
            sx={{
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                Reservation Details
              </Typography>

              <Box sx={{ mb: 3 }}>
                <img
                  src={reservation.room.imageUrl}
                  alt={reservation.room.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
              </Box>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {reservation.room.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarMonth sx={{ color: isDarkMode ? '#FFD700' : 'primary.main' }} />
                <Typography variant="body1">
                  {checkIn.toLocaleDateString()} - {checkOut.toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People sx={{ color: isDarkMode ? '#FFD700' : 'primary.main' }} />
                <Typography variant="body1">{reservation.numberOfGuests} Guests</Typography>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                {nights} night{nights > 1 ? 's' : ''} × ${reservation.room.pricePerNight}/night
              </Typography>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card
            elevation={3}
            sx={{
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                Payment Summary
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">${reservation.totalAmount.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: isDarkMode ? '#FFD700' : 'primary.main',
                    }}
                  >
                    ${reservation.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Payment Form */}
        {isCreatingPayment && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {clientSecret && elementsOptions && stripePromise && (
          <Card
            elevation={3}
            sx={{
              mt: 3,
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                Payment Information
              </Typography>
              <Elements stripe={stripePromise} options={elementsOptions}>
                <StripePaymentForm
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default ResumePayment;
