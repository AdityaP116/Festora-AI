import { describe, it, expect } from 'vitest';
import { ValidatedEventInputSchema } from '../functions/src/schemas/ai-schemas';
import { ApiError } from '../src/services/api-client';

describe('API Contracts & Schema Consistency Verification', () => {
  describe('ValidatedEventInputSchema (functions/src/schemas/ai-schemas.ts)', () => {
    it('accepts fully compliant event input conforming to API_CONTRACTS.md', () => {
      const validPayload = {
        title: 'Diwali Corporate Gathering',
        eventType: 'community_event' as const,
        startDate: '2027-11-01',
        timezone: 'Asia/Kolkata',
        location: {
          label: 'Grand Hyatt, Mumbai',
          city: 'Mumbai',
        },
        currency: 'INR',
        guestCount: 150,
        budgetLimitMinor: 150000000,
        preferences: {
          theme: 'Festival of Lights',
          dietary: ['Vegetarian', 'Vegan'],
          priorities: ['Lighting & Ambience', 'Catering'],
        },
      };

      const parsed = ValidatedEventInputSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.title).toBe('Diwali Corporate Gathering');
        expect(parsed.data.guestCount).toBe(150);
      }
    });

    it('rejects title shorter than 3 characters with clear message', () => {
      const invalidPayload = {
        title: 'NY',
        eventType: 'birthday' as const,
        startDate: '2027-12-31',
        location: { label: 'Times Square' },
        guestCount: 50,
        budgetLimitMinor: 5000000,
      };

      const parsed = ValidatedEventInputSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const titleIssue = parsed.error.issues.find((i) => i.path.includes('title'));
        expect(titleIssue).toBeDefined();
        expect(titleIssue?.message).toContain('at least 3 character');
      }
    });

    it('rejects guest count less than 1', () => {
      const invalidPayload = {
        title: 'Solo Retreat',
        eventType: 'other' as const,
        startDate: '2027-05-10',
        location: { label: 'Goa' },
        guestCount: 0,
        budgetLimitMinor: 1000000,
      };

      const parsed = ValidatedEventInputSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const guestIssue = parsed.error.issues.find((i) => i.path.includes('guestCount'));
        expect(guestIssue).toBeDefined();
      }
    });

    it('rejects negative budgetLimitMinor', () => {
      const invalidPayload = {
        title: 'Tech Conference 2027',
        eventType: 'college_event' as const,
        startDate: '2027-09-15',
        location: { label: 'Convention Center, Bengaluru' },
        guestCount: 300,
        budgetLimitMinor: -50000,
      };

      const parsed = ValidatedEventInputSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const budgetIssue = parsed.error.issues.find((i) => i.path.includes('budgetLimitMinor'));
        expect(budgetIssue).toBeDefined();
      }
    });

    it('rejects unsupported eventType enum', () => {
      const invalidPayload = {
        title: 'Secret Agent Mission',
        eventType: 'secret_underground_rave' as any,
        startDate: '2027-09-15',
        location: { label: 'Unknown Location' },
        guestCount: 50,
        budgetLimitMinor: 5000000,
      };

      const parsed = ValidatedEventInputSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });

    it('rejects invalid date formats not matching YYYY-MM-DD', () => {
      const invalidPayload = {
        title: 'Summer Birthday',
        eventType: 'birthday' as const,
        startDate: '15/08/2027', // DD/MM/YYYY is invalid according to schema
        location: { label: 'Home' },
        guestCount: 20,
        budgetLimitMinor: 2000000,
      };

      const parsed = ValidatedEventInputSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });
  });

  describe('ApiError & HTTP Status Mapping Contract', () => {
    it('creates structured ApiError conforming to API_CONTRACTS error specification', () => {
      const error = new ApiError('Requested event not found.', 'NOT_FOUND', 404, 'req_12345');

      expect(error.message).toBe('Requested event not found.');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
      expect(error.requestId).toBe('req_12345');
      expect(error.name).toBe('ApiError');
    });

    it('creates structured ApiError for permission denied (403)', () => {
      const error = new ApiError('Forbidden operation.', 'PERMISSION_DENIED', 403);
      expect(error.code).toBe('PERMISSION_DENIED');
      expect(error.status).toBe(403);
    });

    it('creates structured ApiError for resource exhausted / rate limiting (429)', () => {
      const error = new ApiError('Rate limit exceeded.', 'RESOURCE_EXHAUSTED', 429);
      expect(error.code).toBe('RESOURCE_EXHAUSTED');
      expect(error.status).toBe(429);
    });
  });
});
