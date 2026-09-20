'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-command-darkest text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header />

      {/* Mobile Menu Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-command-dark border-b border-command-border">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-mono text-cyan-400 px-2.5 py-1.5 rounded-md bg-command-surface border border-command-border"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{mobileMenuOpen ? 'Close Menu' : 'Navigation Menu'}</span>
        </button>
        <span className="text-[11px] font-mono text-slate-400">Command Center</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex">
            <div className="w-72 bg-command-darkest border-r border-command-border h-full flex flex-col pt-16">
              <Sidebar />
            </div>
            <div
              className="flex-1"
              onClick={() => setMobileMenuOpen(false)}
            />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-command-darkest/95">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
