import * as admin from 'firebase-admin';
import {
  ValidatedEventInputSchema,
  type AIPlanProposal,
} from './schemas/ai-schemas';
import { verifyAuthHeader, AuthorizationError } from './services/authorization';
import { checkRateLimit } from './services/rate-limits';
import { callGeminiForPlan } from './services/gemini-client';
import { SecurityLogger } from './services/security-logger';

export interface GenerateEventPlanRequest {
  eventInput: unknown;
  requestId?: string;
}

export interface GenerateEventPlanResponse {
  proposalId: string;
  schemaVersion: 1;
  plan: AIPlanProposal;
  warnings: string[];
}

/**
 * Handles generateEventPlan operation per API_CONTRACTS.md Section 2.
 */
export async function handleGenerateEventPlan(
  authHeader: string | undefined,
  body: GenerateEventPlanRequest,
  firestore: admin.firestore.Firestore
): Promise<GenerateEventPlanResponse> {
  // 1. Authenticate user
  const auth = await verifyAuthHeader(authHeader);

  // 2. Rate limiting check
  const rateLimit = checkRateLimit(auth.uid);
  if (!rateLimit.allowed) {
    SecurityLogger.log({
      eventType: 'RATE_LIMIT_EXCEEDED',
      severity: 'MEDIUM',
      uid: auth.uid,
      endpoint: '/generateEventPlan',
      details: { retryAfterSeconds: rateLimit.retryAfterSeconds },
    });
    throw new AuthorizationError(
      `Rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds}s before generating another plan.`,
      'RESOURCE_EXHAUSTED'
    );
  }

  // 3. Validate input schema
  const parsedInput = ValidatedEventInputSchema.safeParse(body.eventInput);
  if (!parsedInput.success) {
    const errorDetails = parsedInput.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    SecurityLogger.log({
      eventType: 'UNTRUSTED_INPUT_DETECTED',
      severity: 'LOW',
      uid: auth.uid,
      endpoint: '/generateEventPlan',
      details: { issues: parsedInput.error.issues },
    });
    throw new AuthorizationError(`[INVALID_ARGUMENT] Invalid event input: ${errorDetails}`, 'INVALID_ARGUMENT');
  }

  // 4. Generate AI Plan (with invariant verification)
  const plan = await callGeminiForPlan(parsedInput.data);

  // 5. Generate proposal ID and persist proposal draft in planVersions or cache
  const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Optional: Record proposal draft in Firestore if eventId is provided or for audit
  try {
    const proposalsRef = firestore.collection('system_proposals').doc(proposalId);
    await proposalsRef.set({
      proposalId,
      createdByUid: auth.uid,
      requestId: body.requestId || null,
      plan,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'proposed',
    });
  } catch {
    // Non-blocking log if proposal audit collection fails
  }

  return {
    proposalId,
    schemaVersion: 1,
    plan,
    warnings: [
      'Estimates are indicative planning allocations and not binding vendor quotes.',
      'Review dietary, seasonal availability, and contract terms prior to bookings.',
    ],
  };
}
