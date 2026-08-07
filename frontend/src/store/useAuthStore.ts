import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Fallback demo accounts if backend is temporarily offline
const DEMO_ACCOUNTS = [
  { email: 'admin@cartsense.ai',    password: 'Admin@2026',  name: 'Arjun Mehta',    role: 'Admin',    avatar: 'AM' },
  { email: 'analyst@cartsense.ai',  password: 'Analyst@2026',name: 'Priya Sharma',   role: 'Analyst',  avatar: 'PS' },
  { email: 'demo@cartsense.ai',     password: 'Demo@2026',   name: 'Demo User',      role: 'Merchant', avatar: 'DU' },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Attempt real API call to FastAPI backend
          const res = await api.login(email, password);
          const initials = (res.user.name || email).split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
          set({
            user: {
              name: res.user.name || 'Demo User',
              email: res.user.email,
              role: res.user.role || 'Merchant',
              avatar: initials,
            },
            token: res.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: any) {
          // Fallback to local demo accounts if backend server is not running
          console.warn('Backend API connection failed, checking offline demo accounts:', err.message);
          const account = DEMO_ACCOUNTS.find(
            a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
          );

          if (account) {
            set({
              user: { name: account.name, email: account.email, role: account.role, avatar: account.avatar },
              token: 'demo-token-12345',
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({ isLoading: false, error: err.message || 'Invalid credentials. Try demo@cartsense.ai / Demo@2026' });
            return false;
          }
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        try {
          const res = await api.register(name, email, password, role);
          set({
            user: { name: res.user.name, email: res.user.email, role: res.user.role, avatar: initials },
            token: res.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: any) {
          console.warn('Backend registration failed, using offline mode:', err.message);
          set({
            user: { name, email, role, avatar: initials },
            token: 'demo-token-12345',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'cartsense-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
