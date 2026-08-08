import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import useClickOutside from '../../hooks/useClickOutside.js';
import Avatar from '../ui/Avatar.jsx';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useClickOutside(() => setOpen(false), open);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={user.avatar} name={user.name} />
        <span className="user-menu__name">{user.name.split(' ')[0]}</span>
        <ChevronDown size={15} strokeWidth={2} color="var(--muted)" />
      </button>

      {open && (
        <div className="menu" role="menu">
          <div style={{ padding: '0.35rem 0.65rem 0.6rem' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{user.name}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{user.email}</p>
          </div>

          <div className="menu__divider" />

          <button
            type="button"
            role="menuitem"
            className="menu__item"
            onClick={() => {
              setOpen(false);
              navigate('/coach');
            }}
          >
            <Sparkles size={16} strokeWidth={1.8} />
            Coach settings
          </button>

          <button type="button" role="menuitem" className="menu__item menu__item--danger" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
