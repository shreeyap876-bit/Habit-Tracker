import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingScreen } from '../components/ui/Spinner.jsx';

/** Keeps signed-in users away from the login screen. */
export default function PublicRoute() {
  const { isAuthenticated, initialising } = useAuth();

  if (initialising) return <LoadingScreen message="Checking your session…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
