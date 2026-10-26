import type { BudgetCategoryDocument, ExpenseDocument } from '../types';

export interface BudgetMetrics {
  budgetLimitMinor: number;
  estimatedTotalMinor: number;
  actualSpendMinor: number;
  remainingBudgetMinor: number;
  projectedSpendMinor: number;
  varianceMinor: number;
  isOverBudget: boolean;
  spendPercentage: number;
}

/**
 * Calculates deterministic budget metrics according to DATA_MODEL.md:
 * - Estimated total = sum of active category estimates
 * - Actual spend = sum of non-cancelled incurred expenses with actual amounts
 * - Remaining budget = budget limit - actual spend
 * - Projected final spend = actual spend + estimates for remaining planned expenses
 * - Variance = projected final spend - budget limit
 */
export function calculateBudgetMetrics(
  budgetLimitMinor: number,
  categories: BudgetCategoryDocument[],
  expenses: ExpenseDocument[]
): BudgetMetrics {
  // Sum of active category estimates
  const estimatedTotalMinor = categories.reduce((sum, cat) => {
    return sum + (cat.estimatedAmountMinor > 0 ? cat.estimatedAmountMinor : 0);
  }, 0);

  // Actual spend: non-cancelled incurred expenses with actual amounts
  const actualSpendMinor = expenses.reduce((sum, exp) => {
    if (exp.expenseStatus === 'incurred' && typeof exp.actualAmountMinor === 'number') {
      return sum + Math.max(0, exp.actualAmountMinor);
    }
    return sum;
  }, 0);

  // Remaining budget: budget limit - actual spend
  const remainingBudgetMinor = budgetLimitMinor - actualSpendMinor;

  // Planned expenses that haven't been incurred yet
  const remainingPlannedMinor = expenses.reduce((sum, exp) => {
    if (exp.expenseStatus === 'planned' && typeof exp.estimatedAmountMinor === 'number') {
      return sum + Math.max(0, exp.estimatedAmountMinor);
    }
    return sum;
  }, 0);

  // Projected spend
  const projectedSpendMinor = actualSpendMinor + remainingPlannedMinor;
  const varianceMinor = projectedSpendMinor - budgetLimitMinor;
  const isOverBudget = actualSpendMinor > budgetLimitMinor || projectedSpendMinor > budgetLimitMinor;

  const spendPercentage = budgetLimitMinor > 0 
    ? Math.min(100, Math.round((actualSpendMinor / budgetLimitMinor) * 100))
    : 0;

  return {
    budgetLimitMinor,
    estimatedTotalMinor,
    actualSpendMinor,
    remainingBudgetMinor,
    projectedSpendMinor,
    varianceMinor,
    isOverBudget,
    spendPercentage,
  };
}

const CURRENCY_EXPONENTS: Record<string, number> = {
  // 0 decimals
  JPY: 0,
  KRW: 0,
  VND: 0,
  CLP: 0,
  // 3 decimals
  BHD: 3,
  KWD: 3,
  OMR: 3,
  JOD: 3,
  // Default is 2 (INR, USD, EUR, GBP, AED, CAD, AUD, etc.)
};

export function getCurrencyExponent(currency = 'INR'): number {
  const upper = (currency || 'INR').toUpperCase();
  return upper in CURRENCY_EXPONENTS ? CURRENCY_EXPONENTS[upper] : 2;
}

/**
 * Currency-aware formatting from minor units to formatted currency string.
 * Supports INR (Indian numbering system ₹1,00,000), USD ($100,000), EUR, GBP, JPY, KWD, etc.
 */
export function formatCurrency(amountMinor: number, currency = 'INR'): string {
  const isNegative = amountMinor < 0;
  const absoluteMinor = Math.abs(amountMinor);
  const exponent = getCurrencyExponent(currency);
  const divisor = Math.pow(10, exponent);
  
  const majorAmount = absoluteMinor / divisor;

  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: exponent === 0 ? 0 : majorAmount % 1 === 0 ? 0 : exponent,
      minimumFractionDigits: 0,
    }).format(majorAmount);
  } catch {
    formatted = `${currency} ${majorAmount.toLocaleString()}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Convert user major amount input (e.g. 50000) to minor units (e.g. 5000000)
 */
export function toMinorUnits(amountMajor: number, currency = 'INR'): number {
  const exponent = getCurrencyExponent(currency);
  return Math.round(amountMajor * Math.pow(10, exponent));
}

/**
 * Convert minor units (e.g. 5000000) to major units (e.g. 50000)
 */
export function toMajorUnits(amountMinor: number, currency = 'INR'): number {
  const exponent = getCurrencyExponent(currency);
  return amountMinor / Math.pow(10, exponent);
}
