import React, { useState } from 'react';
import { LogOut, CheckCircle2, Trash2 } from 'lucide-react';
import { useAuth } from '../services/auth-context';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency || 'INR');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateProfile({
        displayName: displayName.trim(),
        defaultCurrency,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteAccount();
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      console.error('Failed to delete account:', err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const userData = {
      userProfile: user,
      exportedAt: new Date().toISOString(),
      formatVersion: '2026.1',
    };
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `festora-account-export-${user.uid}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          Account Preferences
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
          Manage your organizer profile and default currency preferences.
        </p>
      </div>

      {isSaved && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Account preferences successfully updated!</span>
        </div>
      )}

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="s-name">
              <span>Display Name</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input
                id="s-name"
                type="text"
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="s-email">
              <span>Email Address</span>
            </label>
            <input
              id="s-email"
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: 'var(--color-surface-muted)', cursor: 'not-allowed' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
              <span className="form-hint" style={{ margin: 0 }}>
                Signed in via: <strong>{user?.authProvider === 'google.com' ? 'Google Account' : 'Email & Password'}</strong>
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="s-curr">
              <span>Default Celebration Currency</span>
            </label>
            <select
              id="s-curr"
              className="form-select"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="AED">AED (د.إ) - UAE Dirham</option>
            </select>
            <span className="form-hint">Used as default for new events; each event retains its own currency.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
            style={{ marginTop: '0.75rem' }}
          >
            {isSaving ? 'Saving Changes...' : 'Save Preferences'}
          </button>
        </form>
      </div>

      {/* Privacy & Data Protection Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Export Data */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Export Account Data (DPDP / GDPR)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Download a machine-readable JSON copy of your personal profile and consent records.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportData}
            style={{ fontSize: '0.875rem' }}
          >
            Export JSON
          </button>
        </div>

        {/* Cookie & Tracking Preferences */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Cookie & Analytics Consent
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Review or adjust your consent choices for diagnostic telemetry and essential storage.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('festora:open-cookie-preferences'));
              }
            }}
            style={{ fontSize: '0.875rem' }}
          >
            Manage Cookies
          </button>
        </div>

        {/* Sign out */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border)' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Sign Out of Session
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Safely log out from this device. Your event records remain stored in your account.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSignOut}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Delete Account (GDPR/DPDP Self-Service) */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-danger-border, #fca5a5)', backgroundColor: 'var(--color-danger-bg, #fff5f5)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-danger)' }}>
              Delete Account
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              Permanently remove your account and all associated celebrations, budgets, and plans.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Trash2 size={16} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Confirm Account Deletion Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div style={{ padding: '0.5rem 0' }}>
          {deleteError && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {deleteError}
            </div>
          )}
          <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Are you sure you want to delete your account (<strong>{user?.email}</strong>)? This will permanently remove all your celebration workspaces, budget records, checklists, and vendor contacts. This action cannot be undone.
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
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting Account...' : 'Permanently Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
