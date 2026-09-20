import { DEMO_REPORTS, DEMO_FLEET, DEMONSTRATION_DEPOT } from '@/data/demo';
import { BENGALURU_BBMP_BOUNDS } from '@/services/dataProcessing/boundaryValidation';
import { MunicipalDataset } from './types';

export const DEMO_SAMPLE_DATASET: MunicipalDataset = {
  id: 'demo_sample',
  name: 'Simulated Demonstration Sample',
  city: 'Bengaluru',
  state: 'Karnataka',
  wardOrZone: 'Metropolitan Demonstration',
  description: 'Lightweight 14-report synthetic dataset for rapid UI testing and verification.',
  depot: DEMONSTRATION_DEPOT,
  fleet: DEMO_FLEET,
  defaultCenter: [12.9716, 77.5946],
  defaultZoom: 12,
  boundary: BENGALURU_BBMP_BOUNDS,
  reports: DEMO_REPORTS,
};
