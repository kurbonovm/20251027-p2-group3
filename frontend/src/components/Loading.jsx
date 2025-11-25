import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading component to show loading state
 * @param {Object} props - Component props
 * @param {string} props.message - Optional loading message
 * @returns {React.ReactNode} Loading component
 */
const Loading = ({ message = 'Loading...' }) => {
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
