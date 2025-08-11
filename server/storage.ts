import { 
  type User, 
  type InsertUser, 
  type ExamCategory, 
  type Question, 
  type InsertQuestion,
  type UserProgress,
  type InsertUserProgress,
  type QuizSession,
  type InsertQuizSession,
  type Achievement,
  type UserAchievement
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Exam Categories
  getExamCategories(): Promise<ExamCategory[]>;
  getExamCategory(id: string): Promise<ExamCategory | undefined>;

  // Questions
  getQuestionsByCategory(examCategoryId: string, limit?: number): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;

  // User Progress
  getUserProgress(userId: string, examCategoryId: string): Promise<UserProgress | undefined>;
  createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgressAll(userId: string): Promise<UserProgress[]>;

  // Quiz Sessions
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  updateQuizSession(id: string, updates: Partial<QuizSession>): Promise<QuizSession | undefined>;
  getQuizSession(id: string): Promise<QuizSession | undefined>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  addUserAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private examCategories: Map<string, ExamCategory> = new Map();
  private questions: Map<string, Question> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private quizSessions: Map<string, QuizSession> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize exam categories
    const categories: ExamCategory[] = [
      {
        id: "yks",
        name: "YKS",
        slug: "yks",
        description: "Yükseköğretim Kurumları Sınavı",
        icon: "fas fa-university",
        color: "blue",
        isActive: true
      },
      {
        id: "kpss",
        name: "KPSS",
        slug: "kpss",
        description: "Kamu Personeli Seçme Sınavı",
        icon: "fas fa-briefcase",
        color: "green",
        isActive: true
      },
      {
        id: "driving",
        name: "Ehliyet",
        slug: "driving",
        description: "Sürücü Kursu Sınavı",
        icon: "fas fa-car",
        color: "orange",
        isActive: true
      }
    ];

    categories.forEach(cat => this.examCategories.set(cat.id, cat));

    // Initialize sample questions
    const sampleQuestions: Question[] = [
      {
        id: randomUUID(),
        examCategoryId: "yks",
        subject: "Matematik",
        difficulty: "medium",
        questionText: "Bir sayının %25'i 60 ise, bu sayının %40'ı kaçtır?",
        options: [
          { text: "96", letter: "A" },
          { text: "120", letter: "B" },
          { text: "144", letter: "C" },
          { text: "150", letter: "D" }
        ],
        correctAnswer: 0,
        explanation: "Sayı = 60 ÷ 0.25 = 240. 240'ın %40'ı = 240 × 0.40 = 96",
        points: 10
      },
      {
        id: randomUUID(),
        examCategoryId: "yks",
        subject: "Türkçe",
        difficulty: "easy",
        questionText: "Aşağıdakilerden hangisi bir deyimdir?",
        options: [
          { text: "Hızlı koşmak", letter: "A" },
          { text: "Pabucu dama atılmak", letter: "B" },
          { text: "Kitap okumak", letter: "C" },
          { text: "Yemek yemek", letter: "D" }
        ],
        correctAnswer: 1,
        explanation: "Pabucu dama atılmak bir deyimdir ve 'öldürülmek, yok edilmek' anlamına gelir.",
        points: 10
      },
      {
        id: randomUUID(),
        examCategoryId: "kpss",
        subject: "Genel Kültür",
        difficulty: "medium",
        questionText: "Türkiye'nin en uzun nehri hangisidir?",
        options: [
          { text: "Fırat", letter: "A" },
          { text: "Dicle", letter: "B" },
          { text: "Kızılırmak", letter: "C" },
          { text: "Sakarya", letter: "D" }
        ],
        correctAnswer: 2,
        explanation: "Kızılırmak, Türkiye'nin en uzun nehridir ve 1355 km uzunluğundadır.",
        points: 10
      },
      {
        id: randomUUID(),
        examCategoryId: "driving",
        subject: "Trafik Kuralları",
        difficulty: "easy",
        questionText: "Şehir içinde azami hız sınırı kaç km/saat'tir?",
        options: [
          { text: "50", letter: "A" },
          { text: "60", letter: "B" },
          { text: "70", letter: "C" },
          { text: "80", letter: "D" }
        ],
        correctAnswer: 0,
        explanation: "Şehir içinde azami hız sınırı 50 km/saat'tir.",
        points: 10
      }
    ];

    sampleQuestions.forEach(q => this.questions.set(q.id, q));

    // Initialize achievements
    const sampleAchievements: Achievement[] = [
      {
        id: "streak-7",
        name: "7 Gün Seri",
        description: "7 gün üst üste çalışma",
        icon: "fas fa-fire",
        color: "orange",
        requirement: { streakDays: 7 }
      },
      {
        id: "questions-100",
        name: "100 Soru",
        description: "Toplam 100 soru çözme",
        icon: "fas fa-star",
        color: "purple",
        requirement: { totalQuestions: 100 }
      },
      {
        id: "accuracy-80",
        name: "80% Başarı",
        description: "Son 10 soruda %80 başarı",
        icon: "fas fa-bullseye",
        color: "green",
        requirement: { accuracy: 80, questionCount: 10 }
      }
    ];

    sampleAchievements.forEach(a => this.achievements.set(a.id, a));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      level: 1,
      totalPoints: 0,
      streakDays: 0,
      lastActiveDate: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getExamCategories(): Promise<ExamCategory[]> {
    return Array.from(this.examCategories.values()).filter(cat => cat.isActive);
  }

  async getExamCategory(id: string): Promise<ExamCategory | undefined> {
    return this.examCategories.get(id);
  }

  async getQuestionsByCategory(examCategoryId: string, limit = 20): Promise<Question[]> {
    const questions = Array.from(this.questions.values())
      .filter(q => q.examCategoryId === examCategoryId);
    
    // Shuffle and limit
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getUserProgress(userId: string, examCategoryId: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values())
      .find(p => p.userId === userId && p.examCategoryId === examCategoryId);
  }

  async createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserProgress(progress.userId, progress.examCategoryId);
    
    if (existing) {
      const updated: UserProgress = {
        ...existing,
        questionsAnswered: existing.questionsAnswered + (progress.questionsAnswered || 0),
        correctAnswers: existing.correctAnswers + (progress.correctAnswers || 0),
        totalPoints: existing.totalPoints + (progress.totalPoints || 0),
        studyTimeMinutes: existing.studyTimeMinutes + (progress.studyTimeMinutes || 0),
        lastStudyDate: new Date()
      };
      this.userProgress.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newProgress: UserProgress = {
        id,
        userId: progress.userId,
        examCategoryId: progress.examCategoryId,
        questionsAnswered: progress.questionsAnswered || 0,
        correctAnswers: progress.correctAnswers || 0,
        totalPoints: progress.totalPoints || 0,
        studyTimeMinutes: progress.studyTimeMinutes || 0,
        lastStudyDate: new Date()
      };
      this.userProgress.set(id, newProgress);
      return newProgress;
    }
  }

  async getUserProgressAll(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(p => p.userId === userId);
  }

  async createQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    const id = randomUUID();
    const newSession: QuizSession = {
      id,
      userId: session.userId,
      examCategoryId: session.examCategoryId,
      questionsAnswered: session.questionsAnswered || 0,
      correctAnswers: session.correctAnswers || 0,
      totalQuestions: session.totalQuestions,
      pointsEarned: session.pointsEarned || 0,
      timeSpent: session.timeSpent || 0,
      isCompleted: session.isCompleted || false,
      createdAt: new Date(),
      completedAt: null
    };
    this.quizSessions.set(id, newSession);
    return newSession;
  }

  async updateQuizSession(id: string, updates: Partial<QuizSession>): Promise<QuizSession | undefined> {
    const session = this.quizSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    if (updates.isCompleted) {
      updatedSession.completedAt = new Date();
    }
    this.quizSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getQuizSession(id: string): Promise<QuizSession | undefined> {
    return this.quizSessions.get(id);
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
  }

  async addUserAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const id = randomUUID();
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      earnedAt: new Date()
    };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }
}

export const storage = new MemStorage();
