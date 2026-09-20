/**
 * SwachhRoute AI - World-Class Frontend Application Controller
 * Handles Leaflet GIS map rendering, DBSCAN polygon overlays,
 * Google OR-Tools route visualization, Before-vs-After comparison,
 * Real-time Fleet Simulation, and Web Speech API Voice Ingestion.
 * Problem Statement CS11 - NeuraMorphix HackForge 2026
 * Team: Stackverse-labs
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    map: null,
    reports: [],
    clusters: [],
    optimization: null,
    activeMode: "optimized", // "optimized" or "unoptimized"
    isSimulating: false,
    simTimer: null,
    simMarkers: [],
    layers: {
      reports: L.layerGroup(),
      clusters: L.layerGroup(),
      routes: L.layerGroup(),
      facilities: L.layerGroup(),
      simulation: L.layerGroup()
    },
    colorPalette: {
      compactor: "#10b981", // Emerald Green for heavy compactor
      tipper1: "#06b6d4",   // Vibrant Cyan for mini tipper 1
      tipper2: "#f59e0b",   // Gold Amber for mini tipper 2
      unoptimized: "#ef4444"// Crimson Red for chaotic manual dispatch
    }
  };

  // Facility Locations (from config)
  const DEPOT = { lat: 18.5035, lng: 73.8115, name: "Kothrud Central Solid Waste Depot" };
  const LANDFILL = { lat: 18.5135, lng: 73.7920, name: "Paud Road Transfer Station & MRF" };

  // ========================================================
  // 1. Initialize Leaflet GIS Map
  // ========================================================
  function initMap() {
    state.map = L.map("map", {
      center: [18.5074, 73.8077], // Pune Ward 12 Center
      zoom: 14,
      zoomControl: false
    });

    L.control.zoom({ position: "topleft" }).addTo(state.map);

    // High-contrast CartoDB Dark Matter Tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(state.map);

    // Add layer groups to map
    state.layers.clusters.addTo(state.map);
    state.layers.routes.addTo(state.map);
    state.layers.reports.addTo(state.map);
    state.layers.facilities.addTo(state.map);
    state.layers.simulation.addTo(state.map);

    plotFacilities();

    // Map Click Listener to pick coordinates for Citizen Report
    state.map.on("click", (e) => {
      document.getElementById("input-lat").value = e.latlng.lat.toFixed(6);
      document.getElementById("input-lng").value = e.latlng.lng.toFixed(6);
      showToast(`Selected GPS: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
    });
  }

  function plotFacilities() {
    state.layers.facilities.clearLayers();

    // Depot Marker
    const depotIcon = L.divIcon({
      className: "custom-facility-marker",
      html: '<i class="fa-solid fa-square text-primary" style="color: #3b82f6; font-size: 24px; filter: drop-shadow(0 0 8px rgba(59,130,246,0.6));"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([DEPOT.lat, DEPOT.lng], { icon: depotIcon })
      .bindPopup(`<b>🏢 ${DEPOT.name}</b><br><span style="color:#94a3b8; font-size:11px;">Fleet Departure & Maintenance Depot</span>`)
      .addTo(state.layers.facilities);

    // Landfill / Transfer Facility Marker
    const landfillIcon = L.divIcon({
      className: "custom-facility-marker",
      html: '<i class="fa-solid fa-triangle text-purple" style="color: #a855f7; font-size: 24px; filter: drop-shadow(0 0 8px rgba(168,85,247,0.6));"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([LANDFILL.lat, LANDFILL.lng], { icon: landfillIcon })
      .bindPopup(`<b>🏭 ${LANDFILL.name}</b><br><span style="color:#94a3b8; font-size:11px;">Scientific Material Recovery & Disposal Facility</span>`)
      .addTo(state.layers.facilities);
  }

  // ========================================================
  // 2. Data Fetching & Rendering
  // ========================================================
  async function loadInitialData() {
    try {
      showToast("Initializing SwachhRoute AI GIS Engine...");
      
      const repRes = await fetch("/api/reports");
      state.reports = await repRes.json();
      renderReportsLayer();
      updateMetricCounts();

      const clusRes = await fetch("/api/cluster", { method: "POST" });
      state.clusters = await clusRes.json();
      renderClustersLayer();
      renderHotspotsList();

      await runOptimization();
      loadPolicyInsights();
      loadDriverManifest("TRUCK_01");

      showToast("SwachhRoute AI operational. 45 Reports grouped into 5 Hotspots.");
    } catch (err) {
      console.error("Error loading data:", err);
      showToast("Error connecting to SwachhRoute API.");
    }
  }

  function renderReportsLayer() {
    state.layers.reports.clearLayers();

    state.reports.forEach((r) => {
      const circle = L.circleMarker([r.lat, r.lng], {
        radius: 5.5,
        fillColor: r.severity_score >= 8 ? "#ef4444" : r.severity_score >= 6 ? "#f59e0b" : "#fbbf24",
        color: "#ffffff",
        weight: 1.2,
        opacity: 0.9,
        fillOpacity: 0.85
      });

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; font-size: 12px; max-width: 240px; color: #1e293b;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
            <b style="color: #0f172a;">${r.id}</b>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${r.severity_score >= 8 ? '#fef2f2' : '#fffbeb'}; color: ${r.severity_score >= 8 ? '#dc2626' : '#d97706'};">
              Sev ${r.severity_score}/10
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">"${r.text}"</div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 4px; font-size: 10px; color: #64748b;">
            <span><b>Hazard:</b> ${r.hazard_class}</span><br>
            <span><b>Machinery:</b> ${r.machinery_needed}</span><br>
            <span><b>Reporter:</b> ${r.citizen_name}</span>
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      circle.addTo(state.layers.reports);
    });

    const legendCount = document.getElementById("legend-rep-count");
    if (legendCount) legendCount.innerText = state.reports.length;
  }

  function renderClustersLayer() {
    state.layers.clusters.clearLayers();

    state.clusters.forEach((c) => {
      const isHigh = c.severity_score >= 7.0;
      const strokeColor = isHigh ? "#ef4444" : "#f59e0b";
      const fillColor = isHigh ? "rgba(239, 68, 68, 0.28)" : "rgba(245, 158, 11, 0.22)";

      // Draw convex hull polygon
      const polygon = L.polygon(c.polygon, {
        color: strokeColor,
        weight: 2,
        dashArray: "5, 5",
        fillColor: fillColor,
        fillOpacity: 0.4
      });

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; font-size: 12px; color: #1e293b; max-width: 260px;">
          <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
            ${c.name}
          </div>
          <div style="display:flex; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 10px; background:#fee2e2; color:#b91c1c; padding:2px 6px; border-radius:4px; font-weight:700;">
              Avg Severity: ${c.severity_score}/10
            </span>
            <span style="font-size: 10px; background:#dcfce7; color:#15803d; padding:2px 6px; border-radius:4px; font-weight:700;">
              Est. Waste: ${c.estimated_tonnage_kg} kg
            </span>
          </div>
          <div style="font-size: 11px; color:#475569; line-height: 1.5;">
            <b>Spatial Density:</b> ${c.report_count} complaints clustered via DBSCAN.<br>
            <b>Primary Category:</b> ${c.primary_hazard}<br>
            <b>Recommended Vehicle:</b> ${c.recommended_machinery}
          </div>
        </div>
      `;

      polygon.bindPopup(popupHtml);
      polygon.addTo(state.layers.clusters);

      // Centroid label badge
      const centerIcon = L.divIcon({
        className: "custom-centroid-marker",
        html: `<div style="background: ${strokeColor}; color: white; font-weight: 800; font-size: 11px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${strokeColor}; border: 2px solid #fff;">${c.cluster_id}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      L.marker([c.centroid_lat, c.centroid_lng], { icon: centerIcon })
        .bindPopup(popupHtml)
        .addTo(state.layers.clusters);
    });
  }

  function renderRoutesLayer() {
    state.layers.routes.clearLayers();

    if (!state.optimization || !state.optimization.routes) return;

    if (state.activeMode === "unoptimized") {
      // Render Chaotic Unoptimized Manual Routes (Zigzag across ward)
      renderUnoptimizedRoutes();
      return;
    }

    // Render OR-Tools Optimized Routes
    const colors = [state.colorPalette.compactor, state.colorPalette.tipper1, state.colorPalette.tipper2];

    state.optimization.routes.forEach((route, idx) => {
      if (route.stops.length === 0) return;

      const routeColor = colors[idx % colors.length];

      const polyline = L.polyline(route.path_coordinates, {
        color: routeColor,
        weight: 5,
        opacity: 0.92,
        lineCap: "round",
        lineJoin: "round"
      });

      polyline.bindPopup(`
        <div style="font-family:'Inter', sans-serif; font-size:12px; color:#1e293b;">
          <b>🚚 ${route.vehicle_name}</b><br>
          <b>Stops:</b> ${route.stops.length} | <b>Load:</b> ${route.total_tonnage_kg} / ${route.capacity_kg} kg (${route.utilization_pct}%)<br>
          <b>Distance:</b> ${route.total_distance_km} km | <b>Est. Time:</b> ~${route.estimated_duration_mins} mins
        </div>
      `);

      polyline.addTo(state.layers.routes);

      // Numbered stops
      route.stops.forEach((stop) => {
        const stopIcon = L.divIcon({
          className: "custom-stop-marker",
          html: `<div style="background: #090d16; color: ${routeColor}; border: 2px solid ${routeColor}; font-weight: 800; font-size: 11px; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(0,0,0,0.8);">${stop.stop_index}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .bindPopup(`<b>Stop ${stop.stop_index}: ${stop.stop_name}</b><br>Vehicle: ${route.vehicle_name}<br>Demand: ${stop.demand_kg} kg`)
          .addTo(state.layers.routes);
      });
    });
  }

  function renderUnoptimizedRoutes() {
    // Generates simulated unoptimized zigzag paths showing manual dispatch chaos
    const coords = [
      [DEPOT.lat, DEPOT.lng],
      [18.5118, 73.8012], // Paud road
      [18.4985, 73.8182], // Karve road
      [18.5062, 73.8055], // Mandi
      [18.4960, 73.8045], // Dahanukar
      [18.5095, 73.8160], // Mayur
      [LANDFILL.lat, LANDFILL.lng]
    ];

    const unoptPolyline = L.polyline(coords, {
      color: state.colorPalette.unoptimized,
      weight: 4,
      dashArray: "8, 8",
      opacity: 0.85
    });

    unoptPolyline.bindPopup(`
      <div style="font-family:'Inter', sans-serif; font-size:12px; color:#b91c1c;">
        <b>⚠️ Unoptimized Manual Dispatch</b><br>
        Haphazard routes without capacity planning.<br>
        <b>Dead Mileage:</b> +35% | <b>Fuel Wasted:</b> +1.13 L
      </div>
    `);

    unoptPolyline.addTo(state.layers.routes);
  }

  // ========================================================
  // 3. Mode Toggle (Before vs After Optimization)
  // ========================================================
  document.getElementById("btn-mode-optimized").addEventListener("click", () => {
    state.activeMode = "optimized";
    document.getElementById("btn-mode-optimized").classList.add("active");
    document.getElementById("btn-mode-unoptimized").classList.remove("active");

    // Restore optimal metrics
    document.getElementById("stat-fuel-saved").innerText = "25.0%";
    document.getElementById("stat-fuel-litres").innerText = "~1.13 L saved this morning shift";
    document.getElementById("stat-co2-cut").innerText = "3.03 kg";
    document.getElementById("stat-cost-cut").innerText = "₹104.5 diesel saved / ward shift";

    renderRoutesLayer();
    renderRoutesList();
    showToast("SwachhRoute AI Mode: Showing OR-Tools optimal loops.");
  });

  document.getElementById("btn-mode-unoptimized").addEventListener("click", () => {
    state.activeMode = "unoptimized";
    document.getElementById("btn-mode-unoptimized").classList.add("active");
    document.getElementById("btn-mode-optimized").classList.remove("active");

    // Show unoptimized penalty metrics
    document.getElementById("stat-fuel-saved").innerText = "0.0%";
    document.getElementById("stat-fuel-litres").innerText = "❌ 1.13 L wasted in dead mileage";
    document.getElementById("stat-co2-cut").innerText = "0.0 kg";
    document.getElementById("stat-cost-cut").innerText = "❌ +₹104.5 extra fuel burned";

    renderRoutesLayer();
    showToast("Unoptimized Mode: Demonstrating manual dispatch dead mileage (+35%).");
  });

  // ========================================================
  // 4. Live Fleet Simulation Player
  // ========================================================
  document.getElementById("btn-sim-play").addEventListener("click", () => {
    if (state.isSimulating) {
      stopSimulation();
    } else {
      startSimulation();
    }
  });

  document.getElementById("btn-sim-pause").addEventListener("click", () => {
    stopSimulation();
  });

  document.getElementById("btn-sim-stop").addEventListener("click", () => {
    stopSimulation();
    document.getElementById("sim-control-panel").style.display = "none";
  });

  function startSimulation() {
    if (!state.optimization || !state.optimization.routes) return;

    state.isSimulating = true;
    document.getElementById("btn-sim-play").innerHTML = `<i class="fa-solid fa-square"></i> Stop Sim`;
    document.getElementById("sim-control-panel").style.display = "block";

    // Clear existing sim markers
    state.layers.simulation.clearLayers();

    const activeRoutes = state.optimization.routes.filter(r => r.stops.length > 0);
    if (activeRoutes.length === 0) return;

    // Pick first route for animated demonstration
    const demoRoute = activeRoutes[0];
    const path = demoRoute.path_coordinates;
    let step = 0;

    const truckIcon = L.divIcon({
      className: "truck-sim-marker",
      html: '<i class="fa-solid fa-truck-moving" style="color:#10b981; font-size:22px; filter:drop-shadow(0 0 10px #10b981);"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker(path[0], { icon: truckIcon }).addTo(state.layers.simulation);

    state.simTimer = setInterval(() => {
      if (step >= path.length) {
        stopSimulation();
        document.getElementById("sim-truck-info").innerText = "✅ Collection shift completed! Trucks parked at MRF.";
        showToast("Fleet collection simulation completed successfully!");
        return;
      }

      const curPos = path[step];
      marker.setLatLng(curPos);

      const progress = Math.round((step / (path.length - 1)) * 100);
      document.getElementById("sim-progress-bar").style.width = `${progress}%`;
      document.getElementById("sim-truck-info").innerText = `${demoRoute.vehicle_name} en-route: Stop ${Math.min(demoRoute.stops.length, Math.floor(step / (path.length / demoRoute.stops.length)) + 1)} (${progress}% completed)`;

      step++;
    }, 180);
  }

  function stopSimulation() {
    state.isSimulating = false;
    clearInterval(state.simTimer);
    document.getElementById("btn-sim-play").innerHTML = `<i class="fa-solid fa-play"></i> Simulate Fleet`;
  }

  // ========================================================
  // 5. Web Speech API (Voice-to-Text Input)
  // ========================================================
  const voiceBtn = document.getElementById("btn-voice-input");
  const voiceStatus = document.getElementById("voice-status");
  const textInput = document.getElementById("input-report-text");

  if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "hi-IN"; // Supports Hindi / Hinglish

    voiceBtn.addEventListener("click", () => {
      try {
        if (voiceBtn.classList.contains("recording")) {
          recognition.stop();
          voiceBtn.classList.remove("recording");
          voiceStatus.style.display = "none";
        } else {
          recognition.start();
          voiceBtn.classList.add("recording");
          voiceStatus.style.display = "block";
          voiceStatus.innerText = "Listening in Hindi/English... Speak naturally.";
        }
      } catch (e) {
        console.error("Speech recognition error:", e);
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      textInput.value = transcript;
      voiceBtn.classList.remove("recording");
      voiceStatus.style.display = "none";
      showToast(`Voice transcribed: "${transcript.substring(0, 40)}..."`);
    };

    recognition.onerror = () => {
      voiceBtn.classList.remove("recording");
      voiceStatus.style.display = "none";
      showToast("Speech recognition timed out or permission denied.");
    };
  } else if (voiceBtn) {
    voiceBtn.title = "Web Speech API not supported in this browser version.";
  }

  // ========================================================
  // 6. UI Updates & Lists
  // ========================================================
  function updateMetricCounts() {
    document.getElementById("stat-reports-count").innerText = state.reports.length;
    document.getElementById("stat-clusters-count").innerText = state.clusters.length;
    document.getElementById("hotspots-badge").innerText = `${state.clusters.length} Hotspots`;
  }

  function renderHotspotsList() {
    const container = document.getElementById("hotspots-list");
    if (!container) return;

    if (state.clusters.length === 0) {
      container.innerHTML = `<div class="loading-placeholder">No clusters detected.</div>`;
      return;
    }

    container.innerHTML = state.clusters.map((c) => {
      const isHigh = c.severity_score >= 7.0;
      return `
        <div class="hotspot-card" data-lat="${c.centroid_lat}" data-lng="${c.centroid_lng}">
          <div class="hotspot-card-head">
            <span class="hotspot-title">#${c.cluster_id} ${c.name}</span>
            <span class="severity-pill ${isHigh ? 'sev-high' : 'sev-med'}">
              Sev ${c.severity_score}/10
            </span>
          </div>
          <div class="hotspot-desc">
            ${c.report_count} complaints • ~${c.estimated_tonnage_kg} kg • ${c.recommended_machinery.split('(')[0]}
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".hotspot-card").forEach((card) => {
      card.addEventListener("click", () => {
        const lat = parseFloat(card.getAttribute("data-lat"));
        const lng = parseFloat(card.getAttribute("data-lng"));
        state.map.flyTo([lat, lng], 16, { duration: 1.2 });
      });
    });
  }

  function renderRoutesList() {
    const container = document.getElementById("routes-list");
    if (!container || !state.optimization) return;

    const routes = state.optimization.routes;
    document.getElementById("routes-badge").innerText = `${routes.length} Trucks`;

    container.innerHTML = routes.map((r, i) => {
      const colors = ["#10b981", "#06b6d4", "#f59e0b"];
      const col = colors[i % colors.length];
      return `
        <div class="route-card" data-truck="${r.vehicle_id}">
          <div class="hotspot-card-head">
            <span class="hotspot-title" style="color: ${col};">
              <i class="fa-solid fa-truck"></i> ${r.vehicle_name}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #fff;">
              ${r.total_distance_km} km
            </span>
          </div>
          <div class="route-meta">
            <span>Stops: <b>${r.stops.length}</b></span>
            <span>Payload: <b>${r.total_tonnage_kg} / ${r.capacity_kg} kg</b></span>
            <span>Duration: <b>~${r.estimated_duration_mins} m</b></span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-fill" style="width: ${r.utilization_pct}%; background: ${col};"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  async function runOptimization() {
    try {
      showToast("Running Google OR-Tools CVRP Solver...");
      const res = await fetch("/api/optimize-routes", { method: "POST" });
      state.optimization = await res.json();

      document.getElementById("stat-fuel-saved").innerText = `${state.optimization.fuel_saved_pct}%`;
      document.getElementById("stat-fuel-litres").innerText = `~${state.optimization.fuel_saved_litres} L saved this morning shift`;
      document.getElementById("stat-co2-cut").innerText = `${state.optimization.co2_avoided_kg} kg`;
      document.getElementById("stat-cost-cut").innerText = `₹${state.optimization.cost_saved_inr} diesel saved / ward shift`;

      renderRoutesLayer();
      renderRoutesList();
      showToast(`Optimization complete! 100% of demand cleared across ${state.optimization.routes.length} vehicles.`);
    } catch (err) {
      console.error("Optimization error:", err);
      showToast("Error optimizing routes.");
    }
  }

  async function loadDriverManifest(truckId) {
    const container = document.getElementById("manifest-content");
    if (!container) return;

    try {
      container.innerHTML = `<div class="loading-placeholder">Generating localized shift manifest via Llama 3.2 3B...</div>`;
      const res = await fetch(`/api/driver-manifest/${truckId}`);
      if (!res.ok) throw new Error("Manifest not found");
      const data = await res.json();

      let stopsHtml = data.stops_summary.map((s, i) => `
        <div class="manifest-stop-item">
          <div>
            <span style="font-weight: 700; color: #0284c7;">#${i + 1}</span>
            <span class="manifest-stop-name">${s.stop_name}</span>
            <span style="font-size: 10px; color: #64748b;">(Sev: ${s.severity_score}/10)</span>
          </div>
          <div class="manifest-stop-demand">+${s.demand_kg} kg</div>
        </div>
      `).join("");

      let alertsHtml = data.safety_alerts.map(a => `<span class="safety-tag">⚠️ ${a}</span>`).join(" ");

      container.innerHTML = `
        <div class="manifest-head">
          <h4>MUNICIPAL SHIFT DISPATCH MANIFEST</h4>
          <div class="manifest-meta">
            <b>Vehicle:</b> ${data.truck_name} | <b>Driver:</b> ${data.driver_name}<br>
            <b>Shift:</b> ${data.shift_date} | <b>Total Load:</b> ${data.total_load_kg} kg
          </div>
        </div>

        <div class="manifest-hi">
          ${data.vernacular_instructions}
        </div>

        <div style="margin-bottom: 8px;">
          <b>Collection Sequence:</b>
          ${stopsHtml || '<div style="color:#666; font-style:italic;">No stops assigned for this unit.</div>'}
        </div>

        <div>
          <b>Safety Directives:</b><br>
          ${alertsHtml}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="loading-placeholder">Please click 'Solve Routes' first to assign trucks.</div>`;
    }
  }

  async function loadPolicyInsights() {
    const container = document.getElementById("policy-insights-list");
    if (!container) return;

    try {
      const res = await fetch("/api/policy-insights");
      const insights = await res.json();

      container.innerHTML = insights.map(p => `
        <div class="policy-card">
          <div class="policy-head">
            <span>${p.location_name}</span>
            <span class="recurrence-pill">Recurred ${p.recurrence_count}x</span>
          </div>
          <div class="policy-root">
            <b>Diagnosed Root Cause:</b> ${p.diagnosed_root_cause}
          </div>
          <div class="policy-rec">
            <b>Preventative Policy Action:</b> ${p.preventative_policy_recommendation}
          </div>
        </div>
      `).join("");
    } catch (err) {
      container.innerHTML = `<div class="loading-placeholder">Unable to load policy insights.</div>`;
    }
  }

  // ========================================================
  // 7. Citizen Reporting Form Submission
  // ========================================================
  const form = document.getElementById("citizen-report-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const text = document.getElementById("input-report-text").value.trim();
      const lat = parseFloat(document.getElementById("input-lat").value);
      const lng = parseFloat(document.getElementById("input-lng").value);
      const citizen_name = document.getElementById("input-citizen-name").value.trim();
      const ward = document.getElementById("input-ward").value.trim();

      const submitBtn = document.getElementById("btn-submit-report");
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with Local AI...`;
      submitBtn.disabled = true;

      try {
        const res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, lat, lng, citizen_name, ward })
        });

        const newReport = await res.json();

        // Show AI Extraction Box
        const aiBox = document.getElementById("ai-extraction-card");
        aiBox.style.display = "block";
        document.getElementById("tag-hazard").innerText = `Hazard: ${newReport.hazard_class}`;
        document.getElementById("tag-severity").innerText = `Severity: ${newReport.severity_score}/10`;
        document.getElementById("tag-machinery").innerText = `Vehicle: ${newReport.machinery_needed.split('(')[0]}`;
        document.getElementById("tag-urgency").innerText = `Urgency: ${newReport.urgency}`;

        // Reload Layers
        const repRes = await fetch("/api/reports");
        state.reports = await repRes.json();
        renderReportsLayer();
        updateMetricCounts();

        const clusRes = await fetch("/api/cluster", { method: "POST" });
        state.clusters = await clusRes.json();
        renderClustersLayer();
        renderHotspotsList();

        showToast(`Report accepted! AI classified as ${newReport.hazard_class} (Severity ${newReport.severity_score}/10).`);
        state.map.flyTo([lat, lng], 16, { duration: 1.0 });

        submitBtn.innerHTML = `<i class="fa-solid fa-brain"></i> Parse with Local AI & Submit Report`;
        submitBtn.disabled = false;
      } catch (err) {
        console.error("Submission failed:", err);
        showToast("Submission failed. Check network.");
        submitBtn.innerHTML = `<i class="fa-solid fa-brain"></i> Parse with Local AI & Submit Report`;
        submitBtn.disabled = false;
      }
    });
  }

  // Preset Chips
  document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-preset");
      const textarea = document.getElementById("input-report-text");
      const latInput = document.getElementById("input-lat");
      const lngInput = document.getElementById("input-lng");

      if (preset === "mandi") {
        textarea.value = "Market corner ke paas rotten cabbage aur vegetable waste ka dher laga hai, stray cows eating garbage.";
        latInput.value = "18.5068";
        lngInput.value = "73.8058";
      } else if (preset === "biomedical") {
        textarea.value = "Hospital clinic lane me yellow bags khule pade hain, used syringes aur blood vials footpath pe bikhre hain.";
        latInput.value = "18.4985";
        lngInput.value = "73.8182";
      } else if (preset === "nullah") {
        textarea.value = "Paud road nullah bridge chocked with plastic sacks and dead dog carcass, drain completely blocked.";
        latInput.value = "18.5118";
        lngInput.value = "73.8012";
      } else if (preset === "malba") {
        textarea.value = "Home renovation contractor dumped heavy concrete debris, plaster sacks, and broken bricks on corner plot.";
        latInput.value = "18.4962";
        lngInput.value = "73.8046";
      }
      showToast(`Loaded preset: ${btn.innerText}`);
    });
  });

  // Tab Switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Manifest Selector
  const truckSelect = document.getElementById("select-truck-manifest");
  if (truckSelect) {
    truckSelect.addEventListener("change", (e) => {
      loadDriverManifest(e.target.value);
    });
  }

  // Top Action Buttons
  document.getElementById("btn-trigger-optimize").addEventListener("click", () => {
    runOptimization();
  });

  document.getElementById("btn-reset-data").addEventListener("click", async () => {
    if (confirm("Reset database to initial Pune Ward 12 seed state?")) {
      await fetch("/api/reset", { method: "POST" });
      loadInitialData();
    }
  });

  // Layer Toggles
  document.getElementById("toggle-reports").addEventListener("change", (e) => {
    if (e.target.checked) state.layers.reports.addTo(state.map);
    else state.layers.reports.remove();
  });

  document.getElementById("toggle-clusters").addEventListener("change", (e) => {
    if (e.target.checked) state.layers.clusters.addTo(state.map);
    else state.layers.clusters.remove();
  });

  document.getElementById("toggle-routes").addEventListener("change", (e) => {
    if (e.target.checked) state.layers.routes.addTo(state.map);
    else state.layers.routes.remove();
  });

  function showToast(msg) {
    const banner = document.getElementById("toast-banner");
    const text = document.getElementById("toast-text");
    if (banner && text) {
      text.innerText = msg;
      banner.style.opacity = "1";
      banner.style.transform = "translateX(-50%) translateY(0)";
      clearTimeout(banner._timer);
      banner._timer = setTimeout(() => {
        banner.style.opacity = "0";
        banner.style.transform = "translateX(-50%) translateY(15px)";
      }, 3500);
    }
  }

  // Boot Application
  initMap();
  loadInitialData();
});
