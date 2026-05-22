import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, ArrowLeftRight, Tag, Target, BarChart3, User, LogOut, TrendingUp } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={18} color="#000" />
          </div>
          <span style={{ fontSize: '18px', fontFamily: 'Syne', fontWeight: 700, color: '#fff' }}>FinTrack</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.1em', padding: '0 8px', marginBottom: '8px', marginTop: '4px' }}>MENU</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '12px',
              fontSize: '14px', fontWeight: isActive ? 600 : 400,
              textDecoration: 'none', transition: 'all 0.15s ease',
              background: isActive ? 'var(--brand-glow)' : 'transparent',
              color: isActive ? 'var(--brand-light)' : 'var(--text-muted)',
              border: isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
            })}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <NavLink to="/profile" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
            borderRadius: '12px', textDecoration: 'none', transition: 'all 0.15s ease', marginBottom: '4px',
            background: isActive ? 'var(--brand-glow)' : 'transparent',
            color: isActive ? 'var(--brand-light)' : 'var(--text-muted)',
            border: isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
            fontSize: '14px', fontWeight: 400,
          })}>
            <User size={17} />
            Profile
          </NavLink>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '4px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#000', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#e2ede3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', transition: 'all 0.15s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: '#080c0a' }}>
        <Outlet />
      </main>
    </div>
  );
}