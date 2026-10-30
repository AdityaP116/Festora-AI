import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIService } from '../src/services/ai-service';
import { ApiClient } from '../src/services/api-client';
import type { ValidatedEventInput } from '../src/domain/ai-schema';
import type { AIPlanProposal } from '../src/types';

describe('AIService - Client-Side Orchestration and Fallback Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const sampleWeddingInput: ValidatedEventInput = {
    title: 'Aarav & Maya Wedding',
    eventType: 'wedding',
    startDate: '2027-12-10',
    timezone: 'Asia/Kolkata',
    location: { label: 'Taj Palace, New Delhi' },
    guestCount: 200,
    budgetLimitMinor: 200000000,
    currency: 'INR',
    preferences: {
      theme: 'Royal Heritage',
    },
  };

  const sampleCelebrationInput: ValidatedEventInput = {
    title: 'Rohan 30th Birthday',
    eventType: 'birthday',
    startDate: '2027-08-15',
    timezone: 'Asia/Kolkata',
    location: { label: 'Skyline Lounge, Mumbai' },
    guestCount: 60,
    budgetLimitMinor: 5000000,
    currency: 'INR',
  };

  it('generates a schema-valid wedding proposal when offline using deterministic generator', async () => {
    // Force backend failure to trigger client fallback
    vi.spyOn(ApiClient, 'generateEventPlan').mockRejectedValue(new Error('Backend offline'));

    const result = await AIService.generateEventPlan(sampleWeddingInput);

    expect(result).toBeDefined();
    expect(result.schemaVersion).toBe(1);
    expect(result.proposalId).toMatch(/^prop_/);
    expect(result.plan.theme.name).toBe('Royal Heritage');
    expect(result.plan.budget.length).toBeGreaterThanOrEqual(5);

    // Sum of budget categories should match or remain within total budget limit
    const totalAllocated = result.plan.budget.reduce((acc, b) => acc + b.estimatedAmountMinor, 0);
    expect(totalAllocated).toBeLessThanOrEqual(sampleWeddingInput.budgetLimitMinor);

    // Check tasks exist with proper categories
    expect(result.plan.tasks.some((t) => t.categoryKey === 'venue')).toBe(true);
    expect(result.plan.tasks.some((t) => t.isEventDayTask === true)).toBe(true);
  });

  it('generates a general celebration plan with default fallback theme', async () => {
    vi.spyOn(ApiClient, 'generateEventPlan').mockRejectedValue(new Error('Backend offline'));

    const result = await AIService.generateEventPlan(sampleCelebrationInput);

    expect(result.plan.summary).toContain('Rohan 30th Birthday');
    expect(result.plan.theme.name).toBe('Vibrant Festive Glow');
    expect(result.plan.schedule.length).toBeGreaterThan(0);
    expect(result.warnings.length).toBe(2);
  });

  it('delegates to ApiClient when live backend responds successfully', async () => {
    const mockProposal: AIPlanProposal = {
      schemaVersion: 1,
      summary: 'Live generated proposal from cloud',
      theme: {
        name: 'Cloud Luxe',
        description: 'Generated via Gemini backend',
        palette: ['#000000', '#FFFFFF'],
        ideas: ['Live entertainment'],
      },
      budget: [
        {
          categoryKey: 'venue',
          label: 'Venue',
          estimatedAmountMinor: 100000,
          rationale: 'Deposit',
          confidence: 'high',
        },
      ],
      tasks: [],
      milestones: [],
      schedule: [],
      vendorRequirements: [],
      assumptions: [],
      risks: [],
      costSavingIdeas: [],
    };

    vi.spyOn(ApiClient, 'generateEventPlan').mockResolvedValue({
      proposalId: 'prop_live_123',
      schemaVersion: 1,
      plan: mockProposal,
      warnings: [],
    });

    const result = await AIService.generateEventPlan(sampleWeddingInput);
    expect(result.proposalId).toBe('prop_live_123');
    expect(result.plan.theme.name).toBe('Cloud Luxe');
  });

  it('handles plan revisions with local fallback when backend is unavailable', async () => {
    vi.spyOn(ApiClient, 'proposePlanRevision').mockRejectedValue(new Error('Backend down'));

    const genResult = await AIService.generateEventPlan(sampleCelebrationInput);
    const validBaseProposal = genResult.plan;

    // Test budget cut reduction branch
    const revision = await AIService.proposePlanRevision(
      validBaseProposal,
      'Reduce budget by 15%',
      'evt_123',
      1
    );

    expect(revision.changeSummary).toContain('15%');
    expect(revision.revisedPlan.budget[0].estimatedAmountMinor).toBeLessThan(validBaseProposal.budget[0].estimatedAmountMinor);
  });

  it('handles theme alteration revision prompt locally', async () => {
    const genResult = await AIService.generateEventPlan(sampleCelebrationInput);
    const validBaseProposal = genResult.plan;

    const revision = await AIService.proposePlanRevision(
      validBaseProposal,
      'Theme: Royal Velvet'
    );

    expect(revision.revisedPlan.theme.name).toBe('Theme: Royal Velvet');
    expect(revision.changeSummary).toContain('Updated theme styling concept');
  });

  it('handles general plan adjustment prompt gracefully', async () => {
    const genResult = await AIService.generateEventPlan(sampleCelebrationInput);
    const validBaseProposal = genResult.plan;

    const revision = await AIService.proposePlanRevision(
      validBaseProposal,
      'Add more focus on photography and guest greetings'
    );

    expect(revision.changeSummary).toContain('Applied refinement:');
  });
});
