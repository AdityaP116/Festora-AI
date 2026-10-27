import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Cpu } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SeoHead } from '../components/seo/SeoHead';

export const PrivacyPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <SeoHead
        title="Privacy Policy"
        description="Learn how Festora AI collects, processes, and protects your celebration planning data in accordance with privacy-by-design standards."
        canonicalPath="/privacy"
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

        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0 }}>
                Privacy Policy
              </h1>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Effective Date: October 27, 2026 • Version 2026.1
              </span>
            </div>
          </div>

          <p style={{ fontSize: '1rem', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Festora AI ("we", "our", or "us") values your trust. This Privacy Policy details the exact types of data we collect, how your celebration records are stored, how artificial intelligence processes event prompts, and how you retain complete control over your personal information.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                1. Information We Collect
              </h2>
              <p>We collect information exclusively to provide and improve your event planning experience:</p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                <li><strong>Account Credentials:</strong> Name, email address, password hash (via Firebase Authentication), and Google OAuth profile identifiers if you select "Continue with Google".</li>
                <li><strong>Event Workspace Data:</strong> Celebration titles, dates, locations/cities, headcount estimates, total budget limits, style preferences, dietary notes, and priority checklist items.</li>
                <li><strong>Vendor & Expense Records:</strong> User-entered candidate names, quoted amounts, contact phone numbers, emails, and payment statuses.</li>
                <li><strong>Guest Lists:</strong> Names, dietary preferences, RSVP statuses, and party groupings entered by you.</li>
                <li><strong>Diagnostic & Usage Telemetry:</strong> High-level conversion milestones (e.g. event created, plan applied) collected only with user cookie consent. We do not use third-party invasive trackers or data brokers.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                2. How and Why Information is Processed
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Plan Generation</div>
                  <p style={{ margin: 0, fontSize: '0.825rem' }}>Translates headcount and budget limit into realistic category estimates and timeline milestones.</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Deterministic Budgeting</div>
                  <p style={{ margin: 0, fontSize: '0.825rem' }}>Maintains immutable audit records and computes financial remaining balances via application code.</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Account Security</div>
                  <p style={{ margin: 0, fontSize: '0.825rem' }}>Verifies identity tokens, prevents cross-tenant access, and preserves your saved celebration plans.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                3. Generative AI Processing & Google Gemini
              </h2>
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-primary-soft)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <Cpu size={18} />
                  <span>AI Prompt Processing Transparency</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  When you generate or refine an event plan, your celebration parameters (event type, guest count, city, budget, and stylistic preferences) are formatted and transmitted to Google Gemini AI API over TLS encryption.
                </p>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong>No Sensitive Personal Data in Prompts:</strong> We encourage users not to enter personal national identification numbers, passwords, or payment card details into event notes.</li>
                <li><strong>Model Training Disclosures:</strong> In enterprise Google Cloud / Vertex AI configurations, customer prompts are not used to train foundational AI models without authorization. Users should review Google's API service terms for external provider details.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                4. Data Storage, Security & Cross-Tenant Isolation
              </h2>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong>Cloud Firestore:</strong> Data is persisted in Google Cloud Firestore. Security rules enforce strict multi-tenant isolation: documents nested under <code>/users/&#123;userId&#125;/events</code> are accessible solely by the authenticated owner.</li>
                <li><strong>Local Workspace Persistence:</strong> For offline resilience, a mirrored copy of your active session is stored in your browser's private local storage.</li>
                <li><strong>Encryption:</strong> Data in transit is protected using TLS 1.3 encryption. Cloud data is encrypted at rest by Google Cloud Infrastructure.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                5. Third-Party Service Providers
              </h2>
              <p>We work with trusted infrastructure providers solely to host and secure the application:</p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <li><strong>Google Firebase:</strong> Identity authentication, database hosting, and infrastructure logging.</li>
                <li><strong>Google Cloud (Gemini API):</strong> Natural language generation for event proposal drafting.</li>
              </ul>
              <p style={{ marginTop: '0.5rem' }}>We never sell, rent, or lease your personal information to third-party data brokers or marketing aggregators.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                6. Data Retention and Your Rights (DPDP Act, GDPR, CCPA)
              </h2>
              <p>Depending on your jurisdiction (including India's Digital Personal Data Protection Act, European GDPR, and US regulations), you have the right to:</p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <li><strong>Access and Export:</strong> Review the personal data stored in your workspace.</li>
                <li><strong>Correction:</strong> Update inaccurate name or currency preferences anytime in <Link to="/settings" style={{ color: 'var(--color-primary)' }}>Settings</Link>.</li>
                <li><strong>Erasure (Right to be Forgotten):</strong> Permanently delete your account and associated event plans using the self-service "Delete Account" button in your account settings.</li>
                <li><strong>Withdraw Consent:</strong> Change cookie and tracking choices anytime via our Cookie Preferences center.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                7. Children's Privacy
              </h2>
              <p>
                Festora AI is directed at adults organizing celebratory gatherings. We do not knowingly collect personal information from individuals under the age of 18. If we discover an account created by a minor without verified legal guardian authorization, we will promptly delete it.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                8. Contact Our Privacy Team
              </h2>
              <p>For data protection requests, privacy queries, or data deletion assistance, please contact:</p>
              <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                <div><strong>Privacy Officer / Grievance Contact:</strong> privacy@festora.ai</div>
                <div><strong>Response Timeline:</strong> Within 30 business days</div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
