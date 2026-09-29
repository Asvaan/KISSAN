
import React from 'react';
import SpectralAnalysis from './SpectralAnalysis';
import { TrendingUp, TrendingDown, Zap, PieChart, Info, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { FarmerData } from '../types';

interface AnalyticsViewProps {
  selectedFarmer: FarmerData;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ selectedFarmer }) => {
  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
          <h2 className="text-5xl font-black text-white tracking-tighter">Predictive Intelligence</h2>
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] pl-6">Spectral Health Analysis / Yield Forecasting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Chart Section */}
        <div className="lg:col-span-8 h-[650px]">
          <SpectralAnalysis farmer={selectedFarmer} />
        </div>

        {/* Insight Panel */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] p-12 border border-white/5 shadow-2xl flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-white font-black tracking-tight text-xl">Yield Projections</h3>
              </div>
              <button className="text-slate-600 hover:text-emerald-500 transition-colors">
                <Info size={18} />
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              {[
                { crop: 'Premium Wheat', gain: '+14.2%', status: 'optimal', up: true },
                { crop: 'Organic Cotton', gain: '-2.4%', status: 'risk', up: false },
                { crop: 'Winter Maize', gain: '+5.1%', status: 'stable', up: true },
                { crop: 'Regional Avg', gain: '+1.8%', status: 'benchmark', up: true }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group p-4 rounded-2xl hover:bg-white/[0.02] transition-all cursor-default">
                  <div className="space-y-2">
                    <p className="text-white text-sm font-bold tracking-tight group-hover:text-emerald-400 transition-colors">{item.crop}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${item.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.status === 'risk' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          item.status === 'stable' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.up ? <ArrowUpRight size={18} className="text-emerald-500" /> : <ArrowDownRight size={18} className="text-red-500" />}
                    <span className={`text-xl font-black font-mono tracking-tighter ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.gain}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
              <div className="p-8 bg-slate-950/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Insight</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-medium italic tracking-tight">
                  "Predictive models suggest optimal maturation window for {selectedFarmer.id}. Consider harvest-linked EMI scheduling."
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2rem] p-10 shadow-xl shadow-emerald-500/20 group text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <PieChart className="text-white/30 mb-6 group-hover:rotate-12 transition-transform relative z-10" size={32} />
            <h4 className="text-white font-black text-xl mb-3 tracking-tight relative z-10">District Benchmark</h4>
            <p className="text-emerald-100/80 text-sm leading-relaxed font-medium relative z-10">
              This asset performs in the <span className="text-white font-black">{selectedFarmer.harvestConsistency}th percentile</span> of district output.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
