import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Store,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../services/auth-context';
import type { EventDocument, VendorDocument, BookingStatus } from '../../types';
import { formatCurrency, toMinorUnits, toMajorUnits } from '../../domain/budget';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const VendorsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDocument | null>(null);
  const [vendors, setVendors] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorDocument | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<VendorDocument | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('catering');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [quotedMajor, setQuotedMajor] = useState<number>(0);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('researching');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !eventId) return;
      try {
        setLoading(true);
        const [evt, vList] = await Promise.all([
          StorageService.getEventById(user.uid, eventId),
          StorageService.getVendors(eventId),
        ]);
        setEvent(evt);
        setVendors(vList);
      } catch (err) {
        console.error('Failed to load vendors:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, eventId]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setName('');
    setCategory('catering');
    setContactName('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setQuotedMajor(0);
    setBookingStatus('researching');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VendorDocument) => {
    setEditingVendor(v);
    setName(v.name);
    setCategory(v.category);
    setContactName(v.contactName || '');
    setPhone(v.phone || '');
    setEmail(v.email || '');
    setWebsite(v.website || '');
    setQuotedMajor(toMajorUnits(v.quotedAmountMinor || 0));
    setBookingStatus(v.bookingStatus);
    setNotes(v.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    if (!name.trim()) {
      setFormError('Please enter a vendor or business name.');
      return;
    }

    const quotedMinor = quotedMajor > 0 ? toMinorUnits(quotedMajor) : undefined;

    try {
      if (editingVendor) {
        const updated = await StorageService.updateVendor(eventId, editingVendor.id, {
          name: name.trim(),
          category,
          contactName: contactName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          website: website.trim(),
          quotedAmountMinor: quotedMinor,
          bookingStatus,
          notes: notes.trim(),
        });
        setVendors((prev) => prev.map((v) => (v.id === editingVendor.id ? updated : v)));
      } else {
        const created = await StorageService.createVendor({
          eventId,
          name: name.trim(),
          category,
          contactName: contactName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          website: website.trim(),
          quotedAmountMinor: quotedMinor,
          bookingStatus,
          paymentStatus: 'unpaid',
          notes: notes.trim(),
          source: 'user_entered',
        });
        setVendors((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save vendor');
    }
  };

  const handleDeleteVendor = (vendor: VendorDocument) => {
    setVendorToDelete(vendor);
  };

  const confirmDeleteVendor = async () => {
    if (!eventId || !vendorToDelete) return;
    try {
      await StorageService.deleteVendor(eventId, vendorToDelete.id);
      setVendors((prev) => prev.filter((v) => v.id !== vendorToDelete.id));
      setVendorToDelete(null);
    } catch (err) {
      console.error('Failed to delete vendor:', err);
    }
  };

  if (loading || !event) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
        Loading vendor options...
      </div>
    );
  }

  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case 'booked':
        return 'success';
      case 'shortlisted':
        return 'primary';
      case 'quoted':
        return 'accent';
      case 'contacted':
        return 'warning';
      case 'rejected':
      case 'cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header and Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Vendor Records & Quote Comparisons
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Store your personal vendor candidates, phone numbers, quotes, and booking statuses.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Trust Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.85rem 1.1rem',
          backgroundColor: 'var(--color-surface-muted)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <ShieldCheck size={18} color="var(--color-primary)" />
        <span>
          <strong>User-Entered Directory:</strong> These records are private to your event workspace. Festora AI does not claim live inventory or automatic bookings without direct vendor communication.
        </span>
      </div>

      {/* Vendors Grid */}
      {vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors recorded yet"
          description="Log caterers, photographers, sound technicians, and decorators you are considering to compare quotes and contacts."
          actionText="Add First Vendor"
          onAction={handleOpenAdd}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {vendors.map((v) => (
            <div key={v.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                    {v.category}
                  </span>
                  <Badge variant={getStatusBadgeVariant(v.bookingStatus)}>
                    {v.bookingStatus.toUpperCase()}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                  {v.name}
                </h3>
                {v.contactName && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.85rem' }}>
                    Contact: {v.contactName}
                  </p>
                )}

                {/* Quoted Amount */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Quoted Amount</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {v.quotedAmountMinor ? formatCurrency(v.quotedAmountMinor, event.currency) : 'Pending quote'}
                  </span>
                </div>

                {/* Contact Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                  {v.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={14} color="var(--color-primary)" />
                      <span>{v.phone}</span>
                    </div>
                  )}
                  {v.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} color="var(--color-primary)" />
                      <span>{v.email}</span>
                    </div>
                  )}
                  {v.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Globe size={14} color="var(--color-primary)" />
                      <a href={v.website.startsWith('http') ? v.website : `https://${v.website}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                        {v.website}
                      </a>
                    </div>
                  )}
                </div>

                {v.notes && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                    "{v.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.4rem',
                  paddingTop: '1rem',
                  marginTop: '1rem',
                  borderTop: '1px solid var(--color-border-light)',
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleOpenEdit(v)}
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDeleteVendor(v)}
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Record' : 'Record New Vendor'}
        description="Save business contact information, quoted prices, and booking status."
      >
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSaveVendor}>
          <div className="form-group">
            <label className="form-label" htmlFor="v-name">
              <span>Vendor / Business Name</span>
              <span className="required">*</span>
            </label>
            <input
              id="v-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Caterers Mumbai"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="v-cat">
                <span>Service Category</span>
              </label>
              <select
                id="v-cat"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="catering">Catering & Food</option>
                <option value="venue">Banquet / Venue</option>
                <option value="photography">Photography & Video</option>
                <option value="decor">Decor & Florals</option>
                <option value="music">DJ / Sound System</option>
                <option value="makeup">Hair & Makeup</option>
                <option value="transport">Guest Transportation</option>
                <option value="other">Other Service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="v-status">
                <span>Booking Status</span>
              </label>
              <select
                id="v-status"
                className="form-select"
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
              >
                <option value="researching">Researching</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quote Received</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="booked">Booked (Confirmed)</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="v-contact">
                <span>Contact Person</span>
              </label>
              <input
                id="v-contact"
                type="text"
                className="form-input"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Vikram Mehta"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="v-phone">
                <span>Phone Number</span>
              </label>
              <input
                id="v-phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="v-email">
                <span>Email Address</span>
              </label>
              <input
                id="v-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@royalcaterers.in"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="v-quote">
                <span>Quoted Amount ({event.currency})</span>
              </label>
              <input
                id="v-quote"
                type="number"
                min={0}
                className="form-input"
                value={quotedMajor || ''}
                onChange={(e) => setQuotedMajor(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="v-notes">
              <span>Notes / Quote Terms</span>
            </label>
            <textarea
              id="v-notes"
              className="form-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Includes 4 appetizers, 2 desserts, staff uniform, and live chaat counter..."
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
              {editingVendor ? 'Save Changes' : 'Record Vendor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Vendor Confirmation Modal */}
      <Modal
        isOpen={!!vendorToDelete}
        onClose={() => setVendorToDelete(null)}
        title="Confirm Vendor Removal"
        description="Are you sure you want to remove this vendor record? This action cannot be undone."
      >
        <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Vendor: <strong style={{ color: 'var(--color-text-main)' }}>{vendorToDelete?.name}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setVendorToDelete(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={confirmDeleteVendor}
          >
            Remove Vendor
          </button>
        </div>
      </Modal>
    </div>
  );
};
