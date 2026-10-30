import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '3.5rem 0 2rem 0',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand info */}
          <div style={{ maxWidth: '320px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: 'var(--color-text)',
                fontWeight: 700,
                fontSize: '1.25rem',
                marginBottom: '0.85rem',
              }}
            >
              <img
                src="/logo.png"
                alt="Festora AI Logo"
                style={{
                  width: '34px',
                  height: '34px',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <span>Festora<span style={{ color: 'var(--color-primary)' }}> AI</span></span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              GenAI celebration and event planning platform. Transform ideas into structured plans, deterministic budgets, timelines, and actionable checklists.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem' }}>
              Product Workflows
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/events/new" style={{ color: 'var(--color-text-secondary)' }}>
                  Event Creation Wizard
                </Link>
              </li>
              <li>
                <Link to="/dashboard" style={{ color: 'var(--color-text-secondary)' }}>
                  Workspace & Dashboard
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" style={{ color: 'var(--color-text-secondary)' }}>
                  Deterministic Budget Tracker
                </a>
              </li>
              <li>
                <a href="/#features" style={{ color: 'var(--color-text-secondary)' }}>
                  Task & Milestone Checklist
                </a>
              </li>
              <li>
                <a href="/#contact" style={{ color: 'var(--color-text-secondary)' }}>
                  Contact Planning Support
                </a>
              </li>
            </ul>
          </div>

          {/* Supported Occasions */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem' }}>
              Supported Celebrations
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              <li><Link to="/events/new" style={{ color: 'var(--color-text-secondary)' }}>Weddings & Engagements</Link></li>
              <li><Link to="/events/new" style={{ color: 'var(--color-text-secondary)' }}>Milestone Birthdays & Anniversaries</Link></li>
              <li><Link to="/events/new" style={{ color: 'var(--color-text-secondary)' }}>College Festivals & Campus Events</Link></li>
              <li><Link to="/events/new" style={{ color: 'var(--color-text-secondary)' }}>Community Gatherings & Galas</Link></li>
            </ul>
          </div>

          {/* Legal & Trust Column */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem' }}>
              Legal & Trust
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/terms" style={{ color: 'var(--color-text-secondary)' }}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" style={{ color: 'var(--color-text-secondary)' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: 'var(--color-text-secondary)' }}>
                  About Festora AI
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('festora:open-cookie-preferences'));
                    }
                  }}
                  style={{
                    color: 'var(--color-text-secondary)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support Section */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem' }}>
              Contact & Inquiries
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              <li>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Email Support
                </div>
                <a
                  href="mailto:support@festora.ai"
                  style={{ color: 'var(--color-primary)', fontWeight: 500, wordBreak: 'break-all' }}
                >
                  support@festora.ai
                </a>
              </li>
              <li>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Direct Phone / WhatsApp
                </div>
                <a
                  href="tel:+919876543210"
                  style={{ color: 'var(--color-text)', fontWeight: 500 }}
                >
                  +91 98765 43210
                </a>
              </li>
              <li>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Hours of Operation
                </div>
                <span>Mon – Sat: 9:00 AM – 8:00 PM IST</span>
              </li>
            </ul>
          </div>

          {/* Social Media & Follow Us */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem' }}>
              Follow & Connect
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Stay updated with event planning tips, decoration ideas, and product features.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* WhatsApp */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow or Chat with us on WhatsApp"
                title="Chat on WhatsApp"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#25D36615',
                  color: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #25D36640',
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#25D366';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#25D36615';
                  e.currentTarget.style.color = '#25D366';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.16 7.39C8.97 7.39 8.78 7.46 8.63 7.67C8.42 7.88 7.87 8.41 7.87 9.5C7.87 10.59 8.66 11.64 8.77 11.79C8.88 11.94 10.3 14.13 12.5 15.08C13.03 15.31 13.44 15.45 13.76 15.55C14.29 15.72 14.77 15.7 15.15 15.64C15.58 15.58 16.47 15.1 16.66 14.57C16.85 14.04 16.85 13.59 16.79 13.5C16.73 13.41 16.58 13.35 16.32 13.22C16.06 13.09 14.79 12.46 14.56 12.38C14.33 12.3 14.16 12.26 13.99 12.52C13.82 12.78 13.33 13.35 13.18 13.52C13.03 13.69 12.88 13.71 12.62 13.58C12.36 13.45 11.53 13.18 10.55 12.31C9.79 11.63 9.27 10.79 9.12 10.53C8.97 10.27 9.11 10.13 9.24 10C9.36 9.88 9.5 9.7 9.63 9.55C9.76 9.4 9.81 9.29 9.89 9.12C9.97 8.95 9.93 8.81 9.87 8.68C9.81 8.55 9.32 7.35 9.16 7.39Z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/festora.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                title="Follow on Instagram"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#E1306C15',
                  color: '#E1306C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #E1306C40',
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E1306C';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#E1306C15';
                  e.currentTarget.style.color = '#E1306C';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/festora.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                title="Follow on Facebook"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#1877F215',
                  color: '#1877F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #1877F240',
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1877F2';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1877F215';
                  e.currentTarget.style.color = '#1877F2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* AI Transparency & Trust */}
          <div style={{ backgroundColor: 'var(--color-surface-muted)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={18} />
              <span>AI Transparency Guarantee</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              AI generates editable proposals. Financial calculations are executed in deterministic code. Estimates are distinct from verified quotes.
            </p>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Festora AI. All rights reserved. Designed for stress-free celebration planning.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/terms" style={{ color: 'var(--color-text-muted)', fontSize: '0.825rem' }}>
              Terms
            </Link>
            <Link to="/privacy" style={{ color: 'var(--color-text-muted)', fontSize: '0.825rem' }}>
              Privacy
            </Link>
            <Link to="/about" style={{ color: 'var(--color-text-muted)', fontSize: '0.825rem' }}>
              About
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Crafted with</span>
              <Heart size={14} color="var(--color-primary)" fill="var(--color-primary)" />
              <span>for organizers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
