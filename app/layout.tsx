import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportsProvider } from '@/lib/reportsContext';

export const metadata: Metadata = {
  title: 'SwachhRoute AI — Autonomous Waste Hotspot Clustering & Dynamic Fleet Route Optimiser',
  description: 'NeuraMorphix HackForge 2026 | Problem Statement CS11 — Geospatial Environment: Mapping Waste-Dumping Hotspots and Improving Collection Routes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-command-darkest text-slate-100 antialiased">
        <ReportsProvider>
          <AppLayout>{children}</AppLayout>
        </ReportsProvider>
      </body>
    </html>
  );
}
