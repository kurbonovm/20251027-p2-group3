import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Divider,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { Reservation, RefundCalculation } from '../types';
import { useGetCancellationPreviewQuery, useCancelWithRefundMutation } from '../features/reservations/reservationsApi';

interface CancellationDialogProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onSuccess?: () => void;
}

const CancellationDialog: React.FC<CancellationDialogProps> = ({
  open,
  onClose,
  reservation,
  onSuccess,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [step, setStep] = useState<'preview' | 'confirm' | 'success'>('preview');
  const [cancellationReason, setCancellationReason] = useState('');
  const [acknowledgePolicy, setAcknowledgePolicy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: refundCalc, isLoading: isLoadingPreview, error: previewError } = useGetCancellationPreviewQuery(
    reservation?.id || '',
    { skip: !reservation?.id || !open }
  );

  const [cancelWithRefund, { isLoading: isCancelling }] = useCancelWithRefundMutation();

  useEffect(() => {
    if (open) {
      setStep('preview');
      setCancellationReason('');
      setAcknowledgePolicy(false);
      setErrorMessage('');
    }
  }, [open]);

  const handleNext = () => {
    if (!cancellationReason.trim()) {
      setErrorMessage('Please provide a reason for cancellation');
      return;
    }
    if (!acknowledgePolicy) {
      setErrorMessage('You must acknowledge the cancellation policy');
      return;
    }
    setErrorMessage('');
    setStep('confirm');
  };

  const handleConfirmCancel = async () => {
    if (!reservation) return;

    try {
      const response = await cancelWithRefund({
        id: reservation.id,
        request: {
          reason: cancellationReason,
          acknowledgePolicy: true,
        },
      }).unwrap();

      setStep('success');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      }
    } catch (error: any) {
      setErrorMessage(error.data?.message || error.message || 'Failed to cancel reservation');
      setStep('preview');
    }
  };

  const handleClose = () => {
    if (!isCancelling) {
      onClose();
    }
  };

  const getRefundColor = () => {
    if (!refundCalc) return theme.palette.info.main;
    if (refundCalc.isFullRefund) return theme.palette.success.main;
    if (refundCalc.isNoRefund) return theme.palette.error.main;
    return theme.palette.warning.main;
  };

  const getRefundIcon = () => {
    if (!refundCalc) return <MoneyIcon />;
    if (refundCalc.isFullRefund) return <CheckIcon />;
    if (refundCalc.isNoRefund) return <CancelIcon />;
    return <WarningIcon />;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDarkMode ? 'rgba(26,26,26,0.98)' : 'background.paper',
          border: '2px solid',
          borderColor: getRefundColor(),
        },
      }}
    >
      {/* Preview Step */}
      {step === 'preview' && (
        <>
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${getRefundColor()}15 0%, ${getRefundColor()}05 100%)`,
              borderBottom: '1px solid',
              borderColor: `${getRefundColor()}40`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              {getRefundIcon()}
              <Typography variant="h5" sx={{ fontWeight: 700, color: getRefundColor() }}>
                Cancel Reservation
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            {isLoadingPreview && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {previewError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load cancellation details. Please try again.
              </Alert>
            )}

            {refundCalc && (
              <>
                {/* Reservation Details */}
                <Box
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: isDarkMode ? 'rgba(255,215,0,0.05)' : 'rgba(25,118,210,0.05)',
                    border: '1px solid',
                    borderColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {reservation?.room.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Check-in: {new Date(reservation?.checkInDate || '').toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Check-out: {new Date(reservation?.checkOutDate || '').toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    Days until check-in: <strong>{refundCalc.daysUntilCheckIn}</strong>
                  </Typography>
                </Box>

                {/* Refund Breakdown */}
                <Box
                  sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: getRefundColor(),
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: getRefundColor() }}>
                    Refund Breakdown
                  </Typography>

                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Original Amount:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ${refundCalc.originalAmount.toFixed(2)}
                      </Typography>
                    </Box>

                    {refundCalc.cancellationFee > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'error.main' }}>
                          Cancellation Fee:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                          -${refundCalc.cancellationFee.toFixed(2)}
                        </Typography>
                      </Box>
                    )}

                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        You will receive:
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: getRefundColor() }}
                      >
                        ${refundCalc.refundAmount.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Refund Percentage:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {refundCalc.refundPercentage}%
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Policy Explanation */}
                <Alert
                  severity={refundCalc.isFullRefund ? 'success' : refundCalc.isNoRefund ? 'error' : 'warning'}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {refundCalc.policyDescription}
                  </Typography>
                  <Typography variant="body2">{refundCalc.explanation}</Typography>
                </Alert>

                {/* Cancellation Reason */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason for Cancellation"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please tell us why you're cancelling (optional but helpful)"
                  sx={{ mb: 2 }}
                />

                {/* Policy Acknowledgement */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acknowledgePolicy}
                      onChange={(e) => setAcknowledgePolicy(e.target.checked)}
                      sx={{
                        color: getRefundColor(),
                        '&.Mui-checked': {
                          color: getRefundColor(),
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I understand the cancellation policy and accept the refund amount of{' '}
                      <strong>${refundCalc.refundAmount.toFixed(2)}</strong>
                    </Typography>
                  }
                />

                {errorMessage && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage}
                  </Alert>
                )}
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={handleClose} disabled={isLoadingPreview}>
              Keep Reservation
            </Button>
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={isLoadingPreview || !refundCalc}
              sx={{
                bgcolor: getRefundColor(),
                '&:hover': {
                  bgcolor: getRefundColor(),
                  filter: 'brightness(0.9)',
                },
              }}
            >
              Continue
            </Button>
          </DialogActions>
        </>
      )}

      {/* Confirmation Step */}
      {step === 'confirm' && refundCalc && (
        <>
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, rgba(244,67,54,0.1) 0%, rgba(211,47,47,0.05) 100%)',
              borderBottom: '1px solid',
              borderColor: 'rgba(244,67,54,0.3)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <WarningIcon sx={{ color: 'error.main', fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                Confirm Cancellation
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
                Are you absolutely sure?
              </Typography>
              <Typography variant="body2">
                This action cannot be undone. Your reservation will be permanently cancelled.
              </Typography>
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Refund to be processed:
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: getRefundColor() }}>
                ${refundCalc.refundAmount.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Expected in 5-10 business days
              </Typography>
            </Box>

            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setStep('preview')} disabled={isCancelling}>
              Go Back
            </Button>
            <Button
              onClick={handleConfirmCancel}
              variant="contained"
              disabled={isCancelling}
              sx={{
                bgcolor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
              }}
            >
              {isCancelling ? <CircularProgress size={24} /> : 'Yes, Cancel Reservation'}
            </Button>
          </DialogActions>
        </>
      )}

      {/* Success Step */}
      {step === 'success' && (
        <>
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(56,142,60,0.05) 100%)',
              borderBottom: '1px solid',
              borderColor: 'rgba(76,175,80,0.3)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <CheckIcon sx={{ color: 'success.main', fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                Cancellation Successful
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Your reservation has been cancelled successfully.
              </Typography>
            </Alert>

            {refundCalc && refundCalc.refundAmount > 0 && (
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'rgba(76,175,80,0.05)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(76,175,80,0.2)',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Refund Amount:
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 2 }}>
                  ${refundCalc.refundAmount.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ✓ Refund has been initiated
                  <br />
                  ✓ You will receive it in 5-10 business days
                  <br />
                  ✓ Confirmation email sent to your inbox
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={handleClose} variant="contained" color="success">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default CancellationDialog;
