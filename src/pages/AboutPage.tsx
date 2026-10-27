import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SeoHead } from '../components/seo/SeoHead';

export const AboutPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <SeoHead
        title="About Festora AI"
        description="Learn about Festora AI's mission to bring thoughtful, deterministic, and AI-assisted organization to celebratory events."
        canonicalPath="/about"
      />
      <Navbar />

      <main className="container" style={{ maxWidth: '840px', padding: '3.5rem 1.5rem', flex: 1 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        {/* Hero Card */}
        <div
          className="card"
          style={{
            padding: '3rem 2.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem 0.35rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            <img
              src="/logo.png"
              alt="Festora AI"
              style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '50%' }}
            />
            <span>Our Purpose & Philosophy</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
              fontWeight: 800,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
            }}
          >
            Every celebration deserves{' '}
            <span style={{ color: 'var(--color-primary)' }}>thoughtful planning.</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Festora AI brings event ideas, budgets, timelines, and planning tasks together in one place, using AI-assisted suggestions to help hosts organize celebrations more confidently, calmly, and transparently.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-text)' }}>AI Proposes, You Decide</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Suggestions are starting points, not locked decisions.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-text)' }}>Deterministic Math</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Financial arithmetic is verified in code with zero LLM drift.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-text)' }}>Zero Hidden Commissions</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>We do not take commissions on vendor bookings or inflate quotes.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Capabilities Card */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
          }}
        >
          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              The Problem We Aim to Solve
            </h2>
            <p>
              Planning an Indian wedding, milestone anniversary, or community celebration often involves juggling dozens of vendor quotes, scattered notes, unpredictable budgeting, and high emotional stress. Traditional spreadsheet templates lack intelligent context, while booking aggregators often push commission-driven recommendations.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Festora AI was built to solve this by providing a clean, self-service workspace where generative AI produces tailored first drafts, while deterministic software tracks every rupee, task, and deadline reliably.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              Our Responsible AI Commitment
            </h2>
            <p>
              We believe artificial intelligence should empower organizers, not fabricate facts or mislead users. Our engineering architecture guarantees that:
            </p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              <li>We never claim that an AI proposal is a confirmed hotel booking or signed contract.</li>
              <li>When you request a revision (e.g. "adjust catering allocation"), existing user tasks, notes, and logged expenses are never overwritten.</li>
              <li>Your personal data and guest lists are strictly isolated under authenticated user tenancy and never sold to third-party advertisers.</li>
            </ul>
          </section>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-lg)',
              marginTop: '0.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <strong style={{ display: 'block', color: 'var(--color-text)' }}>Ready to experience calm event planning?</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Generate your first structured plan in under two minutes.</span>
            </div>
            <Link to="/events/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} />
              <span>Start Free Event Plan</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
