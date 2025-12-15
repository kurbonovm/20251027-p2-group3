import React, { useState } from 'react';
import { Box, Typography, IconButton, AppBar, Toolbar, Avatar, Button } from '@mui/material';
import { Bed, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthenticatedMenuDrawer from './AuthenticatedMenuDrawer';
import { selectCurrentUser } from '../features/auth/authSlice';
import { Role } from '../types';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Hotel as HotelIcon,
  CalendarMonth as CalendarIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

interface AdminHeaderProps {}

interface MenuItemConfig {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
}

/**
 * Admin Header component for admin/manager users
 * Displays Hotel Luxe branding, Admin menu items, User Avatar, and Menu
 */
const AdminHeader: React.FC<AdminHeaderProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const allMenuItems: MenuItemConfig[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon />, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Users', path: '/admin/users', icon: <PeopleIcon />, roles: ['ADMIN'] },
    { label: 'Rooms', path: '/admin/rooms', icon: <HotelIcon />, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Reservations', path: '/admin/reservations', icon: <CalendarIcon />, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Transactions', path: '/admin/transactions', icon: <ReceiptIcon />, roles: ['ADMIN', 'MANAGER'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item =>
    item.roles.some(role => user?.roles?.includes(role))
  );

  const handleHomeClick = () => {
    navigate('/admin/dashboard');
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
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
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, md: 1 },
          }}
        >
          {/* Left: Hotel Luxe Logo + Admin Menu Items */}
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

            {/* Admin Menu Items */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    onClick={() => handleMenuItemClick(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: isActive ? '#1976d2' : '#ffffff',
                      fontWeight: isActive ? 600 : 500,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      backgroundColor: isActive ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: isActive ? 'rgba(25, 118, 210, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        opacity: 1,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
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
        </Toolbar>
      </AppBar>

      {/* Mobile Menu - Show admin items in dropdown on mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                onClick={() => handleMenuItemClick(item.path)}
                startIcon={item.icon}
                size="small"
                sx={{
                  color: isActive ? '#1976d2' : '#ffffff',
                  fontWeight: isActive ? 600 : 500,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(25, 118, 210, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* Authenticated Menu Dropdown */}
      <AuthenticatedMenuDrawer
        open={menuOpen}
        onClose={() => setMenuAnchorEl(null)}
        anchorEl={menuAnchorEl}
      />
    </Box>
  );
};

export default AdminHeader;

