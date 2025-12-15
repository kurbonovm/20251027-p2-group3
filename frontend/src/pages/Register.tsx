import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AuthModal from '../components/AuthModal';

/**
 * Register page component - displays AuthModal
 */
const Register: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AuthModal open={open} onClose={handleClose} initialTab="register" />
    </Box>
  );
};

export default Register;
