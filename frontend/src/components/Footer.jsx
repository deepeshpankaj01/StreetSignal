import React from 'react';
import { Radio, ShieldCheck, Heart, Terminal, Code, Cpu } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="mt-20 border-t border-white/10 bg-navy-950/90 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-electric-cyan p-0.5">
                <div className="w-full h-full bg-navy-950 rounded-[7px] flex items-center justify-center">
                  <Radio className="w-4 h-4 text-electric-cyan" />
                </div>
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                Street<span className="text-electric-blue">Signal</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-electric-blue">
                v1.0.0
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An enterprise-grade civic issue dispatch and tracking platform built on AWS Serverless architecture. Transparent, scalable, and built for modern smart cities.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <Cpu className="w-3.5 h-3.5 text-electric-blue" />
              <span>AWS SAM • Node.js 20 • DynamoDB • S3</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-mono uppercase tracking-wider text-white text-xs font-semibold">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-electric-cyan transition-colors">
                  Overview & Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('report')} className="hover:text-electric-cyan transition-colors">
                  Report Civic Issue
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('track')} className="hover:text-electric-cyan transition-colors">
                  Track Signal by ID
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('feed')} className="hover:text-electric-cyan transition-colors">
                  Live Public Feed
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('analytics')} className="hover:text-electric-cyan transition-colors">
                  Municipal Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories & Standards */}
          <div className="space-y-3">
            <h4 className="font-mono uppercase tracking-wider text-white text-xs font-semibold">
              Supported Issues
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Potholes & Road Cracks
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Garbage & Solid Waste
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Road Dust & Construction Silt
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Water Pipeline Leakage
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Streetlights & Electrical
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            StreetSignal Platform © 2026. Distributed under MIT License.
          </div>
          <div className="flex items-center gap-1">
            Built for civic impact with AWS Serverless Architecture
          </div>
        </div>
      </div>
    </footer>
  );
}
