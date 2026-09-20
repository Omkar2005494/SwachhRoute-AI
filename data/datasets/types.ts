import { WasteReport, MunicipalDepot, FleetVehicle } from '@/types';
import { BoundaryEnvelope } from '@/services/dataProcessing/boundaryValidation';

export interface MunicipalDataset {
  id: string;
  name: string;
  city: string;
  state: string;
  wardOrZone: string;
  description: string;
  depot: MunicipalDepot;
  fleet: FleetVehicle[];
  defaultCenter: [number, number];
  defaultZoom: number;
  boundary: BoundaryEnvelope;
  reports: WasteReport[];
}

export interface MunicipalDatasetSummary {
  id: string;
  name: string;
  city: string;
  state: string;
  wardOrZone: string;
  reportCount: number;
  description: string;
  isRealData: boolean;
}
