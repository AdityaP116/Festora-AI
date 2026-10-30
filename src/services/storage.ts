import type {
  EventDocument,
  TaskDocument,
  ExpenseDocument,
  BudgetCategoryDocument,
  VendorDocument,
  GuestDocument,
  PlanVersionDocument,
  AIPlanProposal,
} from '../types';

const STORAGE_KEY = 'festora_ai_storage_v1';

interface FestoraStorageState {
  events: Record<string, EventDocument>;
  tasks: Record<string, TaskDocument[]>;
  expenses: Record<string, ExpenseDocument[]>;
  budgetCategories: Record<string, BudgetCategoryDocument[]>;
  vendors: Record<string, VendorDocument[]>;
  guests: Record<string, GuestDocument[]>;
  planVersions: Record<string, PlanVersionDocument[]>;
  customSchedules: Record<string, import('../types').AIScheduleItem[]>;
  customMilestones: Record<string, import('../types').AIMilestoneItem[]>;
}

// Fallback in-memory storage when running in non-browser/test environments (e.g. Node/Vitest)
const inMemoryStore: Record<string, string> = {};

function loadState(): FestoraStorageState {
  try {
    const raw = typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : inMemoryStore[STORAGE_KEY];
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        events: parsed.events || {},
        tasks: parsed.tasks || {},
        expenses: parsed.expenses || {},
        budgetCategories: parsed.budgetCategories || {},
        vendors: parsed.vendors || {},
        guests: parsed.guests || {},
        planVersions: parsed.planVersions || {},
        customSchedules: parsed.customSchedules || {},
        customMilestones: parsed.customMilestones || {},
      };
    }
  } catch (err) {
    console.error('Failed to parse Festora local storage:', err);
  }
  return {
    events: {},
    tasks: {},
    expenses: {},
    budgetCategories: {},
    vendors: {},
    guests: {},
    planVersions: {},
    customSchedules: {},
    customMilestones: {},
  };
}

function saveState(state: FestoraStorageState) {
  try {
    const serialized = JSON.stringify(state);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, serialized);
    } else {
      inMemoryStore[STORAGE_KEY] = serialized;
    }
  } catch (err) {
    console.error('Failed to save Festora local storage:', err);
  }
}

// Generate simple collision-resistant ID
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

import { ApiClient } from './api-client';

export const StorageService = {
  // Events
  async getEvents(ownerUid: string): Promise<EventDocument[]> {
    const state = loadState();

    // Try synchronizing with backend if online
    try {
      const serverEvents = await ApiClient.getEvents();
      if (Array.isArray(serverEvents) && serverEvents.length > 0) {
        for (const evt of serverEvents) {
          if (evt.id && evt.ownerUid === ownerUid) {
            state.events[evt.id] = { ...state.events[evt.id], ...evt };
          }
        }
        saveState(state);
      }
    } catch {
      // Offline or local development fallback
    }

    return Object.values(state.events)
      .filter((e) => e.ownerUid === ownerUid && e.status !== 'archived')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getEventById(ownerUid: string, eventId: string): Promise<EventDocument | null> {
    const state = loadState();

    // Try fetching from backend if online
    try {
      const serverEvent = await ApiClient.getEventById(eventId);
      if (serverEvent && serverEvent.id && serverEvent.ownerUid === ownerUid) {
        state.events[serverEvent.id] = { ...state.events[serverEvent.id], ...serverEvent };
        saveState(state);
        return state.events[serverEvent.id];
      }
    } catch {
      // Offline fallback
    }

    const event = state.events[eventId];
    if (!event || event.ownerUid !== ownerUid) {
      return null;
    }
    return event;
  },

  async createEvent(
    data: Omit<EventDocument, 'id' | 'createdAt' | 'updatedAt' | 'schemaVersion'>
  ): Promise<EventDocument> {
    const state = loadState();
    const now = new Date().toISOString();
    const id = generateId('evt');

    let createdId = id;

    // Try synchronizing event creation with backend if reachable
    try {
      const serverEvent = await ApiClient.createEvent(data);
      if (serverEvent && serverEvent.id) {
        createdId = serverEvent.id;
      }
    } catch (syncErr) {
      const g = globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } };
      if (g.process?.env?.NODE_ENV !== 'test') {
        console.warn('Event created in local workspace; cloud sync offline or deferred:', syncErr);
      }
    }

    const newEvent: EventDocument = {
      ...data,
      id: createdId,
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
    };

    state.events[createdId] = newEvent;
    state.tasks[createdId] = state.tasks[createdId] || [];
    state.expenses[createdId] = state.expenses[createdId] || [];
    state.budgetCategories[createdId] = state.budgetCategories[createdId] || [];
    state.vendors[createdId] = state.vendors[createdId] || [];
    state.guests[createdId] = state.guests[createdId] || [];
    state.planVersions[createdId] = state.planVersions[createdId] || [];

    saveState(state);
    return newEvent;
  },

  async updateEvent(
    ownerUid: string,
    eventId: string,
    updates: Partial<EventDocument>
  ): Promise<EventDocument> {
    const state = loadState();
    const event = state.events[eventId];
    if (!event || event.ownerUid !== ownerUid) {
      throw new Error('PERMISSION_DENIED: Event not found or unauthorized');
    }

    const updatedEvent: EventDocument = {
      ...event,
      ...updates,
      id: event.id,
      ownerUid: event.ownerUid,
      updatedAt: new Date().toISOString(),
    };

    state.events[eventId] = updatedEvent;
    saveState(state);
    return updatedEvent;
  },

  async deleteEvent(ownerUid: string, eventId: string): Promise<void> {
    const state = loadState();
    const event = state.events[eventId];
    if (!event || event.ownerUid !== ownerUid) {
      throw new Error('PERMISSION_DENIED: Event not found or unauthorized');
    }

    // Try deleting on backend if online
    try {
      await ApiClient.deleteEvent(eventId);
    } catch {
      // Offline fallback
    }

    delete state.events[eventId];
    delete state.tasks[eventId];
    delete state.expenses[eventId];
    delete state.budgetCategories[eventId];
    delete state.vendors[eventId];
    delete state.guests[eventId];
    delete state.planVersions[eventId];

    saveState(state);
  },

  // Tasks
  async getTasks(ownerOrEventId: string, maybeEventId?: string): Promise<TaskDocument[]> {
    const eventId = maybeEventId ?? ownerOrEventId;
    const state = loadState();
    return (state.tasks[eventId] || []).slice();
  },

  async createTask(
    ownerOrData: string | Omit<TaskDocument, 'id' | 'createdAt' | 'updatedAt' | 'revision'>,
    maybeEventId?: string,
    maybeData?: Omit<TaskDocument, 'id' | 'createdAt' | 'updatedAt' | 'revision' | 'eventId'>
  ): Promise<TaskDocument> {
    const state = loadState();
    const now = new Date().toISOString();
    let data: Omit<TaskDocument, 'id' | 'createdAt' | 'updatedAt' | 'revision'>;

    if (typeof ownerOrData === 'string' && maybeEventId && maybeData) {
      data = { ...maybeData, eventId: maybeEventId };
    } else {
      data = ownerOrData as Omit<TaskDocument, 'id' | 'createdAt' | 'updatedAt' | 'revision'>;
    }

    const newTask: TaskDocument = {
      ...data,
      id: generateId('task'),
      revision: 1,
      createdAt: now,
      updatedAt: now,
    };

    if (!state.tasks[data.eventId]) {
      state.tasks[data.eventId] = [];
    }
    state.tasks[data.eventId].unshift(newTask);
    saveState(state);
    return newTask;
  },

  async updateTask(
    ownerOrEventId: string,
    eventOrTaskId: string,
    taskOrUpdates: string | Partial<TaskDocument>,
    maybeUpdates?: Partial<TaskDocument>
  ): Promise<TaskDocument> {
    const state = loadState();
    let eventId: string;
    let taskId: string;
    let updates: Partial<TaskDocument>;

    if (maybeUpdates !== undefined) {
      eventId = eventOrTaskId;
      taskId = taskOrUpdates as string;
      updates = maybeUpdates;
    } else {
      eventId = ownerOrEventId;
      taskId = eventOrTaskId;
      updates = taskOrUpdates as Partial<TaskDocument>;
    }

    const list = state.tasks[eventId] || [];
    const index = list.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error('NOT_FOUND: Task not found');
    }

    const current = list[index];
    const isNowCompleted = updates.status === 'completed' && current.status !== 'completed';
    const isNowUncompleted = updates.status && updates.status !== 'completed' && current.status === 'completed';

    const updated: TaskDocument = {
      ...current,
      ...updates,
      id: current.id,
      eventId: current.eventId,
      revision: current.revision + 1,
      updatedAt: new Date().toISOString(),
      completedAt: isNowCompleted ? new Date().toISOString() : isNowUncompleted ? undefined : current.completedAt,
    };

    list[index] = updated;
    state.tasks[eventId] = list;
    saveState(state);
    return updated;
  },

  async deleteTask(eventId: string, taskId: string): Promise<void> {
    const state = loadState();
    const list = state.tasks[eventId] || [];
    state.tasks[eventId] = list.filter((t) => t.id !== taskId);
    saveState(state);
  },

  // Expenses
  async getExpenses(ownerOrEventId: string, maybeEventId?: string): Promise<ExpenseDocument[]> {
    const eventId = maybeEventId ?? ownerOrEventId;
    const state = loadState();
    return (state.expenses[eventId] || []).slice();
  },

  async createExpense(
    ownerOrData: string | Omit<ExpenseDocument, 'id' | 'createdAt' | 'updatedAt'>,
    maybeEventId?: string,
    maybeData?: Omit<ExpenseDocument, 'id' | 'createdAt' | 'updatedAt' | 'eventId'>
  ): Promise<ExpenseDocument> {
    const state = loadState();
    const now = new Date().toISOString();
    let data: Omit<ExpenseDocument, 'id' | 'createdAt' | 'updatedAt'>;

    if (typeof ownerOrData === 'string' && maybeEventId && maybeData) {
      data = { ...maybeData, eventId: maybeEventId };
    } else {
      data = ownerOrData as Omit<ExpenseDocument, 'id' | 'createdAt' | 'updatedAt'>;
    }

    const newExpense: ExpenseDocument = {
      ...data,
      id: generateId('exp'),
      createdAt: now,
      updatedAt: now,
    };

    if (!state.expenses[data.eventId]) {
      state.expenses[data.eventId] = [];
    }
    state.expenses[data.eventId].unshift(newExpense);
    saveState(state);
    return newExpense;
  },

  async updateExpense(
    eventId: string,
    expenseId: string,
    updates: Partial<ExpenseDocument>
  ): Promise<ExpenseDocument> {
    const state = loadState();
    const list = state.expenses[eventId] || [];
    const index = list.findIndex((e) => e.id === expenseId);
    if (index === -1) {
      throw new Error('NOT_FOUND: Expense not found');
    }

    const updated: ExpenseDocument = {
      ...list[index],
      ...updates,
      id: list[index].id,
      eventId: list[index].eventId,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    state.expenses[eventId] = list;
    saveState(state);
    return updated;
  },

  async deleteExpense(eventId: string, expenseId: string): Promise<void> {
    const state = loadState();
    const list = state.expenses[eventId] || [];
    state.expenses[eventId] = list.filter((e) => e.id !== expenseId);
    saveState(state);
  },

  // Budget Categories
  async getBudgetCategories(eventId: string): Promise<BudgetCategoryDocument[]> {
    const state = loadState();
    return (state.budgetCategories[eventId] || []).slice();
  },

  async setBudgetCategories(eventId: string, categories: BudgetCategoryDocument[]): Promise<void> {
    const state = loadState();
    state.budgetCategories[eventId] = categories;
    saveState(state);
  },

  // Vendors
  async getVendors(eventId: string): Promise<VendorDocument[]> {
    const state = loadState();
    return (state.vendors[eventId] || []).slice();
  },

  async createVendor(
    data: Omit<VendorDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<VendorDocument> {
    const state = loadState();
    const now = new Date().toISOString();
    const newVendor: VendorDocument = {
      ...data,
      id: generateId('vnd'),
      createdAt: now,
      updatedAt: now,
    };

    if (!state.vendors[data.eventId]) {
      state.vendors[data.eventId] = [];
    }
    state.vendors[data.eventId].unshift(newVendor);
    saveState(state);
    return newVendor;
  },

  async updateVendor(
    eventId: string,
    vendorId: string,
    updates: Partial<VendorDocument>
  ): Promise<VendorDocument> {
    const state = loadState();
    const list = state.vendors[eventId] || [];
    const index = list.findIndex((v) => v.id === vendorId);
    if (index === -1) {
      throw new Error('NOT_FOUND: Vendor not found');
    }

    const updated: VendorDocument = {
      ...list[index],
      ...updates,
      id: list[index].id,
      eventId: list[index].eventId,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    state.vendors[eventId] = list;
    saveState(state);
    return updated;
  },

  async deleteVendor(eventId: string, vendorId: string): Promise<void> {
    const state = loadState();
    const list = state.vendors[eventId] || [];
    state.vendors[eventId] = list.filter((v) => v.id !== vendorId);
    saveState(state);
  },

  // Guests
  async getGuests(eventId: string): Promise<GuestDocument[]> {
    const state = loadState();
    return (state.guests[eventId] || []).slice();
  },

  async createGuest(
    data: Omit<GuestDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<GuestDocument> {
    const state = loadState();
    const now = new Date().toISOString();
    const newGuest: GuestDocument = {
      ...data,
      id: generateId('gst'),
      createdAt: now,
      updatedAt: now,
    };

    if (!state.guests[data.eventId]) {
      state.guests[data.eventId] = [];
    }
    state.guests[data.eventId].unshift(newGuest);
    saveState(state);
    return newGuest;
  },

  async updateGuest(
    eventId: string,
    guestId: string,
    updates: Partial<GuestDocument>
  ): Promise<GuestDocument> {
    const state = loadState();
    const list = state.guests[eventId] || [];
    const index = list.findIndex((g) => g.id === guestId);
    if (index === -1) {
      throw new Error('NOT_FOUND: Guest not found');
    }

    const updated: GuestDocument = {
      ...list[index],
      ...updates,
      id: list[index].id,
      eventId: list[index].eventId,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    state.guests[eventId] = list;
    saveState(state);
    return updated;
  },

  async deleteGuest(eventId: string, guestId: string): Promise<void> {
    const state = loadState();
    const list = state.guests[eventId] || [];
    state.guests[eventId] = list.filter((g) => g.id !== guestId);
    saveState(state);
  },

  // Custom Timeline Items (Schedule slots & Milestones)
  async getCustomSchedule(eventId: string): Promise<import('../types').AIScheduleItem[]> {
    const state = loadState();
    return (state.customSchedules[eventId] || []).slice();
  },

  async addCustomScheduleItem(eventId: string, item: import('../types').AIScheduleItem): Promise<import('../types').AIScheduleItem[]> {
    const state = loadState();
    if (!state.customSchedules[eventId]) {
      state.customSchedules[eventId] = [];
    }
    state.customSchedules[eventId].push(item);
    saveState(state);
    return state.customSchedules[eventId].slice();
  },

  async getCustomMilestones(eventId: string): Promise<import('../types').AIMilestoneItem[]> {
    const state = loadState();
    return (state.customMilestones[eventId] || []).slice();
  },

  async addCustomMilestone(eventId: string, milestone: import('../types').AIMilestoneItem): Promise<import('../types').AIMilestoneItem[]> {
    const state = loadState();
    if (!state.customMilestones[eventId]) {
      state.customMilestones[eventId] = [];
    }
    state.customMilestones[eventId].push(milestone);
    saveState(state);
    return state.customMilestones[eventId].slice();
  },

  // Plan Versions
  async getPlanVersions(eventId: string): Promise<PlanVersionDocument[]> {
    const state = loadState();
    return (state.planVersions[eventId] || []).slice();
  },

  async savePlanVersion(planVersion: PlanVersionDocument): Promise<void> {
    const state = loadState();
    if (!state.planVersions[planVersion.eventId]) {
      state.planVersions[planVersion.eventId] = [];
    }
    state.planVersions[planVersion.eventId].unshift(planVersion);
    saveState(state);
  },

  /**
   * Applies an AI proposal safely into the event's live records:
   * 1. Preserves completed tasks and user notes.
   * 2. Preserves all actual expense records.
   * 3. Upserts budget categories.
   * 4. Adds proposed tasks that don't already exist.
   * 5. Saves a versioned plan snapshot with status 'applied'.
   */
  async applyPlanProposal(
    eventId: string,
    ownerUid: string,
    proposal: AIPlanProposal,
    changeSummary = 'Initial AI event plan applied'
  ): Promise<PlanVersionDocument> {
    const state = loadState();
    const now = new Date().toISOString();
    const versions = state.planVersions[eventId] || [];
    const maxVersion = versions.reduce((max, v) => (v.version > max ? v.version : max), 0);
    const nextVersionNumber = maxVersion + 1;

    // 1. Create plan version snapshot
    const planVersion: PlanVersionDocument = {
      id: generateId('pv'),
      eventId,
      version: nextVersionNumber,
      schemaVersion: 1,
      generatedAt: now,
      modelId: 'gemini-1.5-pro-preview',
      inputsSnapshot: state.events[eventId] as unknown as Record<string, unknown>,
      plan: proposal,
      changeSummary,
      createdByUid: ownerUid,
      status: 'applied',
    };

    // 2. Upsert Budget Categories from proposal
    const categories: BudgetCategoryDocument[] = proposal.budget.map((b) => ({
      id: generateId('cat'),
      eventId,
      name: b.label,
      categoryKey: b.categoryKey,
      estimatedAmountMinor: b.estimatedAmountMinor,
      source: 'ai_estimate',
      notes: b.rationale,
      updatedAt: now,
      planVersionId: planVersion.id,
    }));
    state.budgetCategories[eventId] = categories;

    // 3. Merge Tasks safely without overwriting completed tasks
    const existingTasks = state.tasks[eventId] || [];
    const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase().trim()));
    const newTasks: TaskDocument[] = [...existingTasks];

    for (const aiTask of proposal.tasks) {
      if (!existingTitles.has(aiTask.title.toLowerCase().trim())) {
        newTasks.push({
          id: generateId('task'),
          eventId,
          title: aiTask.title,
          description: aiTask.description,
          category: aiTask.categoryKey,
          priority: aiTask.priority,
          status: 'pending',
          dueAt: aiTask.dueDate ? `${aiTask.dueDate}T12:00:00Z` : undefined,
          isEventDayTask: aiTask.isEventDayTask,
          source: 'ai',
          planVersionId: planVersion.id,
          createdAt: now,
          updatedAt: now,
          revision: 1,
        });
      }
    }
    state.tasks[eventId] = newTasks;

    // 4. Update Event Preferences if theme suggested
    if (state.events[eventId] && proposal.theme) {
      state.events[eventId] = {
        ...state.events[eventId],
        preferences: {
          ...state.events[eventId].preferences,
          theme: proposal.theme.name,
        },
        updatedAt: now,
      };
    }

    // 5. Store plan version (bounded to max 10 historical versions to prevent quota exhaustion)
    if (!state.planVersions[eventId]) {
      state.planVersions[eventId] = [];
    }
    state.planVersions[eventId].unshift(planVersion);
    if (state.planVersions[eventId].length > 10) {
      state.planVersions[eventId] = state.planVersions[eventId].slice(0, 10);
    }

    saveState(state);

    // Try synchronizing plan application with backend if online
    try {
      await ApiClient.applyEventPlan(eventId, planVersion.id, proposal, changeSummary);
    } catch (syncErr) {
      const g = globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } };
      if (g.process?.env?.NODE_ENV !== 'test') {
        console.warn('Plan applied to local workspace; cloud sync offline or deferred:', syncErr);
      }
    }

    return planVersion;
  },

  /**
   * Clears all local workspace and personal offline cache (e.g. on user sign out).
   */
  clearWorkspaceData(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    delete inMemoryStore[STORAGE_KEY];
  },
};
