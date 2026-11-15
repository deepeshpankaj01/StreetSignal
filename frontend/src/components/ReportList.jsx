import React, { useState, useEffect } from 'react';
import { getReports } from '../services/api';
import ReportCard from './ReportCard';
import { CATEGORIES } from '../utils/categories';
import { 
  Filter, 
  Search, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  PlusCircle, 
  Inbox, 
  X 
} from 'lucide-react';

const STATUS_OPTIONS = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved'];

export default function ReportList({ onSelectReport, onNewReportClick }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReportList = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await getReports({
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchTerm.trim() || undefined
      });
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to list reports:', err);
      setError(err.message || 'Failed to retrieve reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportList();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReportList();
  };

  const handleClearFilters = () => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setSearchTerm('');
  };

  return (
    <div className="max-w-7xl mx-auto my-6 sm:my-10 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-electric-blue font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-electric-cyan" />
            Civic Feed
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Live Civic Issues Feed
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time issues reported across municipal zones, retrieved from Amazon DynamoDB.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchReportList(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-electric-cyan ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={onNewReportClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-medium text-xs shadow-glow-electric transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="civic-card p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* Keyword & Locality Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID (SIG-...), locality, or keyword..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-electric-blue"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-navy-800 hover:bg-navy-750 text-xs text-electric-blue hover:text-white border border-white/5 transition-all"
            >
              Filter
            </button>
          </form>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0 font-medium hidden sm:inline">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-electric-blue"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0 font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-electric-blue"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>

          {(categoryFilter !== 'All' || statusFilter !== 'All' || searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs border border-rose-500/20 transition-all self-start lg:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="civic-card p-6 border-rose-500/30 bg-rose-500/5 text-center space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
          <h4 className="text-sm font-bold text-white">Failed to Load Reports</h4>
          <p className="text-xs text-slate-300">{error}</p>
        </div>
      )}

      {/* LOADING SKELETON STATE */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="civic-card p-5 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-24 h-5 bg-navy-800 rounded" />
                <div className="w-16 h-5 bg-navy-800 rounded" />
              </div>
              <div className="w-3/4 h-4 bg-navy-800 rounded" />
              <div className="w-full h-12 bg-navy-800 rounded" />
              <div className="pt-3 border-t border-white/5 flex justify-between">
                <div className="w-20 h-4 bg-navy-800 rounded" />
                <div className="w-12 h-4 bg-navy-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && reports.length === 0 && (
        <div className="civic-card p-12 text-center space-y-4 border-dashed border-white/10 max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto rounded-full bg-navy-900 border border-white/10 flex items-center justify-center text-slate-400">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Civic Reports Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || categoryFilter !== 'All' || statusFilter !== 'All'
              ? 'No issues match your current filters. Try resetting the filters or broadening your search.'
              : 'No civic reports have been logged in the system yet. Be the first citizen to report an issue!'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-750 text-white text-xs font-medium border border-white/10"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onNewReportClick}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-semibold shadow-glow-electric"
            >
              Report Issue Now
            </button>
          </div>
        </div>
      )}

      {/* POPULATED REPORT GRID */}
      {!loading && !error && reports.length > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {reports.length} {reports.length === 1 ? 'report' : 'reports'}</span>
            <span>Sorted by newest first</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.reportId}
                report={report}
                onSelect={onSelectReport}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
}
