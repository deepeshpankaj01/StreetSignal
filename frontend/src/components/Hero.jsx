import React, { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Layers 
} from 'lucide-react';
import { CATEGORIES } from '../utils/categories';

export default function Hero({ onStartReport, onTrackReport, totalCount = 0 }) {
  const [trackInput, setTrackInput] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackInput.trim()) {
      onTrackReport(trackInput.trim());
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-white/5">
      {/* Background ambient electric glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-[350px] h-[250px] bg-electric-cyan/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top micro badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900/90 border border-electric-blue/30 text-xs font-medium text-slate-200 shadow-glow-electric backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-electric-cyan signal-live" />
            <span className="font-semibold text-white">AWS Serverless Civic Tech</span>
            <span className="text-slate-500">|</span>
            <span className="text-electric-blue font-mono">SAM Ready</span>
          </div>
        </div>

        {/* Headline & Subhead */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Empowering Citizens.<br />
            <span className="bg-gradient-to-r from-white via-sky-200 to-electric-cyan bg-clip-text text-transparent">
              Resolving Civic Issues Faster.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Report potholes, waste accumulation, road dust, water pipeline ruptures, and broken streetlights directly to civic authorities with instant unique ID tracking and AWS cloud reliability.
          </p>
        </div>

        {/* Primary Action Buttons & Quick Lookup */}
        <div className="mt-8 max-w-2xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartReport}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold text-base shadow-glow-electric transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Report an Issue Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Quick Track Search in Hero */}
            <form onSubmit={handleTrackSubmit} className="w-full sm:w-auto flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value.toUpperCase())}
                  placeholder="Track ID (e.g. SIG-842910)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-900/90 border border-white/10 text-white placeholder-slate-400 text-sm font-mono focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-electric-blue hover:text-white border border-white/10 hover:border-electric-blue/40 text-sm font-medium transition-all"
              >
                Track
              </button>
            </form>
          </div>

          {/* Quick Category Chips */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mr-1">
                Categories:
              </span>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={onStartReport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900/80 border border-white/5 hover:border-electric-blue/30 text-xs font-medium text-slate-300 hover:text-white transition-all hover:bg-white/5"
                  >
                    <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Architecture Badges Strip */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-center text-xs uppercase font-mono tracking-widest text-slate-400 mb-5">
            Cloud Architecture Highlights
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
            
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900/50 border border-white/5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">HTTP API Gateway</p>
                <p className="text-[11px] text-slate-400">Low-latency router</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900/50 border border-white/5">
              <Layers className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">AWS Lambda</p>
                <p className="text-[11px] text-slate-400">Node.js 20 compute</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900/50 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Amazon DynamoDB</p>
                <p className="text-[11px] text-slate-400">On-demand capacity</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900/50 border border-white/5">
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Amazon S3</p>
                <p className="text-[11px] text-slate-400">Presigned photo URLs</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900/50 border border-white/5 col-span-2 sm:col-span-1">
              <CheckCircle2 className="w-4 h-4 text-electric-cyan shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">AWS SAM</p>
                <p className="text-[11px] text-slate-400">Infrastructure as Code</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
