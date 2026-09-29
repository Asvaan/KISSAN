
import React, { useEffect, useState, useRef } from 'react';
import {
  Globe,
  ArrowRight,
  Satellite,
  ShieldCheck,
  Zap,
  Cpu,
  PlayCircle,
  ChevronDown,
  Flame,
  AlertTriangle,
  Pickaxe,
  CheckCircle,
  TrendingUp,
  Users,
  BarChart3,
  Lock,
  Sparkles,
  Eye,
  Target,
  Database,
  Brain
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observerRef.current?.disconnect();
    };
  }, []);

  const features = [
    {
      title: 'Orbital Intelligence',
      desc: 'Real-time satellite monitoring with 0.5m resolution for precise land-use verification and crop health analysis.',
      icon: Satellite,
      tag: 'Core Technology'
    },
    {
      title: 'AI Risk Engine',
      desc: 'Machine learning models detect fraud patterns including stubble burning, illegal mining, and ghost crops.',
      icon: Brain,
      tag: 'Fraud Prevention'
    },
    {
      title: 'Instant Decisions',
      desc: 'Automated credit scoring in under 30 seconds with AI-generated professional narratives for loan officers.',
      icon: Zap,
      tag: 'Speed & Scale'
    }
  ];

  const detectionCapabilities = [
    {
      title: 'Stubble Burning Detection',
      desc: 'Thermal imaging identifies illegal agricultural burning within 24 hours',
      icon: Flame,
      color: 'red'
    },
    {
      title: 'Ghost Crop Analysis',
      desc: 'Spectral analysis verifies actual crop vs. fraudulent declarations',
      icon: Eye,
      color: 'purple'
    },
    {
      title: 'Illegal Mining Scan',
      desc: 'Topography monitoring detects unauthorized excavation activities',
      icon: Pickaxe,
      color: 'amber'
    },
    {
      title: 'Structure Verification',
      desc: 'Computer vision identifies unauthorized farmhouses and commercial buildings',
      icon: Target,
      color: 'blue'
    }
  ];

  const stats = [
    { value: '₹28L Cr', label: 'Target Market Size', sublabel: 'India Agricultural Credit' },
    { value: '98.2%', label: 'Detection Accuracy', sublabel: 'Fraud Pattern Recognition' },
    { value: '< 30s', label: 'Decision Speed', sublabel: 'End-to-End Processing' },
    { value: '60%', label: 'Cost Reduction', sublabel: 'vs Manual Verification' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-['Plus_Jakarta_Sans'] overflow-x-hidden">

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-[100] px-8 lg:px-20 py-6 flex items-center justify-between transition-all duration-700 ${scrolled ? 'bg-slate-950/90 backdrop-blur-2xl border-b border-white/5 py-4 shadow-2xl' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all">
            <Globe className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase leading-none text-white">Kisaan-Credit</span>
            <span className="text-[7px] font-bold text-emerald-400 uppercase tracking-[0.5em] mt-1.5">Intelligence Platform</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-12">
          {['Features', 'Technology', 'Pricing', 'Docs'].map((link) => (
            <button key={link} className="text-[11px] font-black uppercase tracking-widest transition-colors duration-500 hover:text-emerald-400 text-slate-400">
              {link}
            </button>
          ))}
        </div>

        <button
          onClick={onStart}
          className="px-8 py-3 bg-emerald-600 text-white border border-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all flex items-center gap-3 group"
        >
          Launch Dashboard
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-8 lg:px-20 overflow-hidden bg-slate-950 pt-20">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-20 scale-110"
            poster="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-vast-green-field-40456-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>

        <div className="max-w-7xl w-full mx-auto text-center relative z-10 space-y-12 py-20">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-950/30 backdrop-blur-md text-emerald-400 border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-8 duration-1000 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Powered by AI & Satellite Intelligence</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] text-white tracking-tighter animate-in fade-in slide-in-from-bottom-12 duration-1000">
            Agricultural Credit,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400">Verified from Space.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-300 font-medium">
            The world's first AI-powered geospatial platform that eliminates agricultural loan fraud through real-time satellite monitoring, detecting stubble burning, illegal mining, ghost crops, and unauthorized construction before disbursement.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
            <button
              onClick={onStart}
              className="group px-12 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-black uppercase tracking-[0.3em] rounded-xl hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all flex items-center gap-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Start Free Trial</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform relative z-10" />
            </button>
            <button className="px-12 py-5 bg-slate-900/50 backdrop-blur-md text-white text-sm font-black uppercase tracking-[0.3em] rounded-xl border border-white/10 hover:bg-white/5 hover:border-emerald-500/50 transition-all flex items-center gap-3">
              <PlayCircle size={20} className="text-emerald-400" />
              Watch Demo
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-5xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="reveal opacity-0 translate-y-10 text-center">
                <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-sm font-bold text-white uppercase tracking-wider">{stat.label}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.sublabel}</div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.5em]">Scroll to Explore</span>
            <ChevronDown size={20} className="text-emerald-500" />
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-32 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden border-y border-white/5">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px] -ml-40 -mt-40" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-20 reveal opacity-0 translate-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-6">
              <AlertTriangle size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">The ₹1.8 Lakh Crore Problem</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
              Agricultural Loan Fraud<br />is Crippling India's Banks
            </h2>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto font-medium leading-relaxed">
              60% of small farmers still depend on moneylenders because banks can't verify their land, crops, or compliance. Manual audits take weeks and cost thousands. Fraud is rampant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Stubble Burning', desc: 'Farmers burn crop residue illegally, damaging soil health and violating environmental norms', icon: Flame, stat: '23M hectares affected annually' },
              { title: 'Ghost Crops', desc: 'False declarations of crop types and yields to inflate loan amounts', icon: Eye, stat: '₹12,000 Cr estimated annual loss' },
              { title: 'Illegal Construction', desc: 'Agricultural land misused for luxury farmhouses and commercial buildings', icon: Target, stat: '40% of agri loans diverted' }
            ].map((problem, idx) => (
              <div key={idx} className="reveal opacity-0 translate-y-10 bg-slate-950/50 backdrop-blur-sm p-10 rounded-3xl border border-red-500/10 hover:border-red-500/30 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                  <problem.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{problem.title}</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">{problem.desc}</p>
                <div className="text-sm font-black text-red-400 uppercase tracking-wider">{problem.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution - Core Features */}
      <section className="py-40 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] -mr-96 -mt-96" />

        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-32 reveal opacity-0 translate-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
              <CheckCircle size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Our Solution</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-10 tracking-tighter leading-tight">
              Automated Verification<br />at Planetary Scale
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Kisaan-Credit combines satellite imagery, AI, and real-time analytics to verify every loan application in under 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {features.map((item, i) => (
              <div key={i} className="reveal opacity-0 translate-y-10 bg-slate-900/50 backdrop-blur-md p-12 rounded-[3rem] border border-white/5 shadow-2xl hover:-translate-y-4 hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-700 group cursor-default relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-10 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-lg border border-emerald-500/20 relative z-10">
                  <item.icon size={36} strokeWidth={1.5} />
                </div>
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8 border border-white/5 relative z-10">
                  {item.tag}
                </div>
                <h3 className="text-3xl font-black text-white mb-6 tracking-tight relative z-10">{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed font-medium relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detection Capabilities Grid */}
      <section className="py-32 bg-gradient-to-b from-slate-950 to-slate-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20 reveal opacity-0 translate-y-10">
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 tracking-tighter">
              Advanced Threat Detection
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
              Our AI identifies fraud patterns that human auditors miss
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {detectionCapabilities.map((cap, idx) => (
              <div key={idx} className="reveal opacity-0 translate-y-10 bg-slate-950/50 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                <div className={`w-14 h-14 rounded-xl bg-${cap.color}-500/10 flex items-center justify-center text-${cap.color}-400 mb-6 group-hover:scale-110 transition-transform border border-${cap.color}-500/20`}>
                  <cap.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{cap.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-40 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-32 reveal opacity-0 translate-y-10">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-10 tracking-tighter">
              How It Works
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
              From application to disbursement in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Submit Application', desc: 'Farmer provides Aadhaar, land coordinates, and crop declaration', icon: Database },
              { step: '02', title: 'AI Analysis', desc: 'Our system scans satellite imagery, runs fraud detection, and generates credit score', icon: Cpu },
              { step: '03', title: 'Instant Decision', desc: 'Bank receives AI narrative and recommendation in under 30 seconds', icon: Zap }
            ].map((step, idx) => (
              <div key={idx} className="reveal opacity-0 translate-y-10 relative">
                <div className="text-9xl font-black text-emerald-500/10 absolute -top-8 -left-4 -z-10">{step.step}</div>
                <div className="bg-slate-900/50 backdrop-blur-md p-10 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                    <step.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-8 text-center reveal opacity-0 translate-y-10 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter leading-tight text-white">
            Ready to Eliminate<br />Agricultural Loan Fraud?
          </h2>
          <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">
            Join leading banks and financial institutions using Kisaan-Credit to secure their agricultural portfolios.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <button
              onClick={onStart}
              className="px-16 py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-black uppercase tracking-[0.4em] rounded-xl hover:shadow-[0_0_80px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all flex items-center gap-6 group"
            >
              Launch Platform
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-16 py-6 bg-slate-900/50 backdrop-blur-md text-white text-sm font-black uppercase tracking-[0.4em] rounded-xl border border-white/10 hover:bg-white/5 hover:border-emerald-500/50 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                  <Globe size={24} className="text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight uppercase text-white">Kisaan-Credit</span>
              </div>
              <p className="text-slate-400 max-w-md text-lg leading-relaxed mb-6">
                Empowering financial institutions with AI-powered geospatial intelligence for secure agricultural lending.
              </p>
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank-Grade Security • AES-256 Encrypted</span>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-[0.4em]">© 2026 Kisaan-Credit Intelligence. All Rights Reserved.</p>
            <div className="flex gap-8">
              {['LinkedIn', 'Twitter', 'GitHub'].map(s => (
                <a key={s} href="#" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest hover:text-emerald-500 transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
