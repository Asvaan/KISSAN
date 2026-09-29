
import React, { useState } from 'react';
import { MOCK_FARMERS } from '../constants';
import { Search, UserPlus, Filter, MoreHorizontal, TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const DirectoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFarmers = MOCK_FARMERS.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
            <h2 className="text-5xl font-black text-white tracking-tighter">Asset Directory</h2>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] pl-6">Verified Farm Registry / Compliance Status</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-white placeholder:text-slate-600 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all">
            <Filter size={18} />
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5">
            <UserPlus size={16} />
            Register Asset
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/50 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-10 py-6">Farmer Identity</th>
                <th className="px-10 py-6">Credit Score</th>
                <th className="px-10 py-6">Risk Status</th>
                <th className="px-10 py-6">Soil Health</th>
                <th className="px-10 py-6">Verdict</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredFarmers.map(f => {
                const hasViolation = f.riskVectors?.some(r => r.status === 'VIOLATION');
                const hasWarning = f.riskVectors?.some(r => r.status === 'WARNING');

                return (
                  <tr key={f.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all cursor-pointer group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-lg border border-emerald-500/20">
                          {f.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-base tracking-tight group-hover:text-emerald-400 transition-colors">{f.name}</span>
                          <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mt-1">{f.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <span className="text-white font-black text-2xl">{f.score}</span>
                        <div className="flex flex-col gap-1.5">
                          <div className="h-1.5 w-20 rounded-full bg-slate-800 overflow-hidden">
                            <div className={`h-full rounded-full ${f.score > 700 ? 'bg-emerald-500' : f.score > 500 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(f.score / 900) * 100}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">{f.score > 700 ? 'Elite' : f.score > 500 ? 'Standard' : 'High Risk'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        {hasViolation ? (
                          <>
                            <AlertTriangle size={16} className="text-red-500" />
                            <span className="text-red-400 text-xs font-bold uppercase">Violation</span>
                          </>
                        ) : hasWarning ? (
                          <>
                            <AlertTriangle size={16} className="text-amber-500" />
                            <span className="text-amber-400 text-xs font-bold uppercase">Warning</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} className="text-emerald-500" />
                            <span className="text-emerald-400 text-xs font-bold uppercase">Clear</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold">{f.soilMoisture}%</span>
                        {f.neighborhoodBenchmark > 0 ? (
                          <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                            <TrendingUp size={14} />
                            +{f.neighborhoodBenchmark}%
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                            <TrendingDown size={14} />
                            {f.neighborhoodBenchmark}%
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${f.recommendation === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : f.recommendation === 'REVIEW'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        {f.recommendation}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-3 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredFarmers.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center border border-white/5 text-slate-600">
              <Search size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-white font-bold text-lg">No assets found</p>
              <p className="text-slate-500 text-sm">Refine your search or check filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectoryView;
