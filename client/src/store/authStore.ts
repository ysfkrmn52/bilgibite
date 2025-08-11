import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
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
      user: {
        id: 'mock-user-123',
        username: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        level: 12,
        totalPoints: 2450,
        streakDays: 7,
        lastActiveDate: new Date(),
        initials: 'AY'
      },
      isAuthenticated: true,
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