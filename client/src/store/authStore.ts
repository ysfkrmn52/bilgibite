import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  subscriptionType: string;
  hasAiPackage: boolean;
  level: number;
  totalPoints: number;
  streakDays: number;
  lastActiveDate: Date | null;
  initials: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  updateUserStats: (stats: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUserStats: (stats) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...stats } });
        }
      },
    }),
    {
      name: 'bilgibite-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);