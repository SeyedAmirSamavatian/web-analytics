import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  
  // Check if user is authenticated
  const tokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userFromStorage = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const isAuthenticated = !!(user && token) || !!(tokenFromStorage && userFromStorage);

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Don't render if redirecting
  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: '📊',
      title: t('home.features.realtime.title'),
      description: t('home.features.realtime.description'),
    },
    {
      icon: '🚀',
      title: t('home.features.fast.title'),
      description: t('home.features.fast.description'),
    },
    {
      icon: '🔒',
      title: t('home.features.secure.title'),
      description: t('home.features.secure.description'),
    },
    {
      icon: '📈',
      title: t('home.features.reports.title'),
      description: t('home.features.reports.description'),
    },
    {
      icon: '🎯',
      title: t('home.features.integration.title'),
      description: t('home.features.integration.description'),
    },
    {
      icon: '💡',
      title: t('home.features.insights.title'),
      description: t('home.features.insights.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            Web Analytics
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 items-center"
          >
            <LanguageSwitcher />
            <Link
              to="/login"
              className="px-4 py-2 text-white hover:text-primary-200 transition-colors"
            >
              {t('common.login')}
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              {t('common.getStarted')}
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg"
            >
              {t('home.startFreeTrial')}
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all transform hover:scale-105"
            >
              {t('common.signIn')}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">{t('home.everythingYouNeed')}</h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            {t('home.allTheTools')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-primary-100">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-white mb-4">{t('home.readyToGetStarted')}</h2>
          <p className="text-xl text-primary-100 mb-8">
            {t('home.joinThousands')}
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg"
          >
            {t('home.createFreeAccount')}
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/20">
        <div className="text-center text-primary-200">
          <p>{t('home.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}

