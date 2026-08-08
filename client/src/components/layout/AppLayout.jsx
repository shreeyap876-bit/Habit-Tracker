import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HabitsProvider } from '../../context/HabitsContext.jsx';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

/** Page titles shown in the topbar, keyed by route. */
const TITLES = {
  '/dashboard': 'Dashboard',
  '/habits': 'Habit Tracker',
  '/coach': 'AI Habit Coach',
  '/insights': 'Insights',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <HabitsProvider>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div
            className="sidebar__scrim"
            role="presentation"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="app-main">
          <Topbar
            title={TITLES[pathname] ?? 'Habit Tracker'}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
          <main className="page">
            <Outlet />
          </main>
        </div>
      </div>
    </HabitsProvider>
  );
}
