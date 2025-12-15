import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Close,
  EditCalendar,
  HeadsetMic,
  Cancel,
} from '@mui/icons-material';
import { useGetReservationByIdQuery, useCancelReservationMutation } from '../features/reservations/reservationsApi';

/**
 * Helper function to parse date string without timezone conversion
 */
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format date as "Nov 10, 2023" format
 */
const formatLongDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date as "Nov 10" format
 */
const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculate modification deadline (2 days before check-in)
 */
const calculateModificationDeadline = (checkInDate: string): Date => {
  const checkIn = parseDate(checkInDate);
  const deadline = new Date(checkIn);
  deadline.setDate(deadline.getDate() - 2); // 2 days before check-in
  return deadline;
};

/**
 * Calculate cancellation deadline (2 days before check-in)
 */
const calculateCancellationDeadline = (checkInDate: string): Date => {
  const checkIn = parseDate(checkInDate);
  const deadline = new Date(checkIn);
  deadline.setDate(deadline.getDate() - 2); // 2 days before check-in
  return deadline;
};

/**
 * Reservation Manage page component
 * Allows users to modify, contact, or cancel their reservation
 */
const ReservationManage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelError, setCancelError] = useState<string>('');

  // Fetch reservation details using RTK Query
  const { data: reservation, isLoading, error } = useGetReservationByIdQuery(id || '', {
    skip: !id,
  });

  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          backgroundColor: '#000000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#1976d2' }} />
      </Box>
    );
  }

  if (error || !reservation) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          backgroundColor: '#000000',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Alert severity="error" sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }}>
            Failed to load reservation details. Please try again.
          </Alert>
          <Button
            onClick={() => navigate('/reservations')}
            sx={{ mt: 2, color: '#ffffff' }}
          >
            Back to Reservations
          </Button>
        </Container>
      </Box>
    );
  }

  const checkInDate = parseDate(reservation.checkInDate);
  const modificationDeadline = calculateModificationDeadline(reservation.checkInDate);
  const cancellationDeadline = calculateCancellationDeadline(reservation.checkInDate);
  const now = new Date();
  const isBeforeModificationDeadline = now < modificationDeadline;
  const isBeforeCancellationDeadline = now < cancellationDeadline;
  const cancellationFee = 150; // $150 fee after deadline

  const handleBack = () => {
    navigate('/reservations');
  };

  const handleModifyReservation = () => {
    // TODO: Implement modify reservation functionality
    // For now, no action - button is clickable but does nothing
  };

  const handleContactHotel = () => {
    // TODO: Implement contact hotel functionality (email, phone, or chat)
    // For now, show an alert or navigate to a contact page
    alert('Contact Hotel:\nPhone: (555) 123-4567\nEmail: support@hotelluxe.com');
  };

  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
    setCancelError('');
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancelError('');
  };

  const handleConfirmCancel = async () => {
    setCancelError('');

    try {
      await cancelReservation(id!).unwrap();
      handleCloseCancelDialog();
      // Navigate back to reservations page
      navigate('/reservations', {
        state: { message: 'Reservation cancelled successfully!' },
      });
    } catch (err: any) {
      setCancelError(err.data?.message || 'Failed to cancel reservation. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
            }}
          >
            RESERVATION OPTIONS
          </Typography>
          <IconButton
            onClick={handleBack}
            sx={{
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Option 1: Change Dates or Room */}
        <Card
          sx={{
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            mb: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <EditCalendar sx={{ fontSize: 32, color: '#1976d2' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                >
                  Change Dates or Room
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.95rem',
                    mb: 2,
                    lineHeight: 1.6,
                  }}
                >
                  Modifications allowed until{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    {formatLongDate(modificationDeadline)}
                  </Box>
                  . Rate differences may apply based on new dates.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleModifyReservation}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: '#ffffff',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                    },
                  }}
                >
                  Modify Reservation
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Option 2: Contact Property */}
        <Card
          sx={{
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            mb: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <HeadsetMic sx={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.7)' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                >
                  Contact Property
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.95rem',
                    mb: 2,
                    lineHeight: 1.6,
                  }}
                >
                  Have a special request or need assistance? Contact the hotel directly.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleContactHotel}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Contact Hotel for Changes
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Option 3: Cancel Reservation */}
        <Card
          sx={{
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            mb: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Cancel sx={{ fontSize: 32, color: '#f44336' }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                >
                  Cancel Reservation
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.95rem',
                    mb: 2,
                    lineHeight: 1.6,
                  }}
                >
                  {isBeforeCancellationDeadline ? (
                    <>
                      Free cancellation until{' '}
                      <Box component="span" sx={{ fontWeight: 700, color: '#ffffff' }}>
                        {formatShortDate(cancellationDeadline)}
                      </Box>
                      . After this date, a fee of{' '}
                      <Box component="span" sx={{ fontWeight: 700, color: '#ffffff' }}>
                        ${cancellationFee}
                      </Box>
                      {' '}applies.
                    </>
                  ) : (
                    <>
                      Cancellation after{' '}
                      <Box component="span" sx={{ fontWeight: 700, color: '#ffffff' }}>
                        {formatShortDate(cancellationDeadline)}
                      </Box>
                      {' '}incurs a fee of{' '}
                      <Box component="span" sx={{ fontWeight: 700, color: '#ffffff' }}>
                        ${cancellationFee}
                      </Box>
                      .
                    </>
                  )}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleOpenCancelDialog}
                  sx={{
                    borderColor: '#f44336',
                    color: '#f44336',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#d32f2f',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    },
                  }}
                >
                  Cancel Reservation
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={handleCloseCancelDialog}
          aria-labelledby="cancel-dialog-title"
          aria-describedby="cancel-dialog-description"
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
            },
          }}
        >
          <DialogTitle
            id="cancel-dialog-title"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: '#ffffff',
            }}
          >
            <Cancel sx={{ color: '#f44336' }} />
            Cancel Reservation
          </DialogTitle>
          <DialogContent>
            {cancelError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  color: '#f44336',
                }}
              >
                {cancelError}
              </Alert>
            )}
            <DialogContentText
              id="cancel-dialog-description"
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {isBeforeCancellationDeadline ? (
                <>
                  Are you sure you want to cancel this reservation? This action cannot be undone.
                  You will receive a full refund.
                </>
              ) : (
                <>
                  Are you sure you want to cancel this reservation? This action cannot be undone.
                  A cancellation fee of <strong>${cancellationFee}</strong> will be applied.
                </>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseCancelDialog}
              disabled={isCancelling}
              variant="outlined"
              size="large"
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              Keep Reservation
            </Button>
            <Button
              onClick={handleConfirmCancel}
              color="error"
              variant="contained"
              disabled={isCancelling}
              size="large"
              startIcon={isCancelling ? <CircularProgress size={20} color="inherit" /> : <Cancel />}
              autoFocus
              sx={{
                backgroundColor: '#f44336',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
              }}
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ReservationManage;

