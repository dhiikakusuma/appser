import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'pemohon' | 'kasubag' | 'admin';

export interface User {
  id: string;
  nip: string | null;
  namaLengkap: string;
  unitKerja: string | null;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Helper to check if user has specific role
export const hasRole = (role: UserRole): boolean => {
  const state = useAuthStore.getState();
  return state.user?.role === role;
};
