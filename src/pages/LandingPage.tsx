import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Camera,
  Utensils,
  Music,
  MapPin,
  Gift,
  Flame,
  Sparkle,
  Star,
  AlertCircle,
  Zap,
  Tag,
  Check,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import { Analytics } from '../services/analytics';
import { ContactFormSection } from '../components/sections/ContactFormSection';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Interactive mini calculator states for prospective users
  const [calcEventType, setCalcEventType] = useState<'wedding' | 'birthday' | 'corporate' | 'anniversary'>('wedding');
  const [calcBudget, setCalcBudget] = useState<number>(1000000); // 10 Lakhs
  const [calcGuests, setCalcGuests] = useState<number>(200);

  const seasonalOccasions = [
    { title: 'Diwali Festive Galas', badge: 'Upcoming', days: 'In 10 days', icon: '🪔', subtitle: 'Light decor, catering & gift hampers', type: 'community_event', image: '/images/hero_celebration_banner.jpg' },
    { title: 'Winter Wedding Season', badge: 'Peak Season', days: 'Starting Nov', icon: '💍', subtitle: 'Venues, mandap, photo & bridal glam', type: 'wedding', image: '/images/wedding_decor_stage.jpg' },
    { title: 'New Year & Milestone Bashes', badge: 'Trending', days: 'In 65 days', icon: '🎉', subtitle: 'DJs, sound setup, cocktails & styling', type: 'birthday', image: '/images/birthday_celebration_party.jpg' },
    { title: 'Royal Feasts & Dining', badge: 'Popular', days: 'Year-round', icon: '🍲', subtitle: 'Multi-cuisine banquets & live chaat', type: 'other', image: '/images/luxury_catering_buffet.jpg' },
  ];

  const vendorCategories = [
    { name: 'Venues & Resorts', icon: MapPin, count: '450+ verified', desc: 'Banquets, lawns & destination heritage resorts' },
    { name: 'Catering & Banqueting', icon: Utensils, count: '320+ menus', desc: 'Live chaat, multi-cuisine buffets & bar services' },
    { name: 'Photography & Cinema', icon: Camera, count: '280+ teams', desc: 'Candid wedding photography, teasers & drones' },
    { name: 'Decor & Floral Themes', icon: Sparkle, count: '310+ stylists', desc: 'Theme mandaps, balloon arches & fairy lights' },
    { name: 'DJ, Music & Sound', icon: Music, count: '140+ performers', desc: 'Live bands, dhol players & club-grade sound' },
    { name: 'Gifting & Favors', icon: Gift, count: '90+ artisans', desc: 'Customized gift hampers & wedding invitations' },
  ];

  const popularCities = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Jaipur', 'Hyderabad', 'Kolkata', 'Pune', 'Udaipur'];

  // Proportions based on event type
  const getProportions = (type: string) => {
    switch (type) {
      case 'wedding':
        return { venue: 0.35, catering: 0.30, decor: 0.15, photo: 0.12, misc: 0.08 };
      case 'birthday':
        return { venue: 0.25, catering: 0.40, decor: 0.15, photo: 0.10, misc: 0.10 };
      case 'corporate':
        return { venue: 0.40, catering: 0.30, decor: 0.10, photo: 0.10, misc: 0.10 };
      default:
        return { venue: 0.30, catering: 0.35, decor: 0.15, photo: 0.10, misc: 0.10 };
    }
  };

  const currentSplits = getProportions(calcEventType);

  const occasions = [
    {
      title: 'Weddings & Sangeet',
      icon: Heart,
      desc: 'Coordinate multi-day celebrations, caterers, floral decor, photography timelines, and guest hospitality.',
      tag: 'Multi-function Support',
      image: '/images/wedding_decor_stage.jpg',
    },
    {
      title: 'Milestone Birthdays',
      icon: PartyPopper,
      desc: 'Plan custom themes, cake tastings, entertainment playlists, guest invitations, and surprise itineraries.',
      tag: 'Festive & Personal',
      image: '/images/birthday_celebration_party.jpg',
    },
    {
      title: 'College Festivals & Galas',
      icon: GraduationCap,
      desc: 'Structure stage setups, technical soundchecks, student volunteer rosters, and faculty guest coordination.',
      tag: 'Campus Scale',
      image: '/images/college_fest_stage.jpg',
    },
    {
      title: 'Community Gatherings',
      icon: Users,
      desc: 'Manage neighborhood festivals, cultural meets, venue access permits, and volunteer task allocations.',
      tag: 'Civic & Cultural',
      image: '/images/community_cultural_event.jpg',
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
        title="GenAI Celebration & Event Planner | Festora AI"
        description="Plan weddings, birthdays, anniversaries, and community gatherings with structured AI plans, deterministic budgets, task checklists, and timelines."
        canonicalPath="/"
      />
      <Navbar />

      {/* PlanToday-style Festive & Seasonal Ribbon Banner with Shimmer */}
      <div
        className="festive-ribbon"
        style={{
          borderBottom: '1px solid #FDE68A',
          padding: '0.65rem 1rem',
          fontSize: '0.85rem',
          color: '#92400E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(245, 158, 11, 0.08)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
          <Flame size={15} color="#D97706" />
          <span>India Wedding & Festive Season 2026</span>
        </span>
        <span style={{ color: '#D97706' }}>•</span>
        <span>Plan weddings, sangeet & celebrations with AI estimates & verified vendor checklists.</span>
        <Link
          to="/events/new"
          style={{
            fontWeight: 700,
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            marginLeft: '0.25rem',
          }}
        >
          <span>Create Free Plan</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Hero Section with Warm Ambient Radial Glow */}
      <section
        style={{
          padding: '4.5rem 0 4rem 0',
          background: 'var(--color-festive-hero-bg)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
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
                <span>India's Smartest GenAI Event Planner</span>
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
                Plan celebrations smarter.{' '}
                <span style={{ color: 'var(--color-primary)', position: 'relative' }}>
                  Real budgets, zero chaos.
                </span>
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.75rem',
                  maxWidth: '520px',
                }}
              >
                Compare vendor quotes, organize task checklists, calculate deterministic catering & venue costs, and generate day-of schedules in minutes.
              </p>

              {/* Quick Search Pills (PlanToday Style) */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                  Popular:
                </span>
                {['Wedding & Sangeet', 'Birthday Party', 'Banquet Hall', 'Catering Menu', 'Candid Photo'].map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigate('/events/new')}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.8rem',
                      color: 'var(--color-text)',
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/events/new" className="btn btn-primary btn-lg">
                  <Sparkles size={18} />
                  <span>Create AI Event Plan</span>
                  <ArrowRight size={18} />
                </Link>
                <a href="#quick-calculator" className="btn btn-secondary btn-lg">
                  <Wallet size={17} />
                  <span>Estimate Budget</span>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-success)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Free & Zero Commission</span>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Preview Mockup with Float Micro-animation */}
            <div>
              <div
                className="card animate-float"
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 20px 40px -10px rgba(31, 25, 36, 0.12), 0 0 20px rgba(225, 29, 72, 0.08)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1.5px solid var(--color-border)',
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
                    <img
                      src="/logo.png"
                      alt="Festora AI"
                      style={{ width: '18px', height: '18px', objectFit: 'contain', marginLeft: '0.4rem', borderRadius: '2px' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      Festora AI Workspace
                    </span>
                  </div>
                  <span className="badge badge-primary">AI Proposed Plan</span>
                </div>

                {/* Hero Showcase Image */}
                <div style={{ position: 'relative', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                  <img
                    src="/images/hero_celebration_banner.jpg"
                    alt="Festora AI Wedding & Celebration Workspace"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '0.6rem', left: '0.8rem', color: '#FFFFFF' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                      Featured Event Plan
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                      Meera & Arjun's Grand Celebration
                    </h3>
                  </div>
                </div>

                {/* Event Metadata Preview */}
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Nov 28, 2026 • Mumbai, India • 250 Guests
                  </p>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>On Schedule</span>
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

      {/* PlanToday-Inspired Seasonal Celebrations Section */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Seasonal Occasions
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', marginTop: '0.25rem' }}>
                What are you celebrating next?
              </h2>
            </div>
            <Link to="/events/new" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Browse All Occasions</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {seasonalOccasions.map((occ, idx) => (
              <div
                key={idx}
                className="card card-hover"
                style={{
                  padding: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onClick={() => navigate('/events/new')}
              >
                <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={occ.image}
                    alt={occ.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      zIndex: 2,
                    }}
                  >
                    <span className="badge badge-accent" style={{ fontSize: '0.75rem', backdropFilter: 'blur(4px)', backgroundColor: 'rgba(254, 243, 199, 0.95)' }}>
                      {occ.days}
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem', backdropFilter: 'blur(4px)', backgroundColor: 'rgba(101, 67, 165, 0.95)' }}>
                      {occ.badge}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{occ.icon}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      {occ.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.2rem', lineHeight: 1.4, flex: 1 }}>
                    {occ.subtitle}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    <span>Plan with AI</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PlanToday-Inspired Category & Trade Directory Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Everything You Need To Coordinate
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginTop: '0.4rem', marginBottom: '0.5rem' }}>
              Explore Event Service Categories
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Benchmark typical price quotes, compare supplier questions, and track booking contracts.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            {vendorCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="card card-hover"
                  style={{
                    padding: '1.4rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                  }}
                  onClick={() => navigate('/events/new')}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-primary-soft)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {cat.name}
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', display: 'inline-block', marginBottom: '0.35rem' }}>
                      {cat.count}
                    </span>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {cat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Popular Cities Bar */}
          <div
            style={{
              padding: '1.25rem 1.75rem',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={18} color="var(--color-primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Popular event destinations:
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {popularCities.map((city, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => navigate('/events/new')}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface-muted)',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-soft)';
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PlanToday-Inspired Interactive Instant Budget Calculator Tool */}
      <section
        id="quick-calculator"
        style={{
          padding: '4.5rem 0',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container" style={{ maxWidth: '980px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant Estimation Tool
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
              Interactive Event Budget Calculator
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Test deterministic category allocations based on real Indian event industry proportions before you sign up.
            </p>
          </div>

          <div
            className="card"
            style={{
              padding: '2rem',
              backgroundColor: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Event Type Selector Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              {[
                { id: 'wedding', label: '💍 Indian Wedding & Reception' },
                { id: 'birthday', label: '🎂 Milestone Birthday Party' },
                { id: 'corporate', label: '🏢 Corporate Gala / Meet' },
                { id: 'anniversary', label: '🥂 Silver / Golden Anniversary' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={calcEventType === t.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                  onClick={() => setCalcEventType(t.id as 'wedding' | 'birthday' | 'corporate' | 'anniversary')}
                  style={{ borderRadius: 'var(--radius-full)', fontSize: '0.825rem' }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Controls Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                  Total Planned Budget: ₹{calcBudget.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min={100000}
                  max={5000000}
                  step={50000}
                  value={calcBudget}
                  onChange={(e) => setCalcBudget(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                  <span>₹1 Lakh</span>
                  <span>₹25 Lakhs</span>
                  <span>₹50 Lakhs</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                  Estimated Headcount: {calcGuests} Guests
                </label>
                <input
                  type="range"
                  min={25}
                  max={1000}
                  step={25}
                  value={calcGuests}
                  onChange={(e) => setCalcGuests(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                  <span>25 Guests</span>
                  <span>500 Guests</span>
                  <span>1000 Guests</span>
                </div>
              </div>
            </div>

            {/* Calculated Breakdown Display */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-muted)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                  Deterministic Category Breakdown
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Avg. per guest cost: <strong>₹{Math.round(calcBudget / calcGuests).toLocaleString('en-IN')}</strong>
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '10px', backgroundColor: '#E5E0EA', borderRadius: '5px', overflow: 'hidden', display: 'flex', marginBottom: '1.25rem' }}>
                <div style={{ width: `${currentSplits.venue * 100}%`, backgroundColor: '#6543A5' }} title="Venue" />
                <div style={{ width: `${currentSplits.catering * 100}%`, backgroundColor: '#E5A93C' }} title="Catering" />
                <div style={{ width: `${currentSplits.decor * 100}%`, backgroundColor: '#2A724E' }} title="Decor" />
                <div style={{ width: `${currentSplits.photo * 100}%`, backgroundColor: '#2563EB' }} title="Photo" />
                <div style={{ width: `${currentSplits.misc * 100}%`, backgroundColor: '#9CA3AF' }} title="Misc" />
              </div>

              {/* Grid of category estimates */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>🟣 Venue & Banquet</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                    ₹{Math.round(calcBudget * currentSplits.venue).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6543A5' }}>{Math.round(currentSplits.venue * 100)}% allocation</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>🟡 Food & Catering</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                    ₹{Math.round(calcBudget * currentSplits.catering).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#B45309' }}>{Math.round(currentSplits.catering * 100)}% allocation</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>🟢 Decor & Lighting</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                    ₹{Math.round(calcBudget * currentSplits.decor).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#1E824C' }}>{Math.round(currentSplits.decor * 100)}% allocation</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>🔵 Photo & Video</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                    ₹{Math.round(calcBudget * currentSplits.photo).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#2563EB' }}>{Math.round(currentSplits.photo * 100)}% allocation</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>⚪ Misc & Buffer</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                    ₹{Math.round(calcBudget * currentSplits.misc).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{Math.round(currentSplits.misc * 100)}% allocation</div>
                </div>
              </div>
            </div>

            {/* CTA from Calculator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Like these numbers? Turn this into a full AI plan with checklists and vendor questions in one click.
              </div>
              <Link to="/events/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} />
                <span>Save & Plan This Event</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Festora Solution Comparison */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Why Traditional Planning Fails
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)', marginTop: '0.4rem', marginBottom: '0.75rem' }}>
              The Chaos of Planning vs. The Festora Advantage
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              Event planning in India often feels like juggling dozens of WhatsApp groups, runaway spreadsheets, and unexpected vendor surprise charges.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* The Problem Card */}
            <div
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: '#FFF5F5',
                border: '1.5px solid #FED7D7',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FEB2B2',
                    color: '#9B2C2C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertCircle size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9B2C2C', margin: 0 }}>
                  The Old Stressful Way
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { title: 'Budget Blowouts & Hidden Costs', desc: 'Starting with a budget and ending up spending 40% more due to untracked catering extras and decor taxes.' },
                  { title: 'Chaotic WhatsApp Threads', desc: 'Critical vendor contracts, photo shot lists, and payment receipts lost across multiple family chat groups.' },
                  { title: 'Missing Day-of Timelines', desc: 'Photographer arrives late, soundcheck clashes with guest entry, and the host is left stressed instead of celebrating.' },
                  { title: 'Opaque Vendor Markups', desc: 'No baseline understanding of realistic market rates for sound setups, mandaps, or live food counters.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ color: '#E53E3E', fontSize: '1.1rem', lineHeight: 1.2 }}>✕</div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#742A2A', marginBottom: '0.15rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#9B2C2C', opacity: 0.9, lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Festora Solution Card */}
            <div
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: '#F7FAFC',
                border: '1.5px solid var(--color-primary-soft)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-soft)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Zap size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                  The Festora AI Experience
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { title: 'Deterministic Math & Real-Time Variance', desc: 'Category split recommendations with automatic budget remaining balance calculations run by verified code.' },
                  { title: 'Centralized Living Workspace', desc: 'All guest lists, tasks, vendor requirement questionnaires, and day-of agendas in one responsive dashboard.' },
                  { title: 'Hour-by-Hour Operational Run-Downs', desc: 'Precise day-of schedules with milestone tracking from morning vendor load-in to post-party wrap.' },
                  { title: 'Zero Commission & Complete Independence', desc: 'Unbiased planning estimates. We do not inflate vendor prices or push kickback bookings.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={18} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.15rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
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
                <div
                  key={idx}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ position: 'relative', height: '150px', width: '100%', overflow: 'hidden' }}>
                    <img
                      src={occ.image}
                      alt={occ.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                      }}
                    >
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          color: 'var(--color-text)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {occ.tag}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-primary-soft)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                        {occ.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '1rem' }}>
                      {occ.desc}
                    </p>
                    <Link
                      to="/events/new"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                      }}
                    >
                      <span>Plan this celebration</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
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

      {/* Social Proof: Metrics, Ratings & Real Host Experiences */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          {/* Proof Numbers Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              padding: '2rem',
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-xl)',
              marginBottom: '3.5rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                ₹4.2 Cr+
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '0.2rem' }}>
                Celebration Budgets Tracked
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                1,850+
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '0.2rem' }}>
                Events Planned Across India
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                4.9 / 5
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', marginTop: '0.2rem', color: '#F59E0B' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" />
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                Based on 420+ Host Reviews
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-success)', letterSpacing: '-0.02em' }}>
                0%
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '0.2rem' }}>
                Commission or Hidden Fees
              </div>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Host Reviews & Community Trust
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.2rem)', marginTop: '0.4rem' }}>
              Loved by Couples, Families & Organizers
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                name: 'Pooja & Rohan Sharma',
                role: 'Wedding in Udaipur (280 guests)',
                comment: 'The budget tracker saved us at least ₹2.5 Lakhs by catching catering overrun estimates early. The day-of timeline was shared with our photographer and decorators without a hitch!',
                rating: 5,
                city: 'Mumbai',
              },
              {
                name: 'Kavita Sundaram',
                role: '50th Golden Jubilee Birthday',
                comment: 'Festora AI’s checklist suggested vendor questions we would have never thought to ask the caterer regarding live counters and electricity backup. Everything felt organized and calm.',
                rating: 5,
                city: 'Bengaluru',
              },
              {
                name: 'Aakash Verma',
                role: 'Annual Cultural Fest Coordinator',
                comment: 'We used Festora to coordinate stage logistics, guest speakers, and volunteer shifts for 800 college students. Having deterministic math and real-time expense variance is unmatched.',
                rating: 5,
                city: 'Delhi NCR',
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', color: '#F59E0B' }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#F59E0B" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.925rem', color: 'var(--color-text)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.25rem' }}>
                    "{review.comment}"
                  </p>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '0.85rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                    {review.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {review.role} • {review.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Free Launch Offer Section */}
      <section id="pricing" style={{ padding: '5rem 0', backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transparent & Honest
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)', marginTop: '0.4rem', marginBottom: '0.6rem' }}>
              Simple, Free & Zero-Commission Plans
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
              No hidden booking markups, no credit cards required, and no locked features.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              maxWidth: '840px',
              margin: '0 auto',
            }}
          >
            {/* Free Starter Plan */}
            <div
              className="card"
              style={{
                padding: '2.25rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                  Community & Personal
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  For individual hosts planning personal family milestones.
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)' }}>₹0</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>/ forever free</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1 }}>
                {[
                  '1 Active Event Workspace',
                  'AI Planning & Budget Proportions',
                  'Deterministic Expense Logging',
                  'Prioritized Day-of Checklists',
                  'Vendor Requirement Guides',
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                    <Check size={16} color="var(--color-success)" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <Link to="/events/new" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Get Started Free
              </Link>
            </div>

            {/* Launch Celebration Offer (Highlighted) */}
            <div
              className="card"
              style={{
                padding: '2.25rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '2px solid var(--color-primary)',
                boxShadow: '0 10px 25px -5px rgba(101, 67, 165, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '24px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Tag size={12} />
                <span>2026 FESTIVE OFFER</span>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                  Festora Pro Workspace
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Full multi-event suite for weddings, sangeet & galas.
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>Free</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>₹2,499</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success)' }}>100% OFF Launch</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1 }}>
                {[
                  'Unlimited Event Workspaces',
                  'Multi-Day Schedule Milestones',
                  'Safe AI Revisions (No Data Overwrite)',
                  'Custom Multi-Vendor Quote Comparisons',
                  'Guest Headcount & RSVP Tracking',
                  'Self-Service Data Export (JSON / DPDP)',
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                    <CheckCircle2 size={16} color="var(--color-primary)" />
                    <span style={{ fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>

              <Link to="/events/new" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                <Sparkles size={16} />
                <span>Claim Free Pro Access</span>
              </Link>
            </div>
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

      {/* Final Call to Action with Festive Celebration Gradient */}
      <section
        style={{
          padding: '5.5rem 0',
          background: 'var(--color-festive-gradient)',
          color: '#FFFFFF',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to plan your next event?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '2.25rem', lineHeight: 1.6 }}>
            Create your first structured celebration plan in under two minutes with AI-assisted budgeting, tasks, and schedules.
          </p>
          <Link
            to="/events/new"
            className="btn btn-accent btn-lg animate-pulse-glow"
            style={{ fontWeight: 700, fontSize: '1.1rem', padding: '1rem 2.4rem' }}
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
