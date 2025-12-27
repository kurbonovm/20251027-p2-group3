import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions, PaymentIntent } from '@stripe/stripe-js';
import { format } from 'date-fns';
import StripePaymentForm from '../components/StripePaymentForm';
import { useCreatePaymentIntentPublicMutation, useConfirmPaymentMutation } from '../features/payments/paymentsApi';
import { Reservation } from '../types';
import axios from 'axios';
import { CountdownTimer } from '../components/CountdownTimer';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const PublicPayment: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [createPaymentIntent] = useCreatePaymentIntentPublicMutation();
  const [confirmPayment] = useConfirmPaymentMutation();

  useEffect(() => {
    const fetchReservation = async () => {
      if (!token) {
        setError('Invalid payment link');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        const response = await axios.get(`${apiUrl}/reservations/payment-link/${token}`);
        const reservationData = response.data as Reservation;

        setReservation(reservationData);

        // Create payment intent
        const paymentIntent = await createPaymentIntent({
          reservationId: reservationData.id,
          amount: reservationData.totalAmount,
        }).unwrap();

        setClientSecret(paymentIntent.clientSecret);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching reservation:', err);
        if (err.response?.status === 404) {
          setError('This payment link is invalid or has expired.');
        } else if (err.response?.status === 410) {
          setError('This payment link has expired. Please contact the hotel.');
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load payment information. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchReservation();
  }, [token, createPaymentIntent]);

  const handlePaymentSuccess = async (paymentIntent: PaymentIntent) => {
    if (!reservation) return;

    try {
      await confirmPayment({
        paymentIntentId: paymentIntent.id,
        reservationId: reservation.id,
      }).unwrap();

      // Redirect to success page
      navigate('/payment-success', {
        state: {
          reservationId: reservation.id,
          amount: reservation.totalAmount
        }
      });
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError('Payment was processed but confirmation failed. Please contact support.');
    }
  };

  const options: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }
    : undefined;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading payment information...
        </Typography>
      </Container>
    );
  }

  if (error || !reservation || !clientSecret || !stripePromise) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">
          <Typography variant="h6">{error || 'Unable to load payment form'}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            If you need assistance, please contact the hotel directly.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Complete Your Reservation
          </Typography>

          {reservation.expiresAt && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CountdownTimer
                expiresAt={reservation.expiresAt}
                onExpired={() => {
                  setError('This payment link has expired. Please contact the hotel to create a new reservation.');
                }}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Reservation Details
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Room
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {reservation.room.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Room Type
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {reservation.room.type}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Check-in
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {format(new Date(reservation.checkInDate), 'MMM dd, yyyy')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Check-out
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {format(new Date(reservation.checkOutDate), 'MMM dd, yyyy')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Guests
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {reservation.numberOfGuests}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${reservation.totalAmount.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Payment Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your payment details below to complete your reservation.
          </Typography>

          <Elements stripe={stripePromise} options={options}>
            <StripePaymentForm
              onSuccess={handlePaymentSuccess}
              amount={reservation.totalAmount}
            />
          </Elements>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PublicPayment;
