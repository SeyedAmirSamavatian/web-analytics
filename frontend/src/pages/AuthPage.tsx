import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../i18n/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function AuthPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const isRegisterRoute = location.pathname === '/register';
  const [isLogin, setIsLogin] = useState(!isRegisterRoute);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(!isRegisterRoute);
    // Reset form when switching tabs
    if (isRegisterRoute) {
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  }, [isRegisterRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = isLogin
        ? await authApi.login({ email, password })
        : await authApi.register({ name, email, password });

      setAuth(response.user, response.token);
      toast.success(isLogin ? t('auth.loginSuccessful') : t('auth.registrationSuccessful'));
      
      // Small delay to ensure state is persisted
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('auth.anErrorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              navigate('/login');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              isLogin
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('common.login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              navigate('/register');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              !isLogin
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('common.register')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.name')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('auth.yourName')}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={t('auth.yourEmail')}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.processing') : isLogin ? t('common.login') : t('common.register')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

