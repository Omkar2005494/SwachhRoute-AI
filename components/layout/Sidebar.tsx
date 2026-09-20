'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Flame,
  Truck,
  Route as RouteIcon,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: 'cyan' | 'purple' | 'amber';
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    badge: '8 Active',
    badgeColor: 'cyan',
  },
  {
    name: 'Hotspots',
    href: '/hotspots',
    icon: Flame,
    badge: '3 Clusters',
    badgeColor: 'amber',
  },
  {
    name: 'Fleet',
    href: '/fleet',
    icon: Truck,
    badge: '4 Units',
    badgeColor: 'purple',
  },
  {
    name: 'Routes',
    href: '/routes',
    icon: RouteIcon,
  },
  {
    name: 'Manifests',
    href: '/manifests',
    icon: ClipboardList,
  },
  {
    name: 'Officer Review',
    href: '/officer',
    icon: ShieldCheck,
    badge: 'Override',
    badgeColor: 'purple',
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: Sparkles,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-command-dark/95 border-r border-command-border flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
      {/* Operations Navigation Header */}
      <div className="px-4 py-3 border-b border-command-border/60">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Command Center
          </span>
          <span className="text-[10px] text-cyan-500/80 font-semibold">v0.1-P1</span>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-command-surface border border-cyan-500/30 text-white shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-command-surface/50 border border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={clsx(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                <span>{item.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge && (
                  <span
                    className={clsx(
                      'text-[10px] px-1.5 py-0.5 rounded font-mono',
                      item.badgeColor === 'cyan' && 'bg-cyan-950 text-cyan-300 border border-cyan-800/60',
                      item.badgeColor === 'amber' && 'bg-amber-950 text-amber-300 border border-amber-800/60',
                      item.badgeColor === 'purple' && 'bg-purple-950 text-purple-300 border border-purple-800/60'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform duration-200 opacity-0 group-hover:opacity-100',
                    isActive && 'opacity-100 text-cyan-400'
                  )}
                />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Municipal Ward Envelope Footer */}
      <div className="p-3 m-3 rounded-lg bg-command-surface/80 border border-command-border/80">
        <div className="text-[11px] font-mono text-slate-400 space-y-1">
          <div className="text-slate-300 font-medium">Urban Service Zone</div>
          <div className="text-[10px] text-cyan-400 truncate">Synthetic Bengaluru Bounds</div>
          <div className="text-[10px] text-slate-500">EPSG:4326 | EPSG:3857 Ready</div>
        </div>
      </div>
    </aside>
  );
}
