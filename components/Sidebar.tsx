
import React from 'react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Fingerprint,
  Layers,
  Globe,
  CircleDot,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Command Center' },
    { id: 'profiles', icon: Users, label: 'Asset Directory' },
    { id: 'geofencing', icon: Layers, label: 'Geospatial Audit' },
    { id: 'analytics', icon: BarChart3, label: 'Predictive Intel' },
    { id: 'fraud', icon: Fingerprint, label: 'Compliance Hub' },
    { id: 'config', icon: Settings, label: 'System Kernel' },
  ];

  return (
    <aside className="w-72 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-[100] bg-slate-950/80 backdrop-blur-xl">
      {/* Brand Section */}
      <div className="p-8 mb-4 border-b border-slate-800/50">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all duration-500">
            <Globe className="text-emerald-500 w-6 h-6 animate-pulse-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white leading-none">KISAAN</span>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-none">Intelligence.OS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto custom-scrollbar">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 group relative ${isActive
                  ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                  : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
            >
              <div className="flex items-center gap-4">
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`}
                />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.label}
                </span>
              </div>
              {isActive && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-6 mt-auto border-t border-slate-800/50 bg-slate-900/30">
        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 shadow-inner backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Cpu size={14} className="text-emerald-500" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase block">Kernel v2.4</span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Online</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[9px] font-mono font-bold">
              <span className="text-slate-500 uppercase">Latency</span>
              <span className="text-emerald-500">12ms</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[92%] rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></div>
            </div>
            <div className="pt-1 flex items-center gap-2 text-slate-500 justify-end">
              <ShieldCheck size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
