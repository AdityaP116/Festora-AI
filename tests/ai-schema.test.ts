import { describe, it, expect } from 'vitest';
import {
  AIPlanProposalSchema,
  ValidatedEventInputSchema,
} from '../src/domain/ai-schema';

describe('AI Schema Validation & Input Boundaries (TEST_PLAN.md Section 2)', () => {
  const validEventInput = {
    title: 'Aarav & Priya Wedding Reception',
    eventType: 'wedding',
    startDate: '2027-04-15',
    timezone: 'Asia/Kolkata',
    location: { label: 'Taj Lands End, Mumbai', city: 'Mumbai' },
    currency: 'INR',
    guestCount: 200,
    budgetLimitMinor: 150000000,
    preferences: {
      theme: 'Royal Heritage',
      dietary: ['vegetarian', 'jain'],
      priorities: ['food', 'photography'],
    },
  };

  it('accepts valid event creation inputs', () => {
    const result = ValidatedEventInputSchema.safeParse(validEventInput);
    expect(result.success).toBe(true);
  });

  it('rejects missing or short titles', () => {
    const invalid = { ...validEventInput, title: 'ab' }; // min 3 chars
    const result = ValidatedEventInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects unsupported event types', () => {
    const invalid = { ...validEventInput, eventType: 'unsupported_party' };
    const result = ValidatedEventInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects negative guest count or budget limit', () => {
    const invalidGuests = { ...validEventInput, guestCount: 0 };
    expect(ValidatedEventInputSchema.safeParse(invalidGuests).success).toBe(false);

    const invalidBudget = { ...validEventInput, budgetLimitMinor: -100 };
    expect(ValidatedEventInputSchema.safeParse(invalidBudget).success).toBe(false);
  });

  it('rejects invalid date formats', () => {
    const invalidDate = { ...validEventInput, startDate: '15/04/2027' }; // Requires YYYY-MM-DD
    expect(ValidatedEventInputSchema.safeParse(invalidDate).success).toBe(false);
  });

  it('accepts a fully conforming AIPlanProposal', () => {
    const validPlan = {
      schemaVersion: 1,
      summary: 'Grand wedding reception plan emphasizing royal aesthetics and memorable dining.',
      theme: {
        name: 'Royal Heritage',
        description: 'Deep plum and warm golden tones with festive marigold accents.',
        palette: ['#6543A5', '#E5A93C', '#FAF8FC', '#211B2B', '#E9E3EF'],
        ideas: ['Floral entryway arch', 'Traditional shehnai welcome'],
      },
      budget: [
        {
          categoryKey: 'venue',
          label: 'Banquet Hall',
          estimatedAmountMinor: 50000000,
          rationale: 'Primary hall booking with air conditioning and valet.',
          confidence: 'high',
        },
      ],
      tasks: [
        {
          clientKey: 'tsk_1',
          title: 'Finalize Banquet Hall Contract',
          description: 'Review cutoff timings and liquor license permissions.',
          categoryKey: 'venue',
          priority: 'critical',
          dueDate: '2027-03-01',
          isEventDayTask: false,
        },
      ],
      milestones: [
        {
          title: 'Venue Locked',
          targetDate: '2027-03-01',
          description: 'Security deposit paid.',
        },
      ],
      schedule: [
        {
          startLocalTime: '18:00',
          endLocalTime: '19:30',
          title: 'Guest Reception',
          notes: 'Welcome mocktails and registration.',
        },
      ],
      vendorRequirements: [
        {
          category: 'Photography',
          whyNeeded: 'Cinematic coverage and live stream.',
          questionsToAsk: ['Are raw files included in package?'],
        },
      ],
      assumptions: ['Guest headcount will not exceed 220.'],
      risks: ['Peak weekend traffic on Bandra access road.'],
      costSavingIdeas: ['Digital invitations instead of printed cards.'],
    };

    const result = AIPlanProposalSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
  });

  it('rejects AI proposal with negative budget allocations', () => {
    const invalidPlan = {
      schemaVersion: 1,
      summary: 'Test summary with enough length',
      theme: {
        name: 'Test',
        description: 'Test desc',
        palette: ['#6543A5', '#E5A93C'],
        ideas: ['Test idea'],
      },
      budget: [
        {
          categoryKey: 'venue',
          label: 'Venue',
          estimatedAmountMinor: -5000, // Negative not permitted
          rationale: 'Invalid',
          confidence: 'low',
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

    expect(AIPlanProposalSchema.safeParse(invalidPlan).success).toBe(false);
  });
});
