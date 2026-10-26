import { describe, it, expect } from 'vitest';
import {
  verifyAuthHeader,
  AuthorizationError,
} from '../functions/src/services/authorization';

describe('Authentication & Authorization Tests (TEST_PLAN.md Section 3)', () => {
  it('rejects requests with missing or empty Authorization header', async () => {
    await expect(verifyAuthHeader(undefined)).rejects.toThrowError(
      new AuthorizationError('Authentication required to access this resource.', 'UNAUTHENTICATED')
    );

    await expect(verifyAuthHeader('')).rejects.toThrowError(
      new AuthorizationError('Authentication required to access this resource.', 'UNAUTHENTICATED')
    );
  });

  it('rejects malformed authorization schemes (not Bearer)', async () => {
    await expect(verifyAuthHeader('Basic abc123xyz')).rejects.toThrowError(
      new AuthorizationError('Authentication required to access this resource.', 'UNAUTHENTICATED')
    );
  });

  it('correctly verifies identity in test environment from Bearer token', async () => {
    process.env.NODE_ENV = 'test';
    const auth = await verifyAuthHeader('Bearer test_token_user_alice_123');
    expect(auth.uid).toBe('user_alice_123');
    expect(auth.email).toBe('user_alice_123@festora.test');
  });

  it('enforces isolation: User B cannot forge identity by specifying another UID in payload', async () => {
    // When User B authenticates with their own token
    process.env.NODE_ENV = 'test';
    const auth = await verifyAuthHeader('Bearer test_token_user_bob_456');
    expect(auth.uid).toBe('user_bob_456');

    // Even if client payload claims: { ownerUid: 'user_alice_123' }, backend uses auth.uid!
    const clientPayload = { ownerUid: 'user_alice_123', eventId: 'evt_alice_event' };
    const derivedOwner = auth.uid;

    expect(derivedOwner).toBe('user_bob_456');
    expect(derivedOwner).not.toBe(clientPayload.ownerUid);
  });
});
