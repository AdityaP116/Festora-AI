import React, { useState, useEffect } from 'react';
import { Cookie, Shield, X, SlidersHorizontal } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'festora_cookie_consent';
const PREFS_KEY = 'festora_cookie_preferences';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(STORAGE_KEY);
    if (!savedConsent) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    localStorage.setItem(PREFS_KEY, JSON.stringify({ essential: true, analytics: true, marketing: true }));
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    localStorage.setItem(PREFS_KEY, JSON.stringify({ essential: true, analytics: false, marketing: false }));
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(STORAGE_KEY, 'custom');
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setShowBanner(false);
    setShowModal(false);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Bottom Sticky Banner */}
      {showBanner && !showModal && (
        <div
          role="region"
          aria-label="Cookie consent banner"
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            left: '1.25rem',
            right: '1.25rem',
            maxWidth: '680px',
            margin: '0 auto',
            zIndex: 900,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-accent-soft)',
                color: 'var(--color-accent-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Cookie size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                Your Privacy & Cookie Preferences
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                We use strictly essential cookies for secure session management and anonymous analytics to improve AI plan generation quality. No third-party data broker tracking.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.6rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
              onClick={() => setShowModal(true)}
            >
              <SlidersHorizontal size={14} />
              <span>Customize</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.85rem' }}
              onClick={handleRejectNonEssential}
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.85rem' }}
              onClick={handleAcceptAll}
            >
              Accept All
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Shield size={22} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cookie Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--color-text-muted)', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Essential */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 600 }}>Strictly Necessary (Always Active)</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Required for authenticated sessions, security tokens, and local cache.
                  </p>
                </div>
                <span className="badge badge-primary">Required</span>
              </div>

              {/* Analytics */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 600 }}>Performance & Usage Analytics</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Helps us understand feature adoption and benchmark plan calculation accuracy.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
              </div>

              {/* Marketing */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 600 }}>Marketing & Attribution</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Measures referral campaign performance and event invite link previews.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSavePreferences}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
