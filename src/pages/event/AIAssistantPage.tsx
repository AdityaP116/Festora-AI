import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  History,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { AIService } from '../../services/ai-service';
import { useAuth } from '../../services/auth-context';
import type {
  EventDocument,
  PlanVersionDocument,
  AIPlanProposal,
} from '../../types';
import { formatCurrency } from '../../domain/budget';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const AIAssistantPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDocument | null>(null);
  const [planVersions, setPlanVersions] = useState<PlanVersionDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Revision State
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [proposedRevision, setProposedRevision] = useState<{
    revisedPlan: AIPlanProposal;
    changeSummary: string;
  } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !eventId) return;
      try {
        setLoading(true);
        const [evt, pVersions] = await Promise.all([
          StorageService.getEventById(user.uid, eventId),
          StorageService.getPlanVersions(eventId),
        ]);
        setEvent(evt);
        setPlanVersions(pVersions);
      } catch (err) {
        console.error('Failed to load AI plan data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, eventId]);

  const activeVersion = planVersions[0];
  const activePlan = activeVersion?.plan;

  const handleQuickRevision = async (promptText: string) => {
    if (!activePlan) return;
    try {
      setIsRevising(true);
      const result = await AIService.proposePlanRevision(
        activePlan,
        promptText,
        eventId,
        activeVersion?.version || 1
      );
      setProposedRevision(result);
      setIsReviewModalOpen(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Revision request failed');
    } finally {
      setIsRevising(false);
    }
  };

  const handleApplyRevision = async () => {
    if (!eventId || !user || !proposedRevision) return;
    try {
      setIsApplying(true);
      const appliedVersion = await StorageService.applyPlanProposal(
        eventId,
        user.uid,
        proposedRevision.revisedPlan,
        proposedRevision.changeSummary
      );
      setPlanVersions((prev) => [appliedVersion, ...prev]);
      setIsReviewModalOpen(false);
      setProposedRevision(null);
      setRevisionPrompt('');
      setStatusMessage('Plan revision successfully applied! Completed tasks and expenses were preserved.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to apply plan revision');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading || !event) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
        Loading AI planning engine...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Status Notice */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles size={22} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)' }}>
            AI Planning Assistant & Revisions
          </h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Review the structured AI proposal or request targeted refinements with review-before-apply protection.
        </p>
      </div>

      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.1rem',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Revision Controls Card */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
          Request a Targeted Plan Revision
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Choose a pre-built optimization or describe your requested adjustment.
        </p>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleQuickRevision('Reduce budget by 15% while preserving quality')}
            disabled={isRevising}
          >
            📉 Reduce budget by 15%
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleQuickRevision('Add 10% emergency contingency fund to the plan')}
            disabled={isRevising}
          >
            🛡️ Add 10% Contingency Buffer
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleQuickRevision('Rebalance category budgets to absorb overages without exceeding total limit')}
            disabled={isRevising}
          >
            ⚖️ Rebalance Budget Allocations
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleQuickRevision('Shift aesthetic theme to Modern Royal Gold & Jewel Tones')}
            disabled={isRevising}
          >
            🎨 Modern Royal Theme
          </button>
        </div>

        {/* Custom Prompt Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (revisionPrompt.trim()) handleQuickRevision(revisionPrompt.trim());
          }}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            className="form-input"
            value={revisionPrompt}
            onChange={(e) => setRevisionPrompt(e.target.value)}
            placeholder="e.g. Focus on candid cinematography and prioritize vegetarian fine-dining appetizers..."
            style={{ flex: 1, minWidth: '240px' }}
            disabled={isRevising}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isRevising || !revisionPrompt.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', height: '42px' }}
          >
            {isRevising ? (
              <span>Thinking...</span>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Propose Revision</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Active Proposal View */}
      {!activePlan ? (
        <EmptyState
          icon={Sparkles}
          title="No generated plan available"
          description="Generate your initial celebration blueprint to see budget splits, themes, and checklists."
          actionText="Generate Initial Plan"
          onAction={() => handleQuickRevision('Generate comprehensive initial celebration plan')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Version Header Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={16} color="var(--color-primary)" />
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                Active Plan Version: v{activeVersion.version}
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                (Generated {new Date(activeVersion.generatedAt).toLocaleString()})
              </span>
            </div>
            <Badge variant="success">PROPOSAL APPLIED</Badge>
          </div>

          {/* Theme & Summary Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              Concept & Atmosphere: {activePlan.theme.name}
            </h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {activePlan.summary}
            </p>

            {/* Color Palette */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Curated Color Palette
              </span>
              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {activePlan.theme.palette.map((color, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-hover)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <div style={{ width: '16px', height: '16px', borderRadius: '3px', backgroundColor: color }} />
                    <span>{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ideas */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Creative Planning Highlights
              </span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '0.85rem',
                  marginTop: '0.5rem',
                }}
              >
                {activePlan.theme.ideas.map((idea, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--color-surface-muted)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: 'var(--color-text)',
                    }}
                  >
                    ✨ {idea}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Breakdown Table */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>
              Suggested Budget Allocation Table
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Suggested Allocation</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Planning Rationale</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlan.budget.map((b, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {b.label}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {formatCurrency(b.estimatedAmountMinor, event.currency)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-secondary)' }}>
                        {b.rationale}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <Badge variant={b.confidence === 'high' ? 'success' : 'neutral'} size="sm">
                          {b.confidence.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assumptions, Risks & Cost Savings 3-Card Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Assumptions */}
            <div className="card">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                Planning Assumptions
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {activePlan.assumptions.map((a, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--color-primary)' }}>•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Identified Risks */}
            <div className="card">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                Identified Planning Risks
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {activePlan.risks.map((r, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--color-danger)' }}>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cost Saving Ideas */}
            <div className="card">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                Cost-Saving Recommendations
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {activePlan.costSavingIdeas.map((c, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--color-success)' }}>•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Review-Before-Apply Revision Diff Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Proposed Plan Revision"
        description="Review changes before applying them to your workspace."
        maxWidth="640px"
      >
        {proposedRevision && (
          <div>
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--color-primary-soft)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                marginBottom: '1.25rem',
              }}
            >
              Summary: {proposedRevision.changeSummary}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Revised Theme: {proposedRevision.revisedPlan.theme.name}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {proposedRevision.revisedPlan.theme.description}
              </p>
            </div>

            {/* Budget changes overview */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                Proposed Category Allocations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                {proposedRevision.revisedPlan.budget.map((b, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--color-surface-muted)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>{b.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {formatCurrency(b.estimatedAmountMinor, event.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
                marginBottom: '1.5rem',
              }}
            >
              <ShieldCheck size={16} />
              <span>
                Safety Guarantee: Your existing completed tasks, user notes, and actual expense records will remain untouched.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isApplying}
              >
                Discard Proposal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApplyRevision}
                disabled={isApplying}
              >
                {isApplying ? 'Applying Changes...' : 'Apply Revision to Event'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
