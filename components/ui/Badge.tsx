import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate';
  pulse?: boolean;
}

export function Badge({
  children,
  className,
  variant = 'slate',
  pulse = false,
  ...props
}: BadgeProps) {
  const variantStyles = {
    cyan: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-500/30',
    emerald: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-950/70 text-rose-300 border-rose-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/50',
  };

  const pulseStyles = {
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    slate: 'bg-slate-400',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={clsx(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              pulseStyles[variant]
            )}
          />
          <span
            className={clsx('relative inline-flex rounded-full h-2 w-2', pulseStyles[variant])}
          />
        </span>
      )}
      {children}
    </span>
  );
}
