import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  MapPin,
  Users,
  Wallet,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../services/auth-context';
import { StorageService } from '../services/storage';
import type { EventDocument } from '../types';
import { formatCurrency, calculateBudgetMetrics } from '../domain/budget';
import { calculateTaskMetrics } from '../domain/task-rules';
import { Badge } from '../components/ui/Badge';
import { MetricCard } from '../components/ui/MetricCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SeoHead } from '../components/seo/SeoHead';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventStats, setEventStats] = useState<
    Record<string, { completedTasks: number; totalTasks: number; actualSpendMinor: number }>
  >({});
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        const userEvents = await StorageService.getEvents(user.uid);
        setEvents(userEvents);

        // Load tasks and expenses for each event to derive verified aggregate metrics
        const stats: Record<string, { completedTasks: number; totalTasks: number; actualSpendMinor: number }> = {};
        let totalOverdue = 0;

        for (const evt of userEvents) {
          const [tasks, expenses] = await Promise.all([
            StorageService.getTasks(evt.id),
            StorageService.getExpenses(evt.id),
          ]);
          const tMetrics = calculateTaskMetrics(tasks);
          const bMetrics = calculateBudgetMetrics(evt.budgetLimitMinor, [], expenses);
          stats[evt.id] = {
            completedTasks: tMetrics.completedTasks,
            totalTasks: tMetrics.eligibleTasks,
            actualSpendMinor: bMetrics.actualSpendMinor,
          };
          totalOverdue += tMetrics.overdueTasks;
        }

        setEventStats(stats);
        setOverdueCount(totalOverdue);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div>
        <SeoHead title="Celebration Dashboard" description="Manage your celebration events, budgets, timelines, and checklists." />
        <div style={{ marginBottom: '2rem' }}>
          <Skeleton width="40%" height="2rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="60%" height="1rem" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <CardSkeleton rows={2} />
          <CardSkeleton rows={2} />
          <CardSkeleton rows={2} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <CardSkeleton rows={4} />
          <CardSkeleton rows={4} />
        </div>
      </div>
    );
  }

  const totalEvents = events.length;
  const totalBudgetCombined = events.reduce((sum, e) => sum + e.budgetLimitMinor, 0);
  const totalActualSpendCombined = Object.values(eventStats).reduce((sum, s) => sum + s.actualSpendMinor, 0);

  return (
    <div>
      <SeoHead
        title="Celebration Dashboard"
        description="Manage active events, budgets, checklists, and timelines in your Festora AI workspace."
        canonicalPath="/dashboard"
      />
      <Breadcrumbs items={[{ label: 'Dashboard', path: '/dashboard' }]} />

      {/* Top Welcome Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Hello, {user?.displayName || 'Event Organizer'} 👋
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Here is an overview of your active event plans, checklists, and budgets.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/events/new')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', height: '42px' }}
        >
          <Sparkles size={17} />
          <span>Plan New Event</span>
        </button>
      </div>

      {totalEvents === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No celebration events created yet"
          description="Ready to plan a wedding, birthday, college festival, or community gathering? Festora AI will build an editable plan, budget, and task list in under two minutes."
          actionText="Plan Your First Event"
          onAction={() => navigate('/events/new')}
        />
      ) : (
        <>
          {/* Top Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            <MetricCard
              label="Active Celebrations"
              value={totalEvents.toString()}
              subtext="Events in planning"
              icon={Calendar}
              variant="primary"
            />
            <MetricCard
              label="Combined Budget Limit"
              value={formatCurrency(totalBudgetCombined, events[0]?.currency || 'INR')}
              subtext={`Across ${totalEvents} event${totalEvents > 1 ? 's' : ''}`}
              icon={Wallet}
              variant="accent"
            />
            <MetricCard
              label="Logged Expenses"
              value={formatCurrency(totalActualSpendCombined, events[0]?.currency || 'INR')}
              subtext="Actual verified spend"
              icon={TrendingUp}
              variant="success"
            />
            <MetricCard
              label="Tasks Needing Attention"
              value={overdueCount.toString()}
              subtext={overdueCount > 0 ? 'Overdue tasks flagged' : 'All deadlines on schedule'}
              icon={overdueCount > 0 ? AlertTriangle : CheckSquare}
              variant={overdueCount > 0 ? 'warning' : 'neutral'}
            />
          </div>

          {/* Events List Grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Your Planned Celebrations
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {totalEvents} {totalEvents === 1 ? 'event' : 'events'} recorded
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {events.map((event) => {
                const stat = eventStats[event.id] || { completedTasks: 0, totalTasks: 0, actualSpendMinor: 0 };
                const taskPct = stat.totalTasks > 0 ? Math.round((stat.completedTasks / stat.totalTasks) * 100) : 0;
                const spendPct = event.budgetLimitMinor > 0 
                  ? Math.min(100, Math.round((stat.actualSpendMinor / event.budgetLimitMinor) * 100))
                  : 0;

                const formattedDate = new Date(event.startAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={event.id}
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                        <Badge variant="primary">
                          {event.eventType.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant={event.status === 'planning' ? 'warning' : 'success'}>
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Event Title */}
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                        {event.title}
                      </h3>

                      {/* Location and Date */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} color="var(--color-primary)" />
                          <span>{formattedDate} ({event.timezone})</span>
                        </div>
                        {event.location?.label && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={14} color="var(--color-primary)" />
                            <span>{event.location.label}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Users size={14} color="var(--color-primary)" />
                          <span>{event.guestCount} Estimated Guests</span>
                        </div>
                      </div>

                      {/* Progress Metrics */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: 'var(--color-surface-muted)', padding: '0.9rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                        {/* Task progress */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>Task Completion</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                              {stat.completedTasks}/{stat.totalTasks} ({taskPct}%)
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E0EA', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${taskPct}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
                          </div>
                        </div>

                        {/* Spend progress */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>Budget Spent</span>
                            <span style={{ fontWeight: 600, color: stat.actualSpendMinor > event.budgetLimitMinor ? 'var(--color-danger)' : 'var(--color-text)' }}>
                              {formatCurrency(stat.actualSpendMinor, event.currency)} / {formatCurrency(event.budgetLimitMinor, event.currency)}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E0EA', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${spendPct}%`,
                                height: '100%',
                                backgroundColor: stat.actualSpendMinor > event.budgetLimitMinor ? 'var(--color-danger)' : 'var(--color-success)',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid var(--color-border-light)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                      }}
                    >
                      <span>Open Workspace</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
