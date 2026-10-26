import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Wallet,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../services/auth-context';
import { Modal } from '../../components/ui/Modal';
import type {
  EventDocument,
  TaskDocument,
  ExpenseDocument,
  BudgetCategoryDocument,
  PlanVersionDocument,
} from '../../types';
import { calculateBudgetMetrics, formatCurrency } from '../../domain/budget';
import { calculateTaskMetrics, isTaskOverdue, isTaskDueSoon } from '../../domain/task-rules';
import { MetricCard } from '../../components/ui/MetricCard';
import { Badge } from '../../components/ui/Badge';

export const EventOverviewPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventDocument | null>(null);
  const [tasks, setTasks] = useState<TaskDocument[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDocument[]>([]);
  const [categories, setCategories] = useState<BudgetCategoryDocument[]>([]);
  const [planVersions, setPlanVersions] = useState<PlanVersionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadEventData() {
      if (!user || !eventId) return;
      try {
        setLoading(true);
        const [evt, taskList, expList, catList, pVersions] = await Promise.all([
          StorageService.getEventById(user.uid, eventId),
          StorageService.getTasks(eventId),
          StorageService.getExpenses(eventId),
          StorageService.getBudgetCategories(eventId),
          StorageService.getPlanVersions(eventId),
        ]);
        setEvent(evt);
        setTasks(taskList);
        setExpenses(expList);
        setCategories(catList);
        setPlanVersions(pVersions);
      } catch (err) {
        console.error('Failed to load event overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEventData();
  }, [user, eventId]);

  const handleToggleTaskStatus = async (task: TaskDocument) => {
    if (!eventId) return;
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await StorageService.updateTask(eventId, task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
        Loading event summary...
      </div>
    );
  }

  if (!event) return null;

  const bMetrics = calculateBudgetMetrics(event.budgetLimitMinor, categories, expenses);
  const tMetrics = calculateTaskMetrics(tasks);
  const activePlan = planVersions[0]?.plan;

  // Next tasks: pending or in-progress, sorted by due date
  const pendingTasks = tasks
    .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
    .slice(0, 5);

  const handleDeleteEvent = async () => {
    if (!event || !user) return;
    try {
      setIsDeleting(true);
      await StorageService.deleteEvent(user.uid, event.id);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Overview Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <MetricCard
          label="Task Completion"
          value={`${tMetrics.completionPercentage}%`}
          subtext={`${tMetrics.completedTasks} of ${tMetrics.eligibleTasks} tasks done`}
          icon={CheckSquare}
          variant="primary"
        />
        <MetricCard
          label="Budget Limit"
          value={formatCurrency(bMetrics.budgetLimitMinor, event.currency)}
          subtext={`Allocated: ${formatCurrency(bMetrics.estimatedTotalMinor, event.currency)}`}
          icon={Wallet}
          variant="accent"
        />
        <MetricCard
          label="Actual Expenses"
          value={formatCurrency(bMetrics.actualSpendMinor, event.currency)}
          subtext={`${bMetrics.spendPercentage}% of total budget spent`}
          icon={Wallet}
          variant={bMetrics.isOverBudget ? 'danger' : 'success'}
        />
        <MetricCard
          label="Remaining Balance"
          value={formatCurrency(bMetrics.remainingBudgetMinor, event.currency)}
          subtext={bMetrics.remainingBudgetMinor < 0 ? 'Budget exceeded' : 'Available funds'}
          icon={Clock}
          variant={bMetrics.remainingBudgetMinor < 0 ? 'danger' : 'neutral'}
        />
      </div>

      {/* Main 2-Column Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Left Column: Next Tasks Checklist */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Next Priority Tasks
              </h3>
            </div>
            <Link to={`/events/${eventId}/tasks`} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              View all ({tasks.length})
            </Link>
          </div>

          {pendingTasks.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <CheckCircle2 size={32} color="var(--color-success)" style={{ margin: '0 auto 0.5rem' }} />
              <div>All priority tasks are completed or no tasks created yet!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {pendingTasks.map((task) => {
                const overdue = isTaskOverdue(task);
                const dueSoon = isTaskDueSoon(task);
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.9rem',
                      backgroundColor: 'var(--color-surface-hover)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: '2px solid var(--color-border)',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        aria-label="Mark task complete"
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.title}
                        </div>
                        {task.dueAt && (
                          <div style={{ fontSize: '0.75rem', color: overdue ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                            Due {new Date(task.dueAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {overdue ? (
                        <Badge variant="danger" size="sm">Overdue</Badge>
                      ) : dueSoon ? (
                        <Badge variant="warning" size="sm">Due soon</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">{task.priority}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Theme & Plan Concept */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Theme Concept & Aesthetic
              </h3>
            </div>
            <Link to={`/events/${eventId}/assistant`} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              Open AI Assistant
            </Link>
          </div>

          {activePlan?.theme ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                  {activePlan.theme.name}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {activePlan.theme.description}
                </p>
              </div>

              {/* Color Palette Swatches */}
              {activePlan.theme.palette && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Suggested Color Palette
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                    {activePlan.theme.palette.map((color, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: color,
                          boxShadow: 'var(--shadow-sm)',
                          border: '1px solid rgba(0,0,0,0.1)',
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Ideas */}
              {activePlan.theme.ideas && activePlan.theme.ideas.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Personalized Ideas
                  </span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {activePlan.theme.ideas.map((idea, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                        <span style={{ color: 'var(--color-primary)' }}>•</span>
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>No AI plan generated for this event yet.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/events/${eventId}/assistant`)}
              >
                Generate Plan Proposal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <Link
          to={`/events/${eventId}/budget`}
          className="card card-hover"
          style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.925rem' }}>Manage Budget</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Track expenses & quotes</div>
          </div>
        </Link>

        <Link
          to={`/events/${eventId}/tasks`}
          className="card card-hover"
          style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.925rem' }}>Task Checklist</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Manage deadlines & status</div>
          </div>
        </Link>

        <Link
          to={`/events/${eventId}/timeline`}
          className="card card-hover"
          style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.925rem' }}>Day-of Timeline</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Milestones & hourly run</div>
          </div>
        </Link>

        <Link
          to={`/events/${eventId}/assistant`}
          className="card card-hover"
          style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.925rem' }}>AI Assistant</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Revise plans safely</div>
          </div>
        </Link>
      </div>

      {/* Danger Zone: Delete Event Action */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid var(--color-border)',
          marginTop: '1rem',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>
            Event Archival & Removal
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            Permanently remove this event and its associated budget records, tasks, and guest lists.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)' }}
        >
          <Trash2 size={16} />
          <span>Delete Event</span>
        </button>
      </div>

      {/* Delete Event Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Event Deletion"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Are you sure you want to delete <strong>"{event.title}"</strong>? This will permanently remove all associated budgets, checklists, vendor quotes, and AI proposals.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
