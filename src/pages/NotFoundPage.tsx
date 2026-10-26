import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, PlusCircle, Calendar } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <Navbar />

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '580px', width: '100%' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 8px 24px var(--color-primary-glow)',
            }}
          >
            <Compass size={44} />
          </div>

          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Error 404
          </span>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginTop: '0.5rem',
              marginBottom: '1rem',
              letterSpacing: '-0.025em',
            }}
          >
            Celebration Out of Bounds
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
            }}
          >
            We couldn't find the page or event itinerary you're looking for. It might have been relocated, archived, or never existed in the timeline.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={18} />
              <span>Back to Home</span>
            </Link>

            <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} />
              <span>Go to Workspace</span>
            </Link>

            <Link to="/events/new" className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} />
              <span>Create New Event</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
