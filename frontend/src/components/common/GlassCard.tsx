import React, { type ReactNode } from 'react';

/**
 * Reusable glass‑morphism card component.
 * Applies a subtle background blur, thin border and soft shadow.
 * Accepts any children and optional hover elevation.
 */
export const GlassCard: React.FC<{
  className?: string;
  hover?: boolean;
  children?: ReactNode;
}> = ({ className = '', hover = false, children }) => {
  const base = 'bg-glass backdrop-blur-lg border border-border rounded-xl shadow-glass';
  const hoverClass = hover ? 'hover:bg-glassHover transition-colors duration-200' : '';
  return (
    <div className={`${base} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};
