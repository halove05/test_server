import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../services/apiClient';

interface User {
  id: number;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => {
        set({ token, user, isAuthenticated: true });
        // axios default header 설정
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        delete apiClient.defaults.headers.common['Authorization'];
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
