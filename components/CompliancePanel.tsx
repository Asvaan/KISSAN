
import React from 'react';
import { ShieldCheck, Fingerprint, FileCheck, Key, Server, Lock } from 'lucide-react';

const CompliancePanel: React.FC = () => {
  const complianceItems = [
    { title: 'AES-256 Encryption', status: 'Active', icon: Lock, description: 'Bank-grade data protection' },
    { title: 'Aadhaar Verification', status: 'Integrated', icon: Fingerprint, description: 'KYC compliance ready' },
    { title: 'RBI Guidelines', status: 'Compliant', icon: FileCheck, description: 'Regulatory framework aligned' },
    { title: 'API Security', status: 'OAuth 2.0', icon: Key, description: 'Secure token authentication' }
  ];

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-[2rem] p-10 border border-white/5 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-white font-black text-lg tracking-tight">Compliance Status</h3>
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">All Systems Nominal</p>
        </div>
      </div>

      <div className="space-y-4">
        {complianceItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all group cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-white text-sm font-bold">{item.title}</p>
                <p className="text-slate-500 text-[10px] font-medium">{item.description}</p>
              </div>
            </div>
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-slate-950/50 rounded-xl border border-white/5 flex items-center gap-4">
        <Server size={16} className="text-slate-500" />
        <div className="flex-1">
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            <span>System Health</span>
            <span className="text-emerald-400">99.9% Uptime</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[99.9%] rounded-full shadow-[0_0_10px_#10b981]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePanel;
