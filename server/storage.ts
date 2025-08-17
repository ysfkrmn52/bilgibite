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
  type UserAchievement,
  users,
  examCategories,
  questions,
  userProgress,
  quizSessions,
  achievements,
  userAchievements
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from './db';
import { eq, count } from 'drizzle-orm';

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
  addQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  createQuestion(question: any): Promise<Question>;
  getTotalQuestionCount(): Promise<number>;

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

  async addQuestions(questions: InsertQuestion[]): Promise<Question[]> {
    const addedQuestions: Question[] = [];
    
    for (const insertQuestion of questions) {
      const id = randomUUID();
      const question: Question = {
        ...insertQuestion,
        id
      };
      this.questions.set(id, question);
      addedQuestions.push(question);
    }
    
    return addedQuestions;
  }

  async createQuestion(questionData: any): Promise<Question> {
    try {
      const [question] = await db
        .insert(questions)
        .values({
          examCategoryId: questionData.examCategoryId || 'tyt',
          subject: questionData.subject || questionData.category || 'Genel',
          difficulty: questionData.difficulty || 'medium',
          questionText: questionData.text || questionData.questionText,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation || null,
          points: questionData.points || 10,
          topic: questionData.topic || null,
          year: questionData.year || null,
          questionNumber: questionData.questionNumber || null
        })
        .returning();
      return question;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  async getTotalQuestionCount(): Promise<number> {
    try {
      const [result] = await db.select({ count: count() }).from(questions);
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting question count:', error);
      return 0;
    }
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

// Create DatabaseStorage class that implements IStorage with real PostgreSQL
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      return user || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async getExamCategories(): Promise<ExamCategory[]> {
    try {
      return await db.select().from(examCategories).where(eq(examCategories.isActive, true));
    } catch (error) {
      console.error('Error getting exam categories:', error);
      return [];
    }
  }

  async getExamCategory(id: string): Promise<ExamCategory | undefined> {
    try {
      const [category] = await db.select().from(examCategories).where(eq(examCategories.id, id));
      return category || undefined;
    } catch (error) {
      console.error('Error getting exam category:', error);
      return undefined;
    }
  }

  async getQuestionsByCategory(examCategoryId: string, limit = 20): Promise<Question[]> {
    try {
      return await db
        .select()
        .from(questions)
        .where(eq(questions.examCategoryId, examCategoryId))
        .limit(limit);
    } catch (error) {
      console.error('Error getting questions by category:', error);
      return [];
    }
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    try {
      const [question] = await db.select().from(questions).where(eq(questions.id, id));
      return question || undefined;
    } catch (error) {
      console.error('Error getting question:', error);
      return undefined;
    }
  }

  async addQuestions(questionsData: InsertQuestion[]): Promise<Question[]> {
    try {
      const newQuestions: Question[] = [];
      for (const questionData of questionsData) {
        const question = await this.createQuestion(questionData);
        newQuestions.push(question);
      }
      return newQuestions;
    } catch (error) {
      console.error('Error adding multiple questions:', error);
      throw error;
    }
  }

  async createQuestion(questionData: any): Promise<Question> {
    try {
      const [question] = await db
        .insert(questions)
        .values({
          examCategoryId: questionData.examCategoryId || 'tyt',
          subject: questionData.subject || questionData.category || 'Genel',
          difficulty: questionData.difficulty || 'medium',
          questionText: questionData.text || questionData.questionText,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation || null,
          points: questionData.points || 10,
          topic: questionData.topic || null,
          year: questionData.year || null,
          questionNumber: questionData.questionNumber || null
        })
        .returning();
      return question;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  async getTotalQuestionCount(): Promise<number> {
    try {
      const [result] = await db.select({ count: count() }).from(questions);
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting question count:', error);
      return 0;
    }
  }

  async getUserProgress(userId: string, examCategoryId: string): Promise<UserProgress | undefined> {
    try {
      const [progress] = await db.select().from(userProgress)
        .where(eq(userProgress.userId, userId) && eq(userProgress.examCategoryId, examCategoryId));
      return progress || undefined;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return undefined;
    }
  }

  async createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    try {
      const existing = await this.getUserProgress(progress.userId, progress.examCategoryId);
      
      if (existing) {
        const [updated] = await db
          .update(userProgress)
          .set({
            questionsAnswered: existing.questionsAnswered + (progress.questionsAnswered || 0),
            correctAnswers: existing.correctAnswers + (progress.correctAnswers || 0),
            totalPoints: existing.totalPoints + (progress.totalPoints || 0),
            studyTimeMinutes: existing.studyTimeMinutes + (progress.studyTimeMinutes || 0),
            lastStudyDate: new Date()
          })
          .where(eq(userProgress.id, existing.id))
          .returning();
        return updated;
      } else {
        const [newProgress] = await db
          .insert(userProgress)
          .values(progress)
          .returning();
        return newProgress;
      }
    } catch (error) {
      console.error('Error creating or updating user progress:', error);
      throw error;
    }
  }

  async getUserProgressAll(userId: string): Promise<UserProgress[]> {
    try {
      return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    } catch (error) {
      console.error('Error getting all user progress:', error);
      return [];
    }
  }

  async createQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    try {
      const [newSession] = await db
        .insert(quizSessions)
        .values(session)
        .returning();
      return newSession;
    } catch (error) {
      console.error('Error creating quiz session:', error);
      throw error;
    }
  }

  async updateQuizSession(id: string, updates: Partial<QuizSession>): Promise<QuizSession | undefined> {
    try {
      const [updatedSession] = await db
        .update(quizSessions)
        .set(updates)
        .where(eq(quizSessions.id, id))
        .returning();
      return updatedSession || undefined;
    } catch (error) {
      console.error('Error updating quiz session:', error);
      return undefined;
    }
  }

  async getQuizSession(id: string): Promise<QuizSession | undefined> {
    try {
      const [session] = await db.select().from(quizSessions).where(eq(quizSessions.id, id));
      return session || undefined;
    } catch (error) {
      console.error('Error getting quiz session:', error);
      return undefined;
    }
  }

  async getAchievements(): Promise<Achievement[]> {
    try {
      return await db.select().from(achievements);
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  async addUserAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    try {
      const [userAchievement] = await db
        .insert(userAchievements)
        .values({
          userId,
          achievementId,
          earnedAt: new Date()
        })
        .returning();
      return userAchievement;
    } catch (error) {
      console.error('Error adding user achievement:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
