/**
 * Notification toast component for displaying user feedback messages.
 *
 * @module components/Notification
 */

import { Snackbar, Alert, AlertColor } from '@mui/material';

/**
 * Props for Notification component.
 */
interface NotificationProps {
  /** Whether the notification is visible */
  open: boolean;
  /** Callback when notification is closed */
  onClose: () => void;
  /** Message to display */
  message: string;
  /** Severity level affecting color and icon */
  severity?: AlertColor;
}

/**
 * Toast notification component with auto-hide functionality.
 * Displays in top-right corner and auto-dismisses after 6 seconds.
 *
 * @param props - Component props
 * @returns Notification snackbar
 *
 * @example
 * ```tsx
 * <Notification
 *   open={showNotification}
 *   onClose={() => setShowNotification(false)}
 *   message="Operation successful"
 *   severity="success"
 * />
 * ```
 */
const Notification: React.FC<NotificationProps> = ({
  open,
  onClose,
  message,
  severity = 'info'
}) => {
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
