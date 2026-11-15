import React, { useState } from 'react';
import { 
  Radio, 
  PlusCircle, 
  Search, 
  BarChart3, 
  ListFilter, 
  Menu, 
  X, 
  ShieldCheck 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenReportModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview', icon: Radio },
    { id: 'report', label: 'Report Issue', icon: PlusCircle },
    { id: 'track', label: 'Track Signal', icon: Search },
    { id: 'feed', label: 'Live Signals', icon: ListFilter },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-navy-950/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-electric-cyan p-0.5 shadow-glow-cyan">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-electric-cyan transition-transform group-hover:scale-110" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-electric-cyan rounded-full signal-live" />
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Street<span className="text-electric-blue">Signal</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-electric-blue/15 text-electric-blue border border-electric-blue/30 font-semibold tracking-wider">
                  AWS Serverless
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Civic Issue Reporting & Dispatch Network
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-electric-blue/15 text-electric-cyan border border-electric-blue/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-electric-cyan' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick CTA and System Status */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Gateway Ready
            </div>

            <button
              onClick={() => handleNavClick('report')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-medium text-sm shadow-glow-electric transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('report')}
              className="p-2 rounded-lg bg-electric-blue/20 text-electric-cyan border border-electric-blue/30"
              title="Report Issue"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-navy-900/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-electric-blue/15 text-electric-cyan border border-electric-blue/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-emerald-400 bg-navy-950/60 rounded-lg border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AWS HTTP API & DynamoDB Online
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
