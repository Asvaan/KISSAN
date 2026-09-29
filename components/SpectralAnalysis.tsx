
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';
import { FarmerData } from '../types';

interface SpectralAnalysisProps {
  farmer: FarmerData;
}

const SpectralAnalysis: React.FC<SpectralAnalysisProps> = ({ farmer }) => {
  const data = farmer.vhiData.map(d => ({
    ...d,
    value: parseFloat((d.value * 100).toFixed(1))
  }));

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] p-12 h-full border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]"></div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Activity size={28} />
          </div>
          <div>
            <h3 className="text-white font-black text-2xl tracking-tight">Vegetation Health Index</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">12-Month Spectral Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <TrendingUp size={16} className="text-emerald-400" />
          <span className="text-emerald-400 text-sm font-black">+{farmer.neighborhoodBenchmark}% vs District</span>
        </div>
      </div>

      <div className="h-[calc(100%-120px)] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              axisLine={{ stroke: '#1e293b' }}
              tickLine={false}
            />
            <YAxis
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              axisLine={{ stroke: '#1e293b' }}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
              }}
              labelStyle={{ color: '#94a3b8', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}
              itemStyle={{ color: '#10b981', fontWeight: 800, fontSize: '18px' }}
              formatter={(value: number) => [`${value}%`, 'VHI']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#colorValue)"
              dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 8, fill: '#10b981', stroke: '#0f172a', strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute bottom-12 left-12 right-12 flex gap-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Healthy Zone (60-100%)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Stress Zone (30-60%)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Critical (&lt;30%)</span>
        </div>
      </div>
    </div>
  );
};

export default SpectralAnalysis;
