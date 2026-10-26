import { describe, it, expect } from 'vitest';
import {
  calculateBudgetMetrics,
  formatCurrency,
} from '../src/domain/budget';
import { calculateTaskMetrics } from '../src/domain/task-rules';
import type { BudgetCategoryDocument, ExpenseDocument, TaskDocument } from '../src/types';

describe('Performance Benchmarks & High Payload Stress Tests', () => {
  it('efficiently calculates budget metrics across 1,000 budget categories and expenses within 50ms', () => {
    const largeCategories: BudgetCategoryDocument[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `cat_${i}`,
      categoryKey: `category_${i % 10}`,
      categoryName: `Category ${i % 10}`,
      estimatedAmountMinor: 100000 + i * 10,
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const largeExpenses: ExpenseDocument[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `exp_${i}`,
      eventId: 'perf_event',
      description: `Expense item ${i}`,
      categoryKey: `cat_${i % 5}`,
      actualAmountMinor: 50000,
      estimatedAmountMinor: 50000,
      expenseStatus: i % 10 === 0 ? 'cancelled' : 'incurred',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const startTime = performance.now();
    const metrics = calculateBudgetMetrics(100000000, largeCategories, largeExpenses);
    const duration = performance.now() - startTime;

    expect(metrics.actualSpendMinor).toBe(900 * 50000);
    expect(metrics.estimatedTotalMinor).toBeGreaterThan(0);
    expect(duration).toBeLessThan(50);
  });

  it('computes task metrics across 5,000 tasks in under 50ms', () => {
    const largeTasks: TaskDocument[] = Array.from({ length: 5000 }, (_, i) => ({
      id: `task_${i}`,
      eventId: 'perf_event',
      title: `Task ${i}`,
      category: 'general',
      priority: 'medium',
      status: i % 2 === 0 ? 'completed' : 'pending',
      isEventDayTask: false,
      source: 'ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const startTime = performance.now();
    const metrics = calculateTaskMetrics(largeTasks);
    const duration = performance.now() - startTime;

    expect(metrics.completionPercentage).toBe(50);
    expect(metrics.completedTasks).toBe(2500);
    expect(duration).toBeLessThan(50);
  });

  it('formats currency minor unit values within reasonable bounds across 1,000 iterations', () => {
    // In Node.js / V8 environments, repeated Intl.NumberFormat instantiation has small initialization overhead
    const startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      formatCurrency(i * 12500, 'INR');
    }
    const duration = performance.now() - startTime;
    // Assert sanity: 1,000 formatted values completed comfortably under 1000ms
    expect(duration).toBeLessThan(1000);
  });
});
