import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  Sparkles,
  CheckSquare,
  Clock,
  Store,
  UserCheck,
  ChevronLeft,
  LayoutDashboard,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../services/auth-context';
import { StorageService } from '../../services/storage';
import type { EventDocument } from '../../types';
import { formatCurrency } from '../../domain/budget';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { SeoHead } from '../seo/SeoHead';
import { Breadcrumbs } from '../navigation/Breadcrumbs';

export const EventLayout: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      if (!user || !eventId) return;
      try {
        setLoading(true);
        const data = await StorageService.getEventById(user.uid, eventId);
        if (!data) {
          setError('Event not found or you do not have permission to access it.');
        } else {
          setEvent(data);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [user, eventId]);

  const handleDeleteEvent = async () => {
    if (!user || !eventId) return;
    try {
      setIsDeleting(true);
      await StorageService.deleteEvent(user.uid, eventId);
      navigate('/dashboard');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              border: '3px solid var(--color-primary-soft)',
              borderTopColor: 'var(--color-primary)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading event workspace...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="card" style={{ maxWidth: '520px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <h3 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Unable to Access Event</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
          {error || 'The requested event record does not exist or was deleted.'}
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          <ChevronLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const tabs = [
    { label: 'Overview', path: `/events/${eventId}`, icon: LayoutDashboard, exact: true },
    { label: 'AI Assistant', path: `/events/${eventId}/assistant`, icon: Sparkles },
    { label: 'Budget', path: `/events/${eventId}/budget`, icon: Wallet },
    { label: 'Tasks', path: `/events/${eventId}/tasks`, icon: CheckSquare },
    { label: 'Timeline', path: `/events/${eventId}/timeline`, icon: Clock },
    { label: 'Vendors', path: `/events/${eventId}/vendors`, icon: Store },
    { label: 'Guests', path: `/events/${eventId}/guests`, icon: UserCheck },
  ];

  const formattedDate = new Date(event.startAt).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div>
      <SeoHead
        title={event.title}
        description={`Planning workspace for ${event.title}. Manage budget allocations, checklists, schedules, and vendor contracts.`}
      />
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: event.title, path: `/events/${eventId}` },
        ]}
      />

      {/* Event Top Navigation & Context */}
      <div style={{ marginBottom: '1.5rem' }}>

        {/* Event Header Banner */}
        <div
          className="card"
          style={{
            padding: '1.5rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                  {event.title}
                </h1>
                <Badge variant="primary">
                  {event.eventType.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant={event.status === 'planning' ? 'warning' : 'success'}>
                  {event.status.toUpperCase()}
                </Badge>
              </div>

              {/* Event Metadata Chips */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} color="var(--color-primary)" />
                  <span>{formattedDate}</span>
                </div>
                {event.location?.label && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={15} color="var(--color-primary)" />
                    <span>{event.location.label}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={15} color="var(--color-primary)" />
                  <span>{event.guestCount} guests</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  <Wallet size={15} color="var(--color-primary)" />
                  <span>Budget: {formatCurrency(event.budgetLimitMinor, event.currency)}</span>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteModalOpen(true)}
                style={{ color: 'var(--color-danger)' }}
                title="Delete event"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.75rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
        className="tabs-container"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Nested Route Outlet / Content */}
      <Outlet context={{ event, refreshEvent: () => {} }} />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Event Deletion"
        description="Are you sure you want to delete this event?"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          This will permanently delete <strong>{event.title}</strong> along with its tasks, budget categories, expenses, vendors, and generated AI plans. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDeleteModalOpen(false)}
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
            {isDeleting ? 'Deleting...' : 'Delete Event Permanently'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
