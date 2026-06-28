import { Link, useLocation } from 'react-router-dom';
import { useMusicMatch } from '../context/MusicMatchContext';

const navItems = [
  { path: '/',               icon: '🏠', label: 'Dashboard' },
  { path: '/rate',           icon: '⭐', label: 'Rate Songs' },
  { path: '/recommendations',icon: '⚡', label: 'Recommendations' },
  { path: '/latent-space',   icon: '🧬', label: 'Latent Space' },
  { path: '/feed',           icon: '📰', label: 'Social Feed' },
  { path: '/chat',           icon: '💬', label: 'Chat' },
  { path: '/profile',        icon: '👤', label: 'Profile' },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useMusicMatch();
  const active = (p: string) => location.pathname === p;

  return (
    <aside style={{
      width: '220px', flexShrink: 0, backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '20px 12px', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '28px', paddingLeft: '8px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700' }} className="gradient-text">🎵 MusicMatch</h1>
        <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>Music taste, matched.</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
              transition: 'all 0.15s',
              backgroundColor: active(item.path) ? 'rgba(124,58,237,0.2)' : 'transparent',
              color: active(item.path) ? '#9f5ef8' : 'var(--muted-foreground)',
              border: active(item.path) ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
        {user && (
          <div style={{ padding: '10px 12px', backgroundColor: 'var(--muted)', borderRadius: '8px', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            {user.role === 'ADMIN' && <span className="badge badge-info" style={{ marginTop: '4px' }}>Admin</span>}
          </div>
        )}
        <button
          onClick={logout}
          className="btn btn-outline"
          style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
