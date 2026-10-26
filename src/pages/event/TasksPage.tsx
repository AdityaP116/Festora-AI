import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../services/auth-context';
import type { TaskDocument, TaskPriority, TaskStatus } from '../../types';
import { calculateTaskMetrics, isTaskOverdue, isTaskDueSoon } from '../../domain/task-rules';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const TasksPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<TaskDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDocument | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('venue');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formStatus, setFormStatus] = useState<TaskStatus>('pending');
  const [formDueDate, setFormDueDate] = useState('');
  const [formIsEventDay, setFormIsEventDay] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      if (!user || !eventId) return;
      try {
        setLoading(true);
        const data = await StorageService.getTasks(eventId);
        setTasks(data);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [user, eventId]);

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('venue');
    setFormPriority('medium');
    setFormStatus('pending');
    setFormDueDate('');
    setFormIsEventDay(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskDocument) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormDueDate(task.dueAt ? task.dueAt.split('T')[0] : '');
    setFormIsEventDay(task.isEventDayTask);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleTaskStatus = async (task: TaskDocument) => {
    if (!eventId) return;
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await StorageService.updateTask(eventId, task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    if (!formTitle.trim()) {
      setFormError('Please enter a task title.');
      return;
    }

    try {
      if (editingTask) {
        const updated = await StorageService.updateTask(eventId, editingTask.id, {
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          priority: formPriority,
          status: formStatus,
          dueAt: formDueDate ? `${formDueDate}T12:00:00Z` : undefined,
          isEventDayTask: formIsEventDay,
        });
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      } else {
        const created = await StorageService.createTask({
          eventId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          priority: formPriority,
          status: formStatus,
          dueAt: formDueDate ? `${formDueDate}T12:00:00Z` : undefined,
          isEventDayTask: formIsEventDay,
          source: 'user',
        });
        setTasks((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const [taskToDelete, setTaskToDelete] = useState<TaskDocument | null>(null);

  const handleDeleteTask = (task: TaskDocument) => {
    setTaskToDelete(task);
  };

  const confirmDeleteTask = async () => {
    if (!eventId || !taskToDelete) return;
    try {
      await StorageService.deleteTask(eventId, taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
        Loading task list...
      </div>
    );
  }

  const metrics = calculateTaskMetrics(tasks);

  // Extract unique categories
  const categories = Array.from(new Set(tasks.map((t) => t.category))).filter(Boolean);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'active' && (t.status === 'completed' || t.status === 'cancelled')) return false;
    if (statusFilter === 'completed' && t.status !== 'completed') return false;
    if (statusFilter === 'overdue' && !isTaskOverdue(t)) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header and Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Actionable Checklist & Deadlines
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            {metrics.completedTasks} of {metrics.eligibleTasks} completed ({metrics.completionPercentage}%)
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAddModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <span>Overall Preparation Progress</span>
          <span style={{ color: 'var(--color-primary)' }}>{metrics.completionPercentage}%</span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: '#EBE5F2', borderRadius: '5px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${metrics.completionPercentage}%`,
              height: '100%',
              backgroundColor: 'var(--color-primary)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('active')}
          >
            Pending / In Progress ({metrics.pendingTasks + metrics.inProgressTasks})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({metrics.completedTasks})
          </button>
          {metrics.overdueTasks > 0 && (
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'overdue' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('overdue')}
              style={{ color: statusFilter === 'overdue' ? '#FFFFFF' : 'var(--color-danger)' }}
            >
              Overdue ({metrics.overdueTasks})
            </button>
          )}
        </div>

        {/* Category Filter Dropdown */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--color-text-muted)" />
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Task Items List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match the filter"
          description="Try selecting a different filter or add a new task to your celebration plan."
          actionText="Add New Task"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const overdue = isTaskOverdue(task);
            const dueSoon = isTaskDueSoon(task);

            return (
              <div
                key={task.id}
                className="card card-hover"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  opacity: isCompleted ? 0.75 : 1,
                  borderLeft: overdue ? '4px solid var(--color-danger)' : task.isEventDayTask ? '4px solid var(--color-accent)' : '1px solid var(--color-border)',
                }}
              >
                {/* Left side checkbox & title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                  <button
                    type="button"
                    onClick={() => handleToggleTaskStatus(task)}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '5px',
                      border: isCompleted ? 'none' : '2px solid var(--color-border)',
                      backgroundColor: isCompleted ? 'var(--color-success)' : '#FFFFFF',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2px',
                      flexShrink: 0,
                      transition: 'all var(--transition-fast)',
                    }}
                    aria-label={isCompleted ? 'Mark task as pending' : 'Mark task as completed'}
                  >
                    {isCompleted && <CheckCircle2 size={16} />}
                  </button>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>
                      {task.isEventDayTask && (
                        <Badge variant="accent" size="sm">Day-of Task</Badge>
                      )}
                      {task.source === 'ai' && (
                        <span title="Generated by AI" style={{ display: 'inline-flex', color: 'var(--color-primary)' }}>
                          <Sparkles size={13} />
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                        {task.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.4rem', fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ textTransform: 'capitalize' }}>📂 {task.category}</span>
                      {task.dueAt && (
                        <span style={{ color: overdue ? 'var(--color-danger)' : dueSoon ? 'var(--color-warning)' : 'currentColor', fontWeight: overdue || dueSoon ? 600 : 400 }}>
                          📅 Due {new Date(task.dueAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side status badges & actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                  <Badge variant={task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'warning' : 'neutral'} size="sm">
                    {task.priority.toUpperCase()}
                  </Badge>

                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => handleOpenEditModal(task)}
                    title="Edit task"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => handleDeleteTask(task)}
                    title="Delete task"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add Planning Task'}
        description="Assign actionable deadlines and categories for your celebration."
      >
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSaveTask}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              <span>Task Title</span>
              <span className="required">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Schedule Bridal Hair & Makeup Trial"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              <span>Description / Checklist notes</span>
            </label>
            <textarea
              id="task-desc"
              className="form-textarea"
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Include phone numbers, contact names, or specific requirements..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-cat">
                <span>Category</span>
              </label>
              <select
                id="task-cat"
                className="form-select"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              >
                <option value="venue">Venue</option>
                <option value="catering">Catering</option>
                <option value="decor">Decor & Florals</option>
                <option value="photography">Photography</option>
                <option value="entertainment">Entertainment</option>
                <option value="invitations">Invitations & RSVPs</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-prio">
                <span>Priority</span>
              </label>
              <select
                id="task-prio"
                className="form-select"
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-due">
                <span>Due Date</span>
              </label>
              <input
                id="task-due"
                type="date"
                className="form-input"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-status">
                <span>Current Status</span>
              </label>
              <select
                id="task-status"
                className="form-select"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.75rem 0 1.25rem' }}>
            <input
              id="is-event-day"
              type="checkbox"
              checked={formIsEventDay}
              onChange={(e) => setFormIsEventDay(e.target.checked)}
              style={{ width: '17px', height: '17px' }}
            />
            <label htmlFor="is-event-day" style={{ fontSize: '0.875rem', color: 'var(--color-text)', cursor: 'pointer' }}>
              Mark as Event-Day specific task (e.g. stage soundcheck, cake arrival)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Task Deletion Modal */}
      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Confirm Task Deletion"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Are you sure you want to delete the task <strong>"{taskToDelete?.title}"</strong>?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setTaskToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmDeleteTask}
            >
              Delete Task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
