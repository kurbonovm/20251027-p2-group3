import { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { AccessTime } from '@mui/icons-material';

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export const CountdownTimer = ({ expiresAt, onExpired }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        if (onExpired) {
          onExpired();
        }
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  if (isExpired) {
    return (
      <Chip
        icon={<AccessTime />}
        label="Reservation Expired"
        color="error"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        icon={<AccessTime />}
        label={`Time left: ${timeLeft}`}
        color="warning"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    </Box>
  );
};
