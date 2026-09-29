
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import DirectoryView from './components/DirectoryView';
import SecurityView from './components/SecurityView';
import AnalyticsView from './components/AnalyticsView';
import MapModule from './components/MapModule';
import LandingPage from './components/LandingPage';
import { HardDrive, AlertOctagon, CheckCircle2, Clock, Cpu, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { MOCK_FARMERS } from './constants';
import { FarmerData } from './types';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerData | null>(null);
  const [isLockedOn, setIsLockedOn] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const found = MOCK_FARMERS.find(f =>
        f.name.toLowerCase().includes(term.toLowerCase()) ||
        f.id.toLowerCase().includes(term.toLowerCase())
      );
      if (found) {
        setSelectedFarmer(found);
        setIsLockedOn(true);
        if (activeView !== 'dashboard') setActiveView('dashboard');
      }
    } else if (term.length === 0) {
      setIsLockedOn(false);
      setSelectedFarmer(null);
    }
  };

  const handleFarmerSelect = (farmer: FarmerData) => {
    setSelectedFarmer(farmer);
    setIsLockedOn(true);
    if (activeView !== 'dashboard') setActiveView('dashboard');
  };

  const renderPortfolio = () => (
    <div className="space-y-10 animate-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
          <h2 className="text-5xl font-black text-white tracking-tighter">Portfolio Overview</h2>
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] pl-6">Sovereign Capital Allocation / Risk Metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Portfolio', value: '₹14.2 Cr', icon: HardDrive, color: 'emerald', change: '+12.4%', up: true },
          { label: 'Risk Exposure', value: '₹1.8 Cr', icon: AlertOctagon, color: 'red', change: '-8.2%', up: false },
          { label: 'Avg Credit Score', value: '712', icon: CheckCircle2, color: 'blue', change: '+3.1%', up: true },
          { label: 'Open Audits', value: '12', icon: Clock, color: 'amber', change: '+2', up: true }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 shadow-2xl hover:border-emerald-500/20 transition-all cursor-default group">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-${stat.color}-500/20`}>
              <stat.icon size={24} className={`text-${stat.color}-400`} />
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h4 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h4>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] p-12 border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Shield size={28} />
            </div>
            <div>
              <h3 className="text-white font-black text-2xl tracking-tight">Risk Distribution</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Portfolio Health Analysis</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-8 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
            <p className="text-5xl font-black text-emerald-400 mb-2">68%</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Low Risk</p>
          </div>
          <div className="p-8 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
            <p className="text-5xl font-black text-amber-400 mb-2">24%</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Medium Risk</p>
          </div>
          <div className="p-8 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
            <p className="text-5xl font-black text-red-400 mb-2">8%</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">High Risk</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans']">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onSearch={handleSearch} />

        <main className="flex-1 ml-64 p-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-32">
            {activeView === 'dashboard' && (
              <DashboardView
                selectedFarmer={selectedFarmer}
                setSelectedFarmer={handleFarmerSelect}
                isLockedOn={isLockedOn}
                externalSearchTerm={searchTerm}
              />
            )}
            {activeView === 'profiles' && <DirectoryView />}
            {activeView === 'portfolio' && renderPortfolio()}
            {activeView === 'geofencing' && (
              <div className="space-y-10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                    <h2 className="text-5xl font-black text-white tracking-tighter">Geospatial Monitor</h2>
                  </div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] pl-6">Satellite Surveillance / Territory Analysis</p>
                </div>
                <div className="h-[750px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative bg-slate-900/50">
                  <MapModule selectedFarmer={selectedFarmer} setSelectedFarmer={handleFarmerSelect} />
                </div>
              </div>
            )}
            {activeView === 'fraud' && <SecurityView />}
            {activeView === 'analytics' && (
              selectedFarmer ? <AnalyticsView selectedFarmer={selectedFarmer} /> :
                <div className="py-40 text-center flex flex-col items-center justify-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-900/50 border border-white/5 shadow-xl flex items-center justify-center">
                    <Cpu className="text-slate-600" size={32} />
                  </div>
                  <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Acquire target on dashboard to view analytics</p>
                </div>
            )}
            {activeView === 'config' && (
              <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center py-40 gap-8">
                <div className="w-32 h-32 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center border border-emerald-500/20 shadow-xl">
                  <div className="animate-spin duration-[10s]">
                    <Cpu size={56} className="text-emerald-500/40" />
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase">System Configuration</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Encryption Level: AES-256 / Status: Active</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
