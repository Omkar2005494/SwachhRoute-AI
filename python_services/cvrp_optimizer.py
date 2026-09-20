#!/usr/bin/env python3
"""
SwachhRoute AI — Python Google OR-Tools CVRP Service
NeuraMorphix HackForge 2026 | Problem Statement CS11
Tagline: "From Waste Reports to Smarter Routes."

Solves the Capacitated Vehicle Routing Problem (CVRP) with:
- Multiple heterogeneous municipal fleet vehicles
- Individual vehicle capacity constraints
- Municipal depot as origin and return point
- EPSG:3857 Web Mercator projected-coordinate distance matrix (Geometric optimization distance)
- Guided Local Search metaheuristic
- Pre-solver capacity exception detection (infeasible demand handling)
- Fleet overload protection (zero route capacity overflow)
"""

import sys
import json
import math
import time
from ortools.constraint_solver import routing_enums_pb2, pywrapcp

EARTH_RADIUS_METERS = 6378137.0

def project_4326_to_3857(lat, lng):
    """
    Projects WGS84 lat/lng degrees to EPSG:3857 Web Mercator meters.
    EPSG:3857 provides meter-based projected coordinates suitable for
    this local Bengaluru demonstration's geometric distance optimization.
    """
    x = lng * (math.pi / 180.0) * EARTH_RADIUS_METERS
    clamped_lat = max(-85.05112878, min(85.05112878, lat))
    lat_rad = clamped_lat * (math.pi / 180.0)
    y = math.log(math.tan(math.pi / 4.0 + lat_rad / 2.0)) * EARTH_RADIUS_METERS
    return x, y

def compute_pairwise_geometric_distances(projected_coords):
    """
    Computes pairwise Euclidean distance matrix in meters.
    Explicitly categorized as 'Geometric optimization distance' (not road distance).
    """
    n = len(projected_coords)
    matrix = []
    for i in range(n):
        row = []
        xi, yi = projected_coords[i]
        for j in range(n):
            xj, yj = projected_coords[j]
            dist = math.hypot(xi - xj, yi - yj)
            row.append(int(round(dist)))
        matrix.append(row)
    return matrix

def solve_cvrp(payload):
    start_time = time.time()
    
    depot = payload.get("depot")
    if not depot or "lat" not in depot or "lng" not in depot:
        return {"error": "Invalid or missing depot coordinates."}
    
    raw_hotspots = payload.get("hotspots", [])
    raw_vehicles = payload.get("vehicles", [])
    max_time_seconds = int(payload.get("maxTimeSeconds", 5))
    max_time_seconds = max(1, min(max_time_seconds, 10))
    
    # 1. Filter dispatchable vehicles
    # Only status = 'available' AND availableForDispatch = True AND capacityKg > 0
    dispatchable_vehicles = []
    for v in raw_vehicles:
        status = v.get("status", "available")
        is_dispatchable = v.get("availableForDispatch", True)
        capacity = int(v.get("capacityKg", 0))
        if status == "available" and is_dispatchable and capacity > 0:
            dispatchable_vehicles.append(v)
            
    if not dispatchable_vehicles:
        return {
            "error": "No dispatchable fleet vehicles available for CVRP optimization."
        }
    
    max_vehicle_capacity = max(int(v["capacityKg"]) for v in dispatchable_vehicles)
    
    # 2. Demand validation & Capacity Exception isolation
    feasible_hotspots = []
    capacity_exceptions = []
    total_input_demand_kg = 0
    
    for h in raw_hotspots:
        h_id = h.get("id", "UNKNOWN")
        zone_name = h.get("zoneName", "Unknown Zone")
        demand_val = h.get("demandKg")
        machinery = h.get("recommendedMachinery", [])
        
        # Handle demand unavailable
        if demand_val is None:
            capacity_exceptions.append({
                "hotspotId": h_id,
                "zoneName": zone_name,
                "demandedKg": 0,
                "maxVehicleCapacityKg": max_vehicle_capacity,
                "recommendedMachinery": machinery,
                "reason": "Demand unavailable. Excluded from capacity optimization until an operational estimate exists.",
                "remediationAction": "Awaiting field weighbridge verification."
            })
            continue
            
        demand_kg = int(round(demand_val))
        total_input_demand_kg += demand_kg
        
        # Specialized remediation machinery check (e.g. Backhoe required for heavy debris without hauling capacity)
        # or demand exceeds standard compactor capacity (4,500 kg)
        requires_specialized_machinery = "backhoe" in machinery
        exceeds_standard_compactor = demand_kg > 4500
        
        if requires_specialized_machinery or exceeds_standard_compactor or demand_kg > max_vehicle_capacity:
            reason = f"Demand ({demand_kg:,} kg) exceeds standard 4,500 kg hauling compactor capacity."
            if requires_specialized_machinery:
                reason += " Site requires BACK-01 Backhoe specialized remediation equipment for heavy debris."
            capacity_exceptions.append({
                "hotspotId": h_id,
                "zoneName": zone_name,
                "demandedKg": demand_kg,
                "maxVehicleCapacityKg": 4500,
                "recommendedMachinery": machinery,
                "reason": reason,
                "remediationAction": "Dispatch specialized heavy remediation machinery (BACK-01 Backhoe) and secondary multi-lift hauler."
            })
        else:
            feasible_hotspots.append(h)
            
    # If no feasible hotspots enter optimization
    if not feasible_hotspots:
        exec_ms = int((time.time() - start_time) * 1000)
        return {
            "routes": [],
            "totalDistanceMeters": 0,
            "totalDistanceKm": 0,
            "totalDemandKg": total_input_demand_kg,
            "totalServedDemandKg": 0,
            "totalExceptionDemandKg": sum(e["demandedKg"] for e in capacity_exceptions),
            "vehiclesUsedCount": 0,
            "vehiclesTotalCount": len(dispatchable_vehicles),
            "stopsCount": 0,
            "capacityExceptions": capacity_exceptions,
            "solverStatus": "NO_FEASIBLE_HOTSPOTS",
            "optimizationEngine": "google_ortools",
            "executionTimeMs": exec_ms,
            "optimizedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        
    # 3. Build Nodes and Demands
    # Node 0 = Depot, Nodes 1..N = feasible hotspots
    depot_lat = float(depot["lat"])
    depot_lng = float(depot["lng"])
    
    nodes_coords_4326 = [(depot_lat, depot_lng)]
    nodes_demands = [0]
    
    for h in feasible_hotspots:
        nodes_coords_4326.append((float(h["lat"]), float(h["lng"])))
        nodes_demands.append(int(round(h["demandKg"])))
        
    # Project to EPSG:3857 Web Mercator meters
    projected_nodes = [project_4326_to_3857(lat, lng) for lat, lng in nodes_coords_4326]
    distance_matrix = compute_pairwise_geometric_distances(projected_nodes)
    
    vehicle_capacities = [int(v["capacityKg"]) for v in dispatchable_vehicles]
    num_nodes = len(nodes_coords_4326)
    num_vehicles = len(dispatchable_vehicles)
    
    # 4. Formulate OR-Tools CVRP Model
    manager = pywrapcp.RoutingIndexManager(num_nodes, num_vehicles, 0)
    routing = pywrapcp.RoutingModel(manager)
    
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]
        
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return nodes_demands[from_node]
        
    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        vehicle_capacities,
        True,  # start cumul to zero
        "Capacity"
    )
    
    # Add disjunctions with heavy penalties to ensure resilience if capacity is tightly constrained
    penalty = 10_000_000
    for node in range(1, num_nodes):
        routing.AddDisjunction([manager.NodeToIndex(node)], penalty)
        
    # 5. Solver Search Parameters
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = max_time_seconds
    
    # 6. Solve
    solution = routing.SolveWithParameters(search_parameters)
    
    exec_ms = int((time.time() - start_time) * 1000)
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    if not solution:
        return {
            "routes": [],
            "totalDistanceMeters": 0,
            "totalDistanceKm": 0,
            "totalDemandKg": total_input_demand_kg,
            "totalServedDemandKg": 0,
            "totalExceptionDemandKg": sum(e["demandedKg"] for e in capacity_exceptions),
            "vehiclesUsedCount": 0,
            "vehiclesTotalCount": num_vehicles,
            "stopsCount": 0,
            "capacityExceptions": capacity_exceptions,
            "solverStatus": "ROUTING_FAIL",
            "optimizationEngine": "google_ortools",
            "executionTimeMs": exec_ms,
            "optimizedAt": now_iso
        }
        
    # 7. Extract Routes
    routes = []
    visited_nodes = set()
    total_fleet_distance_meters = 0
    total_served_demand_kg = 0
    total_stops_served = 0
    
    for v_idx, vehicle in enumerate(dispatchable_vehicles):
        v_capacity = int(vehicle["capacityKg"])
        index = routing.Start(v_idx)
        
        route_nodes = []
        route_distance_meters = 0
        current_load = 0
        stops = []
        sequence = 1
        
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            route_nodes.append(node)
            
            if node != 0:
                visited_nodes.add(node)
                hotspot_idx = node - 1
                hotspot = feasible_hotspots[hotspot_idx]
                demand = nodes_demands[node]
                current_load += demand
                remaining_cap = v_capacity - current_load
                
                # Enforce Fleet Overload Protection
                if remaining_cap < 0:
                    raise ValueError(f"Vehicle {vehicle['id']} capacity exceeded ({current_load} > {v_capacity})")
                    
                stop = {
                    "stopId": f"STP-{vehicle['id']}-{sequence:02d}",
                    "sequence": sequence,
                    "stopSequence": sequence,
                    "hotspotId": hotspot["id"],
                    "latitude": float(hotspot["lat"]),
                    "longitude": float(hotspot["lng"]),
                    "location": [float(hotspot["lat"]), float(hotspot["lng"])],
                    "addressName": hotspot.get("zoneName", f"Hotspot {hotspot['id']}"),
                    "estimatedDemandKg": demand,
                    "estimatedWasteKg": demand,
                    "cumulativeLoadKg": current_load,
                    "remainingVehicleCapacityKg": remaining_cap,
                    "requiredMachinery": vehicle["vehicleType"],
                    "plannedArrivalTime": now_iso,
                    "status": "pending"
                }
                stops.append(stop)
                sequence += 1
                
            next_index = solution.Value(routing.NextVar(index))
            next_node = manager.IndexToNode(next_index)
            route_distance_meters += distance_matrix[node][next_node]
            index = next_index
            
        route_nodes.append(manager.IndexToNode(index)) # Ends at depot
        
        if stops:
            total_stops_served += len(stops)
            total_served_demand_kg += current_load
            total_fleet_distance_meters += route_distance_meters
            
            # Polyline connecting Depot -> stops -> Depot
            polyline = [[depot_lat, depot_lng]]
            for s in stops:
                polyline.append([s["latitude"], s["longitude"]])
            polyline.append([depot_lat, depot_lng])
            
            route_obj = {
                "id": f"ROUTE-{len(routes) + 1:02d}",
                "routeId": f"ROUTE-{len(routes) + 1:02d}",
                "vehicleId": vehicle["id"],
                "vehicleType": vehicle["vehicleType"],
                "depotId": depot.get("id", "DEPOT-BLR-01"),
                "depotLocation": [depot_lat, depot_lng],
                "stopIds": [s["hotspotId"] for s in stops],
                "stopOrder": [s["sequence"] for s in stops],
                "stops": stops,
                "totalDistanceMeters": route_distance_meters,
                "totalDistanceKm": round(route_distance_meters / 1000.0, 1),
                "totalDurationMinutes": int(round((route_distance_meters / 1000.0) * 1.8)) + len(stops) * 12,
                "totalDemandKg": current_load,
                "totalWasteCollectedKg": current_load,
                "vehicleCapacityKg": v_capacity,
                "remainingCapacityKg": v_capacity - current_load,
                "polylineCoordinates": polyline,
                "roadDistanceMeters": None,
                "roadDistanceKm": None,
                "roadDurationSeconds": None,
                "roadDurationMinutes": None,
                "roadGeometry": None,
                "routingEngine": "unavailable",
                "optimizationEngine": "google_ortools",
                "optimizationAlgorithm": "Google OR-Tools CVRP (Guided Local Search)",
                "solverStatus": "ROUTING_SUCCESS",
                "status": "active",
                "operationalStatus": "optimized",
                "generatedAt": now_iso,
                "optimizedAt": now_iso
            }
            routes.append(route_obj)
            
    # Check for unperformed feasible nodes (if capacity limit caused disjunction drop)
    for node in range(1, num_nodes):
        if node not in visited_nodes:
            hotspot = feasible_hotspots[node - 1]
            capacity_exceptions.append({
                "hotspotId": hotspot["id"],
                "zoneName": hotspot.get("zoneName", "Unknown Zone"),
                "demandedKg": nodes_demands[node],
                "maxVehicleCapacityKg": max_vehicle_capacity,
                "recommendedMachinery": hotspot.get("recommendedMachinery", []),
                "reason": "Vehicle fleet cumulative capacity exhausted. Could not assign without exceeding vehicle limit.",
                "remediationAction": "Deploy secondary collection shift or reserve tipper."
            })
            
    total_exception_demand_kg = sum(e["demandedKg"] for e in capacity_exceptions)
    
    return {
        "routes": routes,
        "totalDistanceMeters": total_fleet_distance_meters,
        "totalDistanceKm": round(total_fleet_distance_meters / 1000.0, 1),
        "totalDemandKg": total_input_demand_kg,
        "totalServedDemandKg": total_served_demand_kg,
        "totalExceptionDemandKg": total_exception_demand_kg,
        "vehiclesUsedCount": len(routes),
        "vehiclesTotalCount": num_vehicles,
        "stopsCount": total_stops_served,
        "capacityExceptions": capacity_exceptions,
        "solverStatus": "ROUTING_SUCCESS",
        "optimizationEngine": "google_ortools",
        "executionTimeMs": exec_ms,
        "optimizedAt": now_iso
    }

def main():
    try:
        raw_input = sys.stdin.read().strip()
        if not raw_input:
            print(json.dumps({"error": "Empty input provided to CVRP optimizer."}))
            sys.exit(1)
            
        payload = json.loads(raw_input)
        result = solve_cvrp(payload)
        print(json.dumps(result, indent=2))
        sys.exit(0)
    except Exception as e:
        err_response = {
            "error": str(e),
            "solverStatus": "INTERNAL_EXCEPTION",
            "optimizationEngine": "google_ortools"
        }
        print(json.dumps(err_response), file=sys.stderr)
        print(json.dumps(err_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
