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
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AdminLayout from '../../layouts/AdminLayout';
import { useGetAllRoomsAdminQuery, useCreateAssistedBookingTokenMutation } from '../../features/admin/adminApi';
import { Room } from '../../types';

const AssistedBooking: React.FC = () => {
  const { data: rooms, isLoading: roomsLoading } = useGetAllRoomsAdminQuery();
  const [createBooking, { isLoading: bookingLoading }] = useCreateAssistedBookingTokenMutation();

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
    paymentMethodId: '', // Stripe test token instead of raw card data
  });

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (field === 'roomId' && rooms) {
      const room = rooms.find((r) => r.id === event.target.value);
      setSelectedRoom(room || null);
    }
  };

  const handleDateChange = (field: 'checkInDate' | 'checkOutDate') => (date: Date | null) => {
    setFormData({ ...formData, [field]: date });
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

    // Email validation
    if (!formData.customerEmail) {
      errors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = 'Invalid email format';
    }

    // Name validation
    if (!formData.customerFirstName) {
      errors.customerFirstName = 'First name is required';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.customerFirstName)) {
      errors.customerFirstName = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    } else if (formData.customerFirstName.length > 100) {
      errors.customerFirstName = 'First name cannot exceed 100 characters';
    }

    if (!formData.customerLastName) {
      errors.customerLastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.customerLastName)) {
      errors.customerLastName = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    } else if (formData.customerLastName.length > 100) {
      errors.customerLastName = 'Last name cannot exceed 100 characters';
    }

    // Phone validation (optional)
    if (formData.customerPhoneNumber && !/^[+]?[0-9\s()-]{7,20}$/.test(formData.customerPhoneNumber)) {
      errors.customerPhoneNumber = 'Invalid phone number format';
    }

    // Room validation
    if (!formData.roomId) {
      errors.roomId = 'Please select a room';
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.checkInDate) {
      errors.checkInDate = 'Check-in date is required';
    } else if (formData.checkInDate < today) {
      errors.checkInDate = 'Check-in date cannot be in the past';
    } else {
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      if (formData.checkInDate > twoYearsFromNow) {
        errors.checkInDate = 'Check-in date cannot be more than 2 years in the future';
      }
    }

    if (!formData.checkOutDate) {
      errors.checkOutDate = 'Check-out date is required';
    } else if (formData.checkInDate && formData.checkOutDate <= formData.checkInDate) {
      errors.checkOutDate = 'Check-out date must be after check-in date';
    }

    // Guests validation
    if (formData.numberOfGuests < 1 || formData.numberOfGuests > 10) {
      errors.numberOfGuests = 'Number of guests must be between 1 and 10';
    }

    if (selectedRoom && formData.numberOfGuests > selectedRoom.capacity) {
      errors.numberOfGuests = `Number of guests cannot exceed room capacity (${selectedRoom.capacity})`;
    }

    // Special requests validation
    if (formData.specialRequests && formData.specialRequests.length > 500) {
      errors.specialRequests = 'Special requests cannot exceed 500 characters';
    }

    // Payment method token validation
    if (!formData.paymentMethodId) {
      errors.paymentMethodId = 'Payment method is required';
    } else if (!/^pm_[a-zA-Z0-9_]+$/.test(formData.paymentMethodId)) {
      errors.paymentMethodId = 'Invalid payment method token format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccess(null);
    setError(null);
    setValidationErrors({});

    // Validate form
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
        checkInDate: formData.checkInDate.toISOString().split('T')[0],
        checkOutDate: formData.checkOutDate.toISOString().split('T')[0],
        numberOfGuests: formData.numberOfGuests,
        specialRequests: formData.specialRequests || undefined,
        paymentMethodId: formData.paymentMethodId, // SECURE: Token instead of raw card data
      }).unwrap();

      setSuccess(
        `Booking created successfully! Reservation ID: ${response.reservation.id}. Payment of $${response.payment.amount} processed.`
      );

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
        paymentMethodId: '',
      });
      setSelectedRoom(null);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create booking. Please check all fields and try again.');
    }
  };

  // Stripe test payment method tokens
  const testPaymentMethods = [
    { value: 'pm_card_visa', label: 'Test Visa (4242 4242 4242 4242)' },
    { value: 'pm_card_visa_debit', label: 'Test Visa Debit' },
    { value: 'pm_card_mastercard', label: 'Test Mastercard (5555 5555 5555 4444)' },
    { value: 'pm_card_amex', label: 'Test American Express (3782 822463 10005)' },
    { value: 'pm_card_discover', label: 'Test Discover' },
    { value: 'pm_card_diners', label: 'Test Diners Club' },
    { value: 'pm_card_jcb', label: 'Test JCB' },
  ];

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Manager-Assisted Booking
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Create a booking on behalf of a customer and charge their card
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Customer Information */}
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Customer Email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange('customerEmail')}
                  error={!!validationErrors.customerEmail}
                  helperText={validationErrors.customerEmail || "Existing customer will be found by email, or new account will be created"}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.customerPhoneNumber}
                  onChange={handleChange('customerPhoneNumber')}
                  error={!!validationErrors.customerPhoneNumber}
                  helperText={validationErrors.customerPhoneNumber}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={formData.customerFirstName}
                  onChange={handleChange('customerFirstName')}
                  error={!!validationErrors.customerFirstName}
                  helperText={validationErrors.customerFirstName}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  value={formData.customerLastName}
                  onChange={handleChange('customerLastName')}
                  error={!!validationErrors.customerLastName}
                  helperText={validationErrors.customerLastName}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Booking Details */}
            <Typography variant="h6" gutterBottom>
              Booking Details
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required sx={{ minWidth: 180 }}>
                  <InputLabel shrink sx={{ whiteSpace: 'nowrap', overflow: 'visible' }}>
                    Room
                  </InputLabel>
                  <Select
                    value={formData.roomId}
                    onChange={handleChange('roomId')}
                    label="Room"
                    disabled={roomsLoading}
                    notched
                    sx={{ minWidth: 180 }}
                  >
                    {rooms?.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.name} - {room.type} (${room.pricePerNight}/night, Capacity: {room.capacity})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Guests"
                  value={formData.numberOfGuests}
                  onChange={handleChange('numberOfGuests')}
                  error={!!validationErrors.numberOfGuests}
                  helperText={validationErrors.numberOfGuests}
                  inputProps={{ min: 1, max: selectedRoom?.capacity || 10 }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 180 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Check-in Date"
                    value={formData.checkInDate}
                    onChange={handleDateChange('checkInDate')}
                    minDate={new Date()}
                    slotProps={{
                      textField: { fullWidth: true, required: true },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Check-out Date"
                    value={formData.checkOutDate}
                    onChange={handleDateChange('checkOutDate')}
                    minDate={formData.checkInDate || new Date()}
                    slotProps={{
                      textField: { fullWidth: true, required: true },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Special Requests"
                  value={formData.specialRequests}
                  onChange={handleChange('specialRequests')}
                  error={!!validationErrors.specialRequests}
                  helperText={validationErrors.specialRequests || `${formData.specialRequests.length}/500 characters`}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {selectedRoom && formData.checkInDate && formData.checkOutDate && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="subtitle2">
                      Total Amount: ${calculateTotal().toFixed(2)}
                    </Typography>
                    <Typography variant="caption">
                      {Math.ceil(
                        (formData.checkOutDate.getTime() - formData.checkInDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      night(s) × ${selectedRoom.pricePerNight}/night
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Payment Information - SECURE Token-Based */}
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                🔒 Secure Payment Processing
              </Typography>
              <Typography variant="body2">
                This form uses Stripe test tokens - card data never touches our server.
                Select a test payment method below to simulate a payment.
              </Typography>
            </Alert>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will charge the customer immediately. Please verify all details before submitting.
            </Alert>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!validationErrors.paymentMethodId}>
                  <InputLabel shrink>Test Payment Method</InputLabel>
                  <Select
                    value={formData.paymentMethodId}
                    onChange={handleChange('paymentMethodId')}
                    label="Test Payment Method"
                    notched
                  >
                    {testPaymentMethods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.paymentMethodId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {validationErrors.paymentMethodId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Testing Guide:</strong> All test payment methods will succeed.
                    In production, you would integrate Stripe.js to tokenize real card data client-side.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={bookingLoading}
                startIcon={bookingLoading ? <CircularProgress size={20} /> : null}
              >
                {bookingLoading ? 'Processing...' : 'Create Booking & Charge Card'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AssistedBooking;
