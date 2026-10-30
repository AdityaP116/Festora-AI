import { describe, it, expect } from 'vitest';
import {
  calculateBudgetMetrics,
  formatCurrency,
  toMinorUnits,
  toMajorUnits,
} from '../src/domain/budget';
import type { BudgetCategoryDocument, ExpenseDocument } from '../src/types';

describe('Budget Calculations & Invariants (TEST_PLAN.md Section 2)', () => {
  it('returns zero totals when category and expense lists are empty', () => {
    const metrics = calculateBudgetMetrics(10000000, [], []);
    expect(metrics.budgetLimitMinor).toBe(10000000);
    expect(metrics.estimatedTotalMinor).toBe(0);
    expect(metrics.actualSpendMinor).toBe(0);
    expect(metrics.remainingBudgetMinor).toBe(10000000);
    expect(metrics.isOverBudget).toBe(false);
    expect(metrics.spendPercentage).toBe(0);
  });

  it('correctly sums category estimates', () => {
    const categories: BudgetCategoryDocument[] = [
      {
        id: 'cat_1',
        categoryKey: 'venue',
        name: 'Venue',
        estimatedAmountMinor: 3500000,
        source: 'ai_estimate',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat_2',
        categoryKey: 'catering',
        name: 'Catering',
        estimatedAmountMinor: 3000000,
        source: 'user_estimate',
        updatedAt: new Date().toISOString(),
      },
    ];

    const metrics = calculateBudgetMetrics(10000000, categories, []);
    expect(metrics.estimatedTotalMinor).toBe(6500000);
    expect(metrics.remainingBudgetMinor).toBe(10000000); // Actual spend is still 0
  });

  it('sums actual spend only from eligible non-cancelled incurred expenses', () => {
    const expenses: ExpenseDocument[] = [
      {
        id: 'exp_1',
        description: 'Venue Advance Deposit',
        categoryKey: 'venue',
        actualAmountMinor: 2000000,
        currency: 'INR',
        expenseStatus: 'incurred',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'user',
      },
      {
        id: 'exp_2',
        description: 'Sound System Quote (Planned)',
        categoryKey: 'sound',
        estimatedAmountMinor: 500000,
        actualAmountMinor: 500000,
        currency: 'INR',
        expenseStatus: 'planned', // Planned, not yet incurred
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'user',
      },
      {
        id: 'exp_3',
        description: 'Cancelled Vendor Booking',
        categoryKey: 'decor',
        actualAmountMinor: 1000000,
        currency: 'INR',
        expenseStatus: 'cancelled', // Cancelled must be excluded per TEST_PLAN.md
        paymentStatus: 'refunded',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'user',
      },
    ];

    const metrics = calculateBudgetMetrics(5000000, [], expenses);
    // Only exp_1 is incurred
    expect(metrics.actualSpendMinor).toBe(2000000);
    expect(metrics.remainingBudgetMinor).toBe(3000000);
    expect(metrics.isOverBudget).toBe(false);
  });

  it('triggers over-budget state and negative remaining budget when spend exceeds limit', () => {
    const expenses: ExpenseDocument[] = [
      {
        id: 'exp_1',
        description: 'Luxury Venue Hall',
        categoryKey: 'venue',
        actualAmountMinor: 12000000,
        currency: 'INR',
        expenseStatus: 'incurred',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'user',
      },
    ];

    const metrics = calculateBudgetMetrics(10000000, [], expenses);
    expect(metrics.remainingBudgetMinor).toBe(-2000000);
    expect(metrics.isOverBudget).toBe(true);
    expect(metrics.spendPercentage).toBe(100);
  });

  it('accurately converts major units to minor units without floating point issues', () => {
    expect(toMinorUnits(15000.50)).toBe(1500050);
    expect(toMajorUnits(1500050)).toBe(15000.5);
    expect(toMinorUnits(0)).toBe(0);
  });

  it('formats currency correctly for INR and USD', () => {
    // 100000 minor units = 1000 major units
    const inrFormatted = formatCurrency(10000000, 'INR'); // ₹1,00,000
    expect(inrFormatted).toContain('₹');
    expect(inrFormatted).toContain('1,00,000');

    const usdFormatted = formatCurrency(500000, 'USD'); // $5,000
    expect(usdFormatted).toContain('$');
    expect(usdFormatted).toContain('5,000');
  });

  it('detects category over-allocation when actual spend exceeds estimated category allocation', () => {
    const category: BudgetCategoryDocument = {
      id: 'cat_venue',
      categoryKey: 'venue',
      name: 'Venue & Staging',
      estimatedAmountMinor: 4000000,
      source: 'ai_estimate',
      updatedAt: new Date().toISOString(),
    };

    const expenseOver: ExpenseDocument = {
      id: 'exp_venue_over',
      description: 'Grand Ballroom Premium Booking',
      categoryKey: 'venue',
      actualAmountMinor: 5500000,
      currency: 'INR',
      expenseStatus: 'incurred',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'user',
    };

    const metrics = calculateBudgetMetrics(10000000, [category], [expenseOver]);
    expect(metrics.actualSpendMinor).toBe(5500000);
    // Category allocation variance: 5,500,000 spent vs 4,000,000 allocated
    const categoryOverage = expenseOver.actualAmountMinor - category.estimatedAmountMinor;
    expect(categoryOverage).toBe(1500000);
  });
});
