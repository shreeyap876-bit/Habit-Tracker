import { Menu } from 'lucide-react';
import { friendlyDate, todayKey } from '../../utils/date.js';
import IconButton from '../ui/IconButton.jsx';
import UserMenu from './UserMenu.jsx';

export default function Topbar({ title, onOpenSidebar }) {
  return (
    <header className="topbar">
      <IconButton
        icon={Menu}
        label="Open menu"
        className="topbar__menu-toggle"
        onClick={onOpenSidebar}
      />

      <div>
        <p className="topbar__date">{friendlyDate(todayKey())}</p>
        <p className="topbar__title">{title}</p>
      </div>

      <div className="topbar__actions">
        <UserMenu />
      </div>
    </header>
  );
}
