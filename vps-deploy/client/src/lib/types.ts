export interface QuizState {
  currentQuestionIndex: number;
  questions: Array<{
    id: string;
    questionText: string;
    options: Array<{ text: string; letter: string }>;
    correctAnswer: number;
    selectedAnswer?: number;
    isAnswered: boolean;
  }>;
  score: number;
  timeRemaining: number;
  isCompleted: boolean;
  startTime: number;
}

export interface UserStats {
  questionsAnswered: number;
  correctAnswers: number;
  studyTime: number;
  accuracy: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isEarned: boolean;
}
