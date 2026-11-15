import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReportForm from './components/ReportForm';
import TrackReport from './components/TrackReport';
import ReportList from './components/ReportList';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [trackedReportId, setTrackedReportId] = useState('');

  const handleStartReport = () => {
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackReport = (reportId) => {
    setTrackedReportId(reportId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportCreated = (newReport) => {
    // ReportForm displays success state internally, but also updates state
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-electric-blue/30 selection:text-electric-cyan">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={handleStartReport}
      />

      {/* Main Body Content based on active tab */}
      <main className="flex-1">
        
        {/* HOME OVERVIEW TAB */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            <Hero
              onStartReport={handleStartReport}
              onTrackReport={handleTrackReport}
            />

            {/* Live Feed Preview Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Public Civic Signal Stream
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Recent community reports filed with municipal authorities
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('feed')}
                  className="text-xs text-electric-blue hover:text-electric-cyan font-mono font-medium flex items-center gap-1"
                >
                  View All Signals →
                </button>
              </div>

              <ReportList
                onSelectReport={handleTrackReport}
                onNewReportClick={handleStartReport}
              />
            </section>

            {/* Quick Analytics Teaser */}
            <section className="pt-8">
              <AnalyticsDashboard onTrackReport={handleTrackReport} />
            </section>
          </div>
        )}

        {/* REPORT ISSUE TAB */}
        {activeTab === 'report' && (
          <ReportForm
            onReportCreated={handleReportCreated}
            onTrackReport={handleTrackReport}
          />
        )}

        {/* TRACK ISSUE TAB */}
        {activeTab === 'track' && (
          <TrackReport
            initialReportId={trackedReportId}
            onReportUpdated={() => {}}
          />
        )}

        {/* LIVE SIGNALS FEED TAB */}
        {activeTab === 'feed' && (
          <ReportList
            onSelectReport={handleTrackReport}
            onNewReportClick={handleStartReport}
          />
        )}

        {/* MUNICIPAL ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            onTrackReport={handleTrackReport}
          />
        )}

      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

    </div>
  );
}
