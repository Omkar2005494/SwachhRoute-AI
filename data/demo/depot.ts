import { MunicipalDepot } from '@/types';

/**
 * Simulated Demonstration Municipal Depot
 * NOTE: This facility is a simulated demonstration depot located in central Bengaluru (Corporation Square area).
 * It is NOT an authentic municipal operations center and is used strictly as the CVRP origin and return point.
 */
export const DEMONSTRATION_DEPOT: MunicipalDepot = {
  id: 'DEPOT-BLR-01',
  name: 'Central Municipal Operations Depot (Corporation Square)',
  address: 'Corporation Square, Hudson Circle, Bengaluru, Karnataka 560002',
  coordinates: [12.9716, 77.5946], // EPSG:4326
  label: 'Simulated Demonstration Depot (EPSG:4326)',
};
