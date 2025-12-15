import React from 'react';
import {
  Menu,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  EventNote,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../features/auth/authSlice';

interface AuthenticatedMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

/**
 * Authenticated Menu Dropdown component - appears below hamburger icon
 * Displays menu items for authenticated users
 */
const AuthenticatedMenuDrawer: React.FC<AuthenticatedMenuDrawerProps> = ({ open, onClose, anchorEl }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const handleMyBookings = () => {
    onClose();
    navigate('/reservations');
  };

  const handleProfile = () => {
    onClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate('/');
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 320,
          maxWidth: '90vw',
          backgroundColor: '#000000',
          color: '#ffffff',
          mt: 1,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography
            variant="body1"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            Welcome {user?.firstName} {user?.lastName}!
          </Typography>
        </Box>

        {/* Menu Items */}
        <List sx={{ p: 0 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleMyBookings}
              sx={{
                backgroundColor: '#1a1a1a',
                borderRadius: 2,
                mb: 1.5,
                py: 1.5,
                px: 2,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#252525',
                },
              }}
            >
              <EventNote sx={{ color: '#ffffff', mr: 2, fontSize: 20 }} />
              <ListItemText
                primary="My Reservations"
                primaryTypographyProps={{
                  sx: {
                    color: '#ffffff',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleProfile}
              sx={{
                backgroundColor: '#1a1a1a',
                borderRadius: 2,
                mb: 1.5,
                py: 1.5,
                px: 2,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#252525',
                },
              }}
            >
              <AccountCircle sx={{ color: '#ffffff', mr: 2, fontSize: 20 }} />
              <ListItemText
                primary="Profile"
                primaryTypographyProps={{
                  sx: {
                    color: '#ffffff',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Logout */}
        <Box
          onClick={handleLogout}
          sx={{
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            py: 1.5,
            px: 2,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: '#252525',
            },
          }}
        >
          <Typography
            sx={{
              color: '#f44336',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            Logout
          </Typography>
        </Box>
      </Box>
    </Menu>
  );
};

export default AuthenticatedMenuDrawer;

