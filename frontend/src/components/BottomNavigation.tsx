import React from 'react';
import { Box, Typography } from '@mui/material';
import { Search, Favorite, Flight, Email, Person } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'explore', label: 'Explore', icon: <Search />, path: '/' },
  { id: 'wishlists', label: 'Wishlists', icon: <Favorite />, path: '/wishlists' },
  { id: 'trips', label: 'Trips', icon: <Flight />, path: '/trips' },
  { id: 'inbox', label: 'Inbox', icon: <Email />, path: '/inbox' },
  { id: 'profile', label: 'Profile', icon: <Person />, path: '/profile' },
];

/**
 * Bottom Navigation component for mobile
 */
const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: { xs: 'flex', md: 'none' },
        justifyContent: 'space-around',
        py: 1,
        zIndex: 1000,
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Box
            key={item.id}
            onClick={() => navigate(item.path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              px: 2,
              py: 0.5,
            }}
          >
            <Box
              sx={{
                color: isActive ? '#1976d2' : 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: isActive ? '#1976d2' : 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.7rem',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.label}
            </Typography>
            {isActive && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: 2,
                  backgroundColor: '#1976d2',
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default BottomNavigation;

