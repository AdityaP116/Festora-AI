import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../services/auth-context';
import type {
  EventDocument,
  ExpenseDocument,
  BudgetCategoryDocument,
  ExpenseStatus,
  PaymentStatus,
} from '../../types';
import {
  calculateBudgetMetrics,
  formatCurrency,
  toMinorUnits,
  toMajorUnits,
} from '../../domain/budget';
import { MetricCard } from '../../components/ui/MetricCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const BudgetPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDocument | null>(null);
  const [categories, setCategories] = useState<BudgetCategoryDocument[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseDocument | null>(null);

  // Form State
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryKey, setFormCategoryKey] = useState('venue');
  const [formAmountMajor, setFormAmountMajor] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<ExpenseStatus>('incurred');
  const [formPaymentStatus, setFormPaymentStatus] = useState<PaymentStatus>('paid');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBudgetData() {
      if (!user || !eventId) return;
      try {
        setLoading(true);
        const [evt, catList, expList] = await Promise.all([
          StorageService.getEventById(user.uid, eventId),
          StorageService.getBudgetCategories(eventId),
          StorageService.getExpenses(eventId),
        ]);
        setEvent(evt);
        setCategories(catList);
        setExpenses(expList);
        if (catList.length > 0) {
          setFormCategoryKey(catList[0].categoryKey);
        }
      } catch (err) {
        console.error('Failed to load budget data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBudgetData();
  }, [user, eventId]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormDescription('');
    setFormCategoryKey(categories[0]?.categoryKey || 'venue');
    setFormAmountMajor(0);
    setFormStatus('incurred');
    setFormPaymentStatus('paid');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormError(null);
    setIsAddExpenseOpen(true);
  };

  const handleOpenEditModal = (exp: ExpenseDocument) => {
    setEditingExpense(exp);
    setFormDescription(exp.description);
    setFormCategoryKey(exp.categoryKey);
    setFormAmountMajor(toMajorUnits(exp.actualAmountMinor || exp.estimatedAmountMinor || 0));
    setFormStatus(exp.expenseStatus);
    setFormPaymentStatus(exp.paymentStatus);
    setFormDate(exp.incurredAt ? exp.incurredAt.split('T')[0] : new Date().toISOString().split('T')[0]);
    setFormError(null);
    setIsAddExpenseOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    if (!formDescription.trim()) {
      setFormError('Please enter an expense description.');
      return;
    }
    if (formAmountMajor <= 0) {
      setFormError('Amount must be greater than zero.');
      return;
    }

    const amountMinor = toMinorUnits(formAmountMajor);

    try {
      if (editingExpense) {
        const updated = await StorageService.updateExpense(eventId, editingExpense.id, {
          description: formDescription.trim(),
          categoryKey: formCategoryKey,
          actualAmountMinor: formStatus === 'incurred' ? amountMinor : undefined,
          estimatedAmountMinor: formStatus === 'planned' ? amountMinor : undefined,
          expenseStatus: formStatus,
          paymentStatus: formPaymentStatus,
          incurredAt: `${formDate}T12:00:00Z`,
        });
        setExpenses((prev) => prev.map((e) => (e.id === editingExpense.id ? updated : e)));
      } else {
        const created = await StorageService.createExpense({
          eventId,
          description: formDescription.trim(),
          categoryKey: formCategoryKey,
          currency: event?.currency || 'INR',
          actualAmountMinor: formStatus === 'incurred' ? amountMinor : undefined,
          estimatedAmountMinor: formStatus === 'planned' ? amountMinor : undefined,
          expenseStatus: formStatus,
          paymentStatus: formPaymentStatus,
          incurredAt: `${formDate}T12:00:00Z`,
          source: 'user',
        });
        setExpenses((prev) => [created, ...prev]);
      }
      setIsAddExpenseOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save expense');
    }
  };

  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseDocument | null>(null);

  const handleDeleteExpense = (expense: ExpenseDocument) => {
    setExpenseToDelete(expense);
  };

  const confirmDeleteExpense = async () => {
    if (!eventId || !expenseToDelete) return;
    try {
      await StorageService.deleteExpense(eventId, expenseToDelete.id);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));
      setExpenseToDelete(null);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  if (loading || !event) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
        Loading budget records...
      </div>
    );
  }

  const metrics = calculateBudgetMetrics(event.budgetLimitMinor, categories, expenses);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Budget & Expense Tracker
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Keep planning estimates distinct from actual logged expenses with deterministic calculations.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAddModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Over-budget Warning Alert */}
      {metrics.isOverBudget && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.9rem' }}>
            <strong>Budget Exceeded Alert:</strong> Total actual spending ({formatCurrency(metrics.actualSpendMinor, event.currency)}) exceeds your event budget limit ({formatCurrency(metrics.budgetLimitMinor, event.currency)}) by{' '}
            <strong>{formatCurrency(Math.abs(metrics.remainingBudgetMinor), event.currency)}</strong>. Consider revising allocations or using contingency.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <MetricCard
          label="Budget Limit"
          value={formatCurrency(metrics.budgetLimitMinor, event.currency)}
          subtext="Configured spending ceiling"
          icon={Wallet}
          variant="primary"
        />
        <MetricCard
          label="Estimated Allocation"
          value={formatCurrency(metrics.estimatedTotalMinor, event.currency)}
          subtext="Sum of category estimates"
          icon={PieChartIcon}
          variant="accent"
        />
        <MetricCard
          label="Actual Expenses"
          value={formatCurrency(metrics.actualSpendMinor, event.currency)}
          subtext={`${metrics.spendPercentage}% of total budget`}
          icon={TrendingUp}
          variant={metrics.isOverBudget ? 'danger' : 'success'}
        />
        <MetricCard
          label="Remaining Budget"
          value={formatCurrency(metrics.remainingBudgetMinor, event.currency)}
          subtext={metrics.remainingBudgetMinor < 0 ? 'Deficit' : 'Available balance'}
          icon={DollarSign}
          variant={metrics.remainingBudgetMinor < 0 ? 'danger' : 'neutral'}
        />
      </div>

      {/* Category Proportions Breakdown */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>
          Category Allocations (Estimated vs Actual)
        </h3>

        {categories.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
            No budget categories generated yet. Visit the AI Assistant tab to create a recommended budget split.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categories.map((cat) => {
              // Calculate actual expenses for this category
              const catActual = expenses
                .filter((e) => e.categoryKey === cat.categoryKey && e.expenseStatus === 'incurred')
                .reduce((sum, e) => sum + (e.actualAmountMinor || 0), 0);

              const estPct = metrics.estimatedTotalMinor > 0 
                ? Math.round((cat.estimatedAmountMinor / metrics.estimatedTotalMinor) * 100) 
                : 0;

              return (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{cat.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>({estPct}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        Est: {formatCurrency(cat.estimatedAmountMinor, event.currency)}
                      </span>
                      <span style={{ fontWeight: 600, color: catActual > cat.estimatedAmountMinor ? 'var(--color-danger)' : 'var(--color-text)' }}>
                        Spent: {formatCurrency(catActual, event.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Over-Allocation Warning */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#EAE6F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, cat.estimatedAmountMinor > 0 ? (catActual / cat.estimatedAmountMinor) * 100 : 0)}%`,
                        height: '100%',
                        backgroundColor: catActual > cat.estimatedAmountMinor ? 'var(--color-danger)' : 'var(--color-primary)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    {cat.notes ? (
                      <span style={{ color: 'var(--color-text-muted)' }}>{cat.notes}</span>
                    ) : <span />}
                    {catActual > cat.estimatedAmountMinor && (
                      <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                        Over allocated by {formatCurrency(catActual - cat.estimatedAmountMinor, event.currency)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logged Expenses Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Recorded Expenses ({expenses.length})
          </h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleOpenAddModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={14} />
            <span>Add Entry</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No expenses logged yet"
            description="Record vendor deposits, hall payments, catering advance, and supply receipts to track verified expenses."
            actionText="Record First Expense"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Expense Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Payment</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => {
                  const amount = exp.actualAmountMinor || exp.estimatedAmountMinor || 0;
                  return (
                    <tr key={exp.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {exp.description}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                        {exp.categoryKey}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {formatCurrency(amount, event.currency)}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <Badge variant={exp.expenseStatus === 'incurred' ? 'success' : exp.expenseStatus === 'planned' ? 'warning' : 'danger'}>
                          {exp.expenseStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <Badge variant={exp.paymentStatus === 'paid' ? 'success' : exp.paymentStatus === 'partially_paid' ? 'warning' : 'neutral'}>
                          {exp.paymentStatus.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-text-muted)' }}>
                        {exp.incurredAt ? new Date(exp.incurredAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleOpenEditModal(exp)}
                            title="Edit expense"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleDeleteExpense(exp)}
                            title="Delete expense"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
        description="Add a verified payment or planned budget line item."
      >
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSaveExpense}>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-desc">
              <span>Description</span>
              <span className="required">*</span>
            </label>
            <input
              id="exp-desc"
              type="text"
              className="form-input"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Banquet Hall 50% Advance Booking Deposit"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="exp-cat">
                <span>Category</span>
              </label>
              <select
                id="exp-cat"
                className="form-select"
                value={formCategoryKey}
                onChange={(e) => setFormCategoryKey(e.target.value)}
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.categoryKey} value={c.categoryKey}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="venue">Venue & Hall</option>
                    <option value="catering">Catering & Dining</option>
                    <option value="decor">Decor & Florals</option>
                    <option value="photography">Photography</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="exp-amt">
                <span>Amount ({event.currency})</span>
                <span className="required">*</span>
              </label>
              <input
                id="exp-amt"
                type="number"
                min={1}
                className="form-input"
                value={formAmountMajor || ''}
                onChange={(e) => setFormAmountMajor(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="exp-status">
                <span>Expense Status</span>
              </label>
              <select
                id="exp-status"
                className="form-select"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as ExpenseStatus)}
              >
                <option value="incurred">Incurred (Actual Spend)</option>
                <option value="planned">Planned (Estimate)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="exp-pay">
                <span>Payment Status</span>
              </label>
              <select
                id="exp-pay"
                className="form-select"
                value={formPaymentStatus}
                onChange={(e) => setFormPaymentStatus(e.target.value as PaymentStatus)}
              >
                <option value="paid">Paid Full</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="not_applicable">Not Applicable</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="exp-date">
              <span>Date</span>
            </label>
            <input
              id="exp-date"
              type="date"
              className="form-input"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddExpenseOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Expense Confirmation Modal */}
      <Modal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Confirm Expense Deletion"
        description="Are you sure you want to delete this expense record? This action cannot be undone."
      >
        <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Expense item: <strong style={{ color: 'var(--color-text-main)' }}>{expenseToDelete?.description}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setExpenseToDelete(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={confirmDeleteExpense}
          >
            Delete Expense
          </button>
        </div>
      </Modal>
    </div>
  );
};
