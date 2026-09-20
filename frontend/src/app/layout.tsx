import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SwachhRoute AI — Autonomous Waste Hotspot Clustering & Dynamic Fleet Route Optimiser',
  description: 'CS11 Geospatial Environment: Closed-loop civic intelligence platform connecting crowdsourced citizen reports to dynamic CVRP fleet logistics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Leaflet CSS */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        {/* FontAwesome 6 Icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="antialiased bg-[#07090e] text-[#f8fafc] h-screen w-screen overflow-hidden flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
