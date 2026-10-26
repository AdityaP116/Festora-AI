import type { TaskDocument } from '../types';

export interface TaskMetrics {
  totalTasks: number;
  eligibleTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  completionPercentage: number;
}

/**
 * Calculates task completion metrics.
 * Cancelled tasks are excluded from eligible task count.
 * Handles zero tasks gracefully without division by zero.
 */
export function calculateTaskMetrics(tasks: TaskDocument[]): TaskMetrics {
  const now = new Date();
  
  let completedTasks = 0;
  let inProgressTasks = 0;
  let pendingTasks = 0;
  let cancelledTasks = 0;
  let overdueTasks = 0;

  for (const task of tasks) {
    if (task.status === 'completed') {
      completedTasks++;
    } else if (task.status === 'cancelled') {
      cancelledTasks++;
    } else if (task.status === 'in_progress') {
      inProgressTasks++;
      if (task.dueAt && new Date(task.dueAt) < now) {
        overdueTasks++;
      }
    } else {
      pendingTasks++;
      if (task.dueAt && new Date(task.dueAt) < now) {
        overdueTasks++;
      }
    }
  }

  const eligibleTasks = tasks.length - cancelledTasks;
  const completionPercentage = eligibleTasks > 0
    ? Math.round((completedTasks / eligibleTasks) * 100)
    : 0;

  return {
    totalTasks: tasks.length,
    eligibleTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    cancelledTasks,
    overdueTasks,
    completionPercentage,
  };
}

/**
 * Checks if a task is overdue (not completed or cancelled, and dueAt in past)
 */
export function isTaskOverdue(task: TaskDocument): boolean {
  if (task.status === 'completed' || task.status === 'cancelled' || !task.dueAt) {
    return false;
  }
  return new Date(task.dueAt) < new Date();
}

/**
 * Checks if a task is due within the next N days
 */
export function isTaskDueSoon(task: TaskDocument, days = 3): boolean {
  if (task.status === 'completed' || task.status === 'cancelled' || !task.dueAt) {
    return false;
  }
  const dueDate = new Date(task.dueAt);
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return dueDate >= now && dueDate <= future;
}
