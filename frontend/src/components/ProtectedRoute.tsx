import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ADMIN_EMAIL = 'mr.smvtn@gmail.com';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const tokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userFromStorage = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  const isAuthenticated = !!(user && token) || !!(tokenFromStorage && userFromStorage);
  const storedUser = user || (userFromStorage ? JSON.parse(userFromStorage) : null);
  const isAdmin = storedUser?.email === ADMIN_EMAIL;

  if (!isAuthenticated) {
    console.log('ProtectedRoute: not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute: authenticated user is not admin', storedUser?.email);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

