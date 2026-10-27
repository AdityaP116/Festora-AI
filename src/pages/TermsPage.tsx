import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SeoHead } from '../components/seo/SeoHead';

export const TermsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <SeoHead
        title="Terms & Conditions"
        description="Review the terms and conditions governing the use of the Festora AI celebration planning workspace and AI generation tools."
        canonicalPath="/terms"
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
              <FileText size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0 }}>
                Terms & Conditions
              </h1>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Effective Date: October 27, 2026 • Version 2026.1
              </span>
            </div>
          </div>

          {/* Legal Operator Notice Banner */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              marginBottom: '2rem',
            }}
          >
            <strong>Service Notice:</strong> Festora AI ("the Service") is operated as an event planning and organization software platform. Legal entity identification and official business registration details are subject to formal confirmation by the business owner upon commercial deployment.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, accessing, or using Festora AI, you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions ("Terms") and our <Link to="/privacy" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Privacy Policy</Link>. If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                2. Eligibility and Account Responsibilities
              </h2>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong>Age Requirement:</strong> You must be at least 18 years of age (or the age of legal majority in your jurisdiction) to register an account and enter into legally binding agreements.</li>
                <li><strong>Account Integrity:</strong> You agree to provide accurate, current, and complete registration information and maintain the confidentiality of your login credentials.</li>
                <li><strong>Security:</strong> You are responsible for all activities occurring under your account. Notify us immediately if you suspect unauthorized access.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                3. Nature of the Service & GenAI Disclaimers
              </h2>
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B45309', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <AlertCircle size={18} />
                  <span>AI Suggestions Are Advisory Only</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400E' }}>
                  Festora AI leverages generative artificial intelligence (including Google Gemini models) to propose event themes, task schedules, and budget allocations. AI proposals are informational drafts and do not constitute guaranteed vendor availability, exact commercial prices, or legally binding bookings.
                </p>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong>No Automatic Bookings:</strong> Festora AI provides self-service coordination tools. We do not automatically charge cards, sign contracts with vendors, or finalize banquet reservations without direct user execution.</li>
                <li><strong>Deterministic Math:</strong> Financial metrics, variance analysis, and balances calculated by the software run on deterministic application code; however, initial suggested category splits are algorithmic estimates subject to local market fluctuations.</li>
                <li><strong>Verification Required:</strong> You remain solely responsible for independently confirming dates, licensing permits, venue capacities, food safety, and vendor terms.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                4. Intellectual Property & User Content
              </h2>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong>Service Ownership:</strong> The Festora AI brand, application code, visual layout, trademarks, logos, and original software are the intellectual property of Festora AI and its licensors.</li>
                <li><strong>User-Generated Content:</strong> You retain ownership of all text, guest lists, private budget records, and personal notes you enter into your workspace. You grant Festora AI a limited, non-exclusive license solely to process and display this content to deliver the service to you.</li>
                <li><strong>Third-Party IP:</strong> All third-party trademarks, vendor logos, and service names referenced belong to their respective holders. Mention of any third party does not imply endorsement or partnership.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                5. Acceptable Use Policy
              </h2>
              <p>You agree not to:</p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <li>Use the Service for any unlawful, fraudulent, or harassing purpose.</li>
                <li>Attempt to reverse-engineer, decompile, or extract the source code of the application.</li>
                <li>Circumvent or tamper with security boundaries, tenant isolation rules, or API rate limits.</li>
                <li>Upload malicious code, viruses, or unauthorized automated scraping bots.</li>
                <li>Upload personal data of third parties (e.g., guest names or phone numbers) without appropriate consent or legal authority.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                6. Service Availability & Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, Festora AI is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Festora AI, its contributors, and developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of event deposits, vendor cancellations, or scheduling discrepancies arising from your use of the application.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                7. Account Termination and Data Deletion
              </h2>
              <p>
                You may terminate your account at any time using the self-service "Delete Account" control in your <Link to="/settings" style={{ color: 'var(--color-primary)' }}>Account Preferences</Link>. Festora AI reserves the right to suspend or terminate accounts that violate these Terms or threaten system security.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.65rem' }}>
                8. Contact Information & Legal Inquiries
              </h2>
              <p>
                For questions regarding these Terms or to report intellectual property concerns, please contact:
              </p>
              <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                <div><strong>Email:</strong> legal@festora.ai (configurable production placeholder)</div>
                <div><strong>Support Inquiries:</strong> support@festora.ai</div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
