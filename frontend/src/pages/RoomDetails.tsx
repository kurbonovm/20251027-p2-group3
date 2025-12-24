import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  TextField,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  People,
  AspectRatio,
  Stairs,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useGetRoomByIdQuery } from '../features/rooms/roomsApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import Loading from '../components/Loading';

/**
 * Room details page component
 */
const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const { data: room, isLoading, error } = useGetRoomByIdQuery(id!);

  // Get booking context from location state (if returning from login)
  const locationState = location.state as { bookingContext?: { checkInDate?: string; checkOutDate?: string; guests?: number } } | null;
  const bookingContext = locationState?.bookingContext;

  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number | ''>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [guestsError, setGuestsError] = useState<string>('');

  // Restore booking context when returning from login
  useEffect(() => {
    if (bookingContext) {
      if (bookingContext.checkInDate) {
        setCheckInDate(new Date(bookingContext.checkInDate));
      }
      if (bookingContext.checkOutDate) {
        setCheckOutDate(new Date(bookingContext.checkOutDate));
      }
      if (bookingContext.guests) {
        setGuests(bookingContext.guests);
      }
      // Clear the booking context from location state to avoid restoring on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [bookingContext, location.pathname, navigate]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Format dates to preserve booking selections
      const formatDate = (date: Date | null): string => {
        if (!date) return '';
        const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return d.toISOString().split('T')[0];
      };
      
      // Navigate to login with booking context to redirect to booking payment page after authentication
      navigate('/login', {
        state: {
          returnTo: `/booking`,
          bookingContext: {
            roomId: id,
            checkInDate: formatDate(checkInDate),
            checkOutDate: formatDate(checkOutDate),
            guests: typeof guests === 'number' ? guests : (guests === '' ? 1 : parseInt(guests.toString()) || 1),
          },
        },
      });
      return;
    }

    // Validate guests is provided
    if (!guests || guests === '') {
      setGuestsError('Please enter the number of guests');
      return;
    }
    
    // Validate guests is a positive number
    const numGuests = typeof guests === 'number' ? guests : parseInt(guests.toString());
    if (isNaN(numGuests) || numGuests < 1) {
      setGuestsError('Number of guests must be at least 1');
      return;
    }
    
    // Validate guests don't exceed room capacity
    if (numGuests > room.capacity) {
      setGuestsError(`Maximum capacity is ${room.capacity} guests`);
      return;
    }

    // Format dates to ISO string for backend (timezone-neutral)
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      // Use toISOString and extract just the date part to avoid timezone issues
      const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return d.toISOString().split('T')[0];
    };

    navigate('/booking', {
      state: {
        room,
        checkInDate: formatDate(checkInDate),
        checkOutDate: formatDate(checkOutDate),
        guests: typeof guests === 'number' ? guests : (guests === '' ? 1 : parseInt(guests.toString()) || 1),
      },
    });
  };

  const handleGuestsChange = (value: string) => {
    // Allow empty input to show placeholder
    if (value === '') {
      setGuests('');
      setGuestsError('');
      return;
    }
    
    const numGuests = parseInt(value);
    
    // Check if it's a valid number
    if (isNaN(numGuests)) {
      setGuests('');
      setGuestsError('');
      return;
    }
    
    // Validate that the number is positive (at least 1)
    if (numGuests < 1) {
      setGuestsError('Number of guests must be at least 1');
      setGuests(numGuests); // Keep the invalid value so user can see the error
      return;
    }
    
    // Set the value and check for capacity constraint
    setGuests(numGuests);
    if (numGuests > room.capacity) {
      setGuestsError(`Maximum capacity is ${room.capacity} guests`);
    } else {
      setGuestsError('');
    }
  };

  if (isLoading) return <Loading message="Loading room details..." />;

  if (error) {
    return (
      <Container>
        <Alert severity="error">Failed to load room details. Please try again.</Alert>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container>
        <Alert severity="error">Room not found.</Alert>
      </Container>
    );
  }

  // Determine if we have additional images
  const hasAdditionalImages = room.additionalImages && room.additionalImages.length > 0;
  const allImages = [room.imageUrl, ...(room.additionalImages || [])].filter(Boolean);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            width: '100%',
          }}
        >
          {/* Heroic Main Image - Left Side */}
          <Box
            sx={{
              width: { xs: '100%', md: hasAdditionalImages ? '60%' : '100%' },
              height: { xs: 400, md: 600 },
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={selectedImage || room.imageUrl || 'https://via.placeholder.com/800x600?text=Room+Image'}
              alt={room.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                cursor: 'pointer',
                transition: 'opacity 0.3s ease',
                '&:hover': {
                  opacity: 0.95,
                },
              }}
              onClick={() => {
                // Cycle through images on click
                const currentIndex = allImages.findIndex(img => img === (selectedImage || room.imageUrl));
                const nextIndex = (currentIndex + 1) % allImages.length;
                setSelectedImage(allImages[nextIndex]);
              }}
            />
          </Box>

          {/* Dynamic Asymmetrical Grid - Right Side (only if additional images exist) */}
          {hasAdditionalImages && (
            <Box
              sx={{
                width: { xs: '100%', md: '40%' },
                height: { xs: 'auto', md: 600 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                flexShrink: 0,
              }}
            >
                {room.additionalImages.length === 1 ? (
                  // Single additional image - full height
                  <Box
                    component="img"
                    src={room.additionalImages[0]}
                    alt={`${room.name} additional 1`}
                    onClick={() => setSelectedImage(room.additionalImages![0])}
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 2,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedImage === room.additionalImages![0] ? '3px solid #1976d2' : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        opacity: 0.9,
                        transform: 'scale(1.02)',
                      },
                    }}
                  />
                ) : room.additionalImages.length === 2 ? (
                  // Two additional images - stacked
                  <>
                    <Box
                      component="img"
                      src={room.additionalImages[0]}
                      alt={`${room.name} additional 1`}
                      onClick={() => setSelectedImage(room.additionalImages![0])}
                      sx={{
                        width: '100%',
                        height: '50%',
                        borderRadius: 2,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: selectedImage === room.additionalImages![0] ? '3px solid #1976d2' : '3px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          opacity: 0.9,
                          transform: 'scale(1.02)',
                        },
                      }}
                    />
                    <Box
                      component="img"
                      src={room.additionalImages[1]}
                      alt={`${room.name} additional 2`}
                      onClick={() => setSelectedImage(room.additionalImages![1])}
                      sx={{
                        width: '100%',
                        height: '50%',
                        borderRadius: 2,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: selectedImage === room.additionalImages![1] ? '3px solid #1976d2' : '3px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          opacity: 0.9,
                          transform: 'scale(1.02)',
                        },
                      }}
                    />
                  </>
                ) : (
                  // Three or more images - asymmetrical grid
                  <Grid container spacing={1} sx={{ height: '100%' }}>
                    {/* First image - takes 2/3 of width, full height */}
                    <Grid item xs={8}>
                      <Box
                        component="img"
                        src={room.additionalImages[0]}
                        alt={`${room.name} additional 1`}
                        onClick={() => setSelectedImage(room.additionalImages![0])}
                        sx={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 2,
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: selectedImage === room.additionalImages![0] ? '3px solid #1976d2' : '3px solid transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            opacity: 0.9,
                            transform: 'scale(1.02)',
                          },
                        }}
                      />
                    </Grid>
                    {/* Right column - stacked smaller images */}
                    <Grid item xs={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                        {room.additionalImages.slice(1, 3).map((img, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={img}
                            alt={`${room.name} additional ${index + 2}`}
                            onClick={() => setSelectedImage(img)}
                            sx={{
                              width: '100%',
                              height: index === 0 && room.additionalImages!.length > 3 ? '60%' : '50%',
                              borderRadius: 2,
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: selectedImage === img ? '3px solid #1976d2' : '3px solid transparent',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                opacity: 0.9,
                                transform: 'scale(1.02)',
                              },
                            }}
                          />
                        ))}
                        {/* If more than 3 images, show a "more" indicator */}
                        {room.additionalImages.length > 3 && (
                          <Box
                            onClick={() => {
                              // Show next image in sequence
                              const currentIndex = allImages.findIndex(img => img === selectedImage);
                              const nextIndex = (currentIndex + 1) % allImages.length;
                              setSelectedImage(allImages[nextIndex]);
                            }}
                            sx={{
                              width: '100%',
                              height: '40%',
                              borderRadius: 2,
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              border: '2px dashed rgba(255, 255, 255, 0.3)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                borderColor: '#1976d2',
                              },
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                              +{room.additionalImages.length - 3} more
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Box>
          )}
        </Box>

        {/* Room Details Section */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                p: 2.5,
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Room Name */}
              <Typography
                variant="h4"
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {room.name}
              </Typography>

              {/* Type and Availability Badges */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Chip
                  label={room.type}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: '#ffffff',
                    fontWeight: 600,
                    borderRadius: '20px',
                    px: 1,
                  }}
                />
                {room.available ? (
                  <Chip
                    label="AVAILABLE"
                    sx={{
                      backgroundColor: '#4caf50',
                      color: '#ffffff',
                      fontWeight: 600,
                      borderRadius: '20px',
                      px: 1,
                    }}
                  />
                ) : (
                  <Chip
                    label="NOT AVAILABLE"
                    sx={{
                      backgroundColor: '#f44336',
                      color: '#ffffff',
                      fontWeight: 600,
                      borderRadius: '20px',
                      px: 1,
                    }}
                  />
                )}
              </Box>

              {/* Price */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#42a5f5',
                    mr: 0.5,
                  }}
                >
                  ${room.pricePerNight}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '1rem',
                    color: '#ffffff',
                  }}
                >
                  {' '}/ night
                </Typography>
              </Box>

                    {/* Description */}
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 2,
                        lineHeight: 1.5,
                        fontSize: '0.9rem',
                      }}
                    >
                      {room.description}
                    </Typography>

              {/* Capacity, Size, Floor */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ color: '#42a5f5', mr: 1.5, fontSize: 20 }} />
                  <Typography sx={{ color: '#ffffff' }}>
                    Capacity: {room.capacity} guests
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AspectRatio sx={{ color: '#42a5f5', mr: 1.5, fontSize: 20 }} />
                  <Typography sx={{ color: '#ffffff' }}>
                    Size: {room.size} sq ft
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0 }}>
                  <Stairs sx={{ color: '#42a5f5', mr: 1.5, fontSize: 20 }} />
                  <Typography sx={{ color: '#ffffff' }}>
                    Floor: {room.floorNumber}
                  </Typography>
                </Box>
              </Box>

              {/* Amenities Section */}
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  mb: 1.5,
                }}
              >
                Amenities
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 1,
                  mb: 2.5,
                }}
              >
                {room.amenities?.map((amenity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <CheckCircle sx={{ color: '#1976d2', fontSize: 20 }} />
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    >
                      {amenity}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Select Your Stay Section */}
              <Box component="form" sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                >
                  Select Your Stay
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {/* Check-in */}
                    <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#ffffff',
                          mb: 0.75,
                          fontWeight: 500,
                          fontSize: '0.875rem',
                        }}
                      >
                        Check-in
                      </Typography>
                      <DatePicker
                        value={checkInDate}
                        onChange={(newValue) => setCheckInDate(newValue)}
                        minDate={new Date()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: 'Add date',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                borderRadius: 2,
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#1976d2',
                                },
                              },
                              '& .MuiInputBase-input': {
                                color: '#ffffff',
                              },
                              '& .MuiInputBase-input::placeholder': {
                                color: 'rgba(255, 255, 255, 0.5)',
                                opacity: 1,
                              },
                            },
                          },
                        }}
                      />
                    </Grid>
                    {/* Check-out */}
                    <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#ffffff',
                          mb: 0.75,
                          fontWeight: 500,
                          fontSize: '0.875rem',
                        }}
                      >
                        Check-out
                      </Typography>
                      <DatePicker
                        value={checkOutDate}
                        onChange={(newValue) => setCheckOutDate(newValue)}
                        minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date()}
                        disabled={!checkInDate}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: 'Add date',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                borderRadius: 2,
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#1976d2',
                                },
                              },
                              '& .MuiInputBase-input': {
                                color: '#ffffff',
                              },
                              '& .MuiInputBase-input::placeholder': {
                                color: 'rgba(255, 255, 255, 0.5)',
                                opacity: 1,
                              },
                            },
                          },
                        }}
                      />
                    </Grid>
                    {/* Guests */}
                    <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#ffffff',
                          mb: 0.75,
                          fontWeight: 500,
                          fontSize: '0.875rem',
                        }}
                      >
                        Guests
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={guests === '' ? '' : guests}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers
                          if (value === '' || /^\d+$/.test(value)) {
                            handleGuestsChange(value);
                          }
                        }}
                        placeholder="Number"
                        error={!!guestsError}
                        helperText={guestsError}
                        inputProps={{
                          min: 1,
                          max: room?.capacity || 10,
                          step: 1,
                        }}
                        sx={{
                          minWidth: '140px',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                            borderRadius: 2,
                            height: '56px', // Match DatePicker height
                            '& fieldset': {
                              borderColor: guestsError ? '#f44336' : 'rgba(255, 255, 255, 0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: guestsError ? '#f44336' : 'rgba(255, 255, 255, 0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: guestsError ? '#f44336' : '#1976d2',
                            },
                            '&.Mui-error fieldset': {
                              borderColor: '#f44336',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#ffffff',
                            paddingRight: '8px',
                            '&::placeholder': {
                              color: 'rgba(255, 255, 255, 0.5) !important',
                              opacity: '1 !important',
                              fontSize: '1rem',
                            },
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            opacity: 1,
                            fontSize: '1rem',
                          },
                          '& .MuiFormHelperText-root': {
                            color: guestsError ? '#f44336' : 'rgba(255, 255, 255, 0.5)',
                            fontSize: '0.75rem',
                            mt: 0.5,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>

                {/* Login to Book Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleBookNow}
                  disabled={!room.available || !checkInDate || !checkOutDate || !guests || guests === '' || (typeof guests === 'number' && (guests < 1 || guests > room.capacity))}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: '#ffffff',
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {isAuthenticated ? 'Book Now' : 'Login to Book'}
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RoomDetails;
