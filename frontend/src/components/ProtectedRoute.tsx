/**
 * Protected route component for authentication and role-based access control.
 * Redirects unauthenticated users to login and unauthorized users to unauthorized page.
 *
 * @module components/ProtectedRoute
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';
import type { Role } from '../types';

/**
 * Props for ProtectedRoute component.
 */
interface ProtectedRouteProps {
  /** Child components to render if authorized */
  children: React.ReactNode;
  /** Roles allowed to access this route (empty array allows all authenticated users) */
  allowedRoles?: Role[];
}

/**
 * Route wrapper that enforces authentication and optional role-based access control.
 *
 * @param props - Component props
 * @returns Protected children or redirect to login/unauthorized page
 *
 * @example
 * ```tsx
 * // Requires any authenticated user
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * // Requires ADMIN or MANAGER role
 * <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = []
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && user) {
    const hasRequiredRole = allowedRoles.some(role =>
      user.roles?.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
