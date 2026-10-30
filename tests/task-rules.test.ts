import { describe, it, expect } from 'vitest';
import {
  calculateTaskMetrics,
  isTaskOverdue,
  isTaskDueSoon,
} from '../src/domain/task-rules';
import type { TaskDocument } from '../src/types';

describe('Task Rules & Metrics (TEST_PLAN.md Section 2)', () => {
  it('safely handles zero eligible tasks without dividing by zero', () => {
    const metrics = calculateTaskMetrics([]);
    expect(metrics.totalTasks).toBe(0);
    expect(metrics.completedTasks).toBe(0);
    expect(metrics.pendingTasks).toBe(0);
    expect(metrics.overdueTasks).toBe(0);
    expect(metrics.completionPercentage).toBe(0);
  });

  it('calculates task completion percentage accurately', () => {
    const tasks: TaskDocument[] = [
      {
        id: 't1',
        eventId: 'evt_test',
        revision: 1,
        title: 'Task 1',
        category: 'venue',
        priority: 'high',
        status: 'completed',
        dueAt: '2027-01-01',
        isEventDayTask: false,
        source: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 't2',
        eventId: 'evt_test',
        revision: 1,
        title: 'Task 2',
        category: 'catering',
        priority: 'medium',
        status: 'pending',
        dueAt: '2027-01-02',
        isEventDayTask: false,
        source: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 't3',
        eventId: 'evt_test',
        revision: 1,
        title: 'Task 3',
        category: 'decor',
        priority: 'low',
        status: 'cancelled', // Cancelled tasks are excluded from eligible task completion
        dueAt: '2027-01-03',
        isEventDayTask: false,
        source: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const metrics = calculateTaskMetrics(tasks);
    // 2 eligible tasks (t1, t2), 1 completed -> 50%
    expect(metrics.eligibleTasks).toBe(2);
    expect(metrics.completedTasks).toBe(1);
    expect(metrics.pendingTasks).toBe(1);
    expect(metrics.completionPercentage).toBe(50);
  });

  it('accurately identifies overdue tasks', () => {
    const pastDate = '2020-01-01';
    const futureDate = '2099-01-01';

    const baseTask: TaskDocument = {
      id: 't_test',
      eventId: 'evt_test',
      revision: 1,
      title: 'Test',
      category: 'general',
      priority: 'medium',
      status: 'pending',
      dueAt: pastDate,
      isEventDayTask: false,
      source: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Pending past date -> overdue
    expect(isTaskOverdue({ ...baseTask, status: 'pending', dueAt: pastDate })).toBe(true);
    // Completed past date -> not overdue
    expect(isTaskOverdue({ ...baseTask, status: 'completed', dueAt: pastDate })).toBe(false);
    // Cancelled past date -> not overdue
    expect(isTaskOverdue({ ...baseTask, status: 'cancelled', dueAt: pastDate })).toBe(false);
    // Future date -> not overdue
    expect(isTaskOverdue({ ...baseTask, status: 'pending', dueAt: futureDate })).toBe(false);
  });

  it('accurately identifies tasks due soon', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const baseTask: TaskDocument = {
      id: 't_test',
      eventId: 'evt_test',
      revision: 1,
      title: 'Test',
      category: 'general',
      priority: 'medium',
      status: 'pending',
      dueAt: tomorrowStr,
      isEventDayTask: false,
      source: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(isTaskDueSoon({ ...baseTask, dueAt: tomorrowStr, status: 'pending' }, 3)).toBe(true);
    expect(isTaskDueSoon({ ...baseTask, dueAt: tomorrowStr, status: 'completed' }, 3)).toBe(false);
  });

  it('correctly filters and differentiates event-day tasks from milestone preparation tasks', () => {
    const tasks: TaskDocument[] = [
      {
        id: 'prep_1',
        eventId: 'evt_test',
        revision: 1,
        title: 'Book Florist',
        category: 'decor',
        priority: 'high',
        status: 'completed',
        dueAt: '2027-04-01',
        isEventDayTask: false,
        source: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'day_1',
        eventId: 'evt_test',
        revision: 1,
        title: 'Coordinator Soundcheck & Mic Setup',
        category: 'music',
        priority: 'critical',
        status: 'pending',
        dueAt: '2027-05-20',
        isEventDayTask: true,
        source: 'ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'day_2',
        eventId: 'evt_test',
        revision: 1,
        title: 'Welcome VIP Guests at Main Entrance',
        category: 'reception',
        priority: 'high',
        status: 'pending',
        dueAt: '2027-05-20',
        isEventDayTask: true,
        source: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const eventDayTasks = tasks.filter((t) => t.isEventDayTask);
    const preparationTasks = tasks.filter((t) => !t.isEventDayTask);

    expect(eventDayTasks.length).toBe(2);
    expect(preparationTasks.length).toBe(1);
    expect(eventDayTasks.some((t) => t.priority === 'critical')).toBe(true);
  });
});
