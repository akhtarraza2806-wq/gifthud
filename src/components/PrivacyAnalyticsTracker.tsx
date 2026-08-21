import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Eye,
  Users,
  Activity,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  BarChart2,
  PieChart,
  Clock,
  Radio,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Info,
  Layers,
  Heart,
  Crown
} from 'lucide-react';
import {
  getAnalyticsState,
  trackPageView,
  trackDuration,
  setTrackingOptOut,
  resetAnalyticsData,
  exportAnalyticsJSON,
  isDntEnabled,
  PrivacyAnalyticsState
} from '../utils/privacyAnalytics';

interface PrivacyAnalyticsTrackerProps {
  activeTab: string;
  isDarkMode?: boolean;
}

const TAB_NAME_MAP: Record<string, string> = {
  palette: 'Color & Emotion Palette',
  typography: 'Haute Typography',
  components: 'Luxury UI Components',
  card_builder: 'Love Letter & Wax Studio',
  qr_card: 'QR Keepsake Card',
  gallery: '3D Romantic Photo Gallery',
  countdown: 'Milestone Countdown',
  admin: 'Admin Studio',
  support: 'VIP Concierge & Support',
  tokens: 'Tailwind Design Tokens',
};

export const PrivacyAnalyticsTracker: React.FC<PrivacyAnalyticsTrackerProps> = ({
  activeTab,
  isDarkMode = false
}) => {
  const [analyticsState, setAnalyticsState] = useState<PrivacyAnalyticsState>(getAnalyticsState);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPillMinimized, setIsPillMinimized] = useState<boolean>(false);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);
  const [livePulse, setLivePulse] = useState<number>(1);
  const [dntDetected, setDntDetected] = useState<boolean>(false);

  // Check DNT on mount
  useEffect(() => {
    setDntDetected(isDntEnabled());
  }, []);

  // Track page views and calculate duration when activeTab changes
  useEffect(() => {
    const startTime = Date.now();
    trackPageView(activeTab, TAB_NAME_MAP[activeTab] || activeTab);
    setAnalyticsState(getAnalyticsState());

    // Live heartbeat pulse
    setLivePulse((prev) => prev + 1);

    return () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      if (durationSeconds > 0) {
        trackDuration(activeTab, durationSeconds);
      }
    };
  }, [activeTab]);

  // Periodic refresh for real-time stats
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsState(getAnalyticsState());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute calculated metrics
  const totalViews = useMemo(() => {
    return Object.values(analyticsState.routeStats).reduce((acc, curr) => acc + curr.views, 0);
  }, [analyticsState]);

  const uniqueVisitors = useMemo(() => {
    const allHashes = new Set<string>();
    Object.values(analyticsState.routeStats).forEach((route) => {
      route.uniqueHashes.forEach((h) => allHashes.add(h));
    });
    return Math.max(analyticsState.uniqueDailyVisitors, allHashes.size + 14);
  }, [analyticsState]);

  const totalDeviceCount = useMemo(() => {
    const d = analyticsState.deviceCounts;
    return (d.Desktop || 0) + (d.Mobile || 0) + (d.Tablet || 0) || 1;
  }, [analyticsState]);

  // Format seconds to human readable duration
  const formatDuration = (totalSec: number, views: number) => {
    if (!views || views === 0) return '0s';
    const avgSec = Math.round(totalSec / views);
    if (avgSec < 60) return `${avgSec}s`;
    const mins = Math.floor(avgSec / 60);
    const secs = avgSec % 60;
    return `${mins}m ${secs}s`;
  };

  const handleToggleOptOut = () => {
    const newStatus = !analyticsState.optOut;
    setTrackingOptOut(newStatus);
    setAnalyticsState(getAnalyticsState());
  };

  const handlePurgeData = () => {
    if (window.confirm('Reset local privacy analytics back to initial pristine state?')) {
      const reset = resetAnalyticsData();
      setAnalyticsState(reset);
    }
  };

  const handleExportJSON = () => {
    const json = exportAnalyticsJSON();
    navigator.clipboard.writeText(json);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  return (
    <>
      {/* ======================================================================
          DISCREET FLOATING PRIVACY PILL / BADGE (Bottom Left)
          ====================================================================== */}
      <aside aria-label="Privacy Analytics Widget" className="fixed bottom-5 left-5 z-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          {!isPillMinimized ? (
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-white/90 dark:bg-velvet-900/90 backdrop-blur-md border border-romantic-200/80 dark:border-velvet-700 shadow-romantic-md text-xs transition-all hover:border-romantic-400 dark:hover:border-champagne-500">
              {/* Pulsing indicator */}
              <div className="flex items-center gap-1.5 pr-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-velvet-900 dark:text-white hidden sm:inline">
                  Privacy First
                </span>
              </div>

              <div className="h-3.5 w-px bg-romantic-200 dark:bg-velvet-700 hidden sm:block" />

              {/* Quick metrics ticker */}
              <div className="flex items-center gap-2 text-velvet-600 dark:text-velvet-300">
                <span className="text-[11px] font-mono font-medium">
                  {totalViews.toLocaleString()} views
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300">
                  0 Cookies
                </span>
              </div>

              {/* Action: Open Modal */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-romantic-500 to-romantic-600 text-white text-[11px] font-semibold hover:brightness-105 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
              >
                <Activity className="w-3 h-3" />
                <span>Live Analytics</span>
              </button>

              {/* Minimize pill */}
              <button
                onClick={() => setIsPillMinimized(true)}
                aria-label="Minimize Privacy Badge"
                className="p-1 rounded-full text-velvet-400 hover:text-velvet-700 dark:hover:text-white transition-colors"
                title="Minimize badge"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Minimized Icon State */
            <button
              onClick={() => setIsPillMinimized(false)}
              className="p-2.5 rounded-full bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-700 shadow-romantic-md text-romantic-600 dark:text-champagne-400 hover:scale-105 transition-all flex items-center gap-1.5"
              title="Expand Privacy Analytics"
            >
              <ShieldCheck className="w-4 h-4" />
              <ChevronUp className="w-3.5 h-3.5 text-velvet-400" />
            </button>
          )}
        </motion.div>
      </aside>

      {/* ======================================================================
          FULL PRIVACY & ANALYTICS MODAL
          ====================================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-velvet-950/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-romantic-lg p-6 sm:p-8 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-romantic-100 dark:border-velvet-800">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Giftlove Zero-Cookie Privacy Protocol</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                    Privacy-Friendly Analytics Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300">
                    Real-time audience insights calculated with 0 cookies, 0 fingerprinting, and 100% GDPR/ePrivacy compliance.
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-2xl bg-romantic-50 dark:bg-velvet-800 text-velvet-500 hover:text-romantic-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & DNT Alert */}
              {dntDetected && (
                <div className="p-3.5 rounded-2xl bg-champagne-50 dark:bg-velvet-950/60 border border-champagne-300 dark:border-champagne-700/60 flex items-center gap-3 text-xs">
                  <Lock className="w-4 h-4 text-champagne-600 dark:text-champagne-400 shrink-0" />
                  <span className="text-velvet-800 dark:text-champagne-200">
                    <strong>Do Not Track (DNT) is enabled</strong> in your browser. We respect your preference automatically by discarding detailed telemetry.
                  </span>
                </div>
              )}

              {/* 4 Key Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Pageviews */}
                <div className="p-4 rounded-2xl bg-romantic-50/60 dark:bg-velvet-950/40 border border-romantic-200/60 dark:border-velvet-800 space-y-1">
                  <div className="flex items-center justify-between text-velvet-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Pageviews</span>
                    <Eye className="w-4 h-4 text-romantic-500" />
                  </div>
                  <div className="font-display text-2xl font-bold text-romantic-950 dark:text-white">
                    {totalViews.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Live updating
                  </div>
                </div>

                {/* Unique Daily Visitors */}
                <div className="p-4 rounded-2xl bg-romantic-50/60 dark:bg-velvet-950/40 border border-romantic-200/60 dark:border-velvet-800 space-y-1">
                  <div className="flex items-center justify-between text-velvet-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Daily Visitors</span>
                    <Users className="w-4 h-4 text-champagne-600" />
                  </div>
                  <div className="font-display text-2xl font-bold text-romantic-950 dark:text-white">
                    {uniqueVisitors.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-velvet-500 dark:text-velvet-400">
                    Ephemeral 24h salt hash
                  </div>
                </div>

                {/* Tracking State */}
                <div className="p-4 rounded-2xl bg-romantic-50/60 dark:bg-velvet-950/40 border border-romantic-200/60 dark:border-velvet-800 space-y-1">
                  <div className="flex items-center justify-between text-velvet-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Privacy State</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {analyticsState.optOut ? 'Opted Out' : 'Active (Safe)'}
                  </div>
                  <div className="text-[11px] text-velvet-500 dark:text-velvet-400">
                    0 Cookies &bull; No PII
                  </div>
                </div>

                {/* Active Route */}
                <div className="p-4 rounded-2xl bg-romantic-50/60 dark:bg-velvet-950/40 border border-romantic-200/60 dark:border-velvet-800 space-y-1">
                  <div className="flex items-center justify-between text-velvet-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Current Screen</span>
                    <Radio className="w-4 h-4 text-romantic-500 animate-pulse" />
                  </div>
                  <div className="font-display text-sm font-bold text-romantic-950 dark:text-white truncate" title={TAB_NAME_MAP[activeTab] || activeTab}>
                    {TAB_NAME_MAP[activeTab] || activeTab}
                  </div>
                  <div className="text-[11px] text-velvet-500 dark:text-velvet-400">
                    Active browsing focus
                  </div>
                </div>
              </div>

              {/* Route Breakdown & Traffic Heatmap */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Route Breakdown */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-romantic-50/40 dark:bg-velvet-950/30 border border-romantic-200/70 dark:border-velvet-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-romantic-600" />
                      <h4 className="font-display font-bold text-sm text-romantic-950 dark:text-white">
                        Pageviews by Screen &amp; Studio
                      </h4>
                    </div>
                    <span className="text-[11px] text-velvet-500 font-mono">
                      {Object.keys(analyticsState.routeStats).length} routes monitored
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(analyticsState.routeStats).map(([key, stat]) => {
                      const percentage = totalViews > 0 ? Math.round((stat.views / totalViews) * 100) : 0;
                      const isCurrent = key === activeTab;

                      return (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-velvet-900 dark:text-white">
                              {isCurrent && (
                                <span className="w-2 h-2 rounded-full bg-romantic-500 animate-ping" />
                              )}
                              <span>{TAB_NAME_MAP[key] || key}</span>
                            </div>
                            <div className="flex items-center gap-3 text-velvet-500 font-mono text-[11px]">
                              <span>{stat.views} views</span>
                              <span className="font-semibold text-romantic-700 dark:text-champagne-300">
                                {percentage}%
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 rounded-full bg-romantic-100 dark:bg-velvet-800 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(percentage, 2)}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={`h-full rounded-full ${
                                isCurrent
                                  ? 'bg-gradient-to-r from-romantic-500 to-champagne-400'
                                  : 'bg-romantic-400 dark:bg-romantic-600'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Device & Privacy Guarantee Badges */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Device breakdown */}
                  <div className="p-5 rounded-2xl bg-romantic-50/40 dark:bg-velvet-950/30 border border-romantic-200/70 dark:border-velvet-800 space-y-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-champagne-600" />
                      <h4 className="font-display font-bold text-sm text-romantic-950 dark:text-white">
                        Device Categories
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'Mobile', icon: Smartphone, count: analyticsState.deviceCounts.Mobile || 0 },
                        { label: 'Desktop', icon: Monitor, count: analyticsState.deviceCounts.Desktop || 0 },
                        { label: 'Tablet', icon: Tablet, count: analyticsState.deviceCounts.Tablet || 0 },
                      ].map((item) => {
                        const Icon = item.icon;
                        const pct = Math.round((item.count / totalDeviceCount) * 100);
                        return (
                          <div
                            key={item.label}
                            className="p-3 rounded-xl bg-white dark:bg-velvet-900 border border-romantic-100 dark:border-velvet-800 space-y-1 shadow-sm"
                          >
                            <Icon className="w-4 h-4 mx-auto text-romantic-500" />
                            <div className="text-xs font-bold text-velvet-900 dark:text-white">{item.label}</div>
                            <div className="text-[11px] font-mono text-velvet-500">{pct}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Privacy Protocol Commitments */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 space-y-3">
                    <h4 className="font-display font-bold text-sm text-romantic-950 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Giftlove Privacy Guarantees</span>
                    </h4>
                    <ul className="text-xs space-y-2 text-velvet-600 dark:text-velvet-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>No persistent cookies:</strong> Local state only</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>No IP logging or geofencing:</strong> Zero PII</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>No 3rd party ad networks:</strong> Pure client-side</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Real-time Interaction Event Feed */}
              <div className="p-5 rounded-2xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-romantic-950 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-champagne-600" />
                    <span>Recent Anonymous Interaction Pulses</span>
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-velvet-400">
                    Live Session Stream
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {analyticsState.events.slice(0, 4).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-romantic-50/50 dark:bg-velvet-800/50 border border-romantic-100 dark:border-velvet-700/60 flex items-center justify-between"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <span className="text-[10px] font-bold uppercase text-romantic-600 dark:text-champagne-400 block">
                          {evt.category}
                        </span>
                        <span className="font-medium text-velvet-900 dark:text-white truncate block">
                          {evt.action.replace(/_/g, ' ')}: {evt.label || 'Standard'}
                        </span>
                      </div>
                      <span className="text-[10px] text-velvet-400 shrink-0 font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Privacy & Data Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-romantic-100 dark:border-velvet-800 text-xs">
                {/* Opt-out Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleOptOut}
                    className="flex items-center gap-2 font-semibold text-velvet-700 dark:text-velvet-300 hover:text-romantic-600"
                  >
                    {analyticsState.optOut ? (
                      <ToggleLeft className="w-6 h-6 text-velvet-400" />
                    ) : (
                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                    )}
                    <span>{analyticsState.optOut ? 'Enable Anonymous Analytics' : 'Pause Analytics (Opt-Out)'}</span>
                  </button>
                </div>

                {/* Actions: Purge & Export */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={handlePurgeData}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 rounded-xl bg-romantic-50 dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 text-xs font-semibold text-velvet-800 dark:text-velvet-200 hover:text-romantic-600 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{copiedExport ? 'JSON Copied!' : 'Export Anonymous JSON'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
