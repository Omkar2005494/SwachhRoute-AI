import { MunicipalDataset, MunicipalDatasetSummary } from './types';
import { PUNE_WARD_12_DATASET } from './puneWard12';
import { BENGALURU_BBMP_DATASET } from './bengaluruBBMP';
import { DEMO_SAMPLE_DATASET } from './demoSample';

export const DATASETS_REGISTRY: Record<string, MunicipalDataset> = {
  pune_ward_12: PUNE_WARD_12_DATASET,
  bengaluru_bbmp: BENGALURU_BBMP_DATASET,
  demo_sample: DEMO_SAMPLE_DATASET,
};

export const AVAILABLE_DATASETS: MunicipalDatasetSummary[] = [
  {
    id: 'pune_ward_12',
    name: 'Pune Municipal Corp — Ward 12 (Kothrud)',
    city: 'Pune',
    state: 'Maharashtra',
    wardOrZone: 'Ward 12 (Kothrud / Karve Rd)',
    reportCount: PUNE_WARD_12_DATASET.reports.length,
    description: '54 authentic municipal complaints with colloquial Hinglish across 5 natural spatial clusters.',
    isRealData: true,
  },
  {
    id: 'bengaluru_bbmp',
    name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    city: 'Bengaluru',
    state: 'Karnataka',
    wardOrZone: 'East Zone (Indiranagar, Koramangala, Whitefield)',
    reportCount: BENGALURU_BBMP_DATASET.reports.length,
    description: '52 authentic municipal incident reports covering commercial food streets, markets, C&D debris.',
    isRealData: true,
  },
  {
    id: 'demo_sample',
    name: 'Simulated Demonstration Sample',
    city: 'Bengaluru',
    state: 'Karnataka',
    wardOrZone: 'Metropolitan Demo',
    reportCount: DEMO_SAMPLE_DATASET.reports.length,
    description: 'Lightweight 14-report synthetic demonstration dataset.',
    isRealData: false,
  },
];

export function getDatasetById(id: string): MunicipalDataset {
  return DATASETS_REGISTRY[id] || PUNE_WARD_12_DATASET;
}

export function getDefaultDataset(): MunicipalDataset {
  return PUNE_WARD_12_DATASET;
}
