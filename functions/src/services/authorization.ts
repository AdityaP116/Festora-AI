import * as admin from 'firebase-admin';

export interface AuthContext {
  uid: string;
  email?: string;
}

export class AuthorizationError extends Error {
  code: string;
  retryAfterSeconds?: number;
  limit?: number;
  remaining?: number;
  constructor(
    message: string,
    code = 'PERMISSION_DENIED',
    meta?: { retryAfterSeconds?: number; limit?: number; remaining?: number }
  ) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    if (meta) {
      this.retryAfterSeconds = meta.retryAfterSeconds;
      this.limit = meta.limit;
      this.remaining = meta.remaining;
    }
  }
}

/**
 * Extracts and verifies the caller's Firebase Auth token from an Authorization header.
 * Never trusts a client-provided body parameter for identity.
 */
export async function verifyAuthHeader(authHeader?: string): Promise<AuthContext> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required to access this resource.', 'UNAUTHENTICATED');
  }

  const idToken = authHeader.split('Bearer ')[1].trim();
  if (!idToken) {
    throw new AuthorizationError('Malformed authorization token.', 'UNAUTHENTICATED');
  }

  // Fail-closed security rule: Never allow mock tokens if NODE_ENV is production
  const isProduction = process.env.NODE_ENV === 'production';
  const isExplicitDevOrTest =
    !isProduction &&
    (process.env.NODE_ENV === 'test' ||
      (process.env.NODE_ENV === 'development' && process.env.FUNCTIONS_EMULATOR === 'true'));

  // Development/Test mock token bypass strictly restricted to isolated test/emulator environments
  if (
    isExplicitDevOrTest &&
    (idToken.startsWith('test_token_') || idToken.startsWith('dev_token_'))
  ) {
    const testUid = idToken.replace(/^(test_token_|dev_token_)/, '');
    return { uid: testUid, email: `${testUid}@festora.test` };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch {
    throw new AuthorizationError('Invalid or expired authentication token.', 'UNAUTHENTICATED');
  }
}

/**
 * Asserts that the authenticated user is the legitimate owner of the target event.
 * Follows DATA_MODEL.md: events are stored at users/{ownerUid}/events/{eventId}.
 */
export async function verifyEventOwnership(
  firestore: admin.firestore.Firestore,
  ownerUid: string,
  eventId: string
): Promise<admin.firestore.DocumentSnapshot> {
  if (!ownerUid || !eventId) {
    throw new AuthorizationError('Missing required owner or event identifier.', 'INVALID_ARGUMENT');
  }

  const eventRef = firestore
    .collection('users')
    .doc(ownerUid)
    .collection('events')
    .doc(eventId);

  const snap = await eventRef.get();
  if (!snap.exists) {
    throw new AuthorizationError('Event not found or access denied.', 'NOT_FOUND');
  }

  const data = snap.data();
  if (data?.ownerUid && data.ownerUid !== ownerUid) {
    throw new AuthorizationError('You do not have permission to access or modify this event.', 'PERMISSION_DENIED');
  }

  return snap;
}
