import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AdminLayout from '../../layouts/AdminLayout';
import { useGetAllRoomsAdminQuery, useCreateReservationWithPaymentLinkMutation } from '../../features/admin/adminApi';
import { useGetAvailableRoomsQuery } from '../../features/rooms/roomsApi';
import { Room } from '../../types';

const AssistedBookingPaymentLink: React.FC = () => {
  const { data: allRooms, isLoading: roomsLoading } = useGetAllRoomsAdminQuery();
  const [createBooking, { isLoading: bookingLoading }] = useCreateReservationWithPaymentLinkMutation();

  const [formData, setFormData] = useState({
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerPhoneNumber: '',
    roomId: '',
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    numberOfGuests: 1,
    specialRequests: '',
  });

  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch available rooms when dates are selected
  const hasValidDates = formData.checkInDate && formData.checkOutDate;
  const { data: availableRooms } = useGetAvailableRoomsQuery(
    hasValidDates
      ? {
          startDate: formData.checkInDate!.toISOString().split('T')[0],
          endDate: formData.checkOutDate!.toISOString().split('T')[0],
          guests: formData.numberOfGuests,
        }
      : { startDate: '', endDate: '', guests: 1 },
    { skip: !hasValidDates }
  );

  // Use available rooms if dates are selected, otherwise show all rooms
  const rooms = hasValidDates && availableRooms ? availableRooms : allRooms;

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (field === 'roomId' && rooms) {
      const room = rooms.find((r) => r.id === event.target.value);
      setSelectedRoom(room || null);
    }
  };

  const handleDateChange = (field: 'checkInDate' | 'checkOutDate') => (date: Date | null) => {
    if (field === 'checkInDate') {
      // If check-in date is changed and check-out is before or equal to new check-in, clear check-out
      if (date && formData.checkOutDate && formData.checkOutDate <= date) {
        setFormData({ ...formData, checkInDate: date, checkOutDate: null, roomId: '' });
        setSelectedRoom(null);
      } else {
        setFormData({ ...formData, checkInDate: date, roomId: '' });
        setSelectedRoom(null);
      }
    } else {
      // Clear selected room when check-out date changes
      setFormData({ ...formData, [field]: date, roomId: '' });
      setSelectedRoom(null);
    }
  };

  const calculateTotal = () => {
    if (!selectedRoom || !formData.checkInDate || !formData.checkOutDate) return 0;
    const nights = Math.ceil(
      (formData.checkOutDate.getTime() - formData.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return selectedRoom.pricePerNight * nights;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.customerEmail) {
      errors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = 'Invalid email format';
    }

    if (!formData.customerFirstName) {
      errors.customerFirstName = 'First name is required';
    }

    if (!formData.customerLastName) {
      errors.customerLastName = 'Last name is required';
    }

    if (!formData.roomId) {
      errors.roomId = 'Please select a room';
    }

    if (!formData.checkInDate) {
      errors.checkInDate = 'Check-in date is required';
    } else if (formData.checkInDate < today) {
      errors.checkInDate = 'Check-in date cannot be in the past';
    }

    if (!formData.checkOutDate) {
      errors.checkOutDate = 'Check-out date is required';
    } else if (formData.checkInDate && formData.checkOutDate <= formData.checkInDate) {
      errors.checkOutDate = 'Check-out date must be after check-in date';
    } else if (formData.checkOutDate < today) {
      errors.checkOutDate = 'Check-out date cannot be in the past';
    }

    if (formData.numberOfGuests < 1 || formData.numberOfGuests > 10) {
      errors.numberOfGuests = 'Number of guests must be between 1 and 10';
    }

    if (selectedRoom && formData.numberOfGuests > selectedRoom.capacity) {
      errors.numberOfGuests = `Number of guests cannot exceed room capacity (${selectedRoom.capacity})`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPaymentLink(null);
    setError(null);
    setValidationErrors({});
    setCopied(false);

    if (!validateForm()) {
      setError('Please correct the errors in the form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const response = await createBooking({
        customerEmail: formData.customerEmail,
        customerFirstName: formData.customerFirstName,
        customerLastName: formData.customerLastName,
        customerPhoneNumber: formData.customerPhoneNumber || undefined,
        roomId: formData.roomId,
        checkInDate: formData.checkInDate!.toISOString().split('T')[0],
        checkOutDate: formData.checkOutDate!.toISOString().split('T')[0],
        numberOfGuests: formData.numberOfGuests,
        specialRequests: formData.specialRequests || undefined,
      }).unwrap();

      setPaymentLink(response.paymentLink);

      // Reset form
      setFormData({
        customerEmail: '',
        customerFirstName: '',
        customerLastName: '',
        customerPhoneNumber: '',
        roomId: '',
        checkInDate: null,
        checkOutDate: null,
        numberOfGuests: 1,
        specialRequests: '',
      });
      setSelectedRoom(null);
    } catch (err: any) {
      setError(err?.data?.message || err?.data?.error || 'Failed to create booking. Please try again.');
    }
  };

  const handleCopyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Manager-Assisted Booking
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Create a booking and send a secure payment link to the customer - PCI Compliant
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {paymentLink && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
            <Typography variant="h6" color="success.main">
              Reservation Created Successfully!
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Send this secure payment link to the customer. They have 30 minutes to complete payment.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              value={paymentLink}
              InputProps={{
                readOnly: true,
                sx: {
                  bgcolor: 'white',
                  '& input': {
                    color: '#000000',
                    WebkitTextFillColor: '#000000',
                  },
                },
              }}
            />
            <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
              <IconButton onClick={handleCopyLink} color={copied ? 'success' : 'primary'}>
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      )}

      <Card>
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.customerFirstName}
                    onChange={handleChange('customerFirstName')}
                    error={!!validationErrors.customerFirstName}
                    helperText={validationErrors.customerFirstName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.customerLastName}
                    onChange={handleChange('customerLastName')}
                    error={!!validationErrors.customerLastName}
                    helperText={validationErrors.customerLastName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleChange('customerEmail')}
                    error={!!validationErrors.customerEmail}
                    helperText={validationErrors.customerEmail}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number (Optional)"
                    value={formData.customerPhoneNumber}
                    onChange={handleChange('customerPhoneNumber')}
                    error={!!validationErrors.customerPhoneNumber}
                    helperText={validationErrors.customerPhoneNumber}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Booking Details
              </Typography>
              {!hasValidDates && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Select check-in and check-out dates first to see available rooms
                </Alert>
              )}
              {hasValidDates && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Showing {rooms?.length || 0} room(s) available for the selected dates
                </Alert>
              )}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!!validationErrors.roomId} sx={{ minWidth: 180 }}>
                    <InputLabel shrink sx={{ whiteSpace: 'nowrap', overflow: 'visible' }}>
                      Room {hasValidDates && '(Available for selected dates)'}
                    </InputLabel>
                    <Select
                      value={formData.roomId}
                      onChange={handleChange('roomId')}
                      label="Room"
                      disabled={roomsLoading}
                      notched
                      sx={{ minWidth: 180 }}
                    >
                      {rooms && rooms.length > 0 ? (
                        rooms.map((room) => (
                          <MenuItem key={room.id} value={room.id}>
                            {room.name} - {room.type} (${room.pricePerNight}/night, Capacity: {room.capacity})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {hasValidDates ? 'No rooms available for selected dates' : 'No rooms available'}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Check-in Date"
                    value={formData.checkInDate}
                    onChange={handleDateChange('checkInDate')}
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!validationErrors.checkInDate,
                        helperText: validationErrors.checkInDate,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Check-out Date"
                    value={formData.checkOutDate}
                    onChange={handleDateChange('checkOutDate')}
                    minDate={formData.checkInDate ? new Date(formData.checkInDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!validationErrors.checkOutDate,
                        helperText: validationErrors.checkOutDate,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Number of Guests"
                    value={formData.numberOfGuests}
                    onChange={handleChange('numberOfGuests')}
                    error={!!validationErrors.numberOfGuests}
                    helperText={validationErrors.numberOfGuests}
                    inputProps={{ min: 1, max: 10 }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Special Requests (Optional)"
                    value={formData.specialRequests}
                    onChange={handleChange('specialRequests')}
                    error={!!validationErrors.specialRequests}
                    helperText={validationErrors.specialRequests || 'Maximum 500 characters'}
                  />
                </Grid>
              </Grid>

              {selectedRoom && formData.checkInDate && formData.checkOutDate && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    <strong>Total Amount:</strong> ${calculateTotal().toFixed(2)}
                  </Typography>
                  <Typography variant="caption">
                    ({Math.ceil((formData.checkOutDate.getTime() - formData.checkInDate.getTime()) / (1000 * 60 * 60 * 24))}{' '}
                    night(s) × ${selectedRoom.pricePerNight})
                  </Typography>
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    setFormData({
                      customerEmail: '',
                      customerFirstName: '',
                      customerLastName: '',
                      customerPhoneNumber: '',
                      roomId: '',
                      checkInDate: null,
                      checkOutDate: null,
                      numberOfGuests: 1,
                      specialRequests: '',
                    });
                    setSelectedRoom(null);
                    setValidationErrors({});
                    setError(null);
                  }}
                >
                  Clear Form
                </Button>
                <Button type="submit" variant="contained" disabled={bookingLoading || roomsLoading}>
                  {bookingLoading ? <CircularProgress size={24} /> : 'Create Booking & Generate Link'}
                </Button>
              </Box>
            </form>
          </LocalizationProvider>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AssistedBookingPaymentLink;
