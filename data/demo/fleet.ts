import { FleetVehicle } from '@/types';

/**
 * Lightweight Synthetic Demonstration Fleet Vehicles
 * NOTE: These vehicle assets and locations are simulated for demonstration purposes.
 * Canonical Machinery Types: 'hydraulic_compactor' | 'mini_tipper' | 'backhoe'
 */
export const DEMO_FLEET: FleetVehicle[] = [
  {
    id: 'HYD-COMP-01',
    registrationNumber: 'KA-01-EA-4211',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 4500,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946], // Depot
    fuelType: 'cng',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98450 11234',
  },
  {
    id: 'HYD-COMP-02',
    registrationNumber: 'KA-01-GA-9023',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 7000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946], // Depot
    fuelType: 'cng',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Anand Gowda',
    driverPhone: '+91 97410 55432',
  },
  {
    id: 'MINI-TIP-01',
    registrationNumber: 'KA-03-FA-8890',
    vehicleType: 'mini_tipper',
    capacityKg: 1800,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946], // Depot
    fuelType: 'electric',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Suresh Patil',
    driverPhone: '+91 98860 99876',
  },
  {
    id: 'BACK-01',
    registrationNumber: 'KA-05-TR-3349',
    vehicleType: 'backhoe',
    capacityKg: 0,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946], // Depot
    fuelType: 'diesel',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: false, // Operational remediation equipment; does not participate in CVRP capacity hauling
    driverName: 'Basavaraj N',
    driverPhone: '+91 99001 77654',
  },
  {
    id: 'VEH-MAINT-01',
    registrationNumber: 'KA-04-MB-1024',
    vehicleType: 'mini_tipper',
    capacityKg: 1800,
    currentLoadKg: 0,
    status: 'maintenance',
    currentLocation: [12.9716, 77.5946], // Depot
    fuelType: 'electric',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: false, // Out of service for scheduled maintenance
    driverName: 'Kiran Rao',
    driverPhone: '+91 99002 33412',
  },
];
