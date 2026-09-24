import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../types/api';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { isLoggedIn, hasRole } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (roles && !hasRole(roles)) return <Navigate to="/access-denied" replace />;
  return <Outlet />;
}
