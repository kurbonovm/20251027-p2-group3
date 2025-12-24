import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Popover,
} from '@mui/material';
import { Search, Close, CheckCircle, Bed, Diamond } from '@mui/icons-material';
import { DatePicker, StaticDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useLocation } from 'react-router-dom';
import { RoomType, Room } from '../types';
import { useGetRoomsQuery } from '../features/rooms/roomsApi';

interface SearchBarProps {
  onSearch: (searchParams: SearchParams) => void;
}

export interface SearchParams {
  roomType?: RoomType;
  roomName?: string;
  checkIn?: Date;
  checkOut?: Date;
}

const roomTypes: { 
  value: RoomType; 
  label: string; 
  description: string;
  icon: React.ReactNode;
}[] = [
  { 
    value: 'STANDARD', 
    label: 'Standard Room',
    description: 'Comfortable and affordable choice for solo travelers.',
    icon: <Bed sx={{ fontSize: 24, color: '#ffffff' }} />
  },
  { 
    value: 'DELUXE', 
    label: 'Deluxe Room',
    description: 'Perfect for couples with a large king-size bed.',
    icon: <Bed sx={{ fontSize: 24, color: '#ffffff' }} />
  },
  { 
    value: 'SUITE', 
    label: 'Suite',
    description: 'Spacious living area with premium luxury amenities.',
    icon: <Diamond sx={{ fontSize: 24, color: '#ffffff' }} />
  },
  { 
    value: 'PRESIDENTIAL', 
    label: 'Presidential Suite',
    description: 'Ultimate luxury with exclusive services and panoramic views.',
    icon: <Diamond sx={{ fontSize: 24, color: '#ffffff' }} />
  },
];

/**
 * Search Bar component with What/When pickers
 * Search button is integrated in the When modal
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {

  const location = useLocation();
  const isRoomsPage = location.pathname === '/rooms';
  const isHomePage = location.pathname === '/';
  
  const [whatOpen, setWhatOpen] = useState(false);
  const [whenOpen, setWhenOpen] = useState(false);
  const whatAnchorRef = useRef<HTMLDivElement>(null);
  const whenAnchorRef = useRef<HTMLDivElement>(null);

  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | ''>('');
  const [selectedRoomName, setSelectedRoomName] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [activeDateField, setActiveDateField] = useState<'checkin' | 'checkout' | null>(null);

  // Get room type from previous search (if on Rooms page)
  const previousSearchParams = (location.state as { searchParams?: SearchParams })?.searchParams;
  const currentRoomType = isRoomsPage ? (previousSearchParams?.roomType || selectedRoomType) : selectedRoomType;

  // Fetch rooms by type when on Rooms page
  const { data: roomsByType } = useGetRoomsQuery(
    isRoomsPage && currentRoomType ? { type: currentRoomType } : undefined,
    { skip: !isRoomsPage || !currentRoomType }
  );

  // Get room type display name
  const getRoomTypeDisplayName = (type: RoomType | ''): string => {
    if (!type) return '';
    const roomType = roomTypes.find(t => t.value === type);
    return roomType ? `${roomType.label}s` : `${type.charAt(0) + type.slice(1).toLowerCase()} Rooms`;
  };

  const handleSearch = () => {
    if (isRoomsPage) {
      // On Rooms page: search by room name and dates
      if (selectedRoomName && checkInDate && checkOutDate) {
        onSearch({
          roomName: selectedRoomName,
          roomType: currentRoomType || undefined, // Keep room type for context
          checkIn: checkInDate,
          checkOut: checkOutDate,
        });
        // Reset fields
        setSelectedRoomName('');
        setCheckInDate(null);
        setCheckOutDate(null);
        setActiveDateField(null);
        setWhenOpen(false);
        setWhatOpen(false);
      }
    } else {
      // On Home page: search by room type and dates
      if (selectedRoomType && checkInDate && checkOutDate) {
        onSearch({
          roomType: selectedRoomType,
          checkIn: checkInDate,
          checkOut: checkOutDate,
        });
        // Reset all fields to default values
        setSelectedRoomType('');
        setCheckInDate(null);
        setCheckOutDate(null);
        setActiveDateField(null);
        setWhenOpen(false);
        setWhatOpen(false);
      }
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Add dates';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateRange = (): string => {
    if (!checkInDate && !checkOutDate) return 'Add dates';
    if (checkInDate && checkOutDate) {
      return `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`;
    }
    if (checkInDate) return `From ${formatDate(checkInDate)}`;
    return 'Add dates';
  };

  return (<>
    {(isHomePage || isRoomsPage)&&
    <Box sx={{ width: '100%', maxWidth: 800 }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
        }}
      >
        {/* What - Room Type or Room Name */}
        <Box
          ref={whatAnchorRef}
          onClick={() => setWhatOpen(true)}
          sx={{
            flex: 1,
            px: 2,
            py: 1.25,
            borderRight: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 0.5 }}>
            What
          </Typography>
          <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
            {isRoomsPage
              ? selectedRoomName || 'Search by room names'
              : selectedRoomType
              ? roomTypes.find(t => t.value === selectedRoomType)?.label
              : 'Search room types'}
          </Typography>
        </Box>

        {/* When - Dates */}
        <Box
          ref={whenAnchorRef}
          onClick={() => setWhenOpen(true)}
          sx={{
            flex: 1,
            px: 2,
            py: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 0.5 }}>
            When
          </Typography>
          <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
            {formatDateRange()}
          </Typography>
        </Box>

        {/* Search Button - Circular button next to When */}
        <IconButton
          onClick={handleSearch}
          sx={{
            backgroundColor: '#1976d2',
            color: '#ffffff',
            width: 40,
            height: 40,
            minWidth: 40,
            mx: 1,
            borderRadius: '50%',
            padding: 0,
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          <Search sx={{ fontSize: 20 }} />
        </IconButton>
      </Paper>

      {/* What Popover - Room Type Selection */}
      <Popover
        open={whatOpen}
        anchorEl={whatAnchorRef.current}
        onClose={() => setWhatOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            borderRadius: 3,
            maxHeight: '90vh',
            width: 400,
            maxWidth: '90vw',
            mt: 1,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        {/* Header with Title, Subtitle, and Close Button */}
        <Box sx={{ position: 'relative', pt: 3, px: 3, pb: 2 }}>
          {/* Close Button */}
          <IconButton
            onClick={() => setWhatOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Close />
          </IconButton>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {isRoomsPage && currentRoomType
              ? getRoomTypeDisplayName(currentRoomType)
              : 'Room Type'}
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
            }}
          >
            {isRoomsPage && currentRoomType
              ? 'Select a room name to search.'
              : 'Select your preferred accommodation.'}
          </Typography>
        </Box>

        {/* Room Type Options or Room Names */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {isRoomsPage && currentRoomType && roomsByType ? (
              // Show room names on Rooms page
              roomsByType.length > 0 ? (
                roomsByType.map((room: Room) => {
                  const isSelected = selectedRoomName === room.name;
                  return (
                    <Card
                      key={room.id}
                      onClick={() => {
                        setSelectedRoomName(room.name);
                        setWhatOpen(false);
                      }}
                      sx={{
                        backgroundColor: isSelected ? '#1976d2' : '#2a2a2a',
                        borderRadius: 2,
                        border: isSelected ? '1px solid #1976d2' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: isSelected ? '#1565c0' : '#333333',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Bed sx={{ fontSize: 24, color: '#ffffff' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              color: '#ffffff',
                              fontWeight: 600,
                              mb: 0.5,
                            }}
                          >
                            {room.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.85rem',
                            }}
                          >
                            ${room.pricePerNight}/night
                          </Typography>
                        </Box>
                        {isSelected && (
                          <CheckCircle sx={{ color: '#ffffff', fontSize: 24, flexShrink: 0 }} />
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', py: 2 }}>
                  No rooms found for this type.
                </Typography>
              )
            ) : (
              // Show room types on Home page
              roomTypes.map((type) => {
                const isSelected = selectedRoomType === type.value;
                return (
                  <Card
                    key={type.value}
                    onClick={() => {
                      setSelectedRoomType(type.value);
                      setWhatOpen(false);
                    }}
                    sx={{
                      backgroundColor: isSelected ? '#1976d2' : '#2a2a2a',
                      borderRadius: 2,
                      border: isSelected ? '1px solid #1976d2' : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: isSelected ? '#1565c0' : '#333333',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {type.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#ffffff',
                            fontWeight: 600,
                            mb: 0.5,
                          }}
                        >
                          {type.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.85rem',
                          }}
                        >
                          {type.description}
                        </Typography>
                      </Box>
                      {isSelected && (
                        <CheckCircle sx={{ color: '#ffffff', fontSize: 24, flexShrink: 0 }} />
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        </Box>
      </Popover>

      {/* When Popover - Date Range Selection */}
      <Popover
        open={whenOpen}
        anchorEl={whenAnchorRef.current}
        onClose={() => setWhenOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            borderRadius: 3,
            maxHeight: '90vh',
            width: 400,
            maxWidth: '90vw',
            mt: 1,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {/* Header with Title and Close Button */}
          <Box sx={{ position: 'relative', pt: 3, px: 3, pb: 2 }}>
            {/* Close Button */}
            <IconButton
              onClick={() => setWhenOpen(false)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Close />
            </IconButton>

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Select dates
            </Typography>

            {/* CHECK-IN and CHECK-OUT Input Fields */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box
                onClick={() => {
                  setActiveDateField('checkin');
                  if (!checkInDate) {
                    // If no check-in date, focus on today or next available date
                  }
                }}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  border: activeDateField === 'checkin' || (checkInDate && !activeDateField) ? '2px solid #1976d2' : '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: activeDateField === 'checkin' || (checkInDate && !activeDateField) ? 'rgba(25, 118, 210, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    display: 'block',
                    mb: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  CHECK-IN
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: checkInDate ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 500,
                  }}
                >
                  {checkInDate ? formatDate(checkInDate) : 'Add date'}
                </Typography>
              </Box>

              <Box
                onClick={() => {
                  setActiveDateField('checkout');
                  if (checkInDate && !checkOutDate) {
                    // If check-in is set but no check-out, focus on check-in date
                  }
                }}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  border: activeDateField === 'checkout' || (checkOutDate && !activeDateField) ? '2px solid #1976d2' : '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: activeDateField === 'checkout' || (checkOutDate && !activeDateField) ? 'rgba(25, 118, 210, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    display: 'block',
                    mb: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  CHECK-OUT
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: checkOutDate ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 500,
                  }}
                >
                  {checkOutDate ? formatDate(checkOutDate) : 'Add date'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Calendar */}
          <Box sx={{ px: 3, pb: 3, maxHeight: '60vh', overflowY: 'auto' }}>
            <StaticDatePicker
              value={activeDateField === 'checkin' ? checkInDate : activeDateField === 'checkout' ? checkOutDate : checkInDate || checkOutDate}
              onChange={(newValue) => {
                if (!newValue) return;

                // If no check-in date is set, set it as check-in
                if (!checkInDate) {
                  setCheckInDate(newValue);
                  setActiveDateField('checkout');
                }
                // If check-in is set but no check-out, set it as check-out (if valid)
                else if (!checkOutDate) {
                  if (newValue >= checkInDate) {
                    setCheckOutDate(newValue);
                    setActiveDateField(null);
                    // Auto-close the picker after both dates are selected
                    setTimeout(() => {
                      setWhenOpen(false);
                    }, 500);
                  } else {
                    // If selected date is before check-in, reset check-in to this date
                    setCheckInDate(newValue);
                    setCheckOutDate(null);
                    setActiveDateField('checkout');
                  }
                }
                // If both dates are set, reset and start over
                else {
                  setCheckInDate(newValue);
                  setCheckOutDate(null);
                  setActiveDateField('checkout');
                }
              }}
              minDate={new Date()}
              shouldDisableDate={(date) => {
                // Disable dates before check-in if check-in is selected
                if (checkInDate && !checkOutDate && date < checkInDate) {
                  return true;
                }
                return false;
              }}
              slotProps={{
                actionBar: {
                  actions: [], // Remove all action buttons (Cancel, OK)
                },
                calendarHeader: {
                  sx: {
                    color: '#ffffff',
                  },
                },
                day: {
                  sx: {
                    color: '#ffffff',
                    '&.Mui-selected': {
                      backgroundColor: '#1976d2',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                    },
                    '&.MuiPickersDay-today': {
                      border: '1px solid #1976d2',
                    },
                  },
                },
              }}
              sx={{
                backgroundColor: 'transparent',
                '& .MuiPickersCalendarHeader-root': {
                  color: '#ffffff',
                  '& .MuiPickersCalendarHeader-label': {
                    color: '#ffffff',
                  },
                  '& .MuiIconButton-root': {
                    color: '#ffffff',
                  },
                },
                '& .MuiDayCalendar-weekContainer': {
                  '& .MuiPickersDay-root': {
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.2)',
                    },
                  },
                },
                '& .MuiPickersDay-root.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                },
                '& .MuiPickersDay-root.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
          </Box>
        </LocalizationProvider>
      </Popover>
    </Box>
  }
    </>
  );
};

export default SearchBar;

