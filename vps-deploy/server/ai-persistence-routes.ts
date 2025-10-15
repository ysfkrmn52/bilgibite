// AI Data Persistence API Routes
import { Request, Response } from "express";
import { aiDataManager } from "./ai-data-service";

// Get stored questions for a user
export const getStoredQuestions = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const examCategory = req.query.examCategory as string;
    
    const questions = aiDataManager.getStoredQuestions(userId);
    
    // Filter by exam category if provided
    const filteredQuestions = examCategory 
      ? questions.filter(q => q.examCategoryId === examCategory)
      : questions;
    
    res.json({
      success: true,
      questions: filteredQuestions,
      totalCount: filteredQuestions.length,
      metadata: {
        allCategories: [...new Set(questions.map(q => q.examCategoryId))],
        lastGenerated: filteredQuestions[filteredQuestions.length - 1]?.generatedAt
      }
    });
  } catch (error) {
    console.error('Get Stored Questions Error:', error);
    res.status(500).json({ error: 'Saklı sorular alınamadı' });
  }
};

// Get stored study plan for a user
export const getStoredStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const studyPlan = aiDataManager.getStoredStudyPlan(userId);
    
    if (!studyPlan) {
      return res.json({
        success: true,
        studyPlan: null,
        message: 'Henüz kaydedilmiş çalışma planı yok'
      });
    }
    
    res.json({
      success: true,
      studyPlan,
      isActive: studyPlan.isActive,
      lastAccessed: studyPlan.lastAccessed
    });
  } catch (error) {
    console.error('Get Stored Study Plan Error:', error);
    res.status(500).json({ error: 'Saklı çalışma planı alınamadı' });
  }
};

// Get chat history for a user
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const chatHistory = aiDataManager.getChatHistory(userId);
    const recentMessages = chatHistory.slice(-limit);
    
    res.json({
      success: true,
      messages: recentMessages,
      totalMessages: chatHistory.length,
      hasMore: chatHistory.length > limit
    });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({ error: 'Sohbet geçmişi alınamadı' });
  }
};

// Get performance data for a user
export const getStoredPerformance = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const performanceData = aiDataManager.getPerformanceData(userId);
    
    res.json({
      success: true,
      performanceData: performanceData || {},
      lastUpdated: performanceData?.updatedAt
    });
  } catch (error) {
    console.error('Get Stored Performance Error:', error);
    res.status(500).json({ error: 'Performans verisi alınamadı' });
  }
};

// Clear user data (optional cleanup)
export const clearUserData = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const dataType = req.query.type as string;
    
    aiDataManager.clearUserData(userId, dataType);
    
    res.json({
      success: true,
      message: `Kullanıcı ${dataType ? dataType : 'tüm'} verileri temizlendi`,
      clearedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear User Data Error:', error);
    res.status(500).json({ error: 'Veri temizleme başarısız' });
  }
};

// Get storage statistics
export const getStorageStats = async (req: Request, res: Response) => {
  try {
    const stats = aiDataManager.getStorageStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Storage Stats Error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
};