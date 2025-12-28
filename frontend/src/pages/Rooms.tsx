import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  useTheme,
  Popover,
  IconButton,
} from '@mui/material';
import { Hotel as HotelIcon, People as PeopleIcon, Recommend as RecommendIcon, CalendarMonth as CalendarIcon, Close as CloseIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useGetRoomsWithAvailabilityQuery } from '../features/rooms/roomsApi';
import { useGetMyPreferencesQuery } from '../features/preferences/preferencesApi';
import { Room, RoomType, RoomAvailabilityDTO, AvailabilityStatus } from '../types';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import PendingReservationsBanner from '../components/PendingReservationsBanner';

/**
 * Rooms page component to browse available rooms
 */
const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Fetch user preferences if authenticated
  const { data: preferences } = useGetMyPreferencesQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Initialize filters from sessionStorage or defaults
  const [filters, setFilters] = useState<{
    type?: string;
    minPrice?: string;
    maxPrice?: string;
  }>(() => {
    const saved = sessionStorage.getItem('roomFilters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { type: '', minPrice: '', maxPrice: '' };
      }
    }
    return { type: '', minPrice: '', maxPrice: '' };
  });

  // Initialize date range from sessionStorage or defaults
  const [dateRange, setDateRange] = useState<{
    checkIn: Date | null;
    checkOut: Date | null;
  }>(() => {
    const saved = sessionStorage.getItem('roomDateRange');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          checkIn: parsed.checkIn ? new Date(parsed.checkIn) : null,
          checkOut: parsed.checkOut ? new Date(parsed.checkOut) : null,
        };
      } catch {
        return { checkIn: null, checkOut: null };
      }
    }
    return { checkIn: null, checkOut: null };
  });
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLButtonElement | null>(null);
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('roomFilters', JSON.stringify(filters));
  }, [filters]);

  // Save date range to sessionStorage whenever it changes
  useEffect(() => {
    const dateRangeToSave = {
      checkIn: dateRange.checkIn?.toISOString() || null,
      checkOut: dateRange.checkOut?.toISOString() || null,
    };
    sessionStorage.setItem('roomDateRange', JSON.stringify(dateRangeToSave));
  }, [dateRange]);

  // Pre-fill preferred room type from user preferences
  useEffect(() => {
    if (preferences?.preferredRoomType && !filters.type) {
      const preferredType = preferences.preferredRoomType.toUpperCase();
      if (['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL'].includes(preferredType)) {
        setFilters(prev => ({ ...prev, type: preferredType }));
      }
    }
  }, [preferences]);

  // Build query params for availability endpoint
  const hasDateRange = dateRange.checkIn && dateRange.checkOut;
  const availabilityParams = hasDateRange
    ? {
        checkInDate: format(dateRange.checkIn!, 'yyyy-MM-dd'),
        checkOutDate: format(dateRange.checkOut!, 'yyyy-MM-dd'),
        guests: 1, // Default to 1 guest, could add a guest selector in the future
      }
    : undefined;

  // Use the new availability endpoint that shows ALL rooms with status
  const { data: roomsWithAvailability, isLoading, error } = useGetRoomsWithAvailabilityQuery(availabilityParams);

  // Calculate preference match score for each room
  const calculatePreferenceScore = (room: Room): number => {
    if (!preferences) return 0;

    let score = 0;

    // Room type match (highest weight)
    if (preferences.preferredRoomType && room.type.toLowerCase() === preferences.preferredRoomType.toLowerCase()) {
      score += 5;
    }

    // Bed type match
    if (preferences.preferredBedType && room.bedType === preferences.preferredBedType) {
      score += 3;
    }

    // View match
    if (preferences.preferredRoomView && room.viewType === preferences.preferredRoomView) {
      score += 2;
    }

    // Accessibility preferences
    if (preferences.wheelchairAccessible && room.wheelchairAccessible) {
      score += 4;
    }
    if (preferences.hearingAccessible && room.hearingAccessible) {
      score += 3;
    }
    if (preferences.visualAccessible && room.visualAccessible) {
      score += 3;
    }

    return score;
  };

  // Filter and sort rooms by preference match
  const processedRooms = React.useMemo(() => {
    if (!roomsWithAvailability) return [];

    let filtered = [...roomsWithAvailability];

    // Apply filters to room data
    if (filters.type) {
      filtered = filtered.filter(dto => dto.room.type === filters.type);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(dto => dto.room.pricePerNight >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(dto => dto.room.pricePerNight <= parseFloat(filters.maxPrice));
    }

    // Filter by accessibility requirements if user has them
    if (preferences?.wheelchairAccessible) {
      filtered = filtered.filter(dto => dto.room.wheelchairAccessible);
    }

    // Add preference score and sort
    const roomsWithScores = filtered.map(dto => ({
      ...dto,
      preferenceScore: calculatePreferenceScore(dto.room),
    }));

    // Sort by preference score (highest first), then by price
    return roomsWithScores.sort((a, b) => {
      if (b.preferenceScore !== a.preferenceScore) {
        return b.preferenceScore - a.preferenceScore;
      }
      return a.room.pricePerNight - b.room.pricePerNight;
    });
  }, [roomsWithAvailability, preferences, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

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

  const clearAllFilters = () => {
    setFilters({ type: '', minPrice: '', maxPrice: '' });
    setDateRange({ checkIn: null, checkOut: null });
    sessionStorage.removeItem('roomFilters');
    sessionStorage.removeItem('roomDateRange');
  };

  const hasActiveFilters = !!(
    filters.type ||
    filters.minPrice ||
    filters.maxPrice ||
    dateRange.checkIn ||
    dateRange.checkOut
  );

  const getDateRangeLabel = () => {
    if (dateRange.checkIn && dateRange.checkOut) {
      return `${format(dateRange.checkIn, 'MMM dd')} - ${format(dateRange.checkOut, 'MMM dd, yyyy')}`;
    } else if (dateRange.checkIn) {
      return `${format(dateRange.checkIn, 'MMM dd, yyyy')} - Select checkout`;
    }
    return 'Select dates';
  };

  const roomTypes: { value: string; label: string }[] = [
    { value: 'STANDARD', label: 'Standard' },
    { value: 'DELUXE', label: 'Deluxe' },
    { value: 'SUITE', label: 'Suite' },
    { value: 'PRESIDENTIAL', label: 'Presidential' },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress sx={{ color: isDarkMode ? '#FFD700' : 'primary.main' }} size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{
            backgroundColor: 'rgba(211,47,47,0.1)',
            color: '#ff6b6b',
            border: '1px solid rgba(211,47,47,0.3)',
          }}
        >
          Failed to load rooms. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              background: isDarkMode ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Our Luxury Rooms
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
              px: { xs: 2, sm: 0 },
            }}
          >
            Experience unparalleled comfort and elegance in our carefully curated selection of rooms
          </Typography>
        </Box>

        {/* Pending Reservations Banner */}
        {isAuthenticated && <PendingReservationsBanner />}

        {hasDateRange && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              backgroundColor: isDarkMode ? 'rgba(2,136,209,0.1)' : 'rgba(2,136,209,0.1)',
              color: isDarkMode ? '#4fc3f7' : '#0288d1',
              border: isDarkMode ? '1px solid rgba(2,136,209,0.3)' : '1px solid rgba(2,136,209,0.3)',
            }}
          >
            Showing rooms available from {format(dateRange.checkIn!, 'MMM dd')} to {format(dateRange.checkOut!, 'MMM dd, yyyy')}
          </Alert>
        )}

        <Box
          sx={{
            mb: { xs: 4, md: 6 },
            p: { xs: 2.5, sm: 3, md: 4 },
            bgcolor: isDarkMode ? 'rgba(26,26,26,0.8)' : 'background.paper',
            borderRadius: 3,
            border: isDarkMode ? '1px solid rgba(255,215,0,0.2)' : '1px solid',
            borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
            backdropFilter: isDarkMode ? 'blur(10px)' : 'none',
            boxShadow: isDarkMode ? 'none' : 1,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              select
              label="Room Type"
              name="type"
              value={filters.type || ''}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected || selected === '') {
                    return 'All Types';
                  }
                  const selectedType = roomTypes.find(t => t.value === selected);
                  return selectedType ? selectedType.label : selected;
                },
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      bgcolor: isDarkMode ? '#1a1a1a' : 'background.paper',
                      border: isDarkMode ? '1px solid rgba(255,215,0,0.2)' : 'none',
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? '#fff' : 'text.primary',
                        '&:hover': {
                          bgcolor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'action.hover',
                        },
                        '&.Mui-selected': {
                          bgcolor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'action.selected',
                          '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255,215,0,0.3)' : 'action.selected',
                          },
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              {roomTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Min Price"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
            <TextField
              fullWidth
              type="number"
              label="Max Price"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </Stack>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={clearAllFilters}
                sx={{
                  color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  borderColor: isDarkMode ? 'rgba(255,215,0,0.3)' : 'divider',
                  '&:hover': {
                    borderColor: isDarkMode ? 'rgba(255,215,0,0.5)' : 'primary.main',
                    bgcolor: isDarkMode ? 'rgba(255,215,0,0.05)' : 'action.hover',
                  },
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          )}

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
        </Box>

        {processedRooms.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              backgroundColor: 'rgba(2,136,209,0.1)',
              color: '#4fc3f7',
              border: '1px solid rgba(2,136,209,0.3)',
            }}
          >
            No rooms found matching your criteria.
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
            }}
          >
            {processedRooms?.map((dto: RoomAvailabilityDTO & { preferenceScore?: number }) => {
              const { room, status, availabilityMessage, availabilityIcon } = dto;
              const isRecommended = !!(dto.preferenceScore && dto.preferenceScore >= 3);

              // Helper function to get chip color based on status
              const getAvailabilityColor = (): 'error' | 'warning' | 'success' => {
                if (status === 'FULLY_BOOKED') return 'error';
                if (status === 'LIMITED') return 'warning';
                return 'success';
              };

              return (
                <Card
                  key={room.id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: isDarkMode ? 'rgba(26,26,26,0.95)' : 'background.paper',
                    border: '1px solid',
                    borderColor: isRecommended
                      ? (isDarkMode ? 'rgba(255,215,0,0.5)' : 'primary.main')
                      : (isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider'),
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    opacity: status === 'FULLY_BOOKED' ? 0.7 : 1,
                    '&:hover': {
                      transform: { xs: 'translateY(-4px)', md: 'translateY(-8px)' },
                      boxShadow: isDarkMode ? '0 12px 40px rgba(255,215,0,0.3)' : '0 12px 40px rgba(25,118,210,0.3)',
                      borderColor: isDarkMode ? 'rgba(255,215,0,0.5)' : 'primary.main',
                    },
                  }}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >
                  {isRecommended && (
                    <Chip
                      icon={<RecommendIcon />}
                      label="Recommended for You"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        bgcolor: isDarkMode ? '#FFD700' : 'primary.main',
                        color: isDarkMode ? '#000' : '#fff',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: isDarkMode ? '#000' : '#fff',
                        },
                      }}
                    />
                  )}
                  <CardMedia
                    component="img"
                    height="140"
                    image={room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800'}
                    alt={room.name}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: { xs: 1.5, md: 2 },
                  }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h2"
                      sx={{
                        color: isDarkMode ? '#FFD700' : 'primary.main',
                        fontWeight: 600,
                        mb: 1,
                        fontSize: { xs: '1.1rem', sm: '1.15rem', md: '1.25rem' },
                      }}
                    >
                      {room.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip
                        icon={<HotelIcon sx={{ color: isDarkMode ? '#FFD700 !important' : 'primary.main', fontSize: '1rem !important' }} />}
                        label={room.type.charAt(0) + room.type.slice(1).toLowerCase()}
                        sx={{
                          backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(25,118,210,0.1)',
                          color: isDarkMode ? '#FFD700' : 'primary.main',
                          border: isDarkMode ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(25,118,210,0.3)',
                          borderRadius: '16px',
                          height: '28px',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          '& .MuiChip-label': {
                            px: 1.5,
                          },
                          '& .MuiChip-icon': {
                            ml: 1,
                          },
                        }}
                        size="small"
                      />
                      <Chip
                        icon={<PeopleIcon sx={{ color: isDarkMode ? '#FFD700 !important' : 'primary.main', fontSize: '1rem !important' }} />}
                        label={`${room.capacity} Guests`}
                        sx={{
                          backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(25,118,210,0.1)',
                          color: isDarkMode ? '#FFD700' : 'primary.main',
                          border: isDarkMode ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(25,118,210,0.3)',
                          borderRadius: '16px',
                          height: '28px',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          '& .MuiChip-label': {
                            px: 1.5,
                          },
                          '& .MuiChip-icon': {
                            ml: 1,
                          },
                        }}
                        size="small"
                      />
                    </Stack>
                    {/* Show availability message when dates are selected */}
                    {hasDateRange && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: status === 'FULLY_BOOKED'
                            ? (isDarkMode ? '#ff6b6b' : '#d32f2f')
                            : status === 'LIMITED'
                            ? (isDarkMode ? '#ffa726' : '#ed6c02')
                            : (isDarkMode ? '#66bb6a' : '#2e7d32'),
                          display: 'block',
                          mb: 1,
                          fontWeight: 600
                        }}
                      >
                        {availabilityMessage}
                      </Typography>
                    )}
                    {!hasDateRange && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'text.secondary',
                          display: 'block',
                          mb: 1,
                          fontStyle: 'italic'
                        }}
                      >
                        Select dates above to check availability
                      </Typography>
                    )}
                    <Typography
                      variant="h6"
                      sx={{
                        color: isDarkMode ? '#FFD700' : 'primary.main',
                        fontWeight: 600,
                        fontSize: { xs: '1.2rem', md: '1.3rem' },
                      }}
                    >
                      ${room.pricePerNight}
                      <Typography component="span" variant="body2" sx={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                        {' '}/ night
                      </Typography>
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Rooms;
