import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'badge-sm' : '';
  return (
    <span className={`badge badge-${variant} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
};
