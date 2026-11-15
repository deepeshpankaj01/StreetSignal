import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../services/api';
import { getCategoryMeta, CATEGORIES } from '../utils/categories';
import StatusBadge from './StatusBadge';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function AnalyticsDashboard({ onTrackReport }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const summary = await getAnalytics();
      setData(summary);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Unable to fetch analytics metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto my-12 px-4 text-center space-y-4">
        <Loader2 className="w-10 h-10 mx-auto text-electric-cyan animate-spin" />
        <p className="text-sm font-mono text-slate-400">
          Aggregating civic analytics from Amazon DynamoDB...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="civic-card p-6 border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-400" />
          <h3 className="text-lg font-bold text-white">Analytics Unavailable</h3>
          <p className="text-sm text-slate-300">{error}</p>
          <button
            onClick={() => fetchAnalyticsData(true)}
            className="px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-750 text-white text-xs font-medium border border-white/10"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const {
    totalReports = 0,
    resolutionRate = 0,
    statusCounts = {},
    categoryCounts = {},
    categoryDistribution = [],
    topLocalities = [],
    recentSubmissions = []
  } = data || {};

  const activeReportsCount = (statusCounts.Submitted || 0) + (statusCounts['Under Review'] || 0) + (statusCounts['In Progress'] || 0);

  return (
    <div className="max-w-6xl mx-auto my-6 sm:my-10 px-4 space-y-8">
      
      {/* Header with Title and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-electric-blue font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-electric-cyan" />
            Real-Time AWS Telemetry
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Civic Operations & Insights Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time aggregation across categories, locality density, and resolution throughput.
          </p>
        </div>

        <button
          onClick={() => fetchAnalyticsData(true)}
          disabled={refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-electric-cyan ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync DynamoDB'}</span>
        </button>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Reports */}
        <div className="civic-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Total Signals</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-electric-blue">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalReports}</div>
          <p className="text-[11px] text-slate-400">Registered across all municipal zones</p>
        </div>

        {/* Resolution Rate */}
        <div className="civic-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Resolution Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{resolutionRate}%</div>
          <p className="text-[11px] text-emerald-400/90 font-medium">
            {statusCounts.Resolved || 0} issues fully resolved
          </p>
        </div>

        {/* Active Dispatch Pipeline */}
        <div className="civic-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">In Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{activeReportsCount}</div>
          <p className="text-[11px] text-slate-400">Submitted or under field repair</p>
        </div>

        {/* Critical Alerts */}
        <div className="civic-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Potholes & Water</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {(categoryCounts['Potholes'] || 0) + (categoryCounts['Water Leakage'] || 0)}
          </div>
          <p className="text-[11px] text-slate-400">High priority road/pipeline risks</p>
        </div>

      </div>

      {/* Charts Section: Category Distribution & Status Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="civic-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="font-bold text-base text-white">Category Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Frequency by civic category</p>
            </div>
            <BarChart3 className="w-5 h-5 text-electric-blue" />
          </div>

          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = categoryCounts[cat.name] || 0;
              const percentage = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                      <span className="font-medium text-slate-200">{cat.name}</span>
                    </div>
                    <div className="font-mono text-slate-400">
                      <span className="text-white font-semibold">{count}</span> ({percentage}%)
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.id === 'Potholes' ? 'bg-amber-400' :
                        cat.id === 'Garbage' ? 'bg-rose-400' :
                        cat.id === 'Road Dust' ? 'bg-orange-400' :
                        cat.id === 'Water Leakage' ? 'bg-sky-400' : 'bg-yellow-400'
                      }`}
                      style={{ width: `${Math.max(percentage, count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Pipeline & Top Localities */}
        <div className="space-y-6">
          
          {/* Status Breakdown */}
          <div className="civic-card p-6 space-y-4">
            <h3 className="font-bold text-base text-white pb-3 border-b border-white/5">
              Status Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Submitted', count: statusCounts.Submitted || 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Under Review', count: statusCounts['Under Review'] || 0, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                { label: 'In Progress', count: statusCounts['In Progress'] || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Resolved', count: statusCounts.Resolved || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((item) => (
                <div key={item.label} className={`p-3 rounded-xl ${item.bg} border border-white/5 text-center`}>
                  <div className={`text-xl font-bold font-mono ${item.color}`}>{item.count}</div>
                  <div className="text-[11px] text-slate-300 font-medium mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Localities Leaderboard */}
          <div className="civic-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="font-bold text-base text-white">Locality Insights</h3>
              <span className="text-xs text-slate-400">Most active zones</span>
            </div>

            {topLocalities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No locality data recorded yet</p>
            ) : (
              <div className="space-y-2.5">
                {topLocalities.map((loc, i) => (
                  <div key={loc.locality} className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/60 border border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-navy-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                        #{i + 1}
                      </span>
                      <MapPin className="w-3.5 h-3.5 text-electric-blue" />
                      <span className="font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                        {loc.locality}
                      </span>
                    </div>
                    <span className="font-mono text-electric-cyan font-semibold">
                      {loc.count} {loc.count === 1 ? 'report' : 'reports'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Recent Submissions Feed */}
      <div className="civic-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h3 className="font-bold text-base text-white">Recent Civic Submissions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest reports registered on DynamoDB</p>
          </div>
        </div>

        {recentSubmissions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No submissions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Locality</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Reported</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {recentSubmissions.map((report) => {
                  const meta = getCategoryMeta(report.category);
                  const Icon = meta.icon;

                  return (
                    <tr key={report.reportId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-mono font-bold text-electric-cyan">
                        {report.reportId}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-white">
                          <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                          {report.category}
                        </span>
                      </td>
                      <td className="py-3 max-w-[180px] truncate text-slate-300">
                        {report.locality}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={report.status} size="sm" />
                      </td>
                      <td className="py-3 font-mono text-slate-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onTrackReport(report.reportId)}
                          className="inline-flex items-center gap-1 text-electric-blue hover:text-electric-cyan font-medium transition-colors"
                        >
                          <span>Track</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
