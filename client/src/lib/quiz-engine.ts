// Duolingo-style Quiz Engine Core System
import { Question } from "@shared/schema";

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'ordering';

export interface QuizEngineQuestion extends Question {
  type: QuestionType;
  interactiveData?: any;
  timeLimit?: number;
  streakMultiplier?: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  questions: QuizEngineQuestion[];
  score: number;
  lives: number;
  streak: number;
  xpGained: number;
  timeRemaining: number;
  startTime: number;
  answeredQuestions: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
    userAnswer: any;
  }>;
  isCompleted: boolean;
}

export interface QuizFeedback {
  isCorrect: boolean;
  message: string;
  explanation?: string;
  xpGained: number;
  streakCount: number;
  heartsLost?: number;
}

export class QuizEngine {
  private state: QuizState;
  private listeners: Array<(state: QuizState) => void> = [];

  constructor(questions: QuizEngineQuestion[], initialLives = 5) {
    this.state = {
      currentQuestionIndex: 0,
      questions: this.shuffleQuestions(questions),
      score: 0,
      lives: initialLives,
      streak: 0,
      xpGained: 0,
      timeRemaining: questions.length * 60, // 1 minute per question
      startTime: Date.now(),
      answeredQuestions: [],
      isCompleted: false,
    };
  }

  // Subscribe to state changes
  subscribe(callback: (state: QuizState) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.state));
  }

  private shuffleQuestions(questions: QuizEngineQuestion[]): QuizEngineQuestion[] {
    return [...questions].sort(() => Math.random() - 0.5);
  }

  getCurrentQuestion(): QuizEngineQuestion | null {
    return this.state.questions[this.state.currentQuestionIndex] || null;
  }

  getState(): QuizState {
    return { ...this.state };
  }

  submitAnswer(userAnswer: any): QuizFeedback {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      throw new Error('No current question available');
    }

    const timeSpent = (Date.now() - this.state.startTime) / 1000;
    
    const isCorrect = this.validateAnswer(currentQuestion, userAnswer);
    let xpGained = 0;
    let heartsLost = 0;

    if (isCorrect) {
      // Calculate XP with streak multiplier
      const baseXP = currentQuestion.points || 10;
      const streakMultiplier = Math.min(this.state.streak * 0.1 + 1, 2); // Max 2x multiplier
      xpGained = Math.floor(baseXP * streakMultiplier);
      
      this.state.score += currentQuestion.points || 10;
      this.state.streak += 1;
      this.state.xpGained += xpGained;
    } else {
      this.state.lives -= 1;
      this.state.streak = 0;
      heartsLost = 1;
    }

    // Record answer
    this.state.answeredQuestions.push({
      questionId: currentQuestion.id || '',
      isCorrect,
      timeSpent,
      userAnswer,
    });

    const feedback: QuizFeedback = {
      isCorrect,
      message: isCorrect ? this.getSuccessMessage() : this.getFailureMessage(),
      explanation: currentQuestion.explanation,
      xpGained,
      streakCount: this.state.streak,
      heartsLost: heartsLost > 0 ? heartsLost : undefined,
    };

    this.notifyListeners();
    return feedback;
  }

  private validateAnswer(question: QuizEngineQuestion, userAnswer: any): boolean {
    switch (question.type) {
      case 'multiple-choice':
        return userAnswer === question.correctAnswer;
      
      case 'true-false':
        return userAnswer === question.correctAnswer;
      
      case 'fill-blank':
        const correctTexts = Array.isArray(question.interactiveData?.correctAnswers) 
          ? question.interactiveData.correctAnswers 
          : [question.interactiveData?.correctAnswer];
        return correctTexts.some((correct: string) => 
          userAnswer.toLowerCase().trim() === correct.toLowerCase().trim()
        );
      
      case 'matching':
        const correctPairs = question.interactiveData?.correctPairs || {};
        return Object.keys(correctPairs).every(key => 
          userAnswer[key] === correctPairs[key]
        );
      
      case 'ordering':
        const correctOrder = question.interactiveData?.correctOrder || [];
        return JSON.stringify(userAnswer) === JSON.stringify(correctOrder);
      
      default:
        return false;
    }
  }

  nextQuestion(): boolean {
    if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
      this.state.currentQuestionIndex += 1;
      this.notifyListeners();
      return true;
    }
    
    this.completeQuiz();
    return false;
  }

  skipQuestion(): boolean {
    // Skipping costs a life
    this.state.lives -= 1;
    this.state.streak = 0;
    
    this.state.answeredQuestions.push({
      questionId: this.getCurrentQuestion()?.id || '',
      isCorrect: false,
      timeSpent: 0,
      userAnswer: null,
    });

    return this.nextQuestion();
  }

  updateTimer(seconds: number) {
    this.state.timeRemaining = seconds;
    if (seconds <= 0) {
      this.completeQuiz();
    }
    this.notifyListeners();
  }

  private completeQuiz() {
    this.state.isCompleted = true;
    this.notifyListeners();
  }

  isGameOver(): boolean {
    return this.state.lives <= 0 || this.state.isCompleted;
  }

  getProgress(): number {
    return Math.round(((this.state.currentQuestionIndex + 1) / this.state.questions.length) * 100);
  }

  getAccuracy(): number {
    const correct = this.state.answeredQuestions.filter(q => q.isCorrect).length;
    const total = this.state.answeredQuestions.length;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  private getSuccessMessage(): string {
    const messages = [
      'Harika!', 'Mükemmel!', 'Süper!', 'Bravo!', 
      'Çok iyi!', 'Doğru!', 'İnanılmaz!', 'Muhteşem!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getFailureMessage(): string {
    const messages = [
      'Bir daha dene!', 'Neredeyse!', 'Devam et!', 
      'Pes etme!', 'Bir dahaki sefere!', 'Pratik yapalım!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const totalTime = (Date.now() - this.state.startTime) / 1000;
    const averageTimePerQuestion = totalTime / Math.max(this.state.answeredQuestions.length, 1);
    
    return {
      totalScore: this.state.score,
      xpGained: this.state.xpGained,
      accuracy: this.getAccuracy(),
      bestStreak: Math.max(...this.state.answeredQuestions.map((_, i) => {
        let streak = 0;
        for (let j = i; j < this.state.answeredQuestions.length; j++) {
          if (this.state.answeredQuestions[j].isCorrect) streak++;
          else break;
        }
        return streak;
      }), 0),
      totalTime,
      averageTimePerQuestion,
      livesRemaining: this.state.lives,
      questionsCompleted: this.state.answeredQuestions.length,
      perfectQuestions: this.state.answeredQuestions.filter(q => q.isCorrect && q.timeSpent < 10).length,
    };
  }
}

// Question type utilities
export const convertToQuizEngineQuestion = (question: Question): QuizEngineQuestion => {
  // Determine question type based on question structure
  let type: QuestionType = 'multiple-choice'; // default
  
  if (question.questionText.toLowerCase().includes('doğru mu') || 
      question.questionText.toLowerCase().includes('yanlış mı')) {
    type = 'true-false';
  }
  
  // Add more type detection logic based on your question structure
  
  return {
    ...question,
    type,
    timeLimit: 60, // 1 minute per question
    streakMultiplier: 1.5,
  };
};