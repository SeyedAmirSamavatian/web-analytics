import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  
  // Check both zustand store and localStorage as fallback
  const tokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userFromStorage = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  
  const isAuthenticated = !!(user && token) || !!(tokenFromStorage && userFromStorage);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;

