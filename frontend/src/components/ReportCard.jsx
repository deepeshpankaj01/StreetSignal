import React from 'react';
import { getCategoryMeta } from '../utils/categories';
import StatusBadge from './StatusBadge';
import { MapPin, Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';

export default function ReportCard({ report, onSelect }) {
  const meta = getCategoryMeta(report.category);
  const Icon = meta.icon;

  const timeAgo = (dateStr) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div 
      onClick={() => onSelect(report.reportId)}
      className="civic-card p-5 hover:border-electric-blue/40 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Top bar: Category + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${meta.bg} ${meta.border} ${meta.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {report.category}
          </span>
          <StatusBadge status={report.status} size="sm" />
        </div>

        {/* Locality */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mb-2">
          <MapPin className="w-3.5 h-3.5 text-electric-blue shrink-0" />
          <span className="truncate">{report.locality}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {report.description}
        </p>

        {/* Photo thumbnail if present */}
        {report.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-white/10 h-32 bg-navy-950 relative">
            <img
              src={report.imageUrl}
              alt={report.category}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-navy-950/80 backdrop-blur-sm text-[10px] font-mono text-electric-cyan flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Photo
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: ID, Time, Track link */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-electric-cyan text-xs">
            {report.reportId}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px] flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" />
            {timeAgo(report.createdAt)}
          </span>
        </div>

        <span className="text-electric-blue group-hover:text-electric-cyan font-medium flex items-center gap-1 transition-colors text-xs">
          <span>Details</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}
