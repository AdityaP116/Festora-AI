import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  style,
  className = '',
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--color-surface-muted)',
        ...style,
      }}
    />
  );
};

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <Skeleton width="45%" height="1.4rem" borderRadius="var(--radius-md)" />
      <Skeleton width="90%" height="0.9rem" />
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <Skeleton key={i} width={`${75 - i * 15}%`} height="0.85rem" />
      ))}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <Skeleton width="30%" height="2rem" borderRadius="var(--radius-md)" />
        <Skeleton width="30%" height="2rem" borderRadius="var(--radius-md)" />
      </div>
    </div>
  );
};
