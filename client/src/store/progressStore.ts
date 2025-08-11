import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CategoryProgress {
  categoryId: string;
  questionsAnswered: number;
  correctAnswers: number;
  totalPoints: number;
  studyTimeMinutes: number;
  lastStudyDate: Date | null;
  accuracy: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isEarned: boolean;
  earnedAt?: Date;
}

interface ProgressState {
  categoryProgress: Record<string, CategoryProgress>;
  achievements: Achievement[];
  weeklyStats: {
    questionsAnswered: number;
    correctAnswers: number;
    studyTime: number;
    accuracy: number;
  };
  updateProgress: (categoryId: string, progress: Partial<CategoryProgress>) => void;
  addAchievement: (achievement: Achievement) => void;
  calculateWeeklyStats: () => void;
  getProgressForCategory: (categoryId: string) => number;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      categoryProgress: {},
      achievements: [
        {
          id: 'streak-7',
          name: '7 Gün Seri',
          description: 'Günlük çalışma',
          icon: 'fas fa-medal',
          color: 'yellow',
          isEarned: true,
          earnedAt: new Date(),
        },
        {
          id: 'questions-100',
          name: '100 Soru',
          description: 'Toplam çözüm',
          icon: 'fas fa-star',
          color: 'purple',
          isEarned: true,
          earnedAt: new Date(),
        },
        {
          id: 'accuracy-80',
          name: '80% Başarı',
          description: 'Son 10 soruda',
          icon: 'fas fa-bullseye',
          color: 'green',
          isEarned: true,
          earnedAt: new Date(),
        },
        {
          id: 'study-time',
          name: '2 Saat',
          description: 'Bugün çalışma',
          icon: 'fas fa-clock',
          color: 'blue',
          isEarned: true,
          earnedAt: new Date(),
        },
      ],
      weeklyStats: {
        questionsAnswered: 187,
        correctAnswers: 142,
        studyTime: 4.2,
        accuracy: 76,
      },

      updateProgress: (categoryId, progress) =>
        set((state) => {
          const existing = state.categoryProgress[categoryId] || {
            categoryId,
            questionsAnswered: 0,
            correctAnswers: 0,
            totalPoints: 0,
            studyTimeMinutes: 0,
            lastStudyDate: null,
            accuracy: 0,
          };

          const updated = { ...existing, ...progress };
          updated.accuracy = updated.questionsAnswered > 0 
            ? Math.round((updated.correctAnswers / updated.questionsAnswered) * 100)
            : 0;
          updated.lastStudyDate = new Date();

          return {
            categoryProgress: {
              ...state.categoryProgress,
              [categoryId]: updated,
            },
          };
        }),

      addAchievement: (achievement) =>
        set((state) => ({
          achievements: [...state.achievements, { ...achievement, earnedAt: new Date() }],
        })),

      calculateWeeklyStats: () =>
        set((state) => {
          const progressValues = Object.values(state.categoryProgress);
          const totalQuestions = progressValues.reduce((sum, p) => sum + p.questionsAnswered, 0);
          const totalCorrect = progressValues.reduce((sum, p) => sum + p.correctAnswers, 0);
          const totalStudyTime = progressValues.reduce((sum, p) => sum + p.studyTimeMinutes / 60, 0);
          
          return {
            weeklyStats: {
              questionsAnswered: totalQuestions || 187,
              correctAnswers: totalCorrect || 142,
              studyTime: totalStudyTime || 4.2,
              accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 76,
            },
          };
        }),

      getProgressForCategory: (categoryId) => {
        const progress = get().categoryProgress[categoryId];
        if (!progress || progress.questionsAnswered === 0) {
          // Return mock progress values for demo
          if (categoryId === 'yks') return 67;
          if (categoryId === 'kpss') return 23;
          if (categoryId === 'driving') return 89;
          return 0;
        }
        return progress.accuracy;
      },
    }),
    {
      name: 'bilgibite-progress-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);