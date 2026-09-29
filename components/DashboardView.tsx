
import React from 'react';
import MapModule from './MapModule';
import DecisionPanel from './DecisionPanel';
import MetricsGrid from './MetricsGrid';
import { Activity, Satellite, Crosshair, Radar, Target, Flame, AlertTriangle, Search, Pickaxe, Droplets } from 'lucide-react';
import { FarmerData } from '../types';

interface DashboardViewProps {
  selectedFarmer: FarmerData | null;
  setSelectedFarmer: (farmer: FarmerData) => void;
  isLockedOn?: boolean;
  externalSearchTerm?: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ selectedFarmer, setSelectedFarmer, isLockedOn, externalSearchTerm }) => {
  return (
    <div className="space-y-12 py-6 animate-in fade-in duration-1000">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 px-2">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
            <h2 className="text-5xl font-black text-white tracking-tighter">Command Center</h2>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] pl-6">Active Surveillance Feed / Sovereign Sector 01</p>
        </div>

        {isLockedOn && selectedFarmer && (
          <div className="flex items-center gap-6 animate-in slide-in-from-right-8 duration-700">
            <div className="h-16 w-[1px] bg-white/10 hidden lg:block"></div>
            <div className="flex items-center gap-5">
              <div className="text-right flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Acquired Asset</span>
                <span className="text-2xl font-black text-emerald-400 tracking-tighter uppercase">{selectedFarmer.id}</span>
              </div>
              <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-emerald-400 shadow-2xl shadow-black/50 border border-emerald-500/20 group">
                <Crosshair size={32} className="group-hover:rotate-90 transition-transform duration-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Analytics Core */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Map Visualizer */}
        <div className="lg:col-span-8 h-[800px] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative group bg-black/40 backdrop-blur-sm">
          <MapModule
            selectedFarmer={selectedFarmer}
            setSelectedFarmer={setSelectedFarmer}
            externalSearchTerm={externalSearchTerm}
          />
          {/* Subtle Frame Overlays */}
          <div className="absolute top-10 left-10 z-10 pointer-events-none">
            <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10">
              <Radar size={16} className="text-emerald-500 animate-spin-slow" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Orbital Precision: 0.5m</span>
            </div>
          </div>
        </div>

        {/* Tactical Feed Panel */}
        <div className="lg:col-span-4 h-[800px]">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] p-10 h-full border border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
            {/* Background scanner effect */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>

            {selectedFarmer ? (
              <div className="space-y-10 flex flex-col h-full animate-in fade-in slide-in-from-right-12 duration-700 relative z-10">
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-[1.75rem] flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                      <Satellite size={32} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-1">Telemetry Synced</span>
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{selectedFarmer.name}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-black/20 rounded-[2rem] border border-white/5 flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Geolocation</span>
                      <span className="text-[11px] font-mono font-bold text-slate-300 tracking-tighter">{selectedFarmer.location.lat.toFixed(4)}N / {selectedFarmer.location.lng.toFixed(4)}E</span>
                    </div>
                    <div className="p-5 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 flex flex-col justify-center">
                      <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest block mb-2">Audit Status</span>
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                      <Activity size={14} className="text-emerald-500" />
                      Live Indices
                    </h4>
                    <span className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-widest italic animate-pulse">LIVE UPDATE</span>
                  </div>

                  <div className="space-y-4">
                    <div className="group flex items-center justify-between p-6 bg-black/20 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all cursor-default">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">GLI Spectral Index</span>
                        <div className="h-1 w-8 bg-emerald-500/50 rounded-full"></div>
                      </div>
                      <span className="text-2xl font-mono font-black text-white group-hover:text-emerald-400 transition-colors">{selectedFarmer.gli}</span>
                    </div>
                    <div className="group flex items-center justify-between p-6 bg-black/20 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all cursor-default">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Soil Moisture Pct</span>
                        <div className="h-1 w-8 bg-blue-500/50 rounded-full"></div>
                      </div>
                      <span className="text-2xl font-mono font-black text-white group-hover:text-blue-400 transition-colors">{selectedFarmer.soilMoisture}%</span>
                    </div>
                  </div>
                </div>

                {/* Fraud Detection Modules */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 pl-2">Threat Detection</h4>

                  {selectedFarmer.riskVectors ? (
                    selectedFarmer.riskVectors.map((risk, idx) => {
                      const getStatusColor = (status: string) => {
                        if (status === 'VIOLATION') return 'red';
                        if (status === 'WARNING') return 'amber';
                        return 'emerald';
                      };
                      const baseColor = getStatusColor(risk.status);
                      const statusColors = {
                        red: 'text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20',
                        amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
                        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                      };
                      const colorClass = statusColors[baseColor as keyof typeof statusColors];

                      // Icon selection logic
                      const Icon = risk.id === 'sb' ? Flame :
                        risk.id === 'im' ? Pickaxe :
                          risk.id === 'gw' ? Droplets :
                            risk.status === 'VIOLATION' ? AlertTriangle : Search;

                      return (
                        <div key={idx} className={`p-5 bg-black/20 rounded-[2rem] border border-white/5 flex items-start gap-4 hover:border-${baseColor}-500/30 transition-all cursor-default group`}>
                          <div className={`mt-1 p-2 rounded-xl border transition-colors ${colorClass}`}>
                            <Icon size={16} />
                          </div>
                          <div className="space-y-1">
                            <p className={`text-[10px] font-black text-slate-300 uppercase tracking-tight group-hover:text-${baseColor}-400 transition-colors`}>{risk.name}</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{risk.description}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-[10px] text-slate-600 uppercase tracking-widest">No risk vectors analyzed</div>
                  )}
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex justify-between items-end mb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Certainty</span>
                      <p className="text-xs font-black text-emerald-500">MISSION OPTIMAL</p>
                    </div>
                    <span className="text-4xl font-black tracking-tighter text-white">98.2<span className="text-lg text-slate-600">%</span></span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-emerald-500 w-[98.2%] rounded-full shadow-[0_0_15px_#10b981]"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-10 animate-in fade-in duration-1200">
                <div className="w-28 h-28 bg-black/20 rounded-[3rem] flex items-center justify-center border border-white/5 shadow-inner group overflow-hidden relative">
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-700 rounded-[3rem]" />
                  <Target className="text-slate-700 animate-pulse group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-700" size={56} strokeWidth={1} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-black text-white tracking-tighter uppercase">Grid Standby</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] mx-auto font-medium">
                    Tactical grid operational. Acquire a sector on the map to initialize orbital uplink and forensic analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedFarmer && (
        <div className="space-y-16 pb-24 animate-in slide-in-from-bottom-16 duration-1000">
          <MetricsGrid farmer={selectedFarmer} />
          <DecisionPanel farmer={selectedFarmer} />
        </div>
      )}
    </div>
  );
};

export default DashboardView;
