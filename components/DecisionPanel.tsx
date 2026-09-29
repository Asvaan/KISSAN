
import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageSquareQuote, Loader2, ArrowRight, Check, Cpu, Zap, Star } from 'lucide-react';
import { generateCreditNarrative } from '../services/geminiService';
import { FarmerData } from '../types';

interface DecisionPanelProps {
  farmer: FarmerData;
}

const DecisionPanel: React.FC<DecisionPanelProps> = ({ farmer }) => {
  const [narrative, setNarrative] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isDisbursed, setIsDisbursed] = useState(false);
  const [disbursing, setDisbursing] = useState(false);

  useEffect(() => {
    const fetchNarrative = async () => {
      setLoading(true);
      const text = await generateCreditNarrative(farmer);
      setNarrative(text);
      setLoading(false);
    };
    fetchNarrative();
  }, [farmer]);

  const handleDisburse = () => {
    setDisbursing(true);
    setTimeout(() => {
      setDisbursing(false);
      setIsDisbursed(true);
    }, 2500);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-[4rem] p-16 lg:p-24 border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-emerald-500/5 rounded-full blur-[150px] -mr-80 -mt-80 pointer-events-none opacity-40 animate-pulse" />

      <div className="flex flex-col lg:flex-row gap-24 relative z-10">
        <div className="flex-1 space-y-20">
          <div className="space-y-12">
            <div className="flex items-center gap-5">
              <div className="px-6 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-in fade-in duration-1000">
                AUDIT VERIFIED: PRIME
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
                <Cpu size={16} className="text-emerald-500" />
                Decision Logic v5.0
              </div>
            </div>

            <div className="flex items-baseline gap-8">
              <h2 className="text-[14rem] font-black text-white tracking-tighter leading-none animate-in slide-in-from-bottom-10 duration-1000 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                {farmer.score}
              </h2>
              <div className="pb-10">
                <p className="text-5xl text-slate-700 font-black tracking-tighter leading-none mb-6">/ 900</p>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Star size={12} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Elite Ranking</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-[3.5rem] p-16 border border-white/5 shadow-inner relative group/narrative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 opacity-20" />
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 shadow-sm text-emerald-400 group-hover/narrative:rotate-6 transition-transform">
                <MessageSquareQuote size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black text-white uppercase tracking-widest">Sovereign Intel Synthesis</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">AI-Generated Professional Audit</span>
              </div>
            </div>

            {loading ? (
              <div className="space-y-6 py-2">
                <div className="h-4 bg-slate-700/30 rounded-full w-[95%] animate-pulse" />
                <div className="h-4 bg-slate-700/30 rounded-full w-full animate-pulse" />
                <div className="h-4 bg-slate-700/30 rounded-full w-[85%] animate-pulse" />
              </div>
            ) : (
              <p className="text-slate-200 text-3xl leading-relaxed italic font-medium tracking-tight animate-in fade-in duration-1000 font-serif">
                "{narrative}"
              </p>
            )}
          </div>
        </div>

        <div className="lg:w-[500px] flex flex-col justify-between pt-10">
          <div className="space-y-16">
            <div className="text-right space-y-4">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Final Verdict</p>
              <div className="inline-block px-10 py-4 bg-emerald-500/10 text-emerald-400 rounded-[2.5rem] border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <p className="text-8xl font-black tracking-tighter uppercase">{farmer.recommendation}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Capital Allocation</p>
              <p className="text-[8rem] font-black text-white tracking-tighter leading-none">₹4.50<span className="text-4xl text-slate-600">L</span></p>
              <div className="flex justify-end mt-8">
                <div className="px-5 py-2.5 rounded-2xl bg-black/40 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm flex items-center gap-2">
                  <Zap size={14} className="text-emerald-500" />
                  Sovereign Scale Adjusted
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 mt-24">
            <button
              onClick={handleDisburse}
              disabled={disbursing || isDisbursed}
              className={`w-full py-12 rounded-[3.5rem] text-sm font-black uppercase tracking-[0.5em] transition-all duration-700 flex items-center justify-center gap-8 shadow-2xl relative overflow-hidden group/btn ${isDisbursed
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default shadow-none'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] hover:-translate-y-2'
                }`}
            >
              {disbursing ? (
                <>
                  <Loader2 size={28} className="animate-spin" />
                  Processing...
                </>
              ) : isDisbursed ? (
                <>
                  <Check size={28} className="animate-in zoom-in-50 duration-500" />
                  Credit Line Active
                </>
              ) : (
                <>
                  Execute Disbursement
                  <ArrowRight size={28} className="group-hover/btn:translate-x-3 transition-transform" />
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-5 opacity-40 group cursor-help">
              <ShieldCheck size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Grade Encryption AES-256</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionPanel;
