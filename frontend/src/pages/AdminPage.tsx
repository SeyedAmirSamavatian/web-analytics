import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/admin';
import { AdminOverview, AdminUser, AdminSite } from '../types';
import { useTranslation } from '../i18n/i18n';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const { t } = useTranslation();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    adminApi
      .getOverview()
      .then((data) => {
        setOverview(data);
        setError('');
      })
      .catch((err) => {
        console.error('Failed to load admin overview', err);
        setError(t('admin.failedToLoad'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t]);

  const latestUsers = useMemo(() => overview?.latestUsers || [], [overview]);
  const latestSites = useMemo(() => overview?.latestSites || [], [overview]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-gradient-to-r from-primary-600 to-sky-600 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-white/70">{t('admin.tagline')}</p>
          <h1 className="text-3xl md:text-4xl font-bold">{t('admin.title')}</h1>
          <p className="max-w-2xl text-sm text-white/80">{t('admin.subtitle')}</p>
          {overview && (
            <div className="flex flex-wrap gap-3 text-xs text-white/80">
              <span>{t('admin.totalUsers')}: {overview.totalUsers.toLocaleString()}</span>
              <span>{t('admin.totalSites')}: {overview.totalSites.toLocaleString()}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatBlock title={t('admin.totalUsers')} value={overview ? overview.totalUsers.toLocaleString() : '—'} loading={loading} />
          <StatBlock title={t('admin.totalSites')} value={overview ? overview.totalSites.toLocaleString() : '—'} loading={loading} />
          <StatBlock
            title={t('admin.latestUsersTitle')}
            value={`${latestUsers.length}`}
            loading={loading}
            description={t('admin.latestUsersSubtitle')}
          />
          <StatBlock
            title={t('admin.latestSitesTitle')}
            value={`${latestSites.length}`}
            loading={loading}
            description={t('admin.latestSitesSubtitle')}
          />
        </section>

        <section className="space-y-6">
          <SectionHeader title={t('admin.latestUsersTitle')} description={t('admin.latestUsersDescription')} />
          {loading && !overview ? (
            <Loader />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="grid grid-cols-5 gap-4 px-6 py-3 text-xs uppercase tracking-widest text-slate-400 bg-slate-950/40">
                <span className="col-span-2">{t('admin.user')}</span>
                <span>{t('admin.email')}</span>
                <span>{t('admin.status')}</span>
                <span className="text-right">{t('admin.created')}</span>
              </div>
              <div className="divide-y divide-slate-900">
                {latestUsers.map((item: AdminUser) => (
                  <div key={item.id} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm items-center">
                    <div className="col-span-2 space-y-1">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-slate-500">{`#${item.id}`}</p>
                    </div>
                    <p className="text-sm text-slate-300">{item.email}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.isPro ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-800 text-slate-300'}`}>
                      {item.isPro ? t('admin.proUser') : t('admin.freeUser')}
                    </span>
                    <p className="text-right text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <SectionHeader title={t('admin.latestSitesTitle')} description={t('admin.latestSitesDescription')} />
          {loading && !overview ? (
            <Loader />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <div className="space-y-4">
              {latestSites.map((site: AdminSite) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-900/30 p-5 shadow-lg"
                >
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-white text-lg font-semibold">{site.url}</p>
                      <p className="text-xs text-slate-400">#{site.id} · {new Date(site.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs text-slate-400">{t('admin.trackingKey')}: <code className="text-white">{site.trackingKey}</code></span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoCard label={t('admin.owner')} value={site.user ? `${site.user.name} (${site.user.email})` : t('admin.unknownOwner')} />
                    <InfoCard label={t('admin.siteId')} value={`ID ${site.id}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatBlock({
  title,
  value,
  description,
  loading,
}: {
  title: string;
  value: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/70 p-5 shadow-2xl"
    >
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{loading ? '...' : value}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </motion.div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="text-sm text-white mt-2">{value}</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-10 w-10 border-4 border-t-primary-400 border-slate-700 rounded-full animate-spin"></div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-red-600/40 bg-red-600/10 px-6 py-4 text-sm text-red-200">
      {message}
    </div>
  );
}

