import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';
import GuestHeader from '../components/GuestHeader';
import AuthenticatedHeader from '../components/AuthenticatedHeader';
import AdminHeader from '../components/AdminHeader';
import Footer from '../components/Footer';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';
import { SearchParams } from '../components/SearchBar';

/**
 * MainLayout component provides the main application layout with navigation
 * Uses AuthenticatedHeader for logged-in users and GuestHeader for guests
 */
const MainLayout: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  // Check if current route is an admin route or special pages that don't need search
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isOAuthCallback = location.pathname === '/oauth2/callback';
  
  // Check if user has admin or manager role
  const isAdminOrManager = user?.roles?.some(role => role === 'ADMIN' || role === 'MANAGER');
  
  // Pages that should not show search bar
  const hideSearchBar = isAdminRoute || isLoginPage || isRegisterPage || isOAuthCallback;

  const handleSearch = (params: SearchParams) => {
    // Navigate to rooms page with search params
    navigate('/rooms', { state: { searchParams: params } });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header - Show AdminHeader for admin routes, AuthenticatedHeader for regular users, GuestHeader for guests */}
      {isAuthenticated && isAdminRoute && isAdminOrManager ? (
        <AdminHeader />
      ) : isAuthenticated ? (
        <AuthenticatedHeader onSearch={hideSearchBar ? undefined : handleSearch} />
      ) : (
        <GuestHeader onSearch={hideSearchBar ? undefined : handleSearch} />
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>

      {/* Footer - Consistent across all pages */}
      <Footer />
    </Box>
  );
};

export default MainLayout;
