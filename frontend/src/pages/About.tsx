import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

/**
 * About Us page component
 */
const About: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Paper
          sx={{
            backgroundColor: '#1a1a1a',
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#ffffff',
              mb: 3,
            }}
          >
            About Hotel Luxe
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.8,
              mb: 3,
            }}
          >
            Welcome to Hotel Luxe, where luxury meets comfort. We are dedicated to providing
            exceptional hospitality and creating memorable experiences for our guests.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.8,
            }}
          >
            Our mission is to offer world-class accommodations with personalized service,
            ensuring every stay is comfortable, elegant, and unforgettable.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default About;

