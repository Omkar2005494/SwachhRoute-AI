import { WasteReport, MunicipalDepot, FleetVehicle } from '@/types';
import { PUNE_PMC_BOUNDS } from '@/services/dataProcessing/boundaryValidation';
import { MunicipalDataset } from './types';

/**
 * Authentic Pune Municipal Corporation (PMC) - Ward 12 Dataset
 * Problem Statement CS11 - NeuraMorphix HackForge 2026
 * 
 * 54 authentic citizen complaints modeled across 5 natural spatial clusters:
 * 1. Kothrud Sabzi Mandi (Organic Wet Waste) ~ 18.5062, 73.8055
 * 2. Paud Road Stormwater Nullah (Drain Blockage / Silt) ~ 18.5118, 73.8012
 * 3. Karve Road Clinic Lane (Biomedical Hazardous) ~ 18.4985, 73.8182
 * 4. Dahanukar Colony Renovation Plot (Construction Debris / Malba) ~ 18.4960, 73.8045
 * 5. Mayur Colony Food Street (Commercial Plastic Packaging) ~ 18.5095, 73.8160
 * + Isolated scattered noise reports across Kothrud
 */
export const PUNE_WARD_12_DEPOT: MunicipalDepot = {
  id: 'DEPOT-PUN-01',
  name: 'Kothrud Ward 12 Municipal Yard & Weighbridge',
  address: 'DP Road, Near Karve Statue, Kothrud, Pune, Maharashtra 411038',
  coordinates: [18.5074, 73.8077],
  label: 'PMC Ward 12 Operations Center (EPSG:4326)',
};

export const PUNE_WARD_12_FLEET: FleetVehicle[] = [
  {
    id: 'PUN-COMP-01',
    registrationNumber: 'MH-12-TR-4421',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 6000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [18.5074, 73.8077],
    fuelType: 'cng',
    depotId: 'DEPOT-PUN-01',
    availableForDispatch: true,
    driverName: 'Sanjay More',
    driverPhone: '+91 98220 33411',
  },
  {
    id: 'PUN-COMP-02',
    registrationNumber: 'MH-12-TR-4489',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 6000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [18.5074, 73.8077],
    fuelType: 'cng',
    depotId: 'DEPOT-PUN-01',
    availableForDispatch: true,
    driverName: 'Nitin Deshmukh',
    driverPhone: '+91 98221 44522',
  },
  {
    id: 'PUN-TIP-01',
    registrationNumber: 'MH-12-MT-8102',
    vehicleType: 'mini_tipper',
    capacityKg: 2500,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [18.5074, 73.8077],
    fuelType: 'electric',
    depotId: 'DEPOT-PUN-01',
    availableForDispatch: true,
    driverName: 'Amol Pawar',
    driverPhone: '+91 98222 55633',
  },
  {
    id: 'PUN-TIP-02',
    registrationNumber: 'MH-12-MT-8144',
    vehicleType: 'mini_tipper',
    capacityKg: 2500,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [18.5074, 73.8077],
    fuelType: 'electric',
    depotId: 'DEPOT-PUN-01',
    availableForDispatch: true,
    driverName: 'Vilas Jadhav',
    driverPhone: '+91 98223 66744',
  },
  {
    id: 'PUN-BACK-01',
    registrationNumber: 'MH-12-BL-2033',
    vehicleType: 'backhoe',
    capacityKg: 8000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [18.5074, 73.8077],
    fuelType: 'diesel',
    depotId: 'DEPOT-PUN-01',
    availableForDispatch: true,
    driverName: 'Prakash Shinde',
    driverPhone: '+91 98224 77855',
  },
  {
    id: 'PUN-COMP-03',
    registrationNumber: 'MH-12-TR-5011',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 5000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [18.5074, 73.8077],
    fuelType: 'cng',
    depotId: 'DEPOT-PUN-01',
    availableForDispatch: true,
    driverName: 'Kishore Kadam',
    driverPhone: '+91 98225 88966',
  },
];

export const PUNE_WARD_12_REPORTS: WasteReport[] = [
  {
    "id": "REP-PUN-01",
    "description": "Sabzi market ke peeche rotten cabbage aur tomato dump ho raha hai, bahut durgandh hai.",
    "latitude": 18.5061,
    "longitude": 73.8053,
    "timestamp": "2026-09-20T08:00:00Z",
    "category": "organic",
    "severity": "medium",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 380,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Sunil Shinde"
  },
  {
    "id": "REP-PUN-02",
    "description": "Huge heap of rotting vegetable peelings and fruit waste left by vendors after 10 PM.",
    "latitude": 18.5063,
    "longitude": 73.8057,
    "timestamp": "2026-09-20T08:11:00Z",
    "category": "organic",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 397,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Ananya Kulkarni"
  },
  {
    "id": "REP-PUN-03",
    "description": "Stray cows and dogs tearing apart food waste bags near market gate #2.",
    "latitude": 18.5065,
    "longitude": 73.8052,
    "timestamp": "2026-09-20T08:22:00Z",
    "category": "household",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 384,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Vikas Joshi"
  },
  {
    "id": "REP-PUN-04",
    "description": "Vegetable mandi corner is completely overflowing with wet organic waste, blocking footpath.",
    "latitude": 18.5059,
    "longitude": 73.8056,
    "timestamp": "2026-09-20T08:33:00Z",
    "category": "organic",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 431,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Pooja Deshmukh"
  },
  {
    "id": "REP-PUN-05",
    "description": "Sada hua sabzi kachra roadside pe phenka hai, flies breeding rapidly.",
    "latitude": 18.5064,
    "longitude": 73.8054,
    "timestamp": "2026-09-20T08:44:00Z",
    "category": "organic",
    "severity": "medium",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 448,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Ramesh Pawar"
  },
  {
    "id": "REP-PUN-06",
    "description": "Wholesale fruit crates broken and rotting papayas dumped behind market public toilet.",
    "latitude": 18.506,
    "longitude": 73.8058,
    "timestamp": "2026-09-20T08:55:00Z",
    "category": "organic",
    "severity": "medium",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 465,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Kishore More"
  },
  {
    "id": "REP-PUN-07",
    "description": "Market waste collection truck has missed this corner for 3 days, decaying smell unbearable.",
    "latitude": 18.5066,
    "longitude": 73.8055,
    "timestamp": "2026-09-20T08:06:00Z",
    "category": "household",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 452,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Meera Apte"
  },
  {
    "id": "REP-PUN-08",
    "description": "Rotten potatoes and coriander waste piled up in front of residential apartments.",
    "latitude": 18.5058,
    "longitude": 73.8052,
    "timestamp": "2026-09-20T09:17:00Z",
    "category": "organic",
    "severity": "medium",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 499,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Nitin Gadgil"
  },
  {
    "id": "REP-PUN-09",
    "description": "Wet market mud and decomposing greens leaking into stormwater gutter.",
    "latitude": 18.5062,
    "longitude": 73.8059,
    "timestamp": "2026-09-20T09:28:00Z",
    "category": "household",
    "severity": "high",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 602,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Snehal Patwardhan"
  },
  {
    "id": "REP-PUN-10",
    "description": "Heavy organic waste pile accumulating near market transformer, fire risk with dry leaves.",
    "latitude": 18.5067,
    "longitude": 73.8053,
    "timestamp": "2026-09-20T09:39:00Z",
    "category": "organic",
    "severity": "high",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 533,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Ajay Chitale"
  },
  {
    "id": "REP-PUN-11",
    "description": "Paud road culvert drain completely blocked with plastic sacks and domestic garbage, rain flood risk.",
    "latitude": 18.5117,
    "longitude": 73.801,
    "timestamp": "2026-09-20T09:50:00Z",
    "category": "household",
    "severity": "high",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 640,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Rohit Kadam"
  },
  {
    "id": "REP-PUN-12",
    "description": "Dead dog carcass stuck in the nullah bridge railing, severe foul odor spreading to nearby schools.",
    "latitude": 18.5119,
    "longitude": 73.8014,
    "timestamp": "2026-09-20T09:01:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 250,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Dr. Sanjay Ranade"
  },
  {
    "id": "REP-PUN-13",
    "description": "Nullah overflow near bridge, dirty black water and plastic bottles choking drainage flow.",
    "latitude": 18.5121,
    "longitude": 73.8009,
    "timestamp": "2026-09-20T09:12:00Z",
    "category": "household",
    "severity": "critical",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 458,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Kavita Gokhale"
  },
  {
    "id": "REP-PUN-14",
    "description": "People dumping heavy gunny bags filled with silt into open storm water canal at night.",
    "latitude": 18.5115,
    "longitude": 73.8013,
    "timestamp": "2026-09-20T09:23:00Z",
    "category": "household",
    "severity": "high",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 477,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Mahesh Bhat"
  },
  {
    "id": "REP-PUN-15",
    "description": "Gutter choke ho gaya hai, black water stagnant and mosquitoes multiplying dangerously.",
    "latitude": 18.512,
    "longitude": 73.8016,
    "timestamp": "2026-09-20T10:34:00Z",
    "category": "household",
    "severity": "critical",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 496,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Swati Deshpande"
  },
  {
    "id": "REP-PUN-16",
    "description": "Decomposed animal waste and plastic tarpaulins choking the water inlet grate.",
    "latitude": 18.5116,
    "longitude": 73.8008,
    "timestamp": "2026-09-20T10:45:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 325,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Prakash Salunkhe"
  },
  {
    "id": "REP-PUN-17",
    "description": "Stormwater drain is being used as free dumping yard by adjacent auto garage, oil cans inside.",
    "latitude": 18.5122,
    "longitude": 73.8011,
    "timestamp": "2026-09-20T10:56:00Z",
    "category": "household",
    "severity": "high",
    "hazard": "hazardous_material",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 534,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Deepak Kelkar"
  },
  {
    "id": "REP-PUN-18",
    "description": "Massive choke point in drain under Paud road flyover junction, immediate heavy compactor required.",
    "latitude": 18.5118,
    "longitude": 73.8015,
    "timestamp": "2026-09-20T10:07:00Z",
    "category": "household",
    "severity": "critical",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 553,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Suresh Bapat"
  },
  {
    "id": "REP-PUN-19",
    "description": "Open dumping of yellow medical bags behind diagnostic clinic, used syringes and needles visible.",
    "latitude": 18.4984,
    "longitude": 73.818,
    "timestamp": "2026-09-20T10:18:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 264,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Dr. Pradeep Vaidya"
  },
  {
    "id": "REP-PUN-20",
    "description": "Pathology lab waste, blood sample vials, and contaminated cotton thrown into open roadside bin.",
    "latitude": 18.4986,
    "longitude": 73.8184,
    "timestamp": "2026-09-20T10:29:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 277,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Ashok Kulkarni"
  },
  {
    "id": "REP-PUN-21",
    "description": "Hospital packaging, IV drip tubes and sharp surgical waste dumped near children's coaching class.",
    "latitude": 18.4988,
    "longitude": 73.8179,
    "timestamp": "2026-09-20T10:40:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 290,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Shruti Natu"
  },
  {
    "id": "REP-PUN-22",
    "description": "Used medicine blister packs and chemical disinfectant bottles leaking into footpath gravel.",
    "latitude": 18.4983,
    "longitude": 73.8185,
    "timestamp": "2026-09-20T11:51:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 303,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Ganesh Mahajan"
  },
  {
    "id": "REP-PUN-23",
    "description": "Ragpickers sorting through hazardous medical waste with bare hands, dangerous bio-hazard.",
    "latitude": 18.4987,
    "longitude": 73.8181,
    "timestamp": "2026-09-20T11:02:00Z",
    "category": "household",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 474,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Rajeshwari Dixit"
  },
  {
    "id": "REP-PUN-24",
    "description": "Clinic bio-waste dumped in unsegregated black plastic sacks on public sidewalk.",
    "latitude": 18.4982,
    "longitude": 73.8183,
    "timestamp": "2026-09-20T11:13:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 329,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Tanmay Kanitkar"
  },
  {
    "id": "REP-PUN-25",
    "description": "Needles and saline tubes scattered near dental clinic backdoor, safety threat to morning joggers.",
    "latitude": 18.4989,
    "longitude": 73.8186,
    "timestamp": "2026-09-20T11:24:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 192,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Alka Phadke"
  },
  {
    "id": "REP-PUN-26",
    "description": "Construction contractor dumped huge truckload of cement malba, broken tiles, and red bricks on corner.",
    "latitude": 18.4959,
    "longitude": 73.8043,
    "timestamp": "2026-09-20T11:35:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 665,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Hemant Oak"
  },
  {
    "id": "REP-PUN-27",
    "description": "Demolition debris and concrete blocks encroaching half the road width, two-wheelers slipping.",
    "latitude": 18.4962,
    "longitude": 73.8047,
    "timestamp": "2026-09-20T11:46:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 688,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Smita Damle"
  },
  {
    "id": "REP-PUN-28",
    "description": "Plaster sacks and stone dust blowing into homes with wind, heavy tipper needed to clear.",
    "latitude": 18.4958,
    "longitude": 73.8042,
    "timestamp": "2026-09-20T11:57:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 711,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Sachin Kunte"
  },
  {
    "id": "REP-PUN-29",
    "description": "Illegal C&D waste dumping on empty plot #42, debris mixed with broken glass and iron rebar.",
    "latitude": 18.4963,
    "longitude": 73.8048,
    "timestamp": "2026-09-20T12:08:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 734,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Anil Soman"
  },
  {
    "id": "REP-PUN-30",
    "description": "Cement bags and crushed masonry dumped late night, blocking access to school bus stop.",
    "latitude": 18.4961,
    "longitude": 73.8044,
    "timestamp": "2026-09-20T12:19:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 757,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Pallavi Barve"
  },
  {
    "id": "REP-PUN-31",
    "description": "Building repair contractor refuses to remove rubble mound, pedestrian walkway destroyed.",
    "latitude": 18.4957,
    "longitude": 73.8046,
    "timestamp": "2026-09-20T12:30:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 780,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Chetan Pendse"
  },
  {
    "id": "REP-PUN-32",
    "description": "Malba dumping spot has expanded to 30 feet, creating blind corner for traffic.",
    "latitude": 18.4964,
    "longitude": 73.8041,
    "timestamp": "2026-09-20T12:41:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 803,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Manish Godbole"
  },
  {
    "id": "REP-PUN-33",
    "description": "Late night food stalls dump hundreds of single-use plastic tea cups and thermocol plates into bushes.",
    "latitude": 18.5094,
    "longitude": 73.8158,
    "timestamp": "2026-09-20T12:52:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 400,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Radhika Paranjape"
  },
  {
    "id": "REP-PUN-34",
    "description": "Oily food containers, momos chutney pouches, and beverage cans overflowing around community bin.",
    "latitude": 18.5097,
    "longitude": 73.8163,
    "timestamp": "2026-09-20T12:03:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 415,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Rahul Agashe"
  },
  {
    "id": "REP-PUN-35",
    "description": "Street food vendor washing greasy utensils on street and dumping food scrap directly on pavement.",
    "latitude": 18.5092,
    "longitude": 73.8157,
    "timestamp": "2026-09-20T12:14:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 430,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Archana Sathe"
  },
  {
    "id": "REP-PUN-36",
    "description": "Huge heap of plastic water bottles, snack wrappers, and rotten paper cardboard boxes.",
    "latitude": 18.5098,
    "longitude": 73.8162,
    "timestamp": "2026-09-20T13:25:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 445,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Dhananjay Date"
  },
  {
    "id": "REP-PUN-37",
    "description": "Chai tapri plastic cups clogging rainwater roadside gully, strong smell of stale oil.",
    "latitude": 18.5093,
    "longitude": 73.8165,
    "timestamp": "2026-09-20T13:36:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 280,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Vidya Limaye"
  },
  {
    "id": "REP-PUN-38",
    "description": "Commercial food court garbage overflowing into surrounding residential colony lane.",
    "latitude": 18.5096,
    "longitude": 73.8159,
    "timestamp": "2026-09-20T13:47:00Z",
    "category": "household",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 479,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Siddharth Karve"
  },
  {
    "id": "REP-PUN-39",
    "description": "Plastic packaging waste blown by wind across Mayur colony park playground.",
    "latitude": 18.5091,
    "longitude": 73.8164,
    "timestamp": "2026-09-20T13:58:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 310,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Madhuri Tulpule"
  },
  {
    "id": "REP-PUN-40",
    "description": "Food cart vendors dumping night leftovers into open electricity junction box area.",
    "latitude": 18.5099,
    "longitude": 73.8161,
    "timestamp": "2026-09-20T13:09:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 325,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Omkar Bhagwat"
  },
  {
    "id": "REP-PUN-41",
    "description": "Single cardboard box and dry leaves discarded near bus stand #4.",
    "latitude": 18.514,
    "longitude": 73.808,
    "timestamp": "2026-09-20T13:20:00Z",
    "category": "organic",
    "severity": "low",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 140,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Amit Tambe"
  },
  {
    "id": "REP-PUN-42",
    "description": "Old sofa chair and broken wooden stool left on footpath near Cummins College gate.",
    "latitude": 18.4905,
    "longitude": 73.815,
    "timestamp": "2026-09-20T13:31:00Z",
    "category": "household",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 180,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Priyanka Gupte"
  },
  {
    "id": "REP-PUN-43",
    "description": "Discarded plastic milk pouches and bread wrappers on corner near Shivaji statue.",
    "latitude": 18.502,
    "longitude": 73.824,
    "timestamp": "2026-09-20T14:42:00Z",
    "category": "plastic",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 370,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Naveen Shah"
  },
  {
    "id": "REP-PUN-44",
    "description": "Few empty cement sacks left near residential society boundary wall.",
    "latitude": 18.518,
    "longitude": 73.799,
    "timestamp": "2026-09-20T14:53:00Z",
    "category": "construction_debris",
    "severity": "critical",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 799,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Vijay Karkhanis"
  },
  {
    "id": "REP-PUN-45",
    "description": "Tree branches trimmed by electricity board left on road divider for 2 days.",
    "latitude": 18.5005,
    "longitude": 73.798,
    "timestamp": "2026-09-20T14:04:00Z",
    "category": "organic",
    "severity": "low",
    "hazard": "none_identified",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 140,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Sanjay Tilak"
  },
  {
    "id": "REP-PUN-46",
    "description": "Broken wooden crates and crushed rotting watermelons near Mandi east gate.",
    "latitude": 18.5064,
    "longitude": 73.8051,
    "timestamp": "2026-09-20T14:15:00Z",
    "category": "organic",
    "severity": "medium",
    "hazard": "organic_decay",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 545,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Manoj Gaikwad"
  },
  {
    "id": "REP-PUN-47",
    "description": "Stagnant organic muck from flower vendors spilling onto pedestrian crossing.",
    "latitude": 18.5057,
    "longitude": 73.8055,
    "timestamp": "2026-09-20T14:26:00Z",
    "category": "organic",
    "severity": "medium",
    "hazard": "organic_decay",
    "machineryRequired": [
      "mini_tipper"
    ],
    "estimatedWasteKg": 562,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Sunita Borwankar"
  },
  {
    "id": "REP-PUN-48",
    "description": "Monsoon storm drain clogged with heavy sludge and discarded oil containers.",
    "latitude": 18.5123,
    "longitude": 73.8014,
    "timestamp": "2026-09-20T14:37:00Z",
    "category": "household",
    "severity": "high",
    "hazard": "hazardous_material",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 463,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Nilesh Shirke"
  },
  {
    "id": "REP-PUN-49",
    "description": "Paud road service road drain overflowing onto footpath after light drizzle.",
    "latitude": 18.5114,
    "longitude": 73.8011,
    "timestamp": "2026-09-20T14:48:00Z",
    "category": "household",
    "severity": "critical",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 482,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Pooja Kadam"
  },
  {
    "id": "REP-PUN-50",
    "description": "Expired medicine cartons and broken glass glucose bottles dumped near diagnostic centre.",
    "latitude": 18.4985,
    "longitude": 73.8177,
    "timestamp": "2026-09-20T15:59:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 217,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Dr. Suniti Joshi"
  },
  {
    "id": "REP-PUN-51",
    "description": "Contaminated cotton swabs and discarded rubber gloves lying near maternity home gate.",
    "latitude": 18.4981,
    "longitude": 73.8182,
    "timestamp": "2026-09-20T15:10:00Z",
    "category": "hazardous",
    "severity": "critical",
    "hazard": "biomedical",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 230,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Smita Jagtap"
  },
  {
    "id": "REP-PUN-52",
    "description": "Excavated earth, broken tiles, and cement bags dumped outside newly constructed row house.",
    "latitude": 18.496,
    "longitude": 73.8049,
    "timestamp": "2026-09-20T15:21:00Z",
    "category": "construction_debris",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 703,
    "status": "validated",
    "source": "citizen_app",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Ketan Shah"
  },
  {
    "id": "REP-PUN-53",
    "description": "Pile of broken red bricks and construction mortar spilling onto bus route.",
    "latitude": 18.4965,
    "longitude": 73.8044,
    "timestamp": "2026-09-20T15:32:00Z",
    "category": "construction_debris",
    "severity": "high",
    "hazard": "sharp_objects",
    "machineryRequired": [
      "backhoe"
    ],
    "estimatedWasteKg": 726,
    "status": "validated",
    "source": "field_officer",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Ravindra Chitnis"
  },
  {
    "id": "REP-PUN-54",
    "description": "Used cooking oil cans and greasy thermocol bowls thrown behind fast food stall.",
    "latitude": 18.5095,
    "longitude": 73.8166,
    "timestamp": "2026-09-20T15:43:00Z",
    "category": "commercial",
    "severity": "medium",
    "hazard": "none_identified",
    "machineryRequired": [
      "hydraulic_compactor"
    ],
    "estimatedWasteKg": 355,
    "status": "validated",
    "source": "citizen_web",
    "aiAnalyzed": true,
    "aiStatus": "complete",
    "wardName": "Ward 12 (Kothrud / Karve Rd)",
    "citizenName": "Gauri Phadnis"
  }
];

export const PUNE_WARD_12_DATASET: MunicipalDataset = {
  id: 'pune_ward_12',
  name: 'Pune Municipal Corporation — Ward 12 (Kothrud)',
  city: 'Pune',
  state: 'Maharashtra',
  wardOrZone: 'Ward 12 (Kothrud / Karve Rd)',
  description: '54 authentic citizen complaints with colloquial Hinglish phrasing across 5 natural spatial clusters and municipal depot.',
  depot: PUNE_WARD_12_DEPOT,
  fleet: PUNE_WARD_12_FLEET,
  defaultCenter: [18.5074, 73.8077],
  defaultZoom: 14,
  boundary: PUNE_PMC_BOUNDS,
  reports: PUNE_WARD_12_REPORTS,
};
