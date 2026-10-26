import React, { useState } from 'react';
import { LogOut, CheckCircle2, Trash2 } from 'lucide-react';
import { useAuth } from '../services/auth-context';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency || 'INR');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      // In local mode, remove auth and session state
      localStorage.removeItem('festora_ai_storage_v1');
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
            <span className="form-hint">Email is tied to your event planning session.</span>
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

      {/* Account Actions: Sign Out & Self-Service Deletion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

        {/* Delete Account (GDPR/CCPA Self-Service) */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-danger-border, #fca5a5)', backgroundColor: 'var(--color-danger-bg, #fff5f5)' }}>
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
            onClick={() => setIsDeleteModalOpen(true)}
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
