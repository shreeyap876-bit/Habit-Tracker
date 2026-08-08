import { NavLink } from 'react-router-dom';
import { BarChart3, CheckCircle2, LayoutDashboard, Sparkles, Sprout } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/habits', label: 'Habit Tracker', icon: CheckCircle2 },
  { to: '/coach', label: 'AI Habit Coach', icon: Sparkles },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`.trim()}>
      <div className="sidebar__brand">
        <span className="sidebar__mark">
          <Sprout size={20} strokeWidth={1.8} />
        </span>
        <div>
          <p className="sidebar__name">Habit Tracker</p>
          <p className="sidebar__tagline">Small habits, big changes</p>
        </div>
      </div>

      <p className="eyebrow sidebar__label">Menu</p>

      <nav className="sidebar__nav" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`.trim()}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__quote">One small thing, done today. That is the whole trick.</p>
      </div>
    </aside>
  );
}
