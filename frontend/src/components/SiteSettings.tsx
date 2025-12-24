import { useState } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Site } from '../types';
import { sitesApi } from '../api/sites';
import toast from 'react-hot-toast';

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
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const response = await sitesApi.addSite({ url });
      toast.success('Site added successfully!');
      setUrl('');
      onSiteAdded(response.site);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add site');
    } finally {
      setAdding(false);
    }
  };

  const copyTrackingKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Tracking key copied!');
  };

  const handleDeleteSite = async (site: Site) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the site "${site.url}"? This action cannot be undone and all data related to this site will be permanently deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await sitesApi.deleteSite(site.id);
        toast.success('Site deleted successfully');
        onSiteDeleted(site.id);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete site');
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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Site</h2>
        <form onSubmit={handleAddSite} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Site'}
          </button>
        </form>
      </motion.div>

      {/* Sites List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Sites</h2>
        {sites.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No sites added yet. Add your first site above!
          </p>
        ) : (
          <div className="space-y-4">
            {sites.map((site) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedSite?.id === site.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{site.url}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tracking Key:</span>
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {site.trackingKey}
                      </code>
                      <button
                        onClick={() => copyTrackingKey(site.trackingKey)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="mt-3 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Add this script to your website:
                      </p>
                      <code className="text-xs text-gray-800 dark:text-gray-200 block break-all">
                        {`<script src="${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/tracker.js" data-key="${site.trackingKey}"></script>`}
                      </code>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSiteSelect(site)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedSite?.id === site.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {selectedSite?.id === site.id ? 'Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => handleDeleteSite(site)}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                      title="Delete site"
                    >
                      Delete
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

