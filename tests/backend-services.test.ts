import { describe, it, expect, vi } from 'vitest';
import {
  verifyAuthHeader,
  verifyEventOwnership,
  AuthorizationError,
} from '../functions/src/services/authorization';
import { checkRateLimit } from '../functions/src/services/rate-limits';
import { SecurityLogger } from '../functions/src/services/security-logger';

describe('Backend Services & Authorization Unit Tests', () => {
  describe('verifyAuthHeader', () => {
    it('throws UNAUTHENTICATED error when header is missing', async () => {
      await expect(verifyAuthHeader(undefined)).rejects.toThrowError(
        new AuthorizationError('Authentication required to access this resource.', 'UNAUTHENTICATED')
      );
    });

    it('throws UNAUTHENTICATED error when header does not start with Bearer', async () => {
      await expect(verifyAuthHeader('Basic abc123xyz')).rejects.toThrowError(
        new AuthorizationError('Authentication required to access this resource.', 'UNAUTHENTICATED')
      );
    });

    it('throws UNAUTHENTICATED error when Bearer token is empty or whitespace', async () => {
      await expect(verifyAuthHeader('Bearer    ')).rejects.toThrowError(
        new AuthorizationError('Malformed authorization token.', 'UNAUTHENTICATED')
      );
    });

    it('correctly parses dev_token prefix in test/dev environment', async () => {
      const auth = await verifyAuthHeader('Bearer dev_token_organizer_42');
      expect(auth.uid).toBe('organizer_42');
      expect(auth.email).toBe('organizer_42@festora.test');
    });

    it('correctly parses test_token prefix in test/dev environment', async () => {
      const auth = await verifyAuthHeader('Bearer test_token_qa_specialist');
      expect(auth.uid).toBe('qa_specialist');
      expect(auth.email).toBe('qa_specialist@festora.test');
    });
  });

  describe('verifyEventOwnership', () => {
    it('throws INVALID_ARGUMENT when ownerUid or eventId is empty', async () => {
      const mockFirestore: any = {};
      await expect(verifyEventOwnership(mockFirestore, '', 'event123')).rejects.toThrowError(
        new AuthorizationError('Missing required owner or event identifier.', 'INVALID_ARGUMENT')
      );

      await expect(verifyEventOwnership(mockFirestore, 'user123', '')).rejects.toThrowError(
        new AuthorizationError('Missing required owner or event identifier.', 'INVALID_ARGUMENT')
      );
    });

    it('throws NOT_FOUND when target event document does not exist', async () => {
      const mockFirestore: any = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                get: async () => ({ exists: false }),
              }),
            }),
          }),
        }),
      };

      await expect(
        verifyEventOwnership(mockFirestore, 'owner_john', 'non_existent_event')
      ).rejects.toThrowError(new AuthorizationError('Event not found or access denied.', 'NOT_FOUND'));
    });

    it('throws PERMISSION_DENIED when document data contains mismatched ownerUid', async () => {
      const mockFirestore: any = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                get: async () => ({
                  exists: true,
                  data: () => ({ ownerUid: 'actual_owner_tammy' }),
                }),
              }),
            }),
          }),
        }),
      };

      await expect(
        verifyEventOwnership(mockFirestore, 'attacker_bob', 'event_xyz')
      ).rejects.toThrowError(
        new AuthorizationError(
          'You do not have permission to access or modify this event.',
          'PERMISSION_DENIED'
        )
      );
    });

    it('successfully returns snapshot when authenticated user is legitimate owner', async () => {
      const mockSnapshot = {
        exists: true,
        id: 'event_wedding_99',
        data: () => ({ ownerUid: 'legit_owner_alice', title: 'Golden Jubilee' }),
      };

      const mockFirestore: any = {
        collection: () => ({
          doc: () => ({
            collection: () => ({
              doc: () => ({
                get: async () => mockSnapshot,
              }),
            }),
          }),
        }),
      };

      const result = await verifyEventOwnership(mockFirestore, 'legit_owner_alice', 'event_wedding_99');
      expect(result.exists).toBe(true);
      expect(result.id).toBe('event_wedding_99');
    });
  });

  describe('checkRateLimit', () => {
    it('allows requests within window capacity and rejects requests exceeding limit', () => {
      const uniqueUid = 'rate_tester_' + Date.now();
      for (let i = 1; i <= 5; i++) {
        const res = checkRateLimit(uniqueUid, 5, 60000);
        expect(res.allowed).toBe(true);
      }

      // 6th request within window must be rejected
      const blocked = checkRateLimit(uniqueUid, 5, 60000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  describe('SecurityLogger', () => {
    it('records security events with structured metadata and warning output', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      SecurityLogger.log({
        eventType: 'UNTRUSTED_INPUT_DETECTED',
        severity: 'LOW',
        uid: 'test_user',
        details: { reason: 'suspicious payload' },
      });

      expect(spy).toHaveBeenCalled();
      const recent = SecurityLogger.getRecentEvents(1);
      expect(recent.length).toBe(1);
      expect(recent[0].eventType).toBe('UNTRUSTED_INPUT_DETECTED');
      spy.mockRestore();
    });

    it('records critical/high security events with console.error', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      SecurityLogger.log({
        eventType: 'AUTH_FAILURE',
        severity: 'HIGH',
        uid: 'attacker',
        details: { reason: 'bad token' },
      });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
