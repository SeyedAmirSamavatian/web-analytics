import { useState } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Site } from '../types';
import { sitesApi } from '../api/sites';
import toast from 'react-hot-toast';
import { useTranslation } from '../i18n/i18n';

interface SiteSettingsProps {
  sites: Site[];
  selectedSite: Site | null;
  onSiteSelect: (site: Site) => void;
  onSiteAdded: (site: Site) => void;
  onSiteDeleted: (siteId: number) => void;
  loading: boolean;
}

export default function SiteSettings({
  sites,
  selectedSite,
  onSiteSelect,
  onSiteAdded,
  onSiteDeleted,
  loading,
}: SiteSettingsProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const formatDate = (value: string) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const response = await sitesApi.addSite({ url });
      toast.success(t('dashboard.siteAddedSuccessfully'));
      setUrl('');
      onSiteAdded(response.site);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('dashboard.failedToLoadSites'));
    } finally {
      setAdding(false);
    }
  };

  const copyTrackingKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(t('dashboard.trackingKeyCopied'));
  };

  const handleDeleteSite = async (site: Site) => {
    const result = await Swal.fire({
      title: t('siteSettings.areYouSure'),
      text: t('siteSettings.deleteConfirm', { url: site.url }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('siteSettings.yesDelete'),
      cancelButtonText: t('common.cancel'),
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await sitesApi.deleteSite(site.id);
        toast.success(t('siteSettings.siteDeletedSuccessfully'));
        onSiteDeleted(site.id);
      } catch (error: any) {
        toast.error(error.response?.data?.error || t('siteSettings.failedToDeleteSite'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Site Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6"
      >
        <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-slate-900 p-4 mb-6 text-white">
          <p className="text-lg font-semibold">{t('dashboard.siteSettingsBanner')}</p>
          <p className="text-sm text-primary-100/80 mt-1">{t('dashboard.siteSettingsDescription')}</p>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.addNewSite')}</h2>
        <form onSubmit={handleAddSite} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              {t('dashboard.siteUrl')}
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-gradient-to-r from-primary-500 to-sky-500 hover:from-primary-600 hover:to-sky-600 text-white font-semibold py-3 px-4 rounded-3xl transition disabled:opacity-50"
          >
            {adding ? t('dashboard.adding') : t('dashboard.addSite')}
          </button>
        </form>
      </motion.div>

      {/* Sites List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.yourSites')}</h2>
        {sites.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {t('dashboard.noSitesYet')}
          </p>
        ) : (
          <div className="space-y-4">
            {sites.map((site) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-5 rounded-3xl border transition-all ${
                  selectedSite?.id === site.id
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/30 shadow-xl'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate">{site.url}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('dashboard.createdAt')}: {formatDate(site.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.trackingKey')}:</span>
                      <code className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                        {site.trackingKey}
                      </code>
                      <button
                        onClick={() => copyTrackingKey(site.trackingKey)}
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        {t('common.copy')}
                      </button>
                    </div>
                    <div className="mt-1 bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {t('dashboard.addThisScript')}
                      </p>
                      <code className="text-xs text-slate-800 dark:text-slate-200 block break-all font-mono rounded-xl px-2 py-1">
                        {(() => {
                          const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
                          const backendUrl = import.meta.env.VITE_API_URL || '';
                          const scriptUrl = `${frontendUrl}/tracker.js`;
                          const dataApiAttr = backendUrl ? ` data-api="${backendUrl}"` : '';
                          return `<script src="${scriptUrl}" data-key="${site.trackingKey}"${dataApiAttr}></script>`;
                        })()}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSiteSelect(site)}
                      className={`px-4 py-2 rounded-2xl font-semibold transition ${
                        selectedSite?.id === site.id
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {selectedSite?.id === site.id ? t('common.selected') : t('common.select')}
                    </button>
                    <button
                      onClick={() => handleDeleteSite(site)}
                      className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-semibold transition"
                      title={t('siteSettings.deleteSite')}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

