import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../services/auth-context';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'All Events', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Event Plan', path: '/events/new', icon: PlusCircle },
    { label: 'Preferences', path: '/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Skip to Main Content Link for Keyboard / Screen Readers */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '1rem',
          zIndex: 9999,
          padding: '0.75rem 1.25rem',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: 'var(--shadow-lg)',
          transition: 'top 0.2s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.top = '1rem';
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-9999px';
        }}
      >
        Skip to main content
      </a>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 90,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform var(--transition-normal)',
        }}
        className={`app-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
      >
        {/* Sidebar Header */}
        <div
          style={{
            height: 'var(--header-height)',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border-light)',
          }}
        >
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--color-text)',
              fontWeight: 700,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
            }}
          >
            <img
              src="/logo.png"
              alt="Festora AI Logo"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
              }}
            />
            <span>Festora<span style={{ color: 'var(--color-primary)' }}> AI</span></span>
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-icon mobile-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1.25rem 0.85rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ padding: '0.25rem 0.65rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Main Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.925rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--color-primary)' : 'currentColor'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div
          style={{
            padding: '1.1rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.9rem',
                flexShrink: 0,
              }}
            >
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={16} />}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.displayName || 'Planner'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'user@festora.ai'}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar for Mobile Toggle & Context */}
        <header
          style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-icon mobile-toggle-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Workspace
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/events/new')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={15} />
              <span className="create-event-text">Create Event</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main id="main-content" tabIndex={-1} style={{ flex: 1, padding: '1.75rem 1.5rem 3.5rem', outline: 'none' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .app-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
          }
          .app-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: inline-flex !important;
          }
          .mobile-toggle-btn {
            display: inline-flex !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-close-btn {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .create-event-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
