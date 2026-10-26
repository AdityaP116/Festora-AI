import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Wallet,
  CheckSquare,
  ShieldCheck,
  ChevronDown,
  Layers,
  Clock,
  Heart,
  PartyPopper,
  GraduationCap,
  Users,
  Compass,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import { Analytics } from '../services/analytics';
import { ContactFormSection } from '../components/sections/ContactFormSection';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const occasions = [
    {
      title: 'Weddings & Sangeet',
      icon: Heart,
      desc: 'Coordinate multi-day celebrations, caterers, floral decor, photography timelines, and guest hospitality.',
      tag: 'Multi-function Support',
    },
    {
      title: 'Milestone Birthdays',
      icon: PartyPopper,
      desc: 'Plan custom themes, cake tastings, entertainment playlists, guest invitations, and surprise itineraries.',
      tag: 'Festive & Personal',
    },
    {
      title: 'College Festivals & Galas',
      icon: GraduationCap,
      desc: 'Structure stage setups, technical soundchecks, student volunteer rosters, and faculty guest coordination.',
      tag: 'Campus Scale',
    },
    {
      title: 'Community Gatherings',
      icon: Users,
      desc: 'Manage neighborhood festivals, cultural meets, venue access permits, and volunteer task allocations.',
      tag: 'Civic & Cultural',
    },
  ];

  const features = [
    {
      title: 'GenAI Planning Proposals',
      desc: 'Convert your event basics into an editable theme, budget split, timeline milestones, and task schedule in seconds.',
      icon: Sparkles,
      color: '#6543A5',
    },
    {
      title: 'Deterministic Budget Tracker',
      desc: 'Keep estimates distinct from actual expenses. Calculations run strictly in application code with zero LLM arithmetic drift.',
      icon: Wallet,
      color: '#E5A93C',
    },
    {
      title: 'Actionable Task Checklist',
      desc: 'Prioritized task cards with due dates, day-of flags, and category filters. Mark items complete with verifiable persistence.',
      icon: CheckSquare,
      color: '#1E824C',
    },
    {
      title: 'Day-of Event Schedule',
      desc: 'Hour-by-hour operational run-down from vendor arrival and soundcheck to ceremonial moments and guest departures.',
      icon: Clock,
      color: '#2563EB',
    },
    {
      title: 'Vendor Requirements & Questions',
      desc: 'Structured category checklists identifying key questions to ask photographers, caterers, and decorators before booking.',
      icon: Layers,
      color: '#7E57C2',
    },
    {
      title: 'Safe AI Revisions',
      desc: 'Request targeted changes like "reduce budget by 15%" without overwriting your already completed tasks or recorded expenses.',
      icon: ShieldCheck,
      color: '#B45309',
    },
  ];

  const faqs = [
    {
      q: 'How does Festora AI create an event plan?',
      a: 'You enter your event type, date, location, guest count, budget limit, and style preferences. Festora AI analyzes these parameters and proposes a structured draft with category allocations, high-priority tasks, and schedule milestones.',
    },
    {
      q: 'Are the budget numbers calculated by AI or by code?',
      a: 'All math is deterministic! The AI suggests initial category proportions based on your budget limit, but every total, variance, and remaining balance is computed by application code. Estimates remain clearly separate from actual logged expenses.',
    },
    {
      q: 'Will regenerating a plan overwrite my completed tasks?',
      a: 'Never. Festora AI enforces safe revision rules: when you apply a revision or refine your plan, already completed tasks, user notes, and actual expense records are strictly preserved.',
    },
    {
      q: 'Does Festora AI claim live vendor booking or guaranteed pricing?',
      a: 'No. Festora AI provides planning estimates and organization tools. We do not fabricate vendor availability, make unauthorized bookings, or claim guaranteed prices.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SeoHead
        title="GenAI Celebration & Event Planner"
        description="Plan weddings, birthdays, anniversaries, and community gatherings with structured AI plans, deterministic budgets, task checklists, and timelines."
        canonicalPath="/"
      />
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          padding: '4.5rem 0 3.5rem 0',
          background: 'linear-gradient(180deg, #FFFFFF 0%, var(--color-background) 100%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left Hero Copy */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles size={16} />
                <span>GenAI Celebration & Event Planner</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                  lineHeight: 1.15,
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem',
                }}
              >
                Every celebration,{' '}
                <span style={{ color: 'var(--color-primary)', position: 'relative' }}>
                  thoughtfully planned.
                </span>
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  maxWidth: '520px',
                }}
              >
                Turn your event details into an editable plan, deterministic budget, actionable checklist, and day-of schedule—all in one persistent workspace.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/events/new" className="btn btn-primary btn-lg">
                  <span>Start Planning Free</span>
                  <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="btn btn-secondary btn-lg">
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginTop: '2.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid var(--color-border)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Deterministic Math</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Safe Plan Revisions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Single-click Export</span>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Preview Mockup */}
            <div>
              <div
                className="card"
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#FFFFFF',
                  boxShadow: 'var(--shadow-lg)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  position: 'relative',
                }}
              >
                {/* Mockup Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--color-border-light)',
                    paddingBottom: '0.85rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginLeft: '0.4rem' }}>
                      Festora AI Workspace
                    </span>
                  </div>
                  <span className="badge badge-primary">AI Proposed Plan</span>
                </div>

                {/* Event Title Preview */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    Meera & Arjun's Wedding Reception
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                    Nov 28, 2026 • Mumbai, India • 250 Guests
                  </p>
                </div>

                {/* Budget Gauge Preview */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Budget Allocation</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹15,00,000 Total</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E0EA', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: '35%', backgroundColor: '#6543A5' }} title="Venue 35%" />
                    <div style={{ width: '30%', backgroundColor: '#E5A93C' }} title="Catering 30%" />
                    <div style={{ width: '15%', backgroundColor: '#2A724E' }} title="Decor 15%" />
                    <div style={{ width: '10%', backgroundColor: '#2563EB' }} title="Photo 10%" />
                    <div style={{ width: '10%', backgroundColor: '#9CA3AF' }} title="Misc 10%" />
                  </div>
                  <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span>🟣 Venue 35%</span>
                    <span>🟡 Food 30%</span>
                    <span>🟢 Decor 15%</span>
                    <span>🔵 Photo 10%</span>
                  </div>
                </div>

                {/* Task Checklist Snippet */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.8rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--color-success)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                        Confirm Banquet Hall Lease
                      </span>
                    </div>
                    <span className="badge badge-success">Completed</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.8rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.5px solid var(--color-border)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)' }}>
                        Review Candid Photography Shot List
                      </span>
                    </div>
                    <span className="badge badge-warning">Due in 3 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Simple 3-Step Flow
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.4rem)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              How Festora AI Works
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
              From initial spark to event day execution, stay completely organized and in control.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              textAlign: 'left',
            }}
          >
            {/* Step 1 */}
            <div className="card" style={{ position: 'relative' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  marginBottom: '1.25rem',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                Tell Us About Your Event
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Enter your celebration type, date, city, estimated guest headcount, total budget limit, and style preferences in our 5-step wizard.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ position: 'relative' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-accent-soft)',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  marginBottom: '1.25rem',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                Review AI-Generated Draft
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Receive a structured proposal with balanced budget allocations, suggested theme palettes, chronological tasks, and schedule milestones.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ position: 'relative' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  marginBottom: '1.25rem',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                Track In One Persistent Workspace
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Log actual expenses against planned estimates, tick off completed tasks, manage vendors, and adjust plans safely as needs evolve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" style={{ padding: '5rem 0', backgroundColor: 'var(--color-background)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Built for Real Organizers
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.4rem)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              Core Features & Planning Tools
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
              Festora AI pairs generative intelligence with reliable, deterministic event management software.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="card card-hover" style={{ padding: '1.75rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${feat.color}15`,
                      color: feat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Occasions */}
      <section id="occasions" style={{ padding: '5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tailored Context
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.4rem)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              Plans for Any Celebration
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
              Festora AI understands the distinct logistics, budget splits, and task priorities for every event format.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {occasions.map((occ, idx) => {
              const Icon = occ.icon;
              return (
                <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-primary-soft)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {occ.tag}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
                    {occ.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, flex: 1 }}>
                    {occ.desc}
                  </p>
                  <Link
                    to="/events/new"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginTop: '1.25rem',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <span>Plan this occasion</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & AI Transparency Card */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--color-background)' }}>
        <div className="container">
          <div
            className="card"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Compass size={32} />
            </div>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                Our Commitment to AI Truthfulness & User Control
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Festora AI is designed around a fundamental principle: <strong>AI proposes, users decide</strong>. We never fabricate live availability, claim unverified vendor quotes as confirmed bookings, or overwrite your saved records during plan updates.
              </p>
            </div>
            <Link to="/events/new" className="btn btn-primary">
              Experience the Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" style={{ padding: '5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Got Questions?
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.2rem)', marginTop: '0.5rem' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {faq.q}
                    </h3>
                    <ChevronDown
                      size={20}
                      color="var(--color-text-muted)"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform var(--transition-fast)',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border-light)' }}>
                      <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section
        style={{
          padding: '5rem 0',
          background: 'linear-gradient(135deg, #503386 0%, var(--color-primary) 100%)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '640px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to plan your next event?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Create your first structured celebration plan in under two minutes with AI-assisted budgeting, tasks, and schedules.
          </p>
          <Link
            to="/events/new"
            className="btn btn-accent btn-lg"
            style={{ fontWeight: 700, fontSize: '1.1rem', padding: '0.95rem 2.2rem' }}
            onClick={() => Analytics.track('click_start_plan', { source: 'landing_bottom_cta' })}
          >
            <span>Start Free Event Plan</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Contact Form with Email Notifications */}
      <ContactFormSection />

      <Footer />
    </div>
  );
};
