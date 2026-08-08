import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingScreen } from '../components/ui/Spinner.jsx';

/**
 * Gate for the authenticated area. While the session is being restored nothing
 * is decided yet, so it waits rather than bouncing the user to /login.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <LoadingScreen message="Checking your session…" />;

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
