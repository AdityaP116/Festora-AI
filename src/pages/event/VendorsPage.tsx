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

  // Filter & Search states
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryPresets = [
    { id: 'catering', label: 'Catering & Food', defaultBudget: '₹1,500/plate', sampleQuestions: 'Includes crockery, live counters, waitstaff?' },
    { id: 'venue', label: 'Banquet & Venue', defaultBudget: '₹1.5L - ₹5L/day', sampleQuestions: 'AC backup, outside catering allowed, sound license?' },
    { id: 'photography', label: 'Photography & Cinema', defaultBudget: '₹40k - ₹1.5L', sampleQuestions: 'Deliverables timeline, drone coverage, raw footage?' },
    { id: 'decor', label: 'Decor & Florals', defaultBudget: '₹50k - ₹2L', sampleQuestions: 'Stage backdrop, flower type (real vs artificial), lighting?' },
    { id: 'music', label: 'DJ & Sound System', defaultBudget: '₹15k - ₹40k', sampleQuestions: 'Console included, overtime charges, playlist sync?' },
    { id: 'makeup', label: 'Hair & Makeup', defaultBudget: '₹8k - ₹25k', sampleQuestions: 'Draping included, trial session, bridal touchups?' },
    { id: 'transport', label: 'Guest Transport', defaultBudget: '₹10k - ₹35k', sampleQuestions: 'Driver allowance, luggage space, AC buses?' },
  ];

  const handleOpenAddWithCategory = (cat: string) => {
    setEditingVendor(null);
    setName('');
    setCategory(cat);
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

  const filteredVendors = vendors.filter((v) => {
    const matchesCategory = selectedCategoryFilter === 'all' || v.category === selectedCategoryFilter;
    const matchesStatus = selectedStatusFilter === 'all' || v.bookingStatus === selectedStatusFilter;
    const matchesSearch = !searchQuery.trim() || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (v.contactName && v.contactName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.notes && v.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const totalQuotedMinor = vendors.reduce((acc, curr) => acc + (curr.quotedAmountMinor || 0), 0);
  const totalBookedMinor = vendors
    .filter((v) => v.bookingStatus === 'booked')
    .reduce((acc, curr) => acc + (curr.quotedAmountMinor || 0), 0);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header and Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Vendor Directory & Quote Comparisons
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Compare proposals, track booking milestones, and record vendor quotes for your celebration.
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

      {/* Quote Benchmarks & Summary Cards (PlanToday Style) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Vendors Listed</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.25rem' }}>
            {vendors.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Across {new Set(vendors.map(v => v.category)).size} categories
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Quoted Value</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {formatCurrency(totalQuotedMinor, event.currency)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Across all candidate quotes
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Confirmed Bookings</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.25rem' }}>
            {formatCurrency(totalBookedMinor, event.currency)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            {vendors.filter(v => v.bookingStatus === 'booked').length} confirmed supplier(s)
          </span>
        </div>
      </div>

      {/* Quick Add By Category (PlanToday inspired category tiles) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Quick-Add Indian Event Services:
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Click any category to log details
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categoryPresets.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleOpenAddWithCategory(cat.id)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                fontSize: '0.825rem',
                color: 'var(--color-text)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-soft)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <Plus size={12} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search vendors by name, contact or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '320px', fontSize: '0.85rem' }}
          />

          {/* Category Filter */}
          <select
            className="form-select"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            style={{ maxWidth: '180px', fontSize: '0.85rem' }}
          >
            <option value="all">All Categories</option>
            <option value="catering">Catering & Food</option>
            <option value="venue">Banquet / Venue</option>
            <option value="photography">Photography & Cinema</option>
            <option value="decor">Decor & Florals</option>
            <option value="music">DJ / Sound System</option>
            <option value="makeup">Hair & Makeup</option>
            <option value="transport">Transportation</option>
            <option value="other">Other Service</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{ maxWidth: '160px', fontSize: '0.85rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="researching">Researching</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="booked">Booked</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Showing {filteredVendors.length} of {vendors.length} vendors
        </span>
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
          <strong>Private Workspace Directory:</strong> Compare multiple quotes side-by-side. Festora AI operates with zero vendor commissions.
        </span>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title={vendors.length === 0 ? "No vendors recorded yet" : "No vendors match your search filters"}
          description={vendors.length === 0 
            ? "Log caterers, photographers, sound technicians, and decorators you are considering to compare quotes and contacts."
            : "Try adjusting your category or status filters to view logged vendors."}
          actionText={vendors.length === 0 ? "Add First Vendor" : "Clear Filters"}
          onAction={vendors.length === 0 ? handleOpenAdd : () => { setSelectedCategoryFilter('all'); setSelectedStatusFilter('all'); setSearchQuery(''); }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredVendors.map((v) => (
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
