/**
 * Loading component displaying a centered spinner with optional message.
 *
 * @module components/Loading
 */

import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Props for Loading component.
 */
interface LoadingProps {
  /** Optional loading message to display */
  message?: string;
}

/**
 * Centered loading indicator with spinner and text.
 *
 * @param props - Component props
 * @returns Loading indicator
 *
 * @example
 * ```tsx
 * <Loading />
 * <Loading message="Fetching data..." />
 * ```
 */
const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;
