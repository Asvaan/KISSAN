
import React, { useState } from 'react';
import { Search, Bell, Menu, X, ChevronDown, User } from 'lucide-react';

interface HeaderProps {
  onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <header className="h-24 px-10 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-sm z-50 ml-64">
      {/* Search Input */}
      <div className="flex-1 max-w-2xl group">
        <div className="relative flex items-center">
          <Search className="absolute left-6 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search Farmer ID, Aadhaar, or coordinates..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-slate-950/50 border border-white/5 text-white pl-16 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium placeholder:text-slate-600 text-sm"
          />
          <div className="absolute right-4 px-2 py-1 bg-white/5 rounded-md border border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CMD + K</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-8 pl-10">
        <button className="relative w-12 h-12 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e] animate-pulse"></span>
        </button>

        <div className="h-10 w-[1px] bg-white/5"></div>

        <button className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-[1px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
              <User size={20} className="text-emerald-500" />
            </div>
          </div>
          <div className="text-left hidden xl:block">
            <span className="block text-sm font-black text-white tracking-tight">Admin Console</span>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Level 5 Clearance</span>
          </div>
          <ChevronDown size={14} className="text-slate-500 group-hover:text-white transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Header;
