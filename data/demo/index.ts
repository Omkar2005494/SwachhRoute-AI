import { DEMO_REPORTS } from './reports';
import { DEMO_HOTSPOTS } from './hotspots';
import { DEMO_FLEET } from './fleet';
import { DEMO_ROUTES } from './routes';
import { DashboardKPIs } from '@/types';

export * from './reports';
export * from './hotspots';
export * from './fleet';
export * from './routes';
export * from './depot';

export const DEMO_DATA_NOTICE = 'Simulated Demonstration Data';

/**
 * Computes live telemetry KPIs from demo state
 */
export function getDemoDashboardKPIs(): DashboardKPIs {
  const totalReports = DEMO_REPORTS.length;
  const activeHotspots = DEMO_HOTSPOTS.filter(h => h.status === 'active').length;
  const highPriorityHotspots = DEMO_HOTSPOTS.filter(h => h.urgencyLevel === 'high' || h.urgencyLevel === 'critical').length;
  
  const totalPendingWasteKg = DEMO_HOTSPOTS
    .filter(h => h.status === 'active')
    .reduce((sum, h) => sum + h.totalEstimatedWasteKg, 0);

  const availableFleetCount = DEMO_FLEET.filter(v => v.status === 'available').length;
  const totalFleetCount = DEMO_FLEET.length;

  return {
    totalReports,
    activeHotspots,
    highPriorityHotspots,
    pendingCollectionTons: Math.round((totalPendingWasteKg / 1000) * 10) / 10,
    availableFleetCount,
    totalFleetCount,
  };
}
