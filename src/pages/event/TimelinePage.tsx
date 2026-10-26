import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Plus,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../services/auth-context';
import type {
  EventDocument,
  PlanVersionDocument,
  AIMilestoneItem,
  AIScheduleItem,
} from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const TimelinePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDocument | null>(null);
  const [planVersions, setPlanVersions] = useState<PlanVersionDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'schedule' | 'milestones'>('schedule');

  // Custom added items stored locally for event
  const [customMilestones, setCustomMilestones] = useState<AIMilestoneItem[]>([]);
  const [customSchedule, setCustomSchedule] = useState<AIScheduleItem[]>([]);

  // Modals
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);

  // Form states
  const [schedTitle, setSchedTitle] = useState('');
  const [schedStart, setSchedStart] = useState('18:00');
  const [schedEnd, setSchedEnd] = useState('19:00');
  const [schedNotes, setSchedNotes] = useState('');

  const [mileTitle, setMileTitle] = useState('');
  const [mileDate, setMileDate] = useState('');
  const [mileDesc, setMileDesc] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user || !eventId) return;
      try {
        setLoading(true);
        const [evt, pVersions, cSched, cMiles] = await Promise.all([
          StorageService.getEventById(user.uid, eventId),
          StorageService.getPlanVersions(eventId),
          StorageService.getCustomSchedule(eventId),
          StorageService.getCustomMilestones(eventId),
        ]);
        setEvent(evt);
        setPlanVersions(pVersions);
        setCustomSchedule(cSched);
        setCustomMilestones(cMiles);
      } catch (err) {
        console.error('Failed to load timeline data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, eventId]);

  const activePlan = planVersions[0]?.plan;

  const milestones: AIMilestoneItem[] = [
    ...(activePlan?.milestones || []),
    ...customMilestones,
  ].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

  const schedule: AIScheduleItem[] = [
    ...(activePlan?.schedule || []),
    ...customSchedule,
  ].sort((a, b) => a.startLocalTime.localeCompare(b.startLocalTime));

  const handleAddScheduleItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle.trim() || !eventId) return;
    const newItem: AIScheduleItem = {
      title: schedTitle.trim(),
      startLocalTime: schedStart,
      endLocalTime: schedEnd,
      notes: schedNotes.trim(),
    };
    try {
      const updated = await StorageService.addCustomScheduleItem(eventId, newItem);
      setCustomSchedule(updated);
      setSchedTitle('');
      setSchedNotes('');
      setIsAddScheduleOpen(false);
    } catch (err) {
      console.error('Failed to save schedule slot:', err);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mileTitle.trim() || !mileDate || !eventId) return;
    const newItem: AIMilestoneItem = {
      title: mileTitle.trim(),
      targetDate: mileDate,
      description: mileDesc.trim(),
    };
    try {
      const updated = await StorageService.addCustomMilestone(eventId, newItem);
      setCustomMilestones(updated);
      setMileTitle('');
      setMileDesc('');
      setIsAddMilestoneOpen(false);
    } catch (err) {
      console.error('Failed to save milestone:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
        Loading chronological timeline...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Timeline & Day-of Schedule
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Structured run-down of key preparation milestones and hourly event execution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'schedule' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsAddScheduleOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>Add Schedule Slot</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsAddMilestoneOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>Add Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('schedule')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Clock size={16} />
          <span>Day-of Hourly Schedule ({schedule.length})</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'milestones' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('milestones')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Calendar size={16} />
          <span>Preparation Milestones ({milestones.length})</span>
        </button>
      </div>

      {/* Schedule Tab Content */}
      {activeTab === 'schedule' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Event Day Run-Down ({event?.timezone})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Operational itinerary for organizers, vendors, caterers, and MCs.
            </p>
          </div>

          {schedule.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No schedule blocks defined"
              description="Add your first hourly block to plan guest arrival, ceremonial events, and dining times."
              actionText="Add Schedule Slot"
              onAction={() => setIsAddScheduleOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
              {/* Timeline vertical guide line */}
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '10px',
                  bottom: '10px',
                  width: '2px',
                  backgroundColor: 'var(--color-border)',
                }}
              />

              {schedule.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', position: 'relative' }}>
                  {/* Timeline dot */}
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 0 0 2px var(--color-primary)',
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '6px',
                    }}
                  />

                  {/* Schedule Card */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--color-surface-hover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        🕒 {item.startLocalTime} — {item.endLocalTime}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                      {item.title}
                    </h4>
                    {item.notes && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Milestones Tab Content */}
      {activeTab === 'milestones' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Major Preparation Milestones
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              High-level checkpoints leading up to the celebration date.
            </p>
          </div>

          {milestones.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No milestones set yet"
              description="Define key milestones such as booking venue deposits, finalizing guest invitations, and tastings."
              actionText="Add Milestone"
              onAction={() => setIsAddMilestoneOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'var(--color-surface-hover)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                      {m.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {m.description}
                    </p>
                  </div>
                  <Badge variant="primary">
                    📅 {new Date(m.targetDate).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Schedule Slot Modal */}
      <Modal
        isOpen={isAddScheduleOpen}
        onClose={() => setIsAddScheduleOpen(false)}
        title="Add Day-of Schedule Slot"
        description="Add a specific activity or operational timing."
      >
        <form onSubmit={handleAddScheduleItem}>
          <div className="form-group">
            <label className="form-label" htmlFor="sched-title">
              <span>Activity / Event Segment Title</span>
              <span className="required">*</span>
            </label>
            <input
              id="sched-title"
              type="text"
              className="form-input"
              value={schedTitle}
              onChange={(e) => setSchedTitle(e.target.value)}
              placeholder="e.g. Guest Arrival & Welcome Cocktails"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="sched-start">
                <span>Start Time (HH:mm)</span>
                <span className="required">*</span>
              </label>
              <input
                id="sched-start"
                type="time"
                className="form-input"
                value={schedStart}
                onChange={(e) => setSchedStart(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sched-end">
                <span>End Time (HH:mm)</span>
                <span className="required">*</span>
              </label>
              <input
                id="sched-end"
                type="time"
                className="form-input"
                value={schedEnd}
                onChange={(e) => setSchedEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sched-notes">
              <span>Operational Notes / Instructions</span>
            </label>
            <textarea
              id="sched-notes"
              className="form-textarea"
              rows={2}
              value={schedNotes}
              onChange={(e) => setSchedNotes(e.target.value)}
              placeholder="e.g. Ensure acoustic background music is playing, photographers stationed at the main arch."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddScheduleOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
        title="Add Preparation Milestone"
        description="Set a target completion date for an overarching event objective."
      >
        <form onSubmit={handleAddMilestone}>
          <div className="form-group">
            <label className="form-label" htmlFor="mile-title">
              <span>Milestone Title</span>
              <span className="required">*</span>
            </label>
            <input
              id="mile-title"
              type="text"
              className="form-input"
              value={mileTitle}
              onChange={(e) => setMileTitle(e.target.value)}
              placeholder="e.g. Wedding Outfits Final Fitting Complete"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mile-date">
              <span>Target Completion Date</span>
              <span className="required">*</span>
            </label>
            <input
              id="mile-date"
              type="date"
              className="form-input"
              value={mileDate}
              onChange={(e) => setMileDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mile-desc">
              <span>Description / Notes</span>
            </label>
            <textarea
              id="mile-desc"
              className="form-textarea"
              rows={2}
              value={mileDesc}
              onChange={(e) => setMileDesc(e.target.value)}
              placeholder="Confirm alterations, shoes, and jewelry accessories."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddMilestoneOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
