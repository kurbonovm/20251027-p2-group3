import React, { useState } from 'react';
import { Box, Typography, IconButton, AppBar, Toolbar, Avatar } from '@mui/material';
import { Bed, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SearchBar, { SearchParams } from './SearchBar';
import AuthenticatedMenuDrawer from './AuthenticatedMenuDrawer';
import { selectCurrentUser } from '../features/auth/authSlice';

interface AuthenticatedHeaderProps {
  onSearch?: (params: SearchParams) => void;
}

/**
 * Authenticated Header component for logged-in users
 * Displays Hotel Luxe branding, My Reservations menu, User Avatar, and Search Bar
 */
const AuthenticatedHeader: React.FC<AuthenticatedHeaderProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleMyBookingsClick = () => {
    navigate('/reservations');
  };

  return (
    <Box sx={{ backgroundColor: 'transparent' }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          borderBottom: 'none',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, md: 1 },
            gap: 2,
          }}
        >
          {/* First Row: Logo, My Bookings, Avatar, and Menu */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Left: Hotel Luxe Logo + My Bookings */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              {/* Hotel Luxe Logo */}
              <Box 
                onClick={handleHomeClick}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <Bed sx={{ fontSize: 28, color: '#1976d2' }} />
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '0.5px',
                  }}
                >
                  Hotel Luxe
                </Typography>
              </Box>

              {/* My Reservations Menu */}
              <Box
                onClick={handleMyBookingsClick}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    color: '#ffffff',
                    fontWeight: 500,
                  }}
                >
                  My Reservations
                </Typography>
              </Box>
            </Box>

            {/* Right: Avatar + Menu */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexShrink: 0,
              }}
            >
              <Avatar
                alt={user?.firstName || 'User'}
                src={user?.avatar}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#1976d2',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              />
              <IconButton
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Second Row: Search Bar */}
          {onSearch && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                mt: { xs: 1, md: 0.5 },
              }}
            >
              <SearchBar onSearch={onSearch} />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Authenticated Menu Dropdown */}
      <AuthenticatedMenuDrawer
        open={menuOpen}
        onClose={() => setMenuAnchorEl(null)}
        anchorEl={menuAnchorEl}
      />
    </Box>
  );
};

export default AuthenticatedHeader;

