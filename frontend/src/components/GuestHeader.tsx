import React, { useState } from 'react';
import { Box, Typography, IconButton, AppBar, Toolbar } from '@mui/material';
import { Bed, Menu } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SearchBar, { SearchParams } from './SearchBar';
import GuestMenuDrawer from './GuestMenuDrawer';

interface GuestHeaderProps {
  onSearch?: (params: SearchParams) => void;
}

/**
 * Guest Header component for unauthenticated users
 * Displays Hotel Luxe branding, Become a Guest button, and Search Bar
 */
const GuestHeader: React.FC<GuestHeaderProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

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
          {/* First Row: Logo and Menu Items */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Left: Hotel Luxe Logo */}
            <Box 
              onClick={() => navigate('/')}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                flexShrink: 0,
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

            {/* Right: Become a Guest + Menu */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexShrink: 0,
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
                Become a Guest
              </Typography>
              <IconButton
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                sx={{
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Menu />
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

      {/* Guest Menu Dropdown */}
      <GuestMenuDrawer
        open={menuOpen}
        onClose={() => setMenuAnchorEl(null)}
        anchorEl={menuAnchorEl}
      />
    </Box>
  );
};

export default GuestHeader;

