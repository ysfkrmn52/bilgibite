// AI Routes for intelligent learning features
import { Request, Response } from "express";
import { z } from "zod";
import {
  generatePersonalizedQuestions,
  analyzeLearningPerformance,
  generateStudyPlan,
  getTutorResponse,
  calculateAdaptiveDifficulty
} from "./ai-service";
import { db } from "./db";
import { users, quizSessions, userProgress } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Schema validations
const questionGenerationSchema = z.object({
  examCategory: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  weakAreas: z.array(z.string()),
  userLevel: z.number(),
  recentErrors: z.array(z.string()),
  topicsToFocus: z.array(z.string()),
  questionCount: z.number().min(1).max(10)
});

const studyPlanSchema = z.object({
  userGoals: z.array(z.string()),
  availableTime: z.number().min(10).max(300),
  currentLevel: z.number(),
  examDate: z.string().optional()
});

const tutorQuerySchema = z.object({
  question: z.string(),
  currentTopic: z.string().optional(),
  recentErrors: z.array(z.string()).optional(),
  userLevel: z.number().optional()
});

// Generate AI-powered personalized questions
export const generateAIQuestions = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const params = questionGenerationSchema.parse(req.body);
    
    // Get user's recent performance for context
    const recentSessions = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.userId, userId))
      .orderBy(desc(quizSessions.completedAt))
      .limit(5);

    // Generate personalized questions using AI
    const aiQuestions = await generatePersonalizedQuestions({
      ...params,
      recentErrors: recentSessions
        .filter(session => (session.correctAnswers / session.totalQuestions * 100) < 70)
        .flatMap(session => [`Category: ${session.examCategoryId}`])
        .slice(0, 5)
    });

    res.json({
      success: true,
      questions: aiQuestions.questions,
      generatedAt: new Date().toISOString(),
      aiGenerated: true
    });
  } catch (error) {
    console.error('AI Question Generation Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz parametreler', details: error.errors });
    }
    res.status(500).json({ error: 'AI soru üretimi başarısız oldu' });
  }
};

// Analyze user's learning performance with AI
export const analyzePerformance = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    // Get user data
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Get recent quiz history
    const quizHistory = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.userId, userId))
      .orderBy(desc(quizSessions.completedAt))
      .limit(20);

    // Get user progress
    const progressData = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    // AI analysis
    const analysis = await analyzeLearningPerformance(
      quizHistory,
      progressData,
      user.level
    );

    const averageScore = quizHistory.length > 0 
      ? quizHistory.reduce((sum, quiz) => (quiz.correctAnswers / quiz.totalQuestions * 100), 0) / quizHistory.length 
      : 0;

    res.json({
      success: true,
      analysis,
      performanceData: {
        totalQuizzes: quizHistory.length,
        averageScore,
        currentLevel: user.level,
        currentXP: user.xp
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Performance Analysis Error:', error);
    res.status(500).json({ error: 'Performans analizi başarısız oldu' });
  }
};

// Generate personalized study plan
export const generatePersonalizedStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const planParams = studyPlanSchema.parse(req.body);
    
    const studyPlan = await generateStudyPlan(
      planParams.userGoals,
      planParams.availableTime,
      planParams.currentLevel,
      planParams.examDate
    );

    res.json({
      success: true,
      studyPlan,
      userId,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Study Plan Generation Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz parametreler', details: error.errors });
    }
    res.status(500).json({ error: 'Çalışma planı oluşturulamadı' });
  }
};

// AI Tutor Chatbot
export const askAITutor = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { question, currentTopic, recentErrors, userLevel } = tutorQuerySchema.parse(req.body);
    
    // Get user context if not provided
    let contextLevel = userLevel;
    if (!contextLevel) {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      contextLevel = user?.level || 1;
    }

    const tutorResponse = await getTutorResponse(question, {
      currentTopic,
      recentErrors,
      userLevel: contextLevel
    });

    res.json({
      success: true,
      response: tutorResponse,
      timestamp: new Date().toISOString(),
      userId
    });
  } catch (error) {
    console.error('AI Tutor Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz soru formatı', details: error.errors });
    }
    res.status(500).json({ error: 'AI öğretmen yanıt veremedi' });
  }
};

// Adaptive difficulty adjustment
export const adjustDifficulty = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    // Get recent performance data
    const recentQuizzes = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.userId, userId))
      .orderBy(desc(quizSessions.completedAt))
      .limit(10);

    if (recentQuizzes.length === 0) {
      return res.status(400).json({ error: 'Yeterli performans verisi bulunamadı' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const recentScores = recentQuizzes.map(quiz => (quiz.correctAnswers / quiz.totalQuestions * 100));
    
    const difficultyAdjustment = await calculateAdaptiveDifficulty(
      recentScores,
      'intermediate', // Default difficulty
      {} // Default preferences
    );

    res.json({
      success: true,
      adjustment: difficultyAdjustment,
      currentPerformance: {
        averageScore: recentScores.reduce((a, b) => a + b, 0) / recentScores.length,
        quizCount: recentQuizzes.length,
        trend: recentScores.slice(-3).reduce((a, b) => a + b, 0) / 3
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Adaptive Difficulty Error:', error);
    res.status(500).json({ error: 'Zorluk ayarlaması başarısız oldu' });
  }
};

// Smart review scheduler
export const getSmartReviewSchedule = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    // Get user's weak areas and incorrect answers
    const recentSessions = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.userId, userId))
      .orderBy(desc(quizSessions.completedAt))
      .limit(20);

    const weakTopics = recentSessions
      .filter(session => (session.correctAnswers / session.totalQuestions * 100) < 80)
      .map(session => session.examCategoryId)
      .reduce((acc: any, topic: string) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {});

    const reviewSchedule = Object.entries(weakTopics)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([topic, count], index) => ({
        topic,
        priority: count as number,
        recommendedDay: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedTime: Math.min(30, (count as number) * 5),
        reason: `${count} kez yanlış yapılan konu`
      }));

    res.json({
      success: true,
      reviewSchedule,
      totalTopics: Object.keys(weakTopics).length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Smart Review Schedule Error:', error);
    res.status(500).json({ error: 'Akıllı tekrar programı oluşturulamadı' });
  }
};