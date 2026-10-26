import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../src/services/storage';

// In Node environment, mock localStorage for storage service testing
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };
}

describe('Firestore Persistence & Data Model Rules', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Event Lifecycle & Owner Scoping', () => {
    it('creates an event scoped strictly under ownerUid', async () => {
      const event = await StorageService.createEvent({
        ownerUid: 'user_david',
        title: 'David 40th Birthday Celebration',
        eventType: 'birthday',
        startDate: '2027-08-20',
        timezone: 'UTC',
        location: { label: 'Rooftop Bar, Chicago' },
        currency: 'USD',
        guestCount: 60,
        budgetLimitMinor: 800000,
        status: 'planning',
      });

      expect(event.id).toBeDefined();
      expect(event.ownerUid).toBe('user_david');

      const retrieved = await StorageService.getEventById('user_david', event.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.title).toBe('David 40th Birthday Celebration');
    });

    it('denies retrieval when requester UID differs from event owner (cross-tenant isolation)', async () => {
      const event = await StorageService.createEvent({
        ownerUid: 'user_david',
        title: 'Confidential Gala',
        eventType: 'anniversary',
        startDate: '2027-09-01',
        timezone: 'UTC',
        location: { label: 'Private Estate' },
        currency: 'USD',
        guestCount: 40,
        budgetLimitMinor: 1500000,
        status: 'planning',
      });

      const unauthorizedAttempt = await StorageService.getEventById('intruder_mallory', event.id);
      expect(unauthorizedAttempt).toBeNull();
    });

    it('denies deletion when caller is not the owner', async () => {
      const event = await StorageService.createEvent({
        ownerUid: 'user_david',
        title: 'David Anniversary',
        eventType: 'anniversary',
        startDate: '2027-09-01',
        timezone: 'UTC',
        location: { label: 'Private Estate' },
        currency: 'USD',
        guestCount: 40,
        budgetLimitMinor: 1500000,
        status: 'planning',
      });

      await expect(StorageService.deleteEvent('intruder_mallory', event.id)).rejects.toThrowError(
        /PERMISSION_DENIED/
      );
    });
  });

  describe('Subcollections: Tasks, Expenses & Budget Categories', () => {
    it('creates and manages tasks with user/ai origin sources', async () => {
      const event = await StorageService.createEvent({
        ownerUid: 'user_elena',
        title: 'Elena Art Exhibition',
        eventType: 'community_event',
        startDate: '2027-10-10',
        timezone: 'Europe/Paris',
        location: { label: 'Galerie Moderne' },
        currency: 'EUR',
        guestCount: 100,
        budgetLimitMinor: 500000,
        status: 'planning',
      });

      const userTask = await StorageService.createTask({
        eventId: event.id,
        title: 'Order catalog prints',
        category: 'marketing',
        priority: 'high',
        status: 'pending',
        isEventDayTask: false,
        source: 'user',
      });

      expect(userTask.source).toBe('user');
      expect(userTask.status).toBe('pending');

      const tasks = await StorageService.getTasks(event.id);
      expect(tasks.length).toBe(1);

      await StorageService.updateTask(event.id, userTask.id, { status: 'completed' });
      const updatedTasks = await StorageService.getTasks(event.id);
      expect(updatedTasks[0].status).toBe('completed');
    });

    it('creates and tracks expenses with minor-unit currency amounts', async () => {
      const event = await StorageService.createEvent({
        ownerUid: 'user_elena',
        title: 'Elena Gala',
        eventType: 'community_event',
        startDate: '2027-10-10',
        timezone: 'Europe/Paris',
        location: { label: 'Galerie' },
        currency: 'EUR',
        guestCount: 100,
        budgetLimitMinor: 500000,
        status: 'planning',
      });

      const expense = await StorageService.createExpense({
        eventId: event.id,
        description: 'Venue Rental Deposit',
        categoryKey: 'venue',
        actualAmountMinor: 150000,
        estimatedAmountMinor: 150000,
        expenseStatus: 'incurred',
        paymentStatus: 'paid',
      });

      expect(expense.actualAmountMinor).toBe(150000);
      expect(expense.paymentStatus).toBe('paid');

      const expenses = await StorageService.getExpenses(event.id);
      expect(expenses.length).toBe(1);
      expect(expenses[0].description).toBe('Venue Rental Deposit');
    });
  });

  describe('Immutable Plan Versions (Audit Trail)', () => {
    it('applies plan proposals into immutable planVersion snapshots', async () => {
      const event = await StorageService.createEvent({
        ownerUid: 'user_audit_test',
        title: 'Corporate Summit',
        eventType: 'college_event',
        startDate: '2027-11-20',
        timezone: 'UTC',
        location: { label: 'Grand Hall' },
        currency: 'USD',
        guestCount: 200,
        budgetLimitMinor: 10000000,
        status: 'planning',
      });

      const mockPlan = {
        schemaVersion: 1,
        summary: 'Comprehensive plan for Corporate Summit',
        budget: [
          {
            categoryKey: 'venue',
            categoryName: 'Venue & Audio-Visual',
            estimatedAmountMinor: 4000000,
            priority: 'high' as const,
            notes: 'Main auditorium rental',
          },
        ],
        tasks: [
          {
            title: 'Book AV technician',
            category: 'venue',
            priority: 'high' as const,
            status: 'pending' as const,
            isEventDayTask: true,
            source: 'ai' as const,
          },
        ],
        vendors: [],
      };

      const appliedVersion = await StorageService.applyPlanProposal(
        event.id,
        'user_audit_test',
        mockPlan as any
      );

      expect(appliedVersion.version).toBe(1);
      expect(appliedVersion.status).toBe('applied');

      const versions = await StorageService.getPlanVersions(event.id);
      expect(versions.length).toBe(1);
      expect(versions[0].version).toBe(1);
    });
  });
});
