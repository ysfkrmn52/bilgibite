// AI Data Persistence Service
// Üretilen AI verilerini saklama ve yönetim sistemi

interface AIDataStorage {
  // Generated questions storage
  generatedQuestions: Map<string, any[]>; // userId -> questions[]
  
  // Study plans storage  
  studyPlans: Map<string, any>; // userId -> studyPlan
  
  // Chat sessions storage
  chatSessions: Map<string, any[]>; // userId -> messages[]
  
  // Performance data
  performanceData: Map<string, any>; // userId -> performance
}

class AIDataManager {
  private storage: AIDataStorage = {
    generatedQuestions: new Map(),
    studyPlans: new Map(),
    chatSessions: new Map(),
    performanceData: new Map()
  };

  // Question Management
  storeGeneratedQuestions(userId: string, questions: any[], examCategory: string) {
    const existing = this.storage.generatedQuestions.get(userId) || [];
    
    // Add metadata to questions
    const questionsWithMeta = questions.map(q => ({
      ...q,
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      examCategoryId: examCategory,
      generatedAt: new Date().toISOString(),
      source: 'ai_generated',
      isApproved: false, // Manuel onay bekliyor
      isPersistent: true // Kullanıcı silene kadar sakla
    }));
    
    this.storage.generatedQuestions.set(userId, [...existing, ...questionsWithMeta]);
    
    // Future: Database'e otomatik ekleme hazırlığı
    this.queueForDatabaseInsertion('questions', questionsWithMeta);
    
    console.log(`✓ ${questions.length} AI soru kullanıcı ${userId} için saklandı`);
    return questionsWithMeta;
  }

  getStoredQuestions(userId: string): any[] {
    return this.storage.generatedQuestions.get(userId) || [];
  }

  // Study Plan Management  
  storeStudyPlan(userId: string, studyPlan: any, userGoals: string[], availableTime: number) {
    const planWithMeta = {
      ...studyPlan,
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userGoals,
      availableTime,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      isActive: true,
      isPersistent: true
    };
    
    this.storage.studyPlans.set(userId, planWithMeta);
    this.queueForDatabaseInsertion('studyPlans', planWithMeta);
    
    console.log(`✓ AI çalışma planı kullanıcı ${userId} için saklandı`);
    return planWithMeta;
  }

  getStoredStudyPlan(userId: string): any | null {
    const plan = this.storage.studyPlans.get(userId);
    if (plan) {
      // Update last accessed
      plan.lastAccessed = new Date().toISOString();
      this.storage.studyPlans.set(userId, plan);
    }
    return plan || null;
  }

  // Chat Session Management
  storeChatMessage(userId: string, message: any, currentTopic?: string) {
    const existing = this.storage.chatSessions.get(userId) || [];
    
    const messageWithMeta = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      currentTopic,
      timestamp: new Date().toISOString(),
      isPersistent: true
    };
    
    this.storage.chatSessions.set(userId, [...existing, messageWithMeta]);
    this.queueForDatabaseInsertion('chatMessages', messageWithMeta);
    
    console.log(`✓ AI sohbet mesajı kullanıcı ${userId} için saklandı`);
    return messageWithMeta;
  }

  getChatHistory(userId: string): any[] {
    return this.storage.chatSessions.get(userId) || [];
  }

  // Performance Data Management
  storePerformanceData(userId: string, performanceData: any) {
    const dataWithMeta = {
      ...performanceData,
      userId,
      updatedAt: new Date().toISOString(),
      isPersistent: true
    };
    
    this.storage.performanceData.set(userId, dataWithMeta);
    this.queueForDatabaseInsertion('performance', dataWithMeta);
    
    console.log(`✓ AI performans verisi kullanıcı ${userId} için saklandı`);
    return dataWithMeta;
  }

  getPerformanceData(userId: string): any | null {
    return this.storage.performanceData.get(userId) || null;
  }

  // Database Integration Queue (Future Implementation)
  private databaseQueue: Array<{type: string, data: any, timestamp: string}> = [];

  private queueForDatabaseInsertion(type: string, data: any) {
    this.databaseQueue.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Future: Batch insert to database
    console.log(`📝 ${type} veritabanı kuyruğuna eklendi. Kuyruk boyutu: ${this.databaseQueue.length}`);
    
    // Simulate periodic flush (in real implementation this would be a cron job)
    if (this.databaseQueue.length > 50) {
      console.log(`🔄 Büyük kuyruk tespit edildi, veritabanı flush simülasyonu`);
      // this.flushToDatabase();
    }
  }

  // Future database integration method
  async flushToDatabase() {
    console.log(`💾 ${this.databaseQueue.length} AI verisi veritabanına kaydediliyor...`);
    // When database is ready:
    // - Insert ai_generated_questions
    // - Insert ai_study_plans  
    // - Insert ai_chat_sessions
    // - Update user performance metrics
    this.databaseQueue = []; // Clear queue after successful flush
  }

  // Cleanup methods
  clearUserData(userId: string, dataType?: string) {
    if (!dataType) {
      // Clear all user data
      this.storage.generatedQuestions.delete(userId);
      this.storage.studyPlans.delete(userId);
      this.storage.chatSessions.delete(userId);
      this.storage.performanceData.delete(userId);
      console.log(`🗑️ Kullanıcı ${userId} tüm AI verileri temizlendi`);
    } else {
      // Clear specific data type
      switch (dataType) {
        case 'questions':
          this.storage.generatedQuestions.delete(userId);
          break;
        case 'studyPlans':
          this.storage.studyPlans.delete(userId);
          break;
        case 'chatSessions':
          this.storage.chatSessions.delete(userId);
          break;
        case 'performance':
          this.storage.performanceData.delete(userId);
          break;
      }
      console.log(`🗑️ Kullanıcı ${userId} ${dataType} verileri temizlendi`);
    }
  }

  // Statistics
  getStorageStats() {
    return {
      totalUsers: new Set([
        ...this.storage.generatedQuestions.keys(),
        ...this.storage.studyPlans.keys(),
        ...this.storage.chatSessions.keys(),
        ...this.storage.performanceData.keys()
      ]).size,
      questionsStored: Array.from(this.storage.generatedQuestions.values()).flat().length,
      studyPlansStored: this.storage.studyPlans.size,
      chatSessionsStored: this.storage.chatSessions.size,
      performanceRecordsStored: this.storage.performanceData.size,
      queuedForDatabase: this.databaseQueue.length
    };
  }
}

// Singleton instance
export const aiDataManager = new AIDataManager();

// Export types for other files to use
export interface StoredQuestion extends Record<string, any> {
  id: string;
  userId: string;
  examCategoryId: string;
  generatedAt: string;
  source: 'ai_generated';
  isApproved: boolean;
  isPersistent: boolean;
}

export interface StoredStudyPlan extends Record<string, any> {
  id: string;
  userId: string;
  userGoals: string[];
  availableTime: number;
  createdAt: string;
  lastAccessed: string;
  isActive: boolean;
  isPersistent: boolean;
}

export interface StoredChatMessage extends Record<string, any> {
  id: string;
  userId: string;
  currentTopic?: string;
  timestamp: string;
  isPersistent: boolean;
}