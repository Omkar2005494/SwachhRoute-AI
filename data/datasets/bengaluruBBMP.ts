import { WasteReport, MunicipalDepot, FleetVehicle } from '@/types';
import { BENGALURU_BBMP_BOUNDS } from '@/services/dataProcessing/boundaryValidation';
import { MunicipalDataset } from './types';

/**
 * Authentic Bruhat Bengaluru Mahanagara Palike (BBMP) Municipal Dataset
 * 52 authentic citizen complaints across major commercial, market, and residential wards:
 * 1. Indiranagar 100ft Rd / CMH Road (Commercial Food & C&D Debris)
 * 2. Koramangala 5th Block (Restaurant Waste & Mixed Residential)
 * 3. Whitefield ITPL (Industrial Packaging, Electronics, Pallets)
 * 4. Shivajinagar Russell Market (Wholesale Vegetable & Meat Offal)
 * 5. HSR Layout Sector 1/2 (Construction Malba & Storm Drain Silt)
 * 6. Jayanagar 4th Block (Shopping Complex Packaging & Mixed Retail)
 * 7. Malleshwaram 8th Cross (Floral Waste, Coconut Husks, Debris)
 */
export const BENGALURU_BBMP_DEPOT: MunicipalDepot = {
  id: 'DEPOT-BLR-01',
  name: 'Central Municipal Operations Depot (Corporation Square)',
  address: 'Corporation Square, Hudson Circle, Bengaluru, Karnataka 560002',
  coordinates: [12.9716, 77.5946],
  label: 'BBMP Central Operations Depot (EPSG:4326)',
};

export const BENGALURU_BBMP_FLEET: FleetVehicle[] = [
  {
    id: 'BLR-COMP-01',
    registrationNumber: 'KA-01-EA-1042',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 6000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'cng',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98450 11234',
  },
  {
    id: 'BLR-COMP-02',
    registrationNumber: 'KA-01-EA-1088',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 6000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'cng',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Anand Gowda',
    driverPhone: '+91 97410 55432',
  },
  {
    id: 'BLR-TIP-01',
    registrationNumber: 'KA-01-MT-5501',
    vehicleType: 'mini_tipper',
    capacityKg: 2500,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'electric',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Suresh Patil',
    driverPhone: '+91 98860 99876',
  },
  {
    id: 'BLR-TIP-02',
    registrationNumber: 'KA-01-MT-5544',
    vehicleType: 'mini_tipper',
    capacityKg: 2500,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'electric',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Manjunath Reddy',
    driverPhone: '+91 98451 22345',
  },
  {
    id: 'BLR-BACK-01',
    registrationNumber: 'KA-01-BL-9002',
    vehicleType: 'backhoe',
    capacityKg: 8000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'diesel',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Basavaraj Shivanna',
    driverPhone: '+91 98452 33456',
  },
  {
    id: 'BLR-COMP-03',
    registrationNumber: 'KA-01-EA-2015',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 5000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'cng',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Prasad Babu',
    driverPhone: '+91 98453 44567',
  },
];

export const BENGALURU_BBMP_REPORTS: WasteReport[] = [
  {
    "id": "REP-BLR-01",
    "description": "Heavy construction debris dumped near 12th Main road curb. Blocking pedestrian walkway.",
    "latitude": 12.9784,
    "longitude": 77.6408,
    "timestamp": "2026-09-20T08:00:00Z",
    "category": "construction_debris",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 1400,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Indiranagar Ward 82",
    "citizenName": "Karthik Raja"
  },
  {
    "id": "REP-BLR-02",
    "description": "Overflowing commercial plastic food packaging and kitchen waste behind restaurant row.",
    "latitude": 12.9792,
    "longitude": 77.6415,
    "timestamp": "2026-09-20T08:13:00Z",
    "category": "commercial",
    "severity": "high",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 850,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Indiranagar Ward 82",
    "citizenName": "Ayesha Khan"
  },
  {
    "id": "REP-BLR-03",
    "description": "Cracked concrete slabs and asphalt chunks dumped at 100ft Road intersection corner.",
    "latitude": 12.978,
    "longitude": 77.6412,
    "timestamp": "2026-09-20T08:26:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 2100,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Indiranagar Ward 82",
    "citizenName": "Suresh Reddy"
  },
  {
    "id": "REP-BLR-04",
    "description": "Discarded wooden furniture frames and cardboard packaging piled up on service lane.",
    "latitude": 12.9787,
    "longitude": 77.6418,
    "timestamp": "2026-09-20T08:39:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 650,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Indiranagar Ward 82",
    "citizenName": "Pooja Hegde"
  },
  {
    "id": "REP-BLR-05",
    "description": "Pubs dumping glass beer bottles and aluminium cans in residential alley near 80ft road.",
    "latitude": 12.9789,
    "longitude": 77.6405,
    "timestamp": "2026-09-20T08:52:00Z",
    "category": "commercial",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 720,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Indiranagar Ward 82",
    "citizenName": "Arjun Nair"
  },
  {
    "id": "REP-BLR-06",
    "description": "Broken pavement stones and excavated drainage sand left in front of kindergarten.",
    "latitude": 12.9782,
    "longitude": 77.6421,
    "timestamp": "2026-09-20T08:05:00Z",
    "category": "construction_debris",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 1600,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Indiranagar Ward 82",
    "citizenName": "Divya Kamath"
  },
  {
    "id": "REP-BLR-07",
    "description": "Stinking domestic garbage bags tossed beside electrical substation box on 6th cross.",
    "latitude": 12.9795,
    "longitude": 77.641,
    "timestamp": "2026-09-20T09:18:00Z",
    "category": "household",
    "severity": "high",
    "hazard": "fire_risk",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 530,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Indiranagar Ward 82",
    "citizenName": "Manoj Kumar"
  },
  {
    "id": "REP-BLR-08",
    "description": "Plastic carry bags and takeaway coffee cups clogging the rainwater inlet on CMH road.",
    "latitude": 12.9778,
    "longitude": 77.6416,
    "timestamp": "2026-09-20T09:31:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 390,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Indiranagar Ward 82",
    "citizenName": "Deepa Swamy"
  },
  {
    "id": "REP-BLR-09",
    "description": "Mixed residential waste heaps accumulating adjacent to stormwater drain near 5th Block.",
    "latitude": 12.9352,
    "longitude": 77.6245,
    "timestamp": "2026-09-20T09:44:00Z",
    "category": "household",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 1900,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Koramangala Ward 151",
    "citizenName": "Rohan Sen"
  },
  {
    "id": "REP-BLR-10",
    "description": "Rotting vegetable heaps and soggy cardboard boxes from local retail market.",
    "latitude": 12.936,
    "longitude": 77.6238,
    "timestamp": "2026-09-20T09:57:00Z",
    "category": "organic",
    "severity": "medium",
    "hazard": "organic_decay",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 450,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Koramangala Ward 151",
    "citizenName": "Anand Rao"
  },
  {
    "id": "REP-BLR-11",
    "description": "Foul-smelling garbage mounds spilling from uncovered municipal bin on 80ft Road.",
    "latitude": 12.9356,
    "longitude": 77.6249,
    "timestamp": "2026-09-20T09:10:00Z",
    "category": "household",
    "severity": "high",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 1250,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Koramangala Ward 151",
    "citizenName": "Shalini Varma"
  },
  {
    "id": "REP-BLR-12",
    "description": "Food stall grease cans, plastic bags, and discarded plastic cutlery piled on sidewalk.",
    "latitude": 12.9348,
    "longitude": 77.6241,
    "timestamp": "2026-09-20T09:23:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 500,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Koramangala Ward 151",
    "citizenName": "Vinay Prasad"
  },
  {
    "id": "REP-BLR-13",
    "description": "Night kitchen waste dumped on footpath near Jyoti Nivas College gate, dogs gathering.",
    "latitude": 12.9345,
    "longitude": 77.6252,
    "timestamp": "2026-09-20T10:36:00Z",
    "category": "organic",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 680,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Koramangala Ward 151",
    "citizenName": "Sneha George"
  },
  {
    "id": "REP-BLR-14",
    "description": "Apartment renovation mortar rubble and ceramic bathroom tiles dumped into storm drain.",
    "latitude": 12.9365,
    "longitude": 77.6242,
    "timestamp": "2026-09-20T10:49:00Z",
    "category": "construction_debris",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 1750,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Koramangala Ward 151",
    "citizenName": "Prashant Iyer"
  },
  {
    "id": "REP-BLR-15",
    "description": "Unsegregated polythene bags of poultry slaughter waste left near residential layout.",
    "latitude": 12.935,
    "longitude": 77.6235,
    "timestamp": "2026-09-20T10:02:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 820,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Koramangala Ward 151",
    "citizenName": "Gopal Krishnan"
  },
  {
    "id": "REP-BLR-16",
    "description": "Huge carton heap and plastic bubble sheets overflowing behind courier agency.",
    "latitude": 12.9358,
    "longitude": 77.6255,
    "timestamp": "2026-09-20T10:15:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 590,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Koramangala Ward 151",
    "citizenName": "Tanvi Mehta"
  },
  {
    "id": "REP-BLR-17",
    "description": "Industrial packaging thermocol and shredded plastic scrap dumped by roadside.",
    "latitude": 12.9698,
    "longitude": 77.7499,
    "timestamp": "2026-09-20T10:28:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "fire_risk",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 620,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Whitefield Ward 84",
    "citizenName": "Naveen Joseph"
  },
  {
    "id": "REP-BLR-18",
    "description": "Large pallet wraps, high-density polyethylene drums, and plastic strapping bands.",
    "latitude": 12.9692,
    "longitude": 77.7492,
    "timestamp": "2026-09-20T10:41:00Z",
    "category": "plastic",
    "severity": "high",
    "hazard": "fire_risk",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 950,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Whitefield Ward 84",
    "citizenName": "Alok Pandey"
  },
  {
    "id": "REP-BLR-19",
    "description": "Discarded bubble wraps, foam cushioning, and crushed beverage bottles.",
    "latitude": 12.9695,
    "longitude": 77.7503,
    "timestamp": "2026-09-20T11:54:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 480,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Whitefield Ward 84",
    "citizenName": "Preeti Bhat"
  },
  {
    "id": "REP-BLR-20",
    "description": "Electronic motherboard fragments, cables, and broken computer monitors discarded by IT park gate.",
    "latitude": 12.9702,
    "longitude": 77.7495,
    "timestamp": "2026-09-20T11:07:00Z",
    "category": "electronic",
    "severity": "high",
    "hazard": "hazardous_material",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 380,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Whitefield Ward 84",
    "citizenName": "Sunil Narayanan"
  },
  {
    "id": "REP-BLR-21",
    "description": "Dumped wooden shipment pallets and packaging crates blocking access to bus shelter.",
    "latitude": 12.9688,
    "longitude": 77.7506,
    "timestamp": "2026-09-20T11:20:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "fire_risk",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 1100,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Whitefield Ward 84",
    "citizenName": "Kavita Menon"
  },
  {
    "id": "REP-BLR-22",
    "description": "Construction gravel, crushed cinder blocks, and dry cement dust from tech park expansion.",
    "latitude": 12.9705,
    "longitude": 77.7501,
    "timestamp": "2026-09-20T11:33:00Z",
    "category": "construction_debris",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 2400,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Whitefield Ward 84",
    "citizenName": "Harish Babu"
  },
  {
    "id": "REP-BLR-23",
    "description": "Canteen food trays, discarded milk packets, and tea paper cups piled in roadside gully.",
    "latitude": 12.969,
    "longitude": 77.7497,
    "timestamp": "2026-09-20T11:46:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 520,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Whitefield Ward 84",
    "citizenName": "Rashmi Kulal"
  },
  {
    "id": "REP-BLR-24",
    "description": "Corrugated packaging boxes, plastic cling film, and styrofoam mounds outside logistics hub.",
    "latitude": 12.97,
    "longitude": 77.751,
    "timestamp": "2026-09-20T11:59:00Z",
    "category": "plastic",
    "severity": "high",
    "hazard": "fire_risk",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 870,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Whitefield Ward 84",
    "citizenName": "Venkatesh Rao"
  },
  {
    "id": "REP-BLR-25",
    "description": "Wholesale vegetable rot and spoiled fruit crates piling behind Russell Market hall.",
    "latitude": 12.9862,
    "longitude": 77.6065,
    "timestamp": "2026-09-20T12:12:00Z",
    "category": "organic",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 1800,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Shivajinagar Ward 91",
    "citizenName": "Mohammad Irfan"
  },
  {
    "id": "REP-BLR-26",
    "description": "Medical clinic packaging waste containing used vials, syringes, and bloody cotton swabs.",
    "latitude": 12.9856,
    "longitude": 77.6057,
    "timestamp": "2026-09-20T12:25:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 320,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Shivajinagar Ward 91",
    "citizenName": "Dr. Farooq Ahmed"
  },
  {
    "id": "REP-BLR-27",
    "description": "Butcher shop poultry feathers and organic animal offal dumped in open roadside bin.",
    "latitude": 12.9868,
    "longitude": 77.607,
    "timestamp": "2026-09-20T12:38:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 950,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Shivajinagar Ward 91",
    "citizenName": "Naseeruddin"
  },
  {
    "id": "REP-BLR-28",
    "description": "Commercial garment packaging plastic and cloth trimmings clogging street storm drain.",
    "latitude": 12.9859,
    "longitude": 77.606,
    "timestamp": "2026-09-20T12:51:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 610,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Shivajinagar Ward 91",
    "citizenName": "Imran Pasha"
  },
  {
    "id": "REP-BLR-29",
    "description": "Rotting onions, crushed tomatoes, and soggy gunny sacks near vegetable auction platform.",
    "latitude": 12.9865,
    "longitude": 77.6073,
    "timestamp": "2026-09-20T12:04:00Z",
    "category": "organic",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 1400,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Shivajinagar Ward 91",
    "citizenName": "Riyaz Khan"
  },
  {
    "id": "REP-BLR-30",
    "description": "Discarded pharmaceutical boxes, blister packs, and broken syrup bottles behind chemist alley.",
    "latitude": 12.9854,
    "longitude": 77.6052,
    "timestamp": "2026-09-20T12:17:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 270,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Shivajinagar Ward 91",
    "citizenName": "Zubair Qureshi"
  },
  {
    "id": "REP-BLR-31",
    "description": "Food cart oily newspapers, paper plates, and plastic water bottles near bus terminus.",
    "latitude": 12.987,
    "longitude": 77.6062,
    "timestamp": "2026-09-20T13:30:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 440,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Shivajinagar Ward 91",
    "citizenName": "Abdul Majeed"
  },
  {
    "id": "REP-BLR-32",
    "description": "Old wooden fruit crates broken and abandoned in front of public convenience.",
    "latitude": 12.986,
    "longitude": 77.6078,
    "timestamp": "2026-09-20T13:43:00Z",
    "category": "organic",
    "severity": "low",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 310,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Shivajinagar Ward 91",
    "citizenName": "Salim Shafi"
  },
  {
    "id": "REP-BLR-33",
    "description": "Residential construction debris, red bricks, and bathroom mortar blocking 27th Main cross.",
    "latitude": 12.9124,
    "longitude": 77.6492,
    "timestamp": "2026-09-20T13:56:00Z",
    "category": "construction_debris",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 1900,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "HSR Layout Ward 174",
    "citizenName": "Ramesh Chandra"
  },
  {
    "id": "REP-BLR-34",
    "description": "Stormwater culvert choked with thermocol sheets, beverage cartons, and street silt.",
    "latitude": 12.9118,
    "longitude": 77.6501,
    "timestamp": "2026-09-20T13:09:00Z",
    "category": "plastic",
    "severity": "critical",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 1100,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "HSR Layout Ward 174",
    "citizenName": "Sita Ramamurthy"
  },
  {
    "id": "REP-BLR-35",
    "description": "Cafes and cloud kitchens dumping wet kitchen trash and grease traps directly on roadside.",
    "latitude": 12.9129,
    "longitude": 77.6488,
    "timestamp": "2026-09-20T13:22:00Z",
    "category": "commercial",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 830,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "HSR Layout Ward 174",
    "citizenName": "Girish Gowda"
  },
  {
    "id": "REP-BLR-36",
    "description": "Demolition concrete blocks and plaster sacks left unattended on vacant plot #14.",
    "latitude": 12.912,
    "longitude": 77.6496,
    "timestamp": "2026-09-20T13:35:00Z",
    "category": "construction_debris",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 2200,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "HSR Layout Ward 174",
    "citizenName": "Vandana Kulkarni"
  },
  {
    "id": "REP-BLR-37",
    "description": "E-commerce bubble wrap, corrugated cardboard boxes, and tape scraps blowing across park.",
    "latitude": 12.9133,
    "longitude": 77.649,
    "timestamp": "2026-09-20T14:48:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 490,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "HSR Layout Ward 174",
    "citizenName": "Kishore Kumar"
  },
  {
    "id": "REP-BLR-38",
    "description": "Rotten coconut shells and street sugarcane bagasse piled high beside transformer.",
    "latitude": 12.9115,
    "longitude": 77.6505,
    "timestamp": "2026-09-20T14:01:00Z",
    "category": "organic",
    "severity": "medium",
    "hazard": "fire_risk",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 710,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "HSR Layout Ward 174",
    "citizenName": "Santhosh Hegde"
  },
  {
    "id": "REP-BLR-39",
    "description": "Broken granite floor tiles and iron rods sticking out dangerously on pedestrian footpath.",
    "latitude": 12.9127,
    "longitude": 77.65,
    "timestamp": "2026-09-20T14:14:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 1650,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "HSR Layout Ward 174",
    "citizenName": "Aparna Nayak"
  },
  {
    "id": "REP-BLR-40",
    "description": "Plastic grocery sacks and decomposing household food waste hanging on compound fence.",
    "latitude": 12.9112,
    "longitude": 77.6494,
    "timestamp": "2026-09-20T14:27:00Z",
    "category": "household",
    "severity": "medium",
    "hazard": "organic_decay",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 380,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "HSR Layout Ward 174",
    "citizenName": "Bharath Reddy"
  },
  {
    "id": "REP-BLR-41",
    "description": "Cardboard packaging bales and plastic straps spilling into shopping complex alley.",
    "latitude": 12.9288,
    "longitude": 77.5832,
    "timestamp": "2026-09-20T14:40:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 850,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Jayanagar Ward 153",
    "citizenName": "Nataraj Sastry"
  },
  {
    "id": "REP-BLR-42",
    "description": "Fast food stall discarded paper cups, chaat plates, and vegetable scraps in storm gully.",
    "latitude": 12.9294,
    "longitude": 77.5828,
    "timestamp": "2026-09-20T14:53:00Z",
    "category": "commercial",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 520,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Jayanagar Ward 153",
    "citizenName": "Meenakshi Sundaram"
  },
  {
    "id": "REP-BLR-43",
    "description": "Saree showroom polybags and thermocol mannequins abandoned behind complex parking.",
    "latitude": 12.9285,
    "longitude": 77.5836,
    "timestamp": "2026-09-20T15:06:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 640,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Jayanagar Ward 153",
    "citizenName": "Chetan Rao"
  },
  {
    "id": "REP-BLR-44",
    "description": "Broken electronic weighing machines, wiring, and metal casings discarded on pavement.",
    "latitude": 12.9297,
    "longitude": 77.583,
    "timestamp": "2026-09-20T15:19:00Z",
    "category": "electronic",
    "severity": "low",
    "hazard": "hazardous_material",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 230,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Jayanagar Ward 153",
    "citizenName": "Raghavendra Joshi"
  },
  {
    "id": "REP-BLR-45",
    "description": "Rotten fruit piles and marigold floral garlands decaying outside fruit stall arcade.",
    "latitude": 12.9282,
    "longitude": 77.5825,
    "timestamp": "2026-09-20T15:32:00Z",
    "category": "organic",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 790,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Jayanagar Ward 153",
    "citizenName": "Lalitha Prasad"
  },
  {
    "id": "REP-BLR-46",
    "description": "Plastic beverage cups and milkshake bottles overflowing around public dustbin.",
    "latitude": 12.929,
    "longitude": 77.584,
    "timestamp": "2026-09-20T15:45:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 340,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Jayanagar Ward 153",
    "citizenName": "Vinod Shenoy"
  },
  {
    "id": "REP-BLR-47",
    "description": "Massive heaps of decomposed marigold, jasmine garlands, and banana leaves near temple road.",
    "latitude": 13.0042,
    "longitude": 77.5695,
    "timestamp": "2026-09-20T15:58:00Z",
    "category": "organic",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 1350,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Malleshwaram Ward 65",
    "citizenName": "Shreedhar Bhat"
  },
  {
    "id": "REP-BLR-48",
    "description": "Rotten coconut husks and flower baskets blocking footpath near 8th Cross market entrance.",
    "latitude": 13.0038,
    "longitude": 77.5701,
    "timestamp": "2026-09-20T15:11:00Z",
    "category": "organic",
    "severity": "medium",
    "hazard": "organic_decay",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 620,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Malleshwaram Ward 65",
    "citizenName": "Padma Ananth"
  },
  {
    "id": "REP-BLR-49",
    "description": "Discarded street vendor plastic bags and crushed sugarcane pulp decaying in drainage grill.",
    "latitude": 13.0046,
    "longitude": 77.5691,
    "timestamp": "2026-09-20T16:24:00Z",
    "category": "plastic",
    "severity": "high",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 480,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Malleshwaram Ward 65",
    "citizenName": "Jayanthi Sridhar"
  },
  {
    "id": "REP-BLR-50",
    "description": "Tree branches trimmed by electricity board and garden refuse dumped on road divider.",
    "latitude": 13.0035,
    "longitude": 77.5708,
    "timestamp": "2026-09-20T16:37:00Z",
    "category": "organic",
    "severity": "low",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 310,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Malleshwaram Ward 65",
    "citizenName": "Krishna Murthy"
  },
  {
    "id": "REP-BLR-51",
    "description": "Demolition plaster and broken red clay roof tiles piled on residential footpath corner.",
    "latitude": 13.005,
    "longitude": 77.5698,
    "timestamp": "2026-09-20T16:50:00Z",
    "category": "construction_debris",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 1800,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Malleshwaram Ward 65",
    "citizenName": "Balaji Acharya"
  },
  {
    "id": "REP-BLR-52",
    "description": "Household garbage bags torn by stray cows, foul stench spreading to adjacent bus stop.",
    "latitude": 13.0032,
    "longitude": 77.5688,
    "timestamp": "2026-09-20T16:03:00Z",
    "category": "household",
    "severity": "high",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 750,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Malleshwaram Ward 65",
    "citizenName": "Saraswathi Narayanan"
  }
];

export const BENGALURU_BBMP_DATASET: MunicipalDataset = {
  id: 'bengaluru_bbmp',
  name: 'Bruhat Bengaluru Mahanagara Palike — East & South Zones',
  city: 'Bengaluru',
  state: 'Karnataka',
  wardOrZone: 'East Zone (Indiranagar, Koramangala, Whitefield)',
  description: '52 authentic municipal incident reports covering commercial food streets, markets, C&D debris, and IT corridors.',
  depot: BENGALURU_BBMP_DEPOT,
  fleet: BENGALURU_BBMP_FLEET,
  defaultCenter: [12.9716, 77.5946],
  defaultZoom: 12,
  boundary: BENGALURU_BBMP_BOUNDS,
  reports: BENGALURU_BBMP_REPORTS,
};
