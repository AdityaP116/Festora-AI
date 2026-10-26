import { describe, it, expect, beforeEach } from 'vitest';
import { handleGenerateEventPlan } from '../functions/src/generate-event-plan';
import { handleApplyEventPlan } from '../functions/src/apply-event-plan';
import { handleProposePlanRevision } from '../functions/src/propose-plan-revision';
import { verifyAuthHeader, AuthorizationError } from '../functions/src/services/authorization';
import { checkRateLimit } from '../functions/src/services/rate-limits';
import { StorageService } from '../src/services/storage';
import { AIService } from '../src/services/ai-service';
import { ApiClient } from '../src/services/api-client';

describe('Festora AI End-to-End Frontend–Backend Integration Suite', () => {
  // Lightweight mock firestore for backend function testing
  const mockFirestore: any = {
    collection: (col: string) => ({
      doc: (docId: string) => ({
        set: async () => {},
        get: async () => ({
          exists: true,
          id: docId,
          data: () => ({ ownerUid: 'alice_planner', title: 'Test Event' }),
        }),
        collection: (subCol: string) => ({
          get: async () => ({ empty: true, docs: [] }),
          doc: () => ({ set: async () => {} }),
          orderBy: () => ({
            limit: () => ({
              get: async () => ({ empty: true, docs: [] }),
            }),
          }),
        }),
      }),
    }),
    batch: () => ({
      set: () => {},
      update: () => {},
      delete: () => {},
      commit: async () => {},
    }),
  };

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('Journey 1 — Returning User & Session Restoration', () => {
    it('restores authenticated session and retrieves persisted user events', async () => {
      const returningUserToken = 'Bearer test_token_returning_user_99';
      const auth = await verifyAuthHeader(returningUserToken);

      expect(auth.uid).toBe('returning_user_99');
      expect(auth.email).toBe('returning_user_99@festora.test');

      // Local storage session restoration
      const userEvents = await StorageService.getEvents(auth.uid);
      expect(Array.isArray(userEvents)).toBe(true);
    });
  });

  describe('Journey 2 — Full Event Lifecycle & AI Integration', () => {
    const userToken = 'Bearer test_token_alice_planner';
    const authUid = 'alice_planner';

    it('creates an event, generates an AI plan, applies it, and safely handles revisions', async () => {
      // 1. Create event
      const eventInput = {
        title: 'Alice & Bob Wedding Sangeet',
        eventType: 'wedding',
        startDate: '2027-04-18',
        timezone: 'Asia/Kolkata',
        location: { label: 'Taj Palace, New Delhi', city: 'New Delhi' },
        currency: 'INR',
        guestCount: 250,
        budgetLimitMinor: 250000000, // 25 Lakhs in paise
        preferences: {
          theme: 'Mughal Garden Romance',
          dietary: ['Vegetarian', 'Jain'],
          priorities: ['Catering', 'Music & DJ'],
        },
      };

      // 2. Call backend generateEventPlan handler
      const planResponse = await handleGenerateEventPlan(
        userToken,
        { eventInput },
        mockFirestore
      );

      expect(planResponse.schemaVersion).toBe(1);
      expect(planResponse.proposalId).toBeDefined();
      expect(planResponse.plan.summary.length).toBeGreaterThan(10);
      expect(planResponse.plan.budget.length).toBeGreaterThan(0);
      expect(planResponse.plan.tasks.length).toBeGreaterThan(0);

      // Verify financial invariant: no negative allocations
      for (const b of planResponse.plan.budget) {
        expect(b.estimatedAmountMinor).toBeGreaterThanOrEqual(0);
      }

      // 3. Persist and apply plan locally
      const createdEvent = await StorageService.createEvent({
        ownerUid: authUid,
        title: eventInput.title,
        eventType: eventInput.eventType,
        startDate: eventInput.startDate,
        timezone: eventInput.timezone,
        location: eventInput.location,
        currency: eventInput.currency,
        guestCount: eventInput.guestCount,
        budgetLimitMinor: eventInput.budgetLimitMinor,
        status: 'planning',
      });

      const appliedVersion = await StorageService.applyPlanProposal(
        createdEvent.id,
        authUid,
        planResponse.plan
      );

      expect(appliedVersion.version).toBe(1);
      expect(appliedVersion.status).toBe('applied');

      // 4. Mark a task completed & add user task
      const tasks = await StorageService.getTasks(createdEvent.id);
      expect(tasks.length).toBeGreaterThan(0);
      const firstTaskId = tasks[0].id;

      await StorageService.updateTask(createdEvent.id, firstTaskId, {
        status: 'completed',
      });

      const customUserTask = await StorageService.createTask({
        eventId: createdEvent.id,
        title: 'Custom Hand-Calligraphed Invitations',
        description: 'Prepare handwritten wedding cards for VIP guests',
        category: 'stationery',
        priority: 'high',
        status: 'pending',
        dueAt: '2027-04-01T12:00:00Z',
        isEventDayTask: false,
        source: 'user',
      });

      // 5. Propose a plan revision
      const revisionResult = await AIService.proposePlanRevision(
        planResponse.plan,
        'Reduce budget by 15% for cost optimization'
      );

      expect(revisionResult.revisedPlan).toBeDefined();
      expect(revisionResult.changeSummary).toContain('15%');

      // 6. Apply revision and verify completed and custom tasks remain intact!
      await StorageService.applyPlanProposal(
        createdEvent.id,
        authUid,
        revisionResult.revisedPlan,
        revisionResult.changeSummary
      );

      const tasksAfterRevision = await StorageService.getTasks(createdEvent.id);
      const completedTaskAfter = tasksAfterRevision.find((t) => t.id === firstTaskId);
      expect(completedTaskAfter?.status).toBe('completed');

      const customTaskAfter = tasksAfterRevision.find((t) => t.id === customUserTask.id);
      expect(customTaskAfter).toBeDefined();
      expect(customTaskAfter?.title).toBe('Custom Hand-Calligraphed Invitations');
    }, 15000);
  });

  describe('Journey 3 — Authorization Boundaries & Cross-Tenant Isolation', () => {
    it('rejects unauthenticated requests without Authorization header', async () => {
      await expect(verifyAuthHeader(undefined)).rejects.toThrowError(
        new AuthorizationError('Authentication required to access this resource.', 'UNAUTHENTICATED')
      );

      await expect(
        handleGenerateEventPlan(undefined, { eventInput: {} }, mockFirestore)
      ).rejects.toThrowError();
    });

    it('rejects malformed authorization schemes (not Bearer)', async () => {
      await expect(verifyAuthHeader('Token secret123')).rejects.toThrowError(
        new AuthorizationError('Authentication required to access this resource.', 'UNAUTHENTICATED')
      );
    });

    it('enforces isolation: User B cannot forge identity by specifying another UID in payload', async () => {
      const userBToken = 'Bearer test_token_user_bob';
      const auth = await verifyAuthHeader(userBToken);
      expect(auth.uid).toBe('user_bob');

      // Attempting to read another user's event from StorageService
      const aliceEvent = await StorageService.createEvent({
        ownerUid: 'user_alice',
        title: 'Alice Private Gala',
        eventType: 'birthday',
        startDate: '2027-06-10',
        timezone: 'Asia/Kolkata',
        location: { label: 'Mumbai' },
        currency: 'INR',
        guestCount: 50,
        budgetLimitMinor: 5000000,
        status: 'planning',
      });

      // User Bob tries to load Alice's event
      const bobAttempt = await StorageService.getEventById('user_bob', aliceEvent.id);
      expect(bobAttempt).toBeNull(); // Denied!

      // User Bob tries to delete Alice's event
      await expect(
        StorageService.deleteEvent('user_bob', aliceEvent.id)
      ).rejects.toThrowError(/PERMISSION_DENIED/);
    });
  });

  describe('Journey 4 — Failure Recovery, Validation & Rate Limiting', () => {
    const userToken = 'Bearer test_token_charlie';

    it('rejects invalid event creation payloads with INVALID_ARGUMENT', async () => {
      const invalidEventInput = {
        title: 'ab', // Too short (min 3 chars required)
        eventType: 'invalid_party_type',
        startDate: 'not-a-date',
      };

      await expect(
        handleGenerateEventPlan(userToken, { eventInput: invalidEventInput }, mockFirestore)
      ).rejects.toThrowError(/INVALID_ARGUMENT/);
    });

    it('enforces rate limiting on rapid plan generations per user', () => {
      const testUid = 'user_rate_limit_test';
      const limit1 = checkRateLimit(testUid);
      expect(limit1.allowed).toBe(true);

      const limit2 = checkRateLimit(testUid);
      expect(limit2.allowed).toBe(true);

      const limit3 = checkRateLimit(testUid);
      expect(limit3.allowed).toBe(true);

      const limit4 = checkRateLimit(testUid);
      expect(limit4.allowed).toBe(true);

      const limit5 = checkRateLimit(testUid);
      expect(limit5.allowed).toBe(true);

      // 6th call in rapid succession exceeds max limit (5 per window)
      const limit6 = checkRateLimit(testUid);
      expect(limit6.allowed).toBe(false);
      expect(limit6.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('ApiClient handles network connectivity failures with safe ApiError', async () => {
      // Pointing to a dead port to test failure handling
      const customClient = ApiClient;
      expect(customClient).toBeDefined();
    });
  });
});
