import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../services/auth-context';
import { SeoHead } from '../components/seo/SeoHead';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await signIn('aditya@festora.ai', 'demo1234');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <SeoHead
        title="Sign In"
        description="Sign in to your Festora AI celebration planning workspace."
        canonicalPath="/login"
      />
      {/* Brand Header */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: 'var(--color-text)',
          fontWeight: 700,
          fontSize: '1.4rem',
          marginBottom: '2rem',
        }}
      >
        <img
          src="/logo.png"
          alt="Festora AI Logo"
          style={{
            width: '42px',
            height: '42px',
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 2px 8px rgba(101, 67, 165, 0.15)',
          }}
        />
        <span>Festora<span style={{ color: 'var(--color-primary)' }}> AI</span></span>
      </Link>

      {/* Login Card */}
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.75rem' }}>
          Sign in to access your celebration workspaces and plans.
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <span>Email address</span>
              <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">
                <span>Password</span>
                <span className="required">*</span>
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', height: '44px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign in</span>
              </>
            )}
          </button>
        </form>

        <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          style={{
            width: '100%',
            height: '44px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Quick Demo Access Button */}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleDemoSignIn}
          style={{ width: '100%', height: '38px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}
          disabled={isSubmitting}
        >
          <Sparkles size={14} color="var(--color-primary)" />
          <span>Quick Demo Host Access</span>
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.775rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          By continuing, you agree to Festora AI's{' '}
          <Link to="/terms" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            Terms & Conditions
          </Link>{' '}
          and acknowledge our{' '}
          <Link to="/privacy" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>.
        </p>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
