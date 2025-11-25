import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';

/**
 * ProtectedRoute component to guard routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {Array<string>} props.allowedRoles - Array of roles that are allowed to access the route
 * @returns {React.ReactNode} The protected content or redirect to login
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user) {
    const hasRequiredRole = allowedRoles.some(role =>
      user.roles?.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
