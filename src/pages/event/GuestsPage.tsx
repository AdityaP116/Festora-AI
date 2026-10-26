import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  XCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../services/auth-context';
import type { EventDocument, GuestDocument, RSVPStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { MetricCard } from '../../components/ui/MetricCard';

export const GuestsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDocument | null>(null);
  const [guests, setGuests] = useState<GuestDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [rsvpFilter, setRsvpFilter] = useState<'all' | RSVPStatus>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestDocument | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<GuestDocument | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Family');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('confirmed');
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [dietary, setDietary] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !eventId) return;
      try {
        setLoading(true);
        const [evt, gList] = await Promise.all([
          StorageService.getEventById(user.uid, eventId),
          StorageService.getGuests(eventId),
        ]);
        setEvent(evt);
        setGuests(gList);
      } catch (err) {
        console.error('Failed to load guests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, eventId]);

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setName('');
    setGroup('Family');
    setRsvpStatus('confirmed');
    setPlusOnes(0);
    setDietary('');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: GuestDocument) => {
    setEditingGuest(g);
    setName(g.displayName);
    setGroup(g.group || 'Family');
    setRsvpStatus(g.rsvpStatus);
    setPlusOnes(g.plusOneCount || 0);
    setDietary((g.dietaryPreferences || []).join(', '));
    setNotes(g.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    if (!name.trim()) {
      setFormError('Please enter a guest name.');
      return;
    }

    const dietaryArray = dietary.trim()
      ? dietary.split(',').map((d) => d.trim()).filter(Boolean)
      : undefined;

    try {
      if (editingGuest) {
        const updated = await StorageService.updateGuest(eventId, editingGuest.id, {
          displayName: name.trim(),
          group: group.trim(),
          rsvpStatus,
          plusOneCount: plusOnes,
          dietaryPreferences: dietaryArray,
          notes: notes.trim(),
        });
        setGuests((prev) => prev.map((g) => (g.id === editingGuest.id ? updated : g)));
      } else {
        const created = await StorageService.createGuest({
          eventId,
          displayName: name.trim(),
          group: group.trim(),
          rsvpStatus,
          plusOneCount: plusOnes,
          dietaryPreferences: dietaryArray,
          notes: notes.trim(),
        });
        setGuests((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save guest');
    }
  };

  const handleDeleteGuest = (guest: GuestDocument) => {
    setGuestToDelete(guest);
  };

  const confirmDeleteGuest = async () => {
    if (!eventId || !guestToDelete) return;
    try {
      await StorageService.deleteGuest(eventId, guestToDelete.id);
      setGuests((prev) => prev.filter((g) => g.id !== guestToDelete.id));
      setGuestToDelete(null);
    } catch (err) {
      console.error('Failed to delete guest:', err);
    }
  };

  if (loading || !event) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
        Loading guest list...
      </div>
    );
  }

  // Aggregate stats
  const totalEntries = guests.length;
  const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'confirmed');
  const confirmedPlusOnes = confirmedGuests.reduce((sum, g) => sum + (g.plusOneCount || 0), 0);
  const totalAttending = confirmedGuests.length + confirmedPlusOnes;
  const pendingCount = guests.filter((g) => g.rsvpStatus === 'invited' || g.rsvpStatus === 'maybe').length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === 'declined').length;

  const filteredGuests = guests.filter((g) => {
    if (rsvpFilter !== 'all' && g.rsvpStatus !== rsvpFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header and Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Guest List & RSVP Management
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Track invitations, confirmed headcounts, dietary requirements, and family groups.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Add Guest</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <MetricCard
          label="Total Attending Headcount"
          value={totalAttending.toString()}
          subtext={`${confirmedGuests.length} guests + ${confirmedPlusOnes} plus-ones`}
          icon={UserCheck}
          variant="success"
        />
        <MetricCard
          label="Target Venue Capacity"
          value={event.guestCount.toString()}
          subtext="Configured in event wizard"
          icon={Users}
          variant="primary"
        />
        <MetricCard
          label="Awaiting Response"
          value={pendingCount.toString()}
          subtext="Invited or undecided"
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          label="Declined RSVPs"
          value={declinedCount.toString()}
          subtext="Cannot attend"
          icon={XCircle}
          variant="neutral"
        />
      </div>

      {/* Guest Directory Card */}
      <div className="card">
        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${rsvpFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRsvpFilter('all')}
            >
              All ({totalEntries})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${rsvpFilter === 'confirmed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRsvpFilter('confirmed')}
            >
              Confirmed ({confirmedGuests.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${rsvpFilter === 'invited' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRsvpFilter('invited')}
            >
              Pending ({guests.filter((g) => g.rsvpStatus === 'invited').length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${rsvpFilter === 'declined' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRsvpFilter('declined')}
            >
              Declined ({declinedCount})
            </button>
          </div>
        </div>

        {filteredGuests.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No guests in this view"
            description="Add family members, close friends, and honored guests to start tracking RSVPs."
            actionText="Add First Guest"
            onAction={handleOpenAdd}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Guest Name</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Group</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>RSVP Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Plus-Ones</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Dietary / Notes</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {g.displayName}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span className="badge badge-neutral">{g.group || 'General'}</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <Badge variant={g.rsvpStatus === 'confirmed' ? 'success' : g.rsvpStatus === 'declined' ? 'danger' : 'warning'}>
                        {g.rsvpStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-text)' }}>
                      {g.plusOneCount && g.plusOneCount > 0 ? `+${g.plusOneCount}` : 'None'}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-text-secondary)' }}>
                      {g.dietaryPreferences && g.dietaryPreferences.length > 0 ? (
                        <span>🥗 {g.dietaryPreferences.join(', ')}</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Standard</span>
                      )}
                      {g.notes && <span style={{ marginLeft: '0.5rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>({g.notes})</span>}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleOpenEdit(g)}
                          title="Edit guest"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleDeleteGuest(g)}
                          title="Remove guest"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGuest ? 'Edit Guest' : 'Add New Guest'}
        description="Record RSVP response, party size, and dietary requirements."
      >
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSaveGuest}>
          <div className="form-group">
            <label className="form-label" htmlFor="g-name">
              <span>Guest Display Name</span>
              <span className="required">*</span>
            </label>
            <input
              id="g-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel & Family"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="g-group">
                <span>Group / Category</span>
              </label>
              <select
                id="g-group"
                className="form-select"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="Family">Family</option>
                <option value="Close Friends">Close Friends</option>
                <option value="Colleagues">Colleagues</option>
                <option value="VIP Guests">VIP Guests</option>
                <option value="Neighbors">Neighbors</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="g-status">
                <span>RSVP Status</span>
              </label>
              <select
                id="g-status"
                className="form-select"
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RSVPStatus)}
              >
                <option value="confirmed">Confirmed</option>
                <option value="invited">Invited (Awaiting Response)</option>
                <option value="maybe">Maybe</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="g-plus">
              <span>Plus-One Attendee Count</span>
            </label>
            <input
              id="g-plus"
              type="number"
              min={0}
              max={10}
              className="form-input"
              value={plusOnes}
              onChange={(e) => setPlusOnes(parseInt(e.target.value) || 0)}
            />
            <span className="form-hint">Number of additional family members attending with this guest.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="g-diet">
              <span>Dietary Requirements (comma separated)</span>
            </label>
            <input
              id="g-diet"
              type="text"
              className="form-input"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="e.g. Jain Vegetarian, Nut Allergy"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="g-notes">
              <span>Special Notes / Seating Requests</span>
            </label>
            <textarea
              id="g-notes"
              className="form-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Requires ground floor seating near main entrance..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingGuest ? 'Save Changes' : 'Add Guest'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Guest Confirmation Modal */}
      <Modal
        isOpen={!!guestToDelete}
        onClose={() => setGuestToDelete(null)}
        title="Confirm Guest Removal"
        description="Are you sure you want to remove this guest from the guest list? This action cannot be undone."
      >
        <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Guest: <strong style={{ color: 'var(--color-text-main)' }}>{guestToDelete?.displayName}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setGuestToDelete(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={confirmDeleteGuest}
          >
            Remove Guest
          </button>
        </div>
      </Modal>
    </div>
  );
};
