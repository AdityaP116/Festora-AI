import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: Toast = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Toast Render Portal / Container */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '380px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              bg: 'var(--color-surface)',
              border: 'var(--color-success-border)',
              accent: 'var(--color-success)',
            },
            error: {
              icon: AlertCircle,
              bg: 'var(--color-surface)',
              border: 'var(--color-danger-border)',
              accent: 'var(--color-danger)',
            },
            warning: {
              icon: AlertTriangle,
              bg: 'var(--color-surface)',
              border: 'var(--color-warning-border)',
              accent: 'var(--color-warning)',
            },
            info: {
              icon: Info,
              bg: 'var(--color-surface)',
              border: 'var(--color-info-border)',
              accent: 'var(--color-info)',
            },
          }[toast.type];

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={toast.id}
              role="status"
              className="toast-card"
              style={{
                pointerEvents: 'auto',
                backgroundColor: typeConfig.bg,
                border: `1px solid ${typeConfig.border}`,
                borderLeft: `4px solid ${typeConfig.accent}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                animation: 'slideInToast 0.25s ease-out',
              }}
            >
              <IconComponent size={20} color={typeConfig.accent} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)', margin: 0 }}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', margin: 0, lineHeight: 1.4 }}>
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                style={{
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
