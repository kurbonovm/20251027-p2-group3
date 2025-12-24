import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import AuthModal from '../components/AuthModal';

interface LocationState {
  error?: string;
  returnTo?: string;
  bookingContext?: {
    roomId?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guests?: number;
  };
}

/**
 * Login page component - displays AuthModal
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string>('');
  const locationState = location.state as LocationState | null;

  // Check for OAuth2 errors from location state
  useEffect(() => {
    if (locationState?.error) {
      setError(locationState.error);
      // Clear the error from location state
      navigate(location.pathname, { replace: true, state: { ...locationState, error: undefined } });
    }
  }, [location, navigate, locationState]);

  const handleClose = () => {
    setOpen(false);
    // If there's a returnTo path, navigate there, otherwise go home
    if (locationState?.returnTo) {
      navigate(locationState.returnTo, {
        state: locationState.bookingContext ? { bookingContext: locationState.bookingContext } : undefined,
      });
    } else {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AuthModal
        open={open}
        onClose={handleClose}
        initialTab="login"
        returnTo={locationState?.returnTo}
        bookingContext={locationState?.bookingContext}
      />
    </Box>
  );
};

export default Login;
