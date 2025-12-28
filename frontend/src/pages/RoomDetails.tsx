import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  Button,
  Chip,
  TextField,
  Alert,
  useTheme,
  Popover,
  IconButton,
} from '@mui/material';
import { CheckCircle, People, AspectRatio, Stairs, ArrowBack, CalendarMonth as CalendarIcon, Close as CloseIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useGetRoomByIdQuery, useGetBookedDatesQuery } from '../features/rooms/roomsApi';
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const { data: room, isLoading, error } = useGetRoomByIdQuery(id!);
  const { data: bookedDates = [] } = useGetBookedDatesQuery(id!);

  const [dateRange, setDateRange] = useState<{
    checkIn: Date | null;
    checkOut: Date | null;
  }>({ checkIn: null, checkOut: null });
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLButtonElement | null>(null);
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);
  const [guests, setGuests] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // For backwards compatibility with existing code
  const checkInDate = dateRange.checkIn;
  const checkOutDate = dateRange.checkOut;

  // Date picker handlers
  const handleDatePickerOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDatePickerAnchor(event.currentTarget);
    setSelectingCheckIn(true);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
    setSelectingCheckIn(true);
  };

  const handleDateSelect = (date: Date | null) => {
    if (selectingCheckIn) {
      setDateRange({ checkIn: date, checkOut: null });
      setSelectingCheckIn(false);
    } else {
      if (date && dateRange.checkIn && date < dateRange.checkIn) {
        // If check-out is before check-in, swap them
        setDateRange({ checkIn: date, checkOut: dateRange.checkIn });
      } else {
        setDateRange({ ...dateRange, checkOut: date });
      }
      // Close the picker after selecting checkout date
      setTimeout(() => handleDatePickerClose(), 300);
    }
  };

  const clearDates = () => {
    setDateRange({ checkIn: null, checkOut: null });
  };

  const getDateRangeLabel = () => {
    if (dateRange.checkIn && dateRange.checkOut) {
      return `${format(dateRange.checkIn, 'MMM dd')} - ${format(dateRange.checkOut, 'MMM dd, yyyy')}`;
    } else if (dateRange.checkIn) {
      return `${format(dateRange.checkIn, 'MMM dd, yyyy')} - Select checkout`;
    }
    return 'Select dates';
  };

  // Check if a date falls within any booked range
  const isDateBooked = (date: Date): boolean => {
    return bookedDates.some(range => {
      // Parse date strings in YYYY-MM-DD format without timezone conversion
      const [startYear, startMonth, startDay] = range.checkInDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = range.checkOutDate.split('-').map(Number);

      const checkYear = date.getFullYear();
      const checkMonth = date.getMonth() + 1; // getMonth() is 0-indexed
      const checkDay = date.getDate();

      // Convert to comparable numbers (YYYYMMDD format)
      const checkDateNum = checkYear * 10000 + checkMonth * 100 + checkDay;
      const startDateNum = startYear * 10000 + startMonth * 100 + startDay;
      const endDateNum = endYear * 10000 + endMonth * 100 + endDay;

      // A date is booked if it falls within the range (inclusive of check-in, exclusive of check-out)
      return checkDateNum >= startDateNum && checkDateNum < endDateNum;
    });
  };

  // Check if selected date range conflicts with any booked dates
  const hasConflict = useMemo(() => {
    if (!checkInDate || !checkOutDate) return false;

    // Check each day in the selected range
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const currentDate = new Date(start);

    while (currentDate < end) {
      if (isDateBooked(currentDate)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return false;
  }, [checkInDate, checkOutDate, bookedDates]);

  const handleBookNow = () => {
    // Format dates to ISO string for backend (timezone-neutral)
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      // Use toISOString and extract just the date part to avoid timezone issues
      const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return d.toISOString().split('T')[0];
    };

    const bookingState = {
      room,
      checkInDate: formatDate(checkInDate),
      checkOutDate: formatDate(checkOutDate),
      guests,
    };

    if (!isAuthenticated) {
      // Store booking data in sessionStorage to preserve it across login
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingState));
      console.log('Saved pending booking to sessionStorage:', bookingState);

      // Redirect to login with the current page as the return destination
      navigate('/login', {
        state: { from: location },
      });
      return;
    }

    navigate('/booking', {
      state: bookingState,
    });
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/rooms')}
          sx={{
            mb: 2,
            color: isDarkMode ? '#FFD700' : 'primary.main',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(25,118,210,0.1)',
            },
          }}
        >
          Back to Rooms
        </Button>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: isDarkMode ? '1px solid rgba(255,215,0,0.2)' : '1px solid',
                borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
                mb: 1.5,
                flex: 1,
                minHeight: 0,
              }}
            >
              <CardMedia
                component="img"
                height="100%"
                image={
                  selectedImage ||
                  room.imageUrl ||
                  'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200'
                }
                alt={room.name}
                sx={{ objectFit: 'cover', height: '100%' }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, flexShrink: 0 }}>
              {/* Main image thumbnail */}
              <Box>
                <CardMedia
                  component="img"
                  height="90"
                  image={room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400'}
                  alt={room.name}
                  sx={{
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border:
                      !selectedImage || selectedImage === room.imageUrl
                        ? '2px solid #FFD700'
                        : '2px solid rgba(255,215,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 0.8,
                      transform: 'scale(1.05)',
                      borderColor: '#FFD700',
                    },
                    objectFit: 'cover',
                  }}
                  onClick={() => setSelectedImage(room.imageUrl || '')}
                />
              </Box>

              {/* Additional images thumbnails */}
              {room.additionalImages &&
                room.additionalImages.map((img, index) => (
                  <Box key={index}>
                    <CardMedia
                      component="img"
                      height="90"
                      image={img}
                      alt={`${room.name} ${index + 1}`}
                      sx={{
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        border:
                          selectedImage === img ? '2px solid #FFD700' : '2px solid rgba(255,215,0,0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.05)',
                          borderColor: '#FFD700',
                        },
                        objectFit: 'cover',
                      }}
                      onClick={() => setSelectedImage(img)}
                    />
                  </Box>
                ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card
              sx={{
                p: 2.5,
                bgcolor: isDarkMode ? 'rgba(26,26,26,0.95)' : 'background.paper',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
                borderRadius: 2,
                backdropFilter: isDarkMode ? 'blur(10px)' : 'none',
                boxShadow: isDarkMode ? 'none' : 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: isDarkMode ? '#FFD700' : 'primary.main',
                  fontWeight: 700,
                  mb: 1.5,
                }}
              >
                {room.name}
              </Typography>

              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={room.type}
                  sx={{
                    backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(25,118,210,0.1)',
                    color: isDarkMode ? '#FFD700' : 'primary.main',
                    border: isDarkMode ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(25,118,210,0.3)',
                    borderRadius: '16px',
                    height: '26px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                />
                {checkInDate && checkOutDate ? (
                  hasConflict ? (
                    <Chip label="Not Available for selected dates" color="error" sx={{ borderRadius: '16px', height: '26px', fontSize: '0.8rem' }} />
                  ) : (
                    <Chip label="Available for selected dates" color="success" sx={{ borderRadius: '16px', height: '26px', fontSize: '0.8rem' }} />
                  )
                ) : (
                  <Chip label="Select dates to check availability" color="default" sx={{ borderRadius: '16px', height: '26px', fontSize: '0.8rem' }} />
                )}
              </Box>

              <Typography
                variant="h5"
                sx={{
                  color: isDarkMode ? '#FFD700' : 'primary.main',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                ${room.pricePerNight}
                <Typography component="span" variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                  {' '}/ night
                </Typography>
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'text.primary',
                  mb: 2,
                  lineHeight: 1.4,
                }}
              >
                {room.description}
              </Typography>

              <Box sx={{ mb: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <People sx={{ color: isDarkMode ? '#FFD700' : 'primary.main', fontSize: '1.1rem' }} />
                  <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.primary' }}>
                    {room.capacity} guests
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AspectRatio sx={{ color: isDarkMode ? '#FFD700' : 'primary.main', fontSize: '1.1rem' }} />
                  <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.primary' }}>
                    {room.size} sq ft
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Stairs sx={{ color: isDarkMode ? '#FFD700' : 'primary.main', fontSize: '1.1rem' }} />
                  <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.primary' }}>
                    Floor {room.floorNumber}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ color: isDarkMode ? '#FFD700' : 'primary.main', fontWeight: 600, mb: 1 }}>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
                {room.amenities?.map((amenity, index) => (
                  <Chip
                    key={index}
                    icon={<CheckCircle sx={{ color: isDarkMode ? '#FFD700 !important' : 'primary.main', fontSize: '0.9rem !important' }} />}
                    label={amenity}
                    sx={{
                      backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(25,118,210,0.1)',
                      color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.primary',
                      border: isDarkMode ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(25,118,210,0.3)',
                      borderRadius: '12px',
                      height: '24px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                    size="small"
                  />
                ))}
              </Box>

              <Box component="form" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: isDarkMode ? '#FFD700' : 'primary.main', fontWeight: 600, mb: 1.5 }}>
                  Select Your Stay
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5, mb: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleDatePickerOpen}
                    startIcon={<CalendarIcon />}
                    endIcon={dateRange.checkIn && dateRange.checkOut ? (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearDates();
                        }}
                        sx={{ ml: 1, p: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.5,
                      color: isDarkMode ? (dateRange.checkIn || dateRange.checkOut ? '#FFD700' : 'rgba(255,255,255,0.7)') : 'text.primary',
                      borderColor: isDarkMode ? 'rgba(255,215,0,0.3)' : 'divider',
                      '&:hover': {
                        borderColor: isDarkMode ? 'rgba(255,215,0,0.5)' : 'primary.main',
                        bgcolor: isDarkMode ? 'rgba(255,215,0,0.05)' : 'action.hover',
                      },
                    }}
                  >
                    {getDateRangeLabel()}
                  </Button>
                  <TextField
                    fullWidth
                    type="number"
                    label="Guests"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    inputProps={{ min: 1, max: room.capacity }}
                  />
                </Box>

                {/* Date Range Picker Popover */}
                <Popover
                  open={Boolean(datePickerAnchor)}
                  anchorEl={datePickerAnchor}
                  onClose={handleDatePickerClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  slotProps={{
                    paper: {
                      sx: {
                        bgcolor: isDarkMode ? '#1a1a1a' : 'background.paper',
                        border: isDarkMode ? '1px solid rgba(255,215,0,0.2)' : 'none',
                        borderRadius: 2,
                        mt: 1,
                        boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.5)' : 3,
                      },
                    },
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 2,
                          color: isDarkMode ? '#FFD700' : 'primary.main',
                          fontWeight: 600,
                        }}
                      >
                        {selectingCheckIn ? 'Select Check-In Date' : 'Select Check-Out Date'}
                      </Typography>
                      <DateCalendar
                        value={selectingCheckIn ? dateRange.checkIn : dateRange.checkOut}
                        onChange={handleDateSelect}
                        disablePast
                        minDate={selectingCheckIn ? new Date() : dateRange.checkIn || new Date()}
                        shouldDisableDate={isDateBooked}
                        sx={{
                          '& .MuiPickersDay-root': {
                            color: isDarkMode ? '#fff' : 'text.primary',
                            '&:hover': {
                              bgcolor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'action.hover',
                            },
                            '&.Mui-selected': {
                              bgcolor: isDarkMode ? '#FFD700 !important' : 'primary.main !important',
                              color: isDarkMode ? '#000 !important' : '#fff !important',
                            },
                            '&.Mui-disabled': {
                              color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                              backgroundColor: isDarkMode ? 'rgba(128,128,128,0.1)' : 'rgba(128,128,128,0.05)',
                              textDecoration: 'line-through',
                              opacity: 0.5,
                            },
                          },
                          '& .MuiPickersCalendarHeader-label': {
                            color: isDarkMode ? '#FFD700' : 'primary.main',
                          },
                          '& .MuiPickersArrowSwitcher-button': {
                            color: isDarkMode ? '#FFD700' : 'primary.main',
                          },
                          '& .MuiDayCalendar-weekDayLabel': {
                            color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary',
                          },
                        }}
                      />
                      {dateRange.checkIn && dateRange.checkOut && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                            Selected: {format(dateRange.checkIn, 'MMM dd')} - {format(dateRange.checkOut, 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </LocalizationProvider>
                </Popover>

                {checkInDate && checkOutDate && hasConflict && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      backgroundColor: isDarkMode ? 'rgba(211,47,47,0.1)' : 'rgba(211,47,47,0.1)',
                      color: isDarkMode ? '#ff6b6b' : '#d32f2f',
                      border: '1px solid',
                      borderColor: isDarkMode ? 'rgba(211,47,47,0.3)' : 'rgba(211,47,47,0.3)',
                    }}
                  >
                    The selected dates include already booked days. Please choose different dates.
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleBookNow}
                  disabled={!checkInDate || !checkOutDate || hasConflict}
                  sx={{
                    py: 1.25,
                    background: isDarkMode ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    color: isDarkMode ? '#000' : '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                      background: isDarkMode ? 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)' : 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: isDarkMode ? '0 6px 16px rgba(255,215,0,0.3)' : '0 6px 16px rgba(25,118,210,0.3)',
                    },
                    transition: 'all 0.3s ease',
                    '&.Mui-disabled': {
                      background: isDarkMode ? 'rgba(255,215,0,0.3)' : 'rgba(25,118,210,0.3)',
                      color: 'rgba(0,0,0,0.5)',
                    },
                  }}
                >
                  {isAuthenticated ? 'Book Now' : 'Login to Book'}
                </Button>
              </Box>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default RoomDetails;
