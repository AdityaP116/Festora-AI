import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'neutral',
  trend,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { iconBg: 'var(--color-primary-soft)', iconColor: 'var(--color-primary)' };
      case 'accent':
        return { iconBg: 'var(--color-accent-soft)', iconColor: 'var(--color-accent)' };
      case 'success':
        return { iconBg: 'var(--color-success-bg)', iconColor: 'var(--color-success)' };
      case 'warning':
        return { iconBg: 'var(--color-warning-bg)', iconColor: 'var(--color-warning)' };
      case 'danger':
        return { iconBg: 'var(--color-danger-bg)', iconColor: 'var(--color-danger)' };
      default:
        return { iconBg: 'var(--color-surface-muted)', iconColor: 'var(--color-text-muted)' };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
          {label}
        </span>
        {Icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: styles.iconBg,
              color: styles.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {(subtext || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {trend && <span style={{ fontWeight: 600 }}>{trend}</span>}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  );
};
