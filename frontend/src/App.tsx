/**
 * Main application component.
 * Configures routing, theme provider, and defines all application routes.
 *
 * @module App
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Booking from './pages/Booking';
import Reservations from './pages/Reservations';
import ResumePayment from './pages/ResumePayment';
import Profile from './pages/Profile';
import PaymentHistory from './pages/PaymentHistory';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRooms from './pages/admin/Rooms';
import AdminReservations from './pages/admin/Reservations';
import AdminAssistedBookingPaymentLink from './pages/admin/AssistedBookingPaymentLink';
import AdminTransactions from './pages/admin/Transactions';
import PublicPayment from './pages/PublicPayment';
import PaymentSuccess from './pages/PaymentSuccess';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import OAuth2Callback from './pages/OAuth2Callback';

/**
 * Root application component with routing configuration.
 * Defines public routes, protected routes, and role-based admin routes.
 *
 * Route Structure:
 * - Public: Home, Login, Register, Rooms, Public Payment
 * - Protected: Booking, Reservations, Profile, Payment History
 * - Admin (ADMIN/MANAGER): Dashboard, Reservations, Rooms, Transactions, Assisted Booking
 * - Admin (ADMIN only): User Management
 *
 * @returns Configured application with routing
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth2/callback" element={<OAuth2Callback />} />
            <Route path="/payment/:token" element={<PublicPayment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <ProtectedRoute>
                  <Reservations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-payment/:reservationId"
              element={
                <ProtectedRoute>
                  <ResumePayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentHistory />
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminRooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reservations"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminReservations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assisted-booking-link"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminAssistedBookingPaymentLink />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminTransactions />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
