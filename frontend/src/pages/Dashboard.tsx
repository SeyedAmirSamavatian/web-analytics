import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { sitesApi } from '../api/sites';
import { analyticsApi } from '../api/analytics';
import { Site, DashboardStats } from '../types';
import SiteSettings from '../components/SiteSettings';
import AnalyticsView from '../components/AnalyticsView';
import toast from 'react-hot-toast';
import { useTranslation } from '../i18n/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sites' | 'analytics'>('sites');

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadStats(selectedSite.id);
    }
  }, [selectedSite]);

  const loadSites = async () => {
    try {
      const response = await sitesApi.getSites();
      setSites(response.sites);
      if (response.sites.length > 0 && !selectedSite) {
        setSelectedSite(response.sites[0]);
      }
    } catch (error: any) {
      toast.error(t('dashboard.failedToLoadSites'));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (siteId: number) => {
    try {
      const data = await analyticsApi.getDashboardStats(siteId);
      setStats(data);
    } catch (error: any) {
      toast.error(t('dashboard.failedToLoadAnalytics'));
    }
  };

  const handleSiteAdded = (newSite: Site) => {
    setSites([newSite, ...sites]);
    setSelectedSite(newSite);
    setActiveTab('analytics');
  };

  const handleSiteDeleted = (siteId: number) => {
    const updatedSites = sites.filter(site => site.id !== siteId);
    setSites(updatedSites);
    
    // If deleted site was selected, select another one or clear selection
    if (selectedSite?.id === siteId) {
      if (updatedSites.length > 0) {
        setSelectedSite(updatedSites[0]);
      } else {
        setSelectedSite(null);
        setStats(null);
      }
    }
  };

  const heroSnippet = () => {
    const trackerHost = import.meta.env.VITE_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
    const backendUrl = import.meta.env.VITE_API_URL || '';
    const key = selectedSite?.trackingKey || 'YOUR_KEY';
    const dataApiAttr = backendUrl ? ` data-api="${backendUrl}"` : '';
    return `<script src="${trackerHost}/tracker.js" data-key="${key}"${dataApiAttr}></script>`;
  };

  const highlightMetrics = [
    {
      label: t('dashboard.topBrowser'),
      value: stats?.browserBreakdown[0]?.label || t('dashboard.noDataYet'),
      meta: stats ? `${stats.browserBreakdown[0]?.visits ?? 0} ${t('dashboard.visits')}` : t('dashboard.loadingData'),
    },
    {
      label: t('dashboard.topReferrers'),
      value: stats?.topReferrers[0]?.referrer || t('dashboard.noDataYet'),
      meta: stats ? `${stats.topReferrers[0]?.visits ?? 0} ${t('dashboard.visits')}` : t('dashboard.loadingData'),
    },
    {
      label: t('dashboard.topPages'),
      value: stats?.topPages[0]?.pageUrl || t('dashboard.noDataYet'),
      meta: stats ? `${stats.topPages[0]?.visits ?? 0} ${t('dashboard.visits')}` : t('dashboard.loadingData'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">{t('dashboard.heroBadge')}</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('dashboard.title')}</h1>
              <p className="text-base text-white/80">{t('dashboard.heroSubtitle')}</p>
              <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.3em]">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white">
                  {t('dashboard.sitesManaged', { count: sites.length })}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white">
                  {t('dashboard.analyticsLive')}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <LanguageSwitcher />
              <div className="text-sm text-white/80 flex flex-col items-end gap-1">
                <span>{user?.name || user?.email}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 rounded-xl font-semibold transition"
                >
                  {t('common.logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-1 grid grid-cols-2 md:grid-cols-[1fr_minmax(0,1fr)] text-sm font-semibold">
            <button
              onClick={() => setActiveTab('sites')}
              className={`rounded-3xl px-4 py-2 text-center transition ${
                activeTab === 'sites'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('dashboard.siteSettings')}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`rounded-3xl px-4 py-2 text-center transition ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('dashboard.analytics')}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                  {t('dashboard.currentSite')}
                </p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedSite?.url ?? t('dashboard.noSelectedSite')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {selectedSite
                    ? `${t('dashboard.trackingKey')}: ${selectedSite.trackingKey}`
                    : t('dashboard.chooseSiteHint')}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-xs font-semibold text-green-700">
                {selectedSite ? t('dashboard.trackingActive') : t('dashboard.noSelectedSite')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {highlightMetrics.map((metric) => (
                <HighlightChip key={metric.label} label={metric.label} value={metric.value} meta={metric.meta} />
              ))}
            </div>

            {selectedSite ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 text-xs text-slate-200">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                  {t('dashboard.scriptSnippetLabel')}
                </p>
                <code className="block mt-2 break-all text-[12px] font-mono text-white">
                  {heroSnippet()}
                </code>
                <p className="mt-3 text-[11px] text-slate-400">{t('dashboard.scriptCardHint')}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t('dashboard.noSelectedSiteHint')}</p>
            )}
          </motion.div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'sites' ? (
            <SiteSettings
              sites={sites}
              selectedSite={selectedSite}
              onSiteSelect={setSelectedSite}
              onSiteAdded={handleSiteAdded}
              onSiteDeleted={handleSiteDeleted}
              loading={loading}
            />
          ) : (
            <AnalyticsView
              sites={sites}
              selectedSite={selectedSite}
              onSiteSelect={setSelectedSite}
              stats={stats}
              onRefresh={() => selectedSite && loadStats(selectedSite.id)}
            />
          )}
        </motion.div>
      </main>
    </div>
  );
}

function HighlightChip({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white truncate">{value}</span>
      {meta && <span className="text-[11px] text-slate-500">{meta}</span>}
    </div>
  );
}

