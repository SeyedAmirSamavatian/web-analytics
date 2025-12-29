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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.title')}
            </h1>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('sites')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'sites'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('dashboard.siteSettings')}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('dashboard.analytics')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
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

