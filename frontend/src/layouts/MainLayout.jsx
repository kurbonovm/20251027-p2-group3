import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Hotel as HotelIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../features/auth/authSlice';

/**
 * MainLayout component provides the main application layout with navigation
 * @returns {React.ReactNode} The main layout component
 */
const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleCloseUserMenu();
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Rooms', icon: <HotelIcon />, path: '/rooms' },
    ...(isAuthenticated
      ? [{ text: 'My Reservations', icon: <EventNoteIcon />, path: '/reservations' }]
      : []),
    ...(user?.roles?.includes('ADMIN') || user?.roles?.includes('MANAGER')
      ? [{ text: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin' }]
      : []),
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

            <HotelIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              Hotel Reservation System
            </Typography>

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' },
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              HRS
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{ color: 'white' }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

            {isAuthenticated ? (
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.name || 'User'} src={user?.avatar} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>

      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Hotel Reservation System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
