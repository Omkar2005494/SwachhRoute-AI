'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Megaphone,
  ClipboardList,
  FileCheck2,
  Lightbulb,
  Mic,
  Flame,
  Truck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Check,
} from 'lucide-react';
import {
  CitizenReport,
  HotspotCluster,
  OptimizationResponse,
  DriverManifest,
} from '@/types';

interface SidebarProps {
  reports: CitizenReport[];
  clusters: HotspotCluster[];
  optimization: OptimizationResponse | null;
  driverManifest: DriverManifest | null;
  policyInsights: any[];
  onSelectCluster: (c: HotspotCluster) => void;
  onSubmitReport: (payload: { text: string; lat: number; lng: number; citizen_name: string; ward: string }) => Promise<any>;
  onSelectTruck: (truckId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  reports,
  clusters,
  optimization,
  driverManifest,
  policyInsights,
  onSelectCluster,
  onSubmitReport,
  onSelectTruck,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'manifest' | 'override' | 'policy'>('overview');

  // Form State
  const [reportText, setReportText] = useState('');
  const [lat, setLat] = useState(18.5085);
  const [lng, setLng] = useState(73.8062);
  const [citizenName, setCitizenName] = useState('Omkar (Citizen)');
  const [ward, setWard] = useState('Ward 12 (Kothrud)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedAI, setExtractedAI] = useState<any>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);

  const handleSpeechInput = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.lang = 'hi-IN'; // Hindi & Hinglish
      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setReportText((prev) => (prev ? `${prev} ${text}` : text));
      };
      rec.start();
    } else {
      alert('Speech recognition is supported directly in Chromium/Safari browsers.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText) return;
    setIsSubmitting(true);
    try {
      const res = await onSubmitReport({
        text: reportText,
        lat,
        lng,
        citizen_name: citizenName,
        ward,
      });
      setExtractedAI(res);
      setReportText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreset = (preset: string) => {
    if (preset === 'mandi') {
      setReportText('Sabzi market ke peeche rotten cabbage aur vegetable waste ka dher laga hai, stray cows eating garbage.');
      setLat(18.5068);
      setLng(73.8058);
    } else if (preset === 'biomedical') {
      setReportText('Hospital clinic lane me yellow bags khule pade hain, used syringes aur blood vials footpath pe bikhre hain.');
      setLat(18.4985);
      setLng(73.8182);
    } else if (preset === 'nullah') {
      setReportText('Paud road nullah bridge choked with plastic sacks and dead dog carcass, drain completely blocked.');
      setLat(18.5118);
      setLng(73.8012);
    } else if (preset === 'malba') {
      setReportText('Home renovation contractor dumped heavy concrete debris, plaster sacks, and broken bricks on corner plot.');
      setLat(18.4962);
      setLng(73.8046);
    }
  };

  return (
    <aside className="w-[440px] bg-[#0e131f] border-r border-[#212d45] flex flex-col z-20 shadow-2xl h-full">
      {/* Navigation Tabs */}
      <nav className="flex bg-[#090d16] border-b border-[#212d45]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 text-xs font-heading font-semibold flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-3 text-xs font-heading font-semibold flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'report'
              ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Report Waste</span>
        </button>

        <button
          onClick={() => setActiveTab('manifest')}
          className={`flex-1 py-3 text-xs font-heading font-semibold flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'manifest'
              ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Manifest</span>
        </button>

        <button
          onClick={() => setActiveTab('override')}
          className={`flex-1 py-3 text-xs font-heading font-semibold flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'override'
              ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Override</span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`flex-1 py-3 text-xs font-heading font-semibold flex flex-col items-center gap-1 border-b-2 transition-all ${
            activeTab === 'policy'
              ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Policy</span>
        </button>
      </nav>

      {/* Tab Content Panes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ========================================================
            TAB 1: OVERVIEW & METRICS
           ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="glass-card p-3 rounded-lg">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Reports</div>
                <div className="font-heading font-extrabold text-2xl text-white my-1">{reports.length}</div>
                <div className="text-[11px] text-slate-500">Crowdsourced citizen complaints</div>
              </div>

              <div className="glass-card p-3 rounded-lg">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>DBSCAN Hotspots</span>
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="font-heading font-extrabold text-2xl text-rose-400 my-1">{clusters.length}</div>
                <div className="text-[11px] text-slate-500">Persistent chronic clusters</div>
              </div>

              <div className="glass-card p-3 rounded-lg border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 to-transparent">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>Fuel Saved (CVRP)</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-bold">Optimal</span>
                </div>
                <div className="font-heading font-extrabold text-2xl text-emerald-400 my-1">
                  {optimization ? `${optimization.fuel_saved_pct}%` : '25.0%'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {optimization ? `~${optimization.fuel_saved_litres} L saved / shift` : '~1.13 L saved'}
                </div>
              </div>

              <div className="glass-card p-3 rounded-lg border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 to-transparent">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">CO₂ Avoided</div>
                <div className="font-heading font-extrabold text-2xl text-emerald-400 my-1">
                  {optimization ? `${optimization.co2_avoided_kg} kg` : '3.03 kg'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {optimization ? `₹${optimization.cost_saved_inr} diesel saved` : '₹104.5 saved'}
                </div>
              </div>
            </div>

            {/* Hotspots Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>Persistent Hotspots (DBSCAN)</span>
                </h3>
                <span className="text-[10px] bg-[#141c2e] border border-[#212d45] text-slate-400 px-2 py-0.5 rounded-full font-bold">
                  {clusters.length} Zones
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {clusters.map((c) => (
                  <div
                    key={c.cluster_id}
                    onClick={() => onSelectCluster(c)}
                    className="glass-card p-3 rounded-lg cursor-pointer hover:border-emerald-500/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white">#{c.cluster_id} {c.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        c.severity_score >= 7.0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        Sev {c.severity_score}/10
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {c.report_count} complaints • ~{c.estimated_tonnage_kg} kg • {c.recommended_machinery.split('(')[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet Routes Section */}
            {optimization && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Dynamic Fleet Dispatches</span>
                  </h3>
                  <span className="text-[10px] bg-[#141c2e] border border-[#212d45] text-slate-400 px-2 py-0.5 rounded-full font-bold">
                    {optimization.routes.length} Trucks
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {optimization.routes.map((r, i) => {
                    const colors = ['text-emerald-400', 'text-cyan-400', 'text-amber-400'];
                    const barColors = ['bg-emerald-500', 'bg-cyan-500', 'bg-amber-500'];
                    return (
                      <div key={r.vehicle_id} className="glass-card p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-xs ${colors[i % colors.length]} flex items-center gap-1.5`}>
                            <Truck className="w-3.5 h-3.5" />
                            {r.vehicle_name}
                          </span>
                          <span className="text-xs font-bold text-white">{r.total_distance_km} km</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                          <span>Stops: <b className="text-slate-200">{r.stops.length}</b></span>
                          <span>Load: <b className="text-slate-200">{r.total_tonnage_kg} / {r.capacity_kg} kg</b></span>
                          <span>Duration: <b className="text-slate-200">~{r.estimated_duration_mins}m</b></span>
                        </div>
                        <div className="w-full bg-[#1e2a3f] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColors[i % barColors.length]}`}
                            style={{ width: `${Math.min(100, r.utilization_pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: CITIZEN REPORTING PORTAL
           ======================================================== */}
        {activeTab === 'report' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-heading font-semibold text-sm text-white flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-emerald-400" />
                <span>Submit Citizen Waste Grievance</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Natural language ingestion parsed by on-premise Meta Llama 3.2 3B. Click map for coordinates or pick a preset:
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset('mandi')}
                className="text-[11px] bg-[#141c2e] hover:bg-[#1c2740] border border-[#212d45] text-slate-300 px-2.5 py-1 rounded-full transition-all"
              >
                🥬 Rotten Vegetables
              </button>
              <button
                type="button"
                onClick={() => handlePreset('biomedical')}
                className="text-[11px] bg-[#141c2e] hover:bg-[#1c2740] border border-[#212d45] text-slate-300 px-2.5 py-1 rounded-full transition-all"
              >
                💉 Medical Syringes
              </button>
              <button
                type="button"
                onClick={() => handlePreset('nullah')}
                className="text-[11px] bg-[#141c2e] hover:bg-[#1c2740] border border-[#212d45] text-slate-300 px-2.5 py-1 rounded-full transition-all"
              >
                🌊 Clogged Nullah
              </button>
              <button
                type="button"
                onClick={() => handlePreset('malba')}
                className="text-[11px] bg-[#141c2e] hover:bg-[#1c2740] border border-[#212d45] text-slate-300 px-2.5 py-1 rounded-full transition-all"
              >
                🧱 Concrete Malba
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-2.5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Complaint Text (Hinglish/Marathi/English)
                  </label>
                  <button
                    type="button"
                    onClick={handleSpeechInput}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                    <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
                  </button>
                </div>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. Maruti mandir ke peeche kachra overflow, dead animal smell, drain completely blocked..."
                  className="w-full bg-[#090d16] border border-[#212d45] rounded-md p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    required
                    className="w-full bg-[#090d16] border border-[#212d45] rounded-md p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    required
                    className="w-full bg-[#090d16] border border-[#212d45] rounded-md p-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reporter Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#212d45] rounded-md p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ward Name</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-[#090d16] border border-[#212d45] rounded-md p-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-heading font-semibold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Analyzing via Llama 3.2 3B...' : 'Parse with Local AI & Submit'}</span>
              </button>
            </form>

            {/* Extracted AI Metadata Box */}
            {extractedAI && (
              <div className="p-3 bg-gradient-to-br from-blue-950/20 to-emerald-950/20 border border-blue-500/40 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Meta Llama 3.2 3B Extraction Output:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded">
                    Hazard: {extractedAI.hazard_class}
                  </span>
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                    Severity: {extractedAI.severity_score}/10
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Vehicle: {extractedAI.machinery_needed.split('(')[0]}
                  </span>
                  <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded">
                    Urgency: {extractedAI.urgency}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: DRIVER SHIFT MANIFEST
           ======================================================== */}
        {activeTab === 'manifest' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Vehicle:</label>
              <select
                onChange={(e) => onSelectTruck(e.target.value)}
                className="bg-[#090d16] border border-[#212d45] rounded-md px-2 py-1 text-xs text-white"
              >
                <option value="TRUCK_01">Compactor MH-12-Q-4481 (Heavy)</option>
                <option value="TRUCK_02">Tipper MH-12-RN-8812 (Mini)</option>
                <option value="TRUCK_03">Tipper MH-12-RN-9023 (Mini)</option>
              </select>
            </div>

            {driverManifest ? (
              <div className="bg-[#fafafa] text-[#0f172a] p-4 rounded-lg shadow-xl text-xs space-y-3">
                <div className="border-b border-dashed border-slate-300 pb-2">
                  <h4 className="font-heading font-extrabold text-sm text-[#0f172a]">
                    PUNE MUNICIPAL CORPORATION — SHIFT WAYBILL
                  </h4>
                  <div className="text-[11px] text-slate-600 mt-1">
                    <b>Unit:</b> {driverManifest.truck_name} | <b>Operator:</b> {driverManifest.driver_name}<br />
                    <b>Shift:</b> {driverManifest.shift_date} | <b>Total Load:</b> {driverManifest.total_load_kg} kg
                  </div>
                </div>

                <div className="bg-slate-100 border-l-4 border-sky-600 p-2.5 rounded text-xs font-medium whitespace-pre-line text-slate-800">
                  {driverManifest.vernacular_instructions}
                </div>

                <div>
                  <div className="font-bold text-xs text-slate-900 mb-1">Assigned Collection Stops:</div>
                  <div className="space-y-1">
                    {driverManifest.stops_summary.map((s, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-200">
                        <span>
                          <b className="text-sky-700">#{idx + 1}</b> {s.stop_name} (Sev: {s.severity_score}/10)
                        </span>
                        <span className="font-bold text-emerald-700">+{s.demand_kg} kg</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-xs text-slate-900 mb-1">Safety Directives:</div>
                  <div className="flex flex-wrap gap-1">
                    {driverManifest.safety_alerts.map((a, i) => (
                      <span key={i} className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded">
                        ⚠️ {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-4 text-center">Loading driver manifest...</div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: OFFICER OVERRIDE & PICKUP VERIFICATION
           ======================================================== */}
        {activeTab === 'override' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-heading font-semibold text-sm text-white flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                <span>Sanitary Inspector Override & Verification</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Human-in-the-loop control for ward corporators and digital verification of cleared tonnage.
              </p>
            </div>

            <div className="glass-card p-3 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-white">Manual Priority Override</div>
              <p className="text-[11px] text-slate-400">
                Override automated DBSCAN urgency if school zones or VIP transit routes require urgent clearance:
              </p>
              <div className="space-y-1.5">
                <button className="w-full py-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Escalate Paud Road Nullah to Emergency Priority</span>
                </button>
                <button className="w-full py-1.5 text-xs font-semibold bg-[#141c2e] hover:bg-[#1c2740] border border-[#212d45] text-slate-300 rounded flex items-center justify-center gap-1.5">
                  <span>Reassign Compactor MH-12-Q-4481 to Ward 12 Boundary</span>
                </button>
              </div>
            </div>

            <div className="glass-card p-3 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-white flex items-center justify-between">
                <span>Driver Pickup Verification</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">Live</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 bg-[#090d16] rounded border border-[#212d45]">
                  <div>
                    <div className="font-semibold text-slate-200">Stop #1: Kothrud Sabzi Mandi</div>
                    <div className="text-[10px] text-slate-500">Collected: 1,584 kg • Driver Verified</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-2 bg-[#090d16] rounded border border-[#212d45]">
                  <div>
                    <div className="font-semibold text-slate-200">Stop #2: Clinic Lane Bio-Waste</div>
                    <div className="text-[10px] text-slate-500">Pending Driver Weighbridge Sync</div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold">In Transit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: POLICY INSIGHTS & RECURRENCE TRACKING
           ======================================================== */}
        {activeTab === 'policy' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-heading font-semibold text-sm text-white flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Municipal Policy Diagnostics</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Llama 3.2 3B diagnoses why black spots recur and formulates preventative interventions under SWM Rules 2016.
              </p>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {policyInsights.map((p, idx) => (
                <div key={idx} className="glass-card p-3 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{p.location_name}</span>
                    <span className="text-[10px] bg-rose-500/20 border border-rose-500/40 text-rose-400 px-1.5 py-0.5 rounded font-bold">
                      Recurred {p.recurrence_count}x
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <b className="text-slate-400">Root Cause:</b> {p.diagnosed_root_cause}
                  </div>
                  <div className="text-[11px] bg-emerald-500/10 border-l-2 border-emerald-500 p-2 rounded text-emerald-300">
                    <b className="text-emerald-400">Policy Recommendation:</b> {p.preventative_policy_recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
