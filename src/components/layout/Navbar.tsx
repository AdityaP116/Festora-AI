import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '../../services/auth-context';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        className="container"
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--color-text)',
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          <img
            src="/logo.png"
            alt="Festora AI Logo"
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 2px 8px rgba(101, 67, 165, 0.15)',
            }}
          />
          <span>Festora<span style={{ color: 'var(--color-primary)' }}> AI</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="desktop-nav"
        >
          <a
            href="/#quick-calculator"
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <span>Calculator</span>
            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>FREE</span>
          </a>
          <a
            href="/#how-it-works"
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}
          >
            How it works
          </a>
          <a
            href="/#features"
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}
          >
            Features
          </a>
          <a
            href="/#occasions"
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}
          >
            Occasions
          </a>
          <a
            href="/#faq"
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}
          >
            FAQ
          </a>
        </nav>

        {/* Desktop Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }} className="desktop-actions">
          {user ? (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Calendar size={16} />
                <span>My Events</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/events/new')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Sparkles size={16} />
                <span>Plan Event</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link to="/events/new" className="btn btn-primary btn-sm">
                <span>Start Planning</span>
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="btn btn-ghost btn-icon mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          className="mobile-drawer"
        >
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', color: 'var(--color-text)', padding: '0.5rem 0' }}
          >
            How it works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', color: 'var(--color-text)', padding: '0.5rem 0' }}
          >
            Features
          </a>
          <a
            href="#occasions"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', color: 'var(--color-text)', padding: '0.5rem 0' }}
          >
            Occasions
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', color: 'var(--color-text)', padding: '0.5rem 0' }}
          >
            FAQ
          </a>
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.5rem 0' }} />
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/events/new');
                }}
              >
                Plan New Event
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/login"
                className="btn btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/events/new"
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Planning
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-actions {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn, .mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
