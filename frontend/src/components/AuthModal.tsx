import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Link,
  InputAdornment,
} from '@mui/material';
import {
  Close,
  Email,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { useLoginMutation, useRegisterMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { LoginRequest, RegisterRequest } from '../types';

interface BookingContext {
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  returnTo?: string;
  bookingContext?: BookingContext;
}

/**
 * Authentication Modal component for Login and Registration
 */
const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, initialTab = 'login', returnTo, bookingContext }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [error, setError] = useState<string>('');

  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Reset form when tab changes
  useEffect(() => {
    setError('');
  }, [tab]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setError('');
      setLoginData({ email: '', password: '' });
      setRegisterData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
      });
      setTab(initialTab);
    }
  }, [open, initialTab]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(loginData).unwrap();
      dispatch(setCredentials(result));
      onClose();
      
      // Check user role and route accordingly
      const userRoles = result.user.roles || [];
      const isAdmin = userRoles.includes('ADMIN');
      const isManager = userRoles.includes('MANAGER');
      
      // If user has admin or manager role, redirect to admin dashboard
      if (isAdmin || isManager) {
        navigate('/admin/dashboard', { replace: true });
      } else if (returnTo) {
        // Regular users: redirect to returnTo path with booking context if provided
        navigate(returnTo, {
          state: bookingContext ? { bookingContext } : undefined,
          replace: true,
        });
      } else {
        // Regular users: go to home page
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.data?.message || 'Failed to login. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (registerData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const result = await register(registerData).unwrap();
      dispatch(setCredentials(result));
      onClose();
      
      // Check user role and route accordingly
      // Note: Registration always creates GUEST users, but we check anyway for consistency
      const userRoles = result.user.roles || [];
      const isAdmin = userRoles.includes('ADMIN');
      const isManager = userRoles.includes('MANAGER');
      
      // If user has admin or manager role, redirect to admin dashboard
      if (isAdmin || isManager) {
        navigate('/admin/dashboard', { replace: true });
      } else if (returnTo) {
        // Regular users: redirect to returnTo path with booking context if provided
        navigate(returnTo, {
          state: bookingContext ? { bookingContext } : undefined,
          replace: true,
        });
      } else {
        // Regular users: go to home page
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.data?.message || 'Failed to register. Please try again.');
    }
  };

  const handleOAuth2Login = (provider: string) => {
    // Store returnTo and bookingContext in sessionStorage for OAuth2 callback
    if (returnTo) {
      sessionStorage.setItem('oauth2_returnTo', returnTo);
      if (bookingContext) {
        sessionStorage.setItem('oauth2_bookingContext', JSON.stringify(bookingContext));
      }
    }
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth2/${provider}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          color: '#ffffff',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
        }}
      >
        {/* Background Image - Hotel Interior */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '220px',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop&q=90)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '220px',
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
            zIndex: 1,
          }}
        />

        {/* Cancel Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#ffffff',
            width: 40,
            height: 40,
            borderRadius: '50%',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <Close />
        </IconButton>

        {/* Welcome Section */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            pt: 8,
            px: 3,
            pb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              // color: '#ffffff',
              // fontWeight: 800,
              // mb: 1,
              // textShadow: '5px 5px 10px #000000, -5px  -5px 10px #000000',
              color: 
              '#ffffff',
              mb: 3,
              textShadow: '5px 5px 10px #000000, -5px  -5px 10px #000000',
              fontWeight: 800,
              fontSize: '1.5rem',
            }}
          >
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#ffffff',
              mb: 3,
              textShadow: '5px 5px 10px #000000, -5px  -5px 10px #000000',
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            {tab === 'login'
              ? 'Log in to manage your bookings'
              : 'Sign up to start booking your perfect stay'}
          </Typography>

          {/* Tabs */}
          <Box
            sx={{
              display: 'flex',
              gap: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
              p: 0.5,
              mb: 3,
            }}
          >
            <Button
              onClick={() => setTab('login')}
              fullWidth
              sx={{
                backgroundColor: tab === 'login' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: '#000000',
                textTransform: 'none',
                fontWeight: tab === 'login' ? 600 : 400,
                borderRadius: 1,
                py: 1,
                textShadow: '10px 10px 13px #000000',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
             <Typography
                sx={{
                  color: '#ffffff',
                  textShadow: '5px 5px 10px #000000, -5px  -5px 10px #000000',
                  fontWeight: tab === 'login' ? 800 : 700,
                  fontSize: '1.5rem',
                  textTransform: 'none',
                }}
              >
                Log In
              </Typography>
            </Button>
            <Button
              onClick={() => setTab('register')}
              fullWidth
              sx={{
                backgroundColor: tab === 'register' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: '#ffffff',
                textTransform: 'none',
                // fontWeight: tab === 'register' ? 800 : 700,
                borderRadius: 1,
                py: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  textShadow: '5px 5px 10px #000000, -5px  -5px 10px #000000',
                  fontWeight: tab === 'register' ? 800 : 700,
                  fontSize: '1.5rem',
                  textTransform: 'none',
                }}
              >
                Sign Up
              </Typography>
              
            </Button>
          </Box>
        </Box>

        <DialogContent
          sx={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: '#1a1a1a',
            pt: 2,
            maxHeight: '70vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              },
            },
          }}
        >
        {error && (
          <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
            {error}
          </Alert>
        )}

        {tab === 'login' ? (
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                Email Address
              </Typography>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                autoFocus
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleLoginChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Email sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                Password
              </Typography>
              <TextField
                required
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleLoginChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#ffffff' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  sx={{
                    color: '#1976d2',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 3,
                py: 1.5,
                backgroundColor: '#1976d2',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
              disabled={isLoginLoading}
            >
              {isLoginLoading ? 'Signing In...' : 'Log In'}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  px: 2,
                  fontWeight: 500,
                }}
              >
                OR CONTINUE WITH
              </Typography>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleOAuth2Login('google')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
                startIcon={
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </Box>
                }
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleOAuth2Login('facebook')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
                startIcon={
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FacebookIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                  </Box>
                }
              >
                Facebook
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                fontSize: '0.75rem',
              }}
            >
              By continuing, you agree to our{' '}
              <Link href="#" sx={{ color: '#1976d2', textDecoration: 'none' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" sx={{ color: '#1976d2', textDecoration: 'none' }}>
                Privacy Policy.
              </Link>
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegisterSubmit} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  mb: 0.75,
                  fontWeight: 500,
                }}
              >
                First Name
              </Typography>
              <TextField
                required
                fullWidth
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                placeholder="Enter your first name"
                value={registerData.firstName}
                onChange={handleRegisterChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  mb: 0.75,
                  fontWeight: 500,
                }}
              >
                Last Name
              </Typography>
              <TextField
                required
                fullWidth
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                placeholder="Enter your last name"
                value={registerData.lastName}
                onChange={handleRegisterChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  mb: 0.75,
                  fontWeight: 500,
                }}
              >
                Email Address
              </Typography>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                type="email"
                placeholder="Enter your email"
                value={registerData.email}
                onChange={handleRegisterChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Email sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  mb: 0.75,
                  fontWeight: 500,
                }}
              >
                Phone Number
              </Typography>
              <TextField
                required
                fullWidth
                id="phoneNumber"
                name="phoneNumber"
                autoComplete="tel"
                placeholder="Enter your phone number"
                value={registerData.phoneNumber}
                onChange={handleRegisterChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  mb: 0.75,
                  fontWeight: 500,
                }}
              >
                Password
              </Typography>
              <TextField
                required
                fullWidth
                name="password"
                type={showRegisterPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                value={registerData.password}
                onChange={handleRegisterChange}
                helperText="Must be at least 8 characters"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        edge="end"
                        sx={{ color: '#ffffff' }}
                      >
                        {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1.5,
                mb: 2,
                py: 1.25,
                backgroundColor: '#1976d2',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
              disabled={isRegisterLoading}
            >
              {isRegisterLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  px: 2,
                  fontWeight: 500,
                }}
              >
                OR CONTINUE WITH
              </Typography>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleOAuth2Login('google')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
                startIcon={
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </Box>
                }
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleOAuth2Login('facebook')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
                startIcon={
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FacebookIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                  </Box>
                }
              >
                Facebook
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                fontSize: '0.75rem',
              }}
            >
              By continuing, you agree to our{' '}
              <Link href="#" sx={{ color: '#1976d2', textDecoration: 'none' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" sx={{ color: '#1976d2', textDecoration: 'none' }}>
                Privacy Policy.
              </Link>
            </Typography>
          </Box>
        )}
      </DialogContent>
      </Box>
    </Dialog>
  );
};

export default AuthModal;

