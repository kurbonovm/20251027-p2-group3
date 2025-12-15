import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress, Alert, Container } from '@mui/material';
import { setCredentials } from '../features/auth/authSlice';

/**
 * OAuth2 callback handler page
 * Processes OAuth2 authentication response and redirects user
 */
const OAuth2Callback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // OAuth2 authentication failed
      console.error('OAuth2 authentication error:', error);
      // Redirect to login with error message
      navigate('/login', {
        state: { error: `Authentication failed: ${error}` },
        replace: true,
      });
      return;
    }

    if (token) {
      // OAuth2 authentication succeeded - create async function to handle token processing
      const processToken = async () => {
        try {
          // Fetch user info from backend using the token
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user info');
          }
          
          const userInfo = await response.json();
          
          // Dispatch setCredentials to update Redux state and localStorage
          dispatch(setCredentials({ user: userInfo, token }));
          
          // Retrieve returnTo and bookingContext from sessionStorage
          const returnTo = sessionStorage.getItem('oauth2_returnTo');
          const bookingContextStr = sessionStorage.getItem('oauth2_bookingContext');
          
          // Clear sessionStorage
          sessionStorage.removeItem('oauth2_returnTo');
          sessionStorage.removeItem('oauth2_bookingContext');
          
          // Check user role and route accordingly
          const userRoles = userInfo.roles || [];
          const isAdmin = userRoles.includes('ADMIN');
          const isManager = userRoles.includes('MANAGER');
          
          // If user has admin or manager role, redirect to admin dashboard
          if (isAdmin || isManager) {
            navigate('/admin/dashboard', { replace: true });
          } else if (returnTo) {
            // Regular users: redirect to returnTo path with booking context if available
            const bookingContext = bookingContextStr ? JSON.parse(bookingContextStr) : undefined;
            navigate(returnTo, {
              replace: true,
              state: bookingContext ? { bookingContext } : undefined,
            });
          } else {
            // Regular users: go to home page
        navigate('/', { replace: true });
          }
      } catch (err) {
        console.error('Failed to process OAuth2 token:', err);
        navigate('/login', {
          state: { error: 'Failed to process authentication. Please try again.' },
          replace: true,
        });
      }
      };

      // Call the async function
      processToken();
    } else {
      // No token or error - redirect to login
      navigate('/login', {
        state: { error: 'OAuth2 authentication was not completed.' },
        replace: true,
      });
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Alert severity="info">Processing authentication...</Alert>
      </Box>
    </Container>
  );
};

export default OAuth2Callback;
