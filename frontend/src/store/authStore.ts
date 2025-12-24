import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        // Also store in localStorage for API client
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      },
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

