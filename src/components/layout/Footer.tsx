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
