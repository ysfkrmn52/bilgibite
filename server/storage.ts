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
  type PdfMaterial,
  type InsertPdfMaterial,
  type PdfFolder,
  type InsertPdfFolder,
  type PdfTopic,
  type InsertPdfTopic,
  users,
  examCategories,
  questions,
  userProgress,
  quizSessions,
  achievements,
  userAchievements,
  pdfMaterials,
  pdfFolders,
  pdfTopics
} from "@shared/schema";
import { db } from './db';
import { eq, count, like, and, sql } from 'drizzle-orm';

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Exam Categories
  getExamCategories(): Promise<ExamCategory[]>;
  getExamCategory(id: string): Promise<ExamCategory | undefined>;

  // Questions
  getQuestionsByCategory(examCategoryId: string, limit?: number): Promise<Question[]>;
  getAllQuestions(limit?: number): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  addQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  createQuestion(question: any): Promise<Question>;
  getTotalQuestionCount(): Promise<number>;
  getQuestionCount(): Promise<number>;
  getQuestionCountByCategory(examType: string): Promise<number>;
  deleteQuestion(id: string): Promise<boolean>;

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

  // PDF Materials
  getPdfMaterials(filters?: { category?: string; subject?: string; search?: string }): Promise<PdfMaterial[]>;
  getPdfMaterial(id: string): Promise<PdfMaterial | undefined>;
  createPdfMaterial(material: InsertPdfMaterial): Promise<PdfMaterial>;
  updatePdfMaterial(id: string, updates: Partial<PdfMaterial>): Promise<PdfMaterial | undefined>;
  deletePdfMaterial(id: string): Promise<boolean>;
  incrementPdfView(id: string): Promise<void>;
  incrementPdfDownload(id: string): Promise<void>;

  // PDF Folders
  getPdfFolders(): Promise<PdfFolder[]>;
  createPdfFolder(folder: InsertPdfFolder): Promise<PdfFolder>;
  updatePdfFolder(id: string, updates: Partial<PdfFolder>): Promise<PdfFolder | undefined>;
  deletePdfFolder(id: string): Promise<boolean>;

  // PDF Topics
  getPdfTopics(pdfId: string): Promise<PdfTopic[]>;
  createPdfTopic(topic: InsertPdfTopic): Promise<PdfTopic>;
  updatePdfTopic(id: string, updates: Partial<PdfTopic>): Promise<PdfTopic | undefined>;
  deletePdfTopic(id: string): Promise<boolean>;
}

// Only DatabaseStorage - MemStorage completely removed
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
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

  async getQuestionCount(): Promise<number> {
    return this.getTotalQuestionCount();
  }

  async getQuestionCountByCategory(examType: string): Promise<number> {
    try {
      const [result] = await db.select({ count: count() })
        .from(questions)
        .where(eq(questions.examCategoryId, examType));
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting question count by category:', error);
      return 0;
    }
  }

  async deleteQuestion(id: string): Promise<boolean> {
    try {
      const result = await db.delete(questions).where(eq(questions.id, id));
      console.log(`Delete question result:`, result);
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      return false;
    }
  }

  async getAllQuestions(limit = 20): Promise<Question[]> {
    try {
      return await db
        .select()
        .from(questions)
        .limit(limit);
    } catch (error) {
      console.error('Error getting all questions:', error);
      return [];
    }
  }

  async getUserProgress(userId: string, examCategoryId: string): Promise<UserProgress | undefined> {
    try {
      const [progress] = await db.select().from(userProgress)
        .where(eq(userProgress.userId, userId));
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

  async addQuestions(questionList: any[]): Promise<Question[]> {
    try {
      const formattedQuestions = questionList.map(q => ({
        ...q,
        id: undefined, // Let database generate ID
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const addedQuestions = await db
        .insert(questions)
        .values(formattedQuestions)
        .returning();

      console.log(`Added ${addedQuestions.length} questions to database`);
      return addedQuestions;
    } catch (error) {
      console.error('Error adding questions to database:', error);
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

  // PDF Materials
  async getPdfMaterials(filters?: { category?: string; subject?: string; search?: string }): Promise<PdfMaterial[]> {
    try {
      const conditions = [eq(pdfMaterials.isActive, true)];
      
      if (filters?.category) {
        conditions.push(eq(pdfMaterials.category, filters.category));
      }
      
      if (filters?.subject) {
        conditions.push(eq(pdfMaterials.subject, filters.subject));
      }
      
      if (filters?.search) {
        conditions.push(
          sql`(${pdfMaterials.title} ILIKE ${`%${filters.search}%`} OR ${pdfMaterials.description} ILIKE ${`%${filters.search}%`})`
        );
      }
      
      return await db.select()
        .from(pdfMaterials)
        .where(and(...conditions))
        .orderBy(sql`${pdfMaterials.createdAt} DESC`);
    } catch (error) {
      console.error('Error getting PDF materials:', error);
      return [];
    }
  }

  async getPdfMaterial(id: string): Promise<PdfMaterial | undefined> {
    try {
      const [material] = await db.select().from(pdfMaterials).where(eq(pdfMaterials.id, id));
      return material || undefined;
    } catch (error) {
      console.error('Error getting PDF material:', error);
      return undefined;
    }
  }

  async createPdfMaterial(material: InsertPdfMaterial): Promise<PdfMaterial> {
    try {
      const [newMaterial] = await db
        .insert(pdfMaterials)
        .values(material)
        .returning();
      return newMaterial;
    } catch (error) {
      console.error('Error creating PDF material:', error);
      throw error;
    }
  }

  async updatePdfMaterial(id: string, updates: Partial<PdfMaterial>): Promise<PdfMaterial | undefined> {
    try {
      const [updated] = await db
        .update(pdfMaterials)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(pdfMaterials.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error('Error updating PDF material:', error);
      return undefined;
    }
  }

  async deletePdfMaterial(id: string): Promise<boolean> {
    try {
      await db
        .update(pdfMaterials)
        .set({ isActive: false })
        .where(eq(pdfMaterials.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting PDF material:', error);
      return false;
    }
  }

  async incrementPdfView(id: string): Promise<void> {
    try {
      await db
        .update(pdfMaterials)
        .set({ viewCount: sql`${pdfMaterials.viewCount} + 1` })
        .where(eq(pdfMaterials.id, id));
    } catch (error) {
      console.error('Error incrementing PDF view count:', error);
    }
  }

  async incrementPdfDownload(id: string): Promise<void> {
    try {
      await db
        .update(pdfMaterials)
        .set({ downloadCount: sql`${pdfMaterials.downloadCount} + 1` })
        .where(eq(pdfMaterials.id, id));
    } catch (error) {
      console.error('Error incrementing PDF download count:', error);
    }
  }

  // PDF Folders
  async getPdfFolders(): Promise<PdfFolder[]> {
    try {
      return await db.select().from(pdfFolders).where(eq(pdfFolders.isActive, true));
    } catch (error) {
      console.error('Error getting PDF folders:', error);
      return [];
    }
  }

  async createPdfFolder(folder: InsertPdfFolder): Promise<PdfFolder> {
    try {
      const [newFolder] = await db
        .insert(pdfFolders)
        .values(folder)
        .returning();
      return newFolder;
    } catch (error) {
      console.error('Error creating PDF folder:', error);
      throw error;
    }
  }

  async updatePdfFolder(id: string, updates: Partial<PdfFolder>): Promise<PdfFolder | undefined> {
    try {
      const [updated] = await db
        .update(pdfFolders)
        .set(updates)
        .where(eq(pdfFolders.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error('Error updating PDF folder:', error);
      return undefined;
    }
  }

  async deletePdfFolder(id: string): Promise<boolean> {
    try {
      await db
        .update(pdfFolders)
        .set({ isActive: false })
        .where(eq(pdfFolders.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting PDF folder:', error);
      return false;
    }
  }

  // PDF Topics
  async getPdfTopics(pdfId: string): Promise<PdfTopic[]> {
    try {
      return await db.select().from(pdfTopics)
        .where(and(eq(pdfTopics.pdfId, pdfId), eq(pdfTopics.isActive, true)))
        .orderBy(pdfTopics.topicNumber);
    } catch (error) {
      console.error('Error getting PDF topics:', error);
      return [];
    }
  }

  async createPdfTopic(topic: InsertPdfTopic): Promise<PdfTopic> {
    try {
      const [newTopic] = await db
        .insert(pdfTopics)
        .values(topic)
        .returning();
      return newTopic;
    } catch (error) {
      console.error('Error creating PDF topic:', error);
      throw error;
    }
  }

  async updatePdfTopic(id: string, updates: Partial<PdfTopic>): Promise<PdfTopic | undefined> {
    try {
      const [updated] = await db
        .update(pdfTopics)
        .set(updates)
        .where(eq(pdfTopics.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error('Error updating PDF topic:', error);
      return undefined;
    }
  }

  async deletePdfTopic(id: string): Promise<boolean> {
    try {
      await db
        .update(pdfTopics)
        .set({ isActive: false })
        .where(eq(pdfTopics.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting PDF topic:', error);
      return false;
    }
  }

}

export const storage = new DatabaseStorage();