import React from 'react';
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  reservationId: string;
  amount: number;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
          </Box>

          <Typography variant="h4" gutterBottom color="success.main">
            Payment Successful!
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            Your reservation has been confirmed.
          </Typography>

          {state && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reservation ID: {state.reservationId}
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Amount Paid: ${state.amount.toFixed(2)}
              </Typography>
            </>
          )}

          <Typography variant="body2" sx={{ mb: 4 }}>
            A confirmation email has been sent to your email address with all the details.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentSuccess;
