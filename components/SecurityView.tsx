
import React, { useState } from 'react';
import CompliancePanel from './CompliancePanel';
import { ShieldAlert, Microscope, AlertTriangle, Loader2, CheckCircle, Search, FileSearch, ShieldCheck, Scan, Radar } from 'lucide-react';
import { analyzeSatelliteImage } from '../services/geminiService';
import { AnalysisResult } from '../types';

const SecurityView: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const triggerAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeSatelliteImage("");
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
          <h2 className="text-5xl font-black text-white tracking-tighter">Forensic Audit Hub</h2>
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] pl-6">Computer Vision Compliance / Fraud Detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] p-12 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]"></div>

            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-black text-2xl tracking-tight">Vision Audit Module</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">AI-Powered Satellite Analysis</p>
                </div>
              </div>
              {!result && !analyzing && (
                <button
                  onClick={triggerAnalysis}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/20 hover:-translate-y-1"
                >
                  <Scan size={16} />
                  Initiate Scan
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 aspect-video bg-slate-950 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000"
                  className={`w-full h-full object-cover transition-all duration-1000 ${analyzing ? 'blur-md brightness-50 scale-110' : 'group-hover:scale-105 brightness-75'}`}
                  alt="Satellite View"
                />
                {analyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20">
                    <Radar size={48} className="text-emerald-500 animate-spin" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] animate-pulse">Neural Audit Active...</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                  <span className="text-[9px] font-mono font-bold text-emerald-400">LIVE FEED</span>
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                  <span className="text-[9px] font-mono font-bold text-slate-400">28.6139°N / 77.2090°E</span>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                {!result && !analyzing ? (
                  <div className="text-center p-12 bg-slate-950/50 rounded-[2rem] border border-white/5 border-dashed flex flex-col items-center space-y-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600">
                      <FileSearch size={40} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-black text-xl">System Idle</h4>
                      <p className="text-slate-500 text-sm font-medium max-w-[240px] leading-relaxed mx-auto">
                        Awaiting orbital scan to verify land-use and structure integrity.
                      </p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Verdict</p>
                        <p className="text-white font-black text-xl tracking-tight">{result.land_type}</p>
                      </div>
                      <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 text-right">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Confidence</p>
                        <p className="text-white font-mono text-xl font-black">{(result.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-950/50 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Microscope size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Analysis</span>
                      </div>
                      <p className="text-slate-300 text-lg leading-relaxed font-medium italic tracking-tight">
                        "{result.analysis}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`flex-1 p-6 rounded-2xl border flex items-center gap-5 ${result.fraud_score < 20 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        {result.fraud_score < 20 ? <CheckCircle size={24} className="text-emerald-500" /> : <AlertTriangle size={24} className="text-red-500" />}
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Index</p>
                          <p className={`text-3xl font-black ${result.fraud_score < 20 ? 'text-emerald-400' : 'text-red-400'}`}>{result.fraud_score}/100</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setResult(null); triggerAnalysis(); }}
                        className="p-6 bg-slate-950/50 border border-white/10 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                      >
                        <Search size={24} />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-10">
          <CompliancePanel />
          <div className="bg-red-500/10 rounded-[2rem] p-10 border border-red-500/20 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 border border-red-500/20">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-red-400 font-black uppercase tracking-widest text-xs">Active Threat Monitoring</h3>
            </div>
            <p className="text-red-300/70 text-sm leading-relaxed mb-8 font-medium">
              Sector-04 flagged for potential encroachment. 24/7 Sentinel-2C uplink monitoring unauthorized activity.
            </p>
            <div className="h-2 bg-red-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-3/4 animate-pulse rounded-full shadow-[0_0_15px_#ef4444]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityView;
