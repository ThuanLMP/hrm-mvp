import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect employees to timesheet instead of dashboard
  if (user.role === 'employee') {
    return <Navigate to="/timesheet" replace />;
  }

  // Other roles go to dashboard
  return <Navigate to="/dashboard" replace />;
}