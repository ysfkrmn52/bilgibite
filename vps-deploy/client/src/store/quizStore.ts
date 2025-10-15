import { create } from 'zustand';
import { Question } from '@shared/schema';

interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizState {
  currentSession: {
    id: string | null;
    categoryId: string;
    questions: Question[];
    currentQuestionIndex: number;
    answers: QuizAnswer[];
    score: number;
    timeRemaining: number;
    startTime: number;
    lives: number;
    streak: number;
    isCompleted: boolean;
  };
  startQuiz: (categoryId: string, questions: Question[]) => void;
  answerQuestion: (answer: QuizAnswer) => void;
  nextQuestion: () => void;
  skipQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  updateTimer: (timeRemaining: number) => void;
  updateLives: (lives: number) => void;
  updateStreak: (streak: number) => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentSession: {
    id: null,
    categoryId: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    timeRemaining: 20 * 60, // 20 minutes
    startTime: 0,
    lives: 3,
    streak: 0,
    isCompleted: false,
  },

  startQuiz: (categoryId, questions) =>
    set({
      currentSession: {
        id: crypto.randomUUID(),
        categoryId,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        timeRemaining: 20 * 60,
        startTime: Date.now(),
        lives: 3,
        streak: 0,
        isCompleted: false,
      },
    }),

  answerQuestion: (answer) =>
    set((state) => {
      const newAnswers = [...state.currentSession.answers, answer];
      const newScore = answer.isCorrect 
        ? state.currentSession.score + 10 
        : state.currentSession.score;
      const newStreak = answer.isCorrect 
        ? state.currentSession.streak + 1 
        : 0;
      const newLives = !answer.isCorrect 
        ? Math.max(0, state.currentSession.lives - 1) 
        : state.currentSession.lives;

      return {
        currentSession: {
          ...state.currentSession,
          answers: newAnswers,
          score: newScore,
          streak: newStreak,
          lives: newLives,
        },
      };
    }),

  nextQuestion: () =>
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        currentQuestionIndex: Math.min(
          state.currentSession.currentQuestionIndex + 1,
          state.currentSession.questions.length - 1
        ),
      },
    })),

  skipQuestion: () => {
    const state = get();
    state.nextQuestion();
  },

  completeQuiz: () =>
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        isCompleted: true,
      },
    })),

  resetQuiz: () =>
    set({
      currentSession: {
        id: null,
        categoryId: '',
        questions: [],
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        timeRemaining: 20 * 60,
        startTime: 0,
        lives: 3,
        streak: 0,
        isCompleted: false,
      },
    }),

  updateTimer: (timeRemaining) =>
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        timeRemaining,
      },
    })),

  updateLives: (lives) =>
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        lives,
      },
    })),

  updateStreak: (streak) =>
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        streak,
      },
    })),
}));