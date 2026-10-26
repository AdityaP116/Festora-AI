import React, { useState } from 'react';
import { Send, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Analytics } from '../../services/analytics';
import { useToast } from '../ui/Toast';

export const ContactFormSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('wedding');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.warning('Please complete all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate backend email notification dispatch
      await new Promise((resolve) => setTimeout(resolve, 800));

      Analytics.track('submit_contact_form', {
        eventType,
        hasName: !!name,
      });

      toast.success('Inquiry Sent!', 'Our celebration planning team will email you back shortly.');
      setSubmitted(true);
    } catch {
      toast.error('Failed to send inquiry', 'Please try again or email support@festora.ai directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      style={{
        padding: '5rem 0',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="container" style={{ maxWidth: '680px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <Mail size={24} />
          </div>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Get In Touch
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', marginTop: '0.4rem', color: 'var(--color-text)' }}>
            Have a custom celebration requirement?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Send us a message and our lead celebration coordinators will respond via email within 24 hours.
          </p>
        </div>

        {submitted ? (
          <div
            className="card"
            style={{
              padding: '2.5rem 2rem',
              textAlign: 'center',
              backgroundColor: 'var(--color-success-bg)',
              borderColor: 'var(--color-success-border)',
            }}
          >
            <CheckCircle2 size={44} color="var(--color-success)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-success)', fontWeight: 700 }}>
              Message Received!
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Thank you, {name}. A notification email has been dispatched to our team. We'll be in touch at <strong>{email}</strong> shortly.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setSubmitted(false);
                setMessage('');
              }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="card"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label" htmlFor="contact-name">
                  Your Full Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="e.g. Priyanshu Sharma"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="contact-email">
                  Email Address <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="priyanshu@example.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="contact-event-type">
                Celebration Occasion
              </label>
              <select
                id="contact-event-type"
                className="form-input"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="wedding">Wedding / Sangeet / Reception</option>
                <option value="birthday">Milestone Birthday</option>
                <option value="anniversary">Anniversary Celebration</option>
                <option value="college_event">College Festival / Academic Gala</option>
                <option value="community_event">Community Cultural Gathering</option>
                <option value="other">Other Unique Celebration</option>
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="contact-message">
                Your Requirements or Questions <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                placeholder="Tell us about your estimated guest count, planned city, theme preferences or any specific planning queries..."
                className="form-input"
                style={{ resize: 'vertical' }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                fontWeight: 600,
                marginTop: '0.5rem',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Transmitting inquiry...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Planning Inquiry</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
