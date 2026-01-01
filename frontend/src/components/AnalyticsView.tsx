import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Site, DashboardStats } from '../types';
import { useTranslation } from '../i18n/i18n';

interface AnalyticsViewProps {
  sites: Site[];
  selectedSite: Site | null;
  onSiteSelect: (site: Site) => void;
  stats: DashboardStats | null;
  onRefresh: () => void;
}

export default function AnalyticsView({
  sites,
  selectedSite,
  onSiteSelect,
  stats,
  onRefresh,
}: AnalyticsViewProps) {
  const { t } = useTranslation();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  if (!selectedSite) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          {t('dashboard.pleaseSelectSite')}
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Site Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-300 mb-2">
              {t('dashboard.selectSite')}
            </label>
            <select
              value={selectedSite.id}
              onChange={(e) => {
                const site = sites.find((s) => s.id === parseInt(e.target.value, 10));
                if (site) onSiteSelect(site);
              }}
              className="w-full md:w-auto px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white text-slate-900 dark:bg-slate-900 dark:text-white transition"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.url}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded-sm border border-slate-300 dark:border-slate-700"
              />
              {t('dashboard.autoRefresh')}
            </label>
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-lg transition"
            >
              {t('common.refresh')}
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          {t('dashboard.empowerOverview')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.uniqueVisitors')}
          value={stats.uniqueVisitors.toLocaleString()}
          icon="👥"
          description={t('dashboard.uniqueTooltip')}
        />
        <StatCard
          title={t('dashboard.totalVisits')}
          value={stats.totalVisits.toLocaleString()}
          icon="📊"
          description={t('dashboard.totalTooltip')}
        />
        <StatCard
          title={t('dashboard.averageDuration')}
          value={`${Math.floor(stats.avgDuration / 60)}m ${stats.avgDuration % 60}s`}
          icon="⏱️"
          description={t('dashboard.durationTooltip')}
        />
        <StatCard
          title={t('dashboard.activeUsers')}
          value={stats.activeUsers.toLocaleString()}
          icon="🔥"
          description={t('dashboard.activeTooltip')}
        />
      </div>

      {/* Charts + Insights */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {t('dashboard.trafficOverTime')}
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={stats.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', background: '#0f172a' }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Legend />
              <Line type="monotone" dataKey="visits" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-primary-600/90 to-slate-900 rounded-3xl shadow-2xl p-6 text-white"
        >
          <h3 className="text-lg font-bold">{t('dashboard.insightsTitle')}</h3>
          <p className="text-sm text-primary-100/80 mt-1">{t('dashboard.insightsLead')}</p>
          <div className="mt-6 space-y-5">
            <InsightRow
              label={t('dashboard.topPages')}
              value={stats.topPages[0]?.pageUrl || t('dashboard.noDataYet')}
              meta={`${stats.topPages[0]?.visits?.toLocaleString() ?? '0'} ${t('dashboard.visits')}`}
            />
            <InsightRow
              label={t('dashboard.topReferrers')}
              value={stats.topReferrers[0]?.referrer || t('dashboard.directTraffic')}
              meta={`${stats.topReferrers[0]?.visits?.toLocaleString() ?? '0'} ${t('dashboard.visits')}`}
            />
            <InsightRow
              label={t('dashboard.topBrowser')}
              value={stats.browserBreakdown[0]?.label || t('dashboard.noDataYet')}
              meta={`${stats.browserBreakdown[0]?.visits?.toLocaleString() ?? '0'} ${t('dashboard.visits')}`}
            />
          </div>
        </motion.div>
      </div>

      {/* Top Pages & Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.topPages')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.topPages.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
              <XAxis dataKey="pageUrl" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Bar dataKey="visits" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.topReferrers')}</h3>
          <div className="space-y-3">
            {(stats.topReferrers.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">{t('dashboard.noReferrersData')}</p>
            )) ||
              stats.topReferrers.map((ref, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                      {ref.referrer || t('dashboard.directTraffic')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600 ml-4">
                    {ref.visits.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Browser / OS / Device Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BreakdownPanel
          title={t('dashboard.browserBreakdown')}
          data={stats.browserBreakdown}
          accentColor="#0ea5e9"
          emptyText={t('dashboard.noDataYet')}
        />
        <BreakdownPanel
          title={t('dashboard.osBreakdown')}
          data={stats.osBreakdown}
          accentColor="#22c55e"
          emptyText={t('dashboard.noDataYet')}
        />
        <BreakdownPanel
          title={t('dashboard.deviceBreakdown')}
          data={stats.deviceBreakdown}
          accentColor="#f97316"
          emptyText={t('dashboard.noDataYet')}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description }: { title: string; value: string; icon: string; description?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
        <div className="text-3xl">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
    </motion.div>
  );
}

function InsightRow({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-primary-100">{label}</p>
        <p className="text-sm font-semibold mt-1 text-white truncate">{value}</p>
      </div>
      {meta && <span className="text-xs text-primary-100/70">{meta}</span>}
    </div>
  );
}

function BreakdownPanel({
  title,
  data,
  accentColor,
  emptyText,
}: {
  title: string;
  data: Array<{ label: string; visits: number }>;
  accentColor: string;
  emptyText: string;
}) {
  const total = data.reduce((sum, item) => sum + item.visits, 0);
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 min-h-[220px]"
      >
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800"
    >
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {data.slice(0, 5).map((item) => {
          const percent = total ? Math.round((item.visits / total) * 100) : 0;
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="truncate">{item.label}</span>
                <span>{item.visits.toLocaleString()} ({percent}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, percent)}%`,
                    background: accentColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

