import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'none';
}

export function Card({
  children,
  className,
  glow = 'none',
  ...props
}: CardProps) {
  const glowStyles = {
    cyan: 'hover:border-cyan-500/40 hover:shadow-glow-cyan transition-all duration-300',
    purple: 'hover:border-purple-500/40 hover:shadow-glow-purple transition-all duration-300',
    emerald: 'hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/40 transition-all duration-300',
    amber: 'hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-950/40 transition-all duration-300',
    rose: 'hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-950/40 transition-all duration-300',
    none: '',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'bg-command-card/90 backdrop-blur-md border border-command-border rounded-xl p-5 shadow-card transition-colors',
          glowStyles[glow],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border/60">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-command-surface border border-command-border text-cyan-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-100 tracking-wide">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
