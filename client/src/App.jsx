import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Habits from './pages/Habits.jsx';
import Coach from './pages/Coach.jsx';
import Insights from './pages/Insights.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/insights" element={<Insights />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
