/**
 * Status Badge Component - Clean Theme Palette
 */
import React from 'react';

interface StatusBadgeProps {
  status: 'draft' | 'processing' | 'review' | 'validated' | 'commerce-ready' | 'failed';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const statusConfig = {
    draft: {
      bg: 'bg-blue-950/50',
      text: 'text-slate-400',
      border: 'border-slate-800',
      icon: '○',
    },
    processing: {
      bg: 'bg-blue-600/15',
      text: 'text-cyan-400',
      border: 'border-blue-500/30',
      icon: '●',
    },
    review: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: '⚠',
    },
    validated: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: '✓',
    },
    'commerce-ready': {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: '✓',
    },
    failed: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      icon: '✕',
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const displayLabel =
    label ||
    status
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span>{config.icon}</span>
      {displayLabel}
    </span>
  );
};

/**
 * Confidence Badge Component
 */
interface ConfidenceBadgeProps {
  confidence: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  let colorClass = 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
  if (confidence >= 80) colorClass = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
  else if (confidence >= 60) colorClass = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${colorClass}`}>
      {confidence}%
    </span>
  );
};

/**
 * Progress Bar Component
 */
interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  return (
    <div className="w-full">
      <div className={`w-full ${heightClass} bg-slate-900 rounded-full overflow-hidden border border-blue-500/15`}>
        <div
          className={`${heightClass} bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <p className="text-xs text-slate-400 mt-1">{Math.round(percentage)}%</p>}
    </div>
  );
};

/**
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: number;
  variant?: 'default' | 'highlight';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon,
  trend,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 hover:border-cyan-400/40 hover:bg-[#0a1532]/90 shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-400">{label}</span>
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0 text-cyan-400">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white">{value}</span>
          {unit && <span className="text-xs text-slate-400">{unit}</span>}
        </div>
        {trend !== undefined && (
          <p
            className={`text-[10px] font-medium mt-1 ${
              trend >= 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last 7 days
          </p>
        )}
      </div>
    </div>
  );
};
