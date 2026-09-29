
import React from 'react';
import { Droplets, Gauge, MapPin } from 'lucide-react';
import { FarmerData } from '../types';

interface MetricsGridProps {
  farmer: FarmerData;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ farmer }) => {
  const metrics = [
    {
      label: 'Soil Moisture',
      value: `${farmer.soilMoisture}%`,
      status: farmer.soilMoisture > 40 ? 'Optimal' : 'Adequate',
      icon: Droplets,
      color: 'emerald',
    },
    {
      label: 'Harvest Pulse',
      value: `${farmer.harvestConsistency}/100`,
      status: farmer.harvestConsistency > 90 ? 'Consistent' : 'Stable',
      icon: Gauge,
      color: 'blue',
    },
    {
      label: 'District Variance',
      value: `${farmer.neighborhoodBenchmark > 0 ? '+' : ''}${farmer.neighborhoodBenchmark}%`,
      status: farmer.neighborhoodBenchmark > 15 ? 'Leader' : 'Standard',
      icon: MapPin,
      color: 'indigo',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {metrics.map((m, idx) => (
        <div key={idx} className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] p-12 border border-white/5 shadow-2xl hover:shadow-emerald-900/20 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-white">
            <m.icon size={100} />
          </div>
          <div className={`w-16 h-16 rounded-2xl bg-${m.color}-500/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
            <m.icon size={28} className={`text-${m.color}-400`} />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</p>
            <h4 className="text-5xl font-extrabold text-white tracking-tighter">{m.value}</h4>
          </div>
          <div className="mt-10 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-${m.color}-500 shadow-[0_0_10px_currentColor]`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{m.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
