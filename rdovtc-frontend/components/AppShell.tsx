'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface NavItem { label: string; icon: string; id: string; }

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
  navItems: NavItem[];
  children: React.ReactNode;
}

export default function AppShell({ activeTab, setActiveTab, navItems, children }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change / resize
  useEffect(() => {
    const close = () => setSidebarOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const roleBadge: Record<string, string> = {
    'Admin':              'badge-admin',
    'Executive director': 'badge-ed',
    'VET Coordinator':    'badge-vet',
    'Principal/TC':       'badge-prin',
  };

  return (
    <>
      {/* Top header */}
      <header className="app-header">
        <button className="hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Menu">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className="brand">🎓 RDO VTC</span>
        <span className="user-badge">{user?.username}</span>
        <span className={`badge ${roleBadge[user?.role || ''] || 'badge-admin'}`} style={{ fontSize: '.7rem' }}>
          {user?.role}
        </span>
        <button className="btn-logout" onClick={handleLogout}>Sign out</button>
      </header>

      <div className="app-shell">
        {/* Mobile overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-section">
            <div className="sidebar-label">Navigation</div>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-section" style={{ marginTop: 'auto', paddingTop: 16 }}>
            <div className="sidebar-label">Account</div>
            {user?.branch_name && (
              <div style={{ fontSize: '.78rem', color: 'var(--muted)', padding: '4px 10px' }}>
                📍 {user.branch_name}
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}
