import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Heart,
  PartyPopper,
  GraduationCap,
  Store,
  Layers,
  CheckCircle2,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { useAuth } from '../services/auth-context';
import { StorageService } from '../services/storage';
import { AIService } from '../services/ai-service';
import type { EventType } from '../types';
import { formatCurrency, toMinorUnits } from '../domain/budget';
import { SeoHead } from '../components/seo/SeoHead';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { useToast } from '../components/ui/Toast';
import { Analytics } from '../services/analytics';

export const EventWizardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [startDate, setStartDate] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [locationLabel, setLocationLabel] = useState('Mumbai, Maharashtra');

  const [guestCount, setGuestCount] = useState<number>(100);
  const [currency, setCurrency] = useState('INR');
  const [budgetMajor, setBudgetMajor] = useState<number>(500000); // 5 Lakhs default for wedding

  const [theme, setTheme] = useState('Royal Heritage & Florals');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['Catering', 'Photography']);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(['Vegetarian Options']);
  const [notes, setNotes] = useState('');

  const eventTypes: Array<{ type: EventType; label: string; icon: React.ComponentType<{ size: number }> }> = [
    { type: 'wedding', label: 'Wedding & Sangeet', icon: Heart },
    { type: 'birthday', label: 'Birthday Celebration', icon: PartyPopper },
    { type: 'anniversary', label: 'Anniversary Party', icon: Sparkles },
    { type: 'college_event', label: 'College Festival / Gala', icon: GraduationCap },
    { type: 'community_event', label: 'Community Gathering', icon: Store },
    { type: 'other', label: 'Special Occasion', icon: Layers },
  ];

  const priorityOptions = ['Venue Booking', 'Catering & Dining', 'Photography & Video', 'Decor & Florals', 'Music & Entertainment', 'Guest Hospitality'];
  const dietaryOptions = ['Vegetarian Options', 'Vegan Friendly', 'Halal Prepared', 'Jain Dining', 'Nut-Free'];

  const togglePriority = (p: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const toggleDietary = (d: string) => {
    setSelectedDietary((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!title.trim()) {
        setError('Please provide a name or title for your celebration.');
        return;
      }
    } else if (step === 2) {
      if (!startDate) {
        setError('Please pick an event date.');
        return;
      }
      if (!locationLabel.trim()) {
        setError('Please enter a location or city.');
        return;
      }
    } else if (step === 3) {
      if (guestCount < 1) {
        setError('Expected guest count must be at least 1.');
        return;
      }
      if (budgetMajor <= 0) {
        setError('Budget limit must be greater than zero.');
        return;
      }
    }
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleGeneratePlan = async () => {
    if (!user) {
      setError('You must be signed in to generate and save an event plan.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const budgetLimitMinor = toMinorUnits(budgetMajor);

      // 1. Call AI Service to produce structured proposal
      const aiResult = await AIService.generateEventPlan({
        eventType,
        title: title.trim(),
        startDate,
        timezone,
        location: { label: locationLabel.trim() },
        guestCount,
        currency,
        budgetLimitMinor,
        preferences: {
          theme,
          dietary: selectedDietary,
          priorities: selectedPriorities,
          notes: notes.trim(),
        },
      });

      // 2. Persist event document in storage
      const newEvent = await StorageService.createEvent({
        ownerUid: user.uid,
        title: title.trim(),
        eventType,
        startAt: `${startDate}T10:00:00Z`,
        timezone,
        location: { label: locationLabel.trim() },
        currency,
        guestCount,
        budgetLimitMinor,
        preferences: {
          theme,
          dietary: selectedDietary,
          priorities: selectedPriorities,
          notes: notes.trim(),
        },
        status: 'planning',
      });

      // 3. Apply the AI proposal into the event's records
      await StorageService.applyPlanProposal(newEvent.id, user.uid, aiResult.plan);

      // Track conversion
      Analytics.track('complete_event_wizard', {
        eventType,
        guestCount,
        hasTheme: !!theme,
      });

      toast.success('Celebration Plan Generated!', 'Your structured itinerary, budget, and checklists are ready.');

      // 4. Redirect to the newly created event workspace
      navigate(`/events/${newEvent.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Plan generation encountered an error';
      setError(msg);
      toast.error('Generation Failed', msg);
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '1rem 0 3rem' }}>
      <SeoHead
        title="Plan New Celebration"
        description="Configure event basics, budget constraints, and theme to generate an AI-powered celebration plan."
        canonicalPath="/events/new"
      />
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'New Event Plan', path: '/events/new' },
        ]}
      />

      {/* Wizard Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            fontSize: '0.825rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          <Sparkles size={15} />
          <span>Event Creation Wizard</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          Plan Your Next Celebration
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Step {step} of 5 — {step === 1 && 'Event Basics'}
          {step === 2 && 'Date & Location'}
          {step === 3 && 'Guests & Budget'}
          {step === 4 && 'Theme & Priorities'}
          {step === 5 && 'Review & Generate'}
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: 'var(--color-border)',
            zIndex: 1,
            transform: 'translateY(-50%)',
          }}
        />
        {[1, 2, 3, 4, 5].map((i) => {
          const isPassed = step > i;
          const isCurrent = step === i;
          return (
            <div
              key={i}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isPassed || isCurrent ? 'var(--color-primary)' : 'var(--color-surface)',
                border: isPassed || isCurrent ? 'none' : '2px solid var(--color-border)',
                color: isPassed || isCurrent ? '#FFFFFF' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                zIndex: 2,
                boxShadow: isCurrent ? '0 0 0 4px var(--color-primary-soft)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              {isPassed ? <CheckCircle2 size={18} /> : i}
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.1rem',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Content Card */}
      <div className="card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-md)' }}>
        {/* STEP 1: Event Basics */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              What occasion are you organizing?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Select the event type so Festora AI can tailor appropriate budget categories and task checklists.
            </p>

            {/* Occasion Selection Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              {eventTypes.map((occ) => {
                const Icon = occ.icon;
                const isSelected = eventType === occ.type;
                return (
                  <div
                    key={occ.type}
                    onClick={() => setEventType(occ.type)}
                    style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div
                      style={{
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span style={{ fontSize: '0.925rem', fontWeight: isSelected ? 600 : 500, color: 'var(--color-text)' }}>
                      {occ.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Event Title Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="event-title">
                <span>Event Title / Celebration Name</span>
                <span className="required">*</span>
              </label>
              <input
                id="event-title"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Maya & Kabir's Wedding Celebration"
                autoFocus
              />
            </div>

            {/* Short Description Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="event-desc">
                <span>Short Summary (Optional)</span>
              </label>
              <textarea
                id="event-desc"
                className="form-textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A warm weekend gathering celebrating close friends and family..."
              />
            </div>
          </div>
        )}

        {/* STEP 2: Date & Place */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              When and where is it happening?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Event dates allow Festora AI to calculate realistic preparation deadlines and milestone dates.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="event-date">
                <span>Event Date</span>
                <span className="required">*</span>
              </label>
              <input
                id="event-date"
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-loc">
                <span>City & Location</span>
                <span className="required">*</span>
              </label>
              <input
                id="event-loc"
                type="text"
                className="form-input"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="e.g. Bangalore, Karnataka (or Not decided yet)"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-tz">
                <span>Timezone</span>
              </label>
              <select
                id="event-tz"
                className="form-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: Guests & Budget */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Guests & Budget Limits
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              All mathematical calculations are deterministic. AI proposes proportional allocations based on your budget limit.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="event-guests">
                <span>Estimated Guest Count</span>
                <span className="required">*</span>
              </label>
              <input
                id="event-guests"
                type="number"
                min={1}
                max={10000}
                className="form-input"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
              />
              <span className="form-hint">Used to calculate catering plates and hall capacity requirements.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="event-curr">
                  <span>Currency</span>
                </label>
                <select
                  id="event-curr"
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="event-budget">
                  <span>Total Budget Limit</span>
                  <span className="required">*</span>
                </label>
                <input
                  id="event-budget"
                  type="number"
                  min={100}
                  className="form-input"
                  value={budgetMajor}
                  onChange={(e) => setBudgetMajor(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface-muted)',
                padding: '0.85rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              Estimated per-guest allocation: <strong>{formatCurrency(toMinorUnits(guestCount > 0 ? budgetMajor / guestCount : 0), currency)}</strong>
            </div>
          </div>
        )}

        {/* STEP 4: Theme & Preferences */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Style, Priorities & Constraints
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Help the AI understand your aesthetic preferences and what matters most.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="event-theme">
                <span>Theme / Aesthetic Concept</span>
              </label>
              <input
                id="event-theme"
                type="text"
                className="form-input"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Royal Botanical, Pastel Sunset, Minimalist Modern"
              />
            </div>

            {/* Priorities */}
            <div className="form-group">
              <label className="form-label">
                <span>Top Planning Priorities</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {priorityOptions.map((opt) => {
                  const isChecked = selectedPriorities.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => togglePriority(opt)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: isChecked ? 600 : 500,
                        border: isChecked ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isChecked ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                        color: isChecked ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {isChecked ? `✓ ${opt}` : opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary */}
            <div className="form-group">
              <label className="form-label">
                <span>Dietary Considerations</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {dietaryOptions.map((opt) => {
                  const isChecked = selectedDietary.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleDietary(opt)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: isChecked ? 600 : 500,
                        border: isChecked ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
                        backgroundColor: isChecked ? 'var(--color-success-bg)' : 'var(--color-surface)',
                        color: isChecked ? 'var(--color-success)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {isChecked ? `✓ ${opt}` : opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-notes">
                <span>Special Notes or Restrictions</span>
              </label>
              <textarea
                id="event-notes"
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Venue sound curfew at 10:00 PM, wheelchair ramp required at entrance..."
              />
            </div>
          </div>
        )}

        {/* STEP 5: Review & Generate */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Review & Generate Plan
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Confirm your event parameters. Festora AI will produce a tailored proposal that you can review and edit.
            </p>

            {/* Summary Box */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-muted)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Occasion & Title
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                  {title}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                  {eventType.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Date & Place
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                  {startDate}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                  {locationLabel}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Guests & Budget
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                  {guestCount} Guests
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {formatCurrency(toMinorUnits(budgetMajor), currency)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Theme Aesthetic
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                  {theme || 'Festive Contemporary'}
                </div>
              </div>
            </div>

            {/* AI Disclaimer Alert */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-accent-soft)',
                border: '1px solid var(--color-accent-border)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}
            >
              <Compass size={22} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: '#6A4305', lineHeight: 1.5 }}>
                <strong>AI Transparency Notice:</strong> Festora AI creates an initial planning proposal based on your criteria. Financial totals are calculated deterministically by application code. Suggested costs are estimates, not guaranteed vendor prices.
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border-light)',
          }}
        >
          {step > 1 ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevStep}
              disabled={isGenerating}
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNextStep}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              style={{ fontWeight: 700 }}
            >
              {isGenerating ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#FFFFFF',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Generating AI Event Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Event Plan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
