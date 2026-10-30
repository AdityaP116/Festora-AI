import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiClient, ApiError, registerTokenProvider, getApiBaseUrl } from '../src/services/api-client';
import { StorageService } from '../src/services/storage';

describe('Issue 11 - Storage and API Client Comprehensive Branch Coverage', () => {
  describe('ApiClient Error, Timeout, and Status Branch Coverage', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns empty object when response status is 204 No Content', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn(),
      });
      globalThis.fetch = mockFetch;

      const result = await ApiClient.checkHealth();
      expect(result).toEqual({});
    });

    it('parses structured JSON error bodies when response is not ok', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({
          error: {
            code: 'RESOURCE_EXHAUSTED',
            message: 'Too many requests. Please wait 45s.',
          },
        }),
      });
      globalThis.fetch = mockFetch;

      await expect(ApiClient.getEvents()).rejects.toThrow(ApiError);
      try {
        await ApiClient.getEvents();
      } catch (err: any) {
        expect(err.code).toBe('RESOURCE_EXHAUSTED');
        expect(err.status).toBe(429);
        expect(err.message).toBe('Too many requests. Please wait 45s.');
      }
    });

    it('falls back to text error body when response is not application/json', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: vi.fn().mockResolvedValue('Bad Gateway Error from Upstream Load Balancer'),
      });
      globalThis.fetch = mockFetch;

      await expect(ApiClient.getEvents()).rejects.toThrow(ApiError);
      try {
        await ApiClient.getEvents();
      } catch (err: any) {
        expect(err.status).toBe(502);
        expect(err.message).toContain('Bad Gateway Error');
      }
    });

    it('handles JSON parsing errors on non-ok responses with default fallback message', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockRejectedValue(new Error('SyntaxError: Unexpected end of JSON')),
      });
      globalThis.fetch = mockFetch;

      try {
        await ApiClient.getEvents();
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Request failed with status 500');
      }
    });

    it('maps AbortError to 408 RESOURCE_EXHAUSTED timeout ApiError', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      const mockFetch = vi.fn().mockRejectedValue(abortError);
      globalThis.fetch = mockFetch;

      try {
        await ApiClient.getEvents();
      } catch (err: any) {
        expect(err.status).toBe(408);
        expect(err.code).toBe('RESOURCE_EXHAUSTED');
        expect(err.message).toContain('Request timed out');
      }
    });

    it('handles token provider exceptions gracefully without failing request initialization', async () => {
      registerTokenProvider(async () => {
        throw new Error('Auth token retrieval failed');
      });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({ status: 'healthy', service: 'festora-ai-backend', version: '1.0.0' }),
      });
      globalThis.fetch = mockFetch;

      const health = await ApiClient.checkHealth();
      expect(health).toEqual({ status: 'healthy', service: 'festora-ai-backend', version: '1.0.0' });
    });

    it('attaches Authorization header when token provider supplies valid token', async () => {
      registerTokenProvider(async () => 'valid_bearer_token_xyz');

      let capturedHeaders: Record<string, string> = {};
      const mockFetch = vi.fn().mockImplementation((_url, options) => {
        capturedHeaders = options.headers;
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: vi.fn().mockResolvedValue({ events: [] }),
        });
      });
      globalThis.fetch = mockFetch;

      await ApiClient.getEvents();
      expect(capturedHeaders['Authorization']).toBe('Bearer valid_bearer_token_xyz');
    });

    it('getApiBaseUrl returns a valid URL string', () => {
      const url = getApiBaseUrl();
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });
  });

  describe('StorageService Version Pruning, Purge, and Invariants (Issues 05 & 07)', () => {
    beforeEach(() => {
      StorageService.clearWorkspaceData();
    });

    it('caps planVersions array to at most 10 historical records', async () => {
      const eventId = 'evt_version_test';

      const dummyProposal = {
        schemaVersion: 1,
        summary: 'Version Test Plan',
        budget: [
          {
            categoryKey: 'venue',
            categoryName: 'Venue',
            estimatedAmountMinor: 100000,
            priority: 'high' as const,
          },
        ],
        tasks: [],
      };

      // Create 15 plan versions sequentially
      for (let i = 1; i <= 15; i++) {
        await StorageService.applyPlanProposal(
          eventId,
          'user_test',
          dummyProposal as any,
          `Revision ${i}`
        );
      }

      const versions = await StorageService.getPlanVersions(eventId);
      expect(versions.length).toBe(10);
      // The newest versions should be preserved
      expect(versions[0].version).toBe(15);
      expect(versions[9].version).toBe(6);
    });

    it('clearWorkspaceData purges local state and protects offline privacy', async () => {
      await StorageService.createEvent({
        ownerUid: 'user_privacy_test',
        title: 'Sensitive Private Celebration',
        eventType: 'birthday',
        startDate: '2027-05-10',
        timezone: 'UTC',
        location: { label: 'Private Residence' },
        currency: 'USD',
        guestCount: 25,
        budgetLimitMinor: 500000,
        status: 'planning',
      });

      const eventsBefore = await StorageService.getEvents('user_privacy_test');
      expect(eventsBefore.length).toBe(1);

      StorageService.clearWorkspaceData();

      const eventsAfter = await StorageService.getEvents('user_privacy_test');
      expect(eventsAfter.length).toBe(0);
    });
  });
});
