import { Snackbar, Alert } from '@mui/material';

/**
 * Notification component for displaying alerts
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether notification is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.message - Notification message
 * @param {string} props.severity - Severity level (success, error, warning, info)
 * @returns {React.ReactNode} Notification component
 */
const Notification = ({ open, onClose, message, severity = 'info' }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
