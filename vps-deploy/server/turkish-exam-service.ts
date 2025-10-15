// Turkish Exam Service
import { 
  ExamCategory, ExamQuestion, MockExamSession, ExamPerformance,
  ExamRegistration, SuccessPrediction, TurkishExamTypes, ExamSubjects 
} from '@shared/exam-schema';
import { TurkishExamQuestionBank, getQuestionsByCategory, generateAdditionalQuestions } from './turkish-exam-question-bank';

// Mock Turkish Exam Data Service
export class TurkishExamService {
  
  // Get all exam categories with Turkish-specific data
  static getExamCategories(): ExamCategory[] {
    return [
      {
        id: 'yks-tyt',
        name: 'YKS - TYT (Temel Yeterlilik Testi)',
        slug: 'yks-tyt',
        type: 'yks',
        description: 'Üniversite giriş sınavının temel yeterlilik bölümü. Tüm öğrencilerin girmesi zorunlu.',
        icon: '🎓',
        color: '#2563eb',
        examDuration: 165, // 2 saat 45 dakika
        totalQuestions: 120,
        passingScore: '150.00',
        officialExamDates: ['2025-06-14', '2025-06-15'],
        subjects: ExamSubjects.YKS.TYT,
        examFormat: {
          sections: [
            { name: 'Türkçe', questions: 40, duration: 50 },
            { name: 'Matematik', questions: 30, duration: 40 },
            { name: 'Fen Bilimleri', questions: 20, duration: 35 },
            { name: 'Sosyal Bilimler', questions: 30, duration: 40 }
          ],
          scoringSystem: 'net_calculation',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'yks-ayt',
        name: 'YKS - AYT (Alan Yeterlilik Testi)',
        slug: 'yks-ayt',
        type: 'yks',
        description: 'Üniversite giriş sınavının alan yeterlilik bölümü. Tercih edilen alana göre girilir.',
        icon: '📚',
        color: '#7c3aed',
        examDuration: 180, // 3 saat
        totalQuestions: 80,
        passingScore: '180.00',
        officialExamDates: ['2025-06-21', '2025-06-22'],
        subjects: ExamSubjects.YKS.AYT,
        examFormat: {
          sections: [
            { name: 'Türk Dili ve Edebiyatı', questions: 24, duration: 45 },
            { name: 'Matematik', questions: 40, duration: 90 },
            { name: 'Fen Bilimleri', questions: 13, duration: 25 },
            { name: 'Sosyal Bilimler', questions: 11, duration: 20 }
          ],
          scoringSystem: 'net_calculation',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'kpss-genel',
        name: 'KPSS - Genel Yetenek ve Genel Kültür',
        slug: 'kpss-genel',
        type: 'kpss',
        description: 'Kamu personeli seçme sınavının temel bölümü. Tüm KPSS adayları için zorunlu.',
        icon: '🏛️',
        color: '#dc2626',
        examDuration: 180, // 3 saat
        totalQuestions: 120,
        passingScore: '70.00',
        officialExamDates: ['2025-07-13', '2025-11-09'],
        subjects: ['Genel Yetenek', 'Genel Kültür'],
        examFormat: {
          sections: [
            { name: 'Genel Yetenek', questions: 60, duration: 90 },
            { name: 'Genel Kültür', questions: 60, duration: 90 }
          ],
          scoringSystem: 'percentage',
          negativeScoring: false,
          wrongAnswerPenalty: 0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'kpss-egitim',
        name: 'KPSS - Eğitim Bilimleri',
        slug: 'kpss-egitim',
        type: 'kpss',
        description: 'Öğretmenlik pozisyonları için eğitim bilimleri sınavı.',
        icon: '👨‍🏫',
        color: '#059669',
        examDuration: 90,
        totalQuestions: 80,
        passingScore: '70.00',
        officialExamDates: ['2025-07-13', '2025-11-09'],
        subjects: ExamSubjects.KPSS.EGITIM_BILIMLERI,
        examFormat: {
          sections: [
            { name: 'Eğitim Bilimleri', questions: 80, duration: 90 }
          ],
          scoringSystem: 'percentage',
          negativeScoring: false,
          wrongAnswerPenalty: 0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ehliyet-teorik',
        name: 'Ehliyet Teorik Sınavı',
        slug: 'ehliyet-teorik',
        type: 'ehliyet',
        description: 'Motorlu taşıt sürücü belgesi teorik sınavı.',
        icon: '🚗',
        color: '#ea580c',
        examDuration: 30,
        totalQuestions: 50,
        passingScore: '70.00',
        officialExamDates: [], // Sürekli sınav
        subjects: ExamSubjects.EHLIYET.TEORIK,
        examFormat: {
          sections: [
            { name: 'Trafik Kuralları', questions: 23, duration: 15 },
            { name: 'İlk Yardım', questions: 12, duration: 8 },
            { name: 'Motor ve Araç Tekniği', questions: 11, duration: 5 },
            { name: 'Çevre Bilgisi', questions: 4, duration: 2 }
          ],
          scoringSystem: 'percentage',
          negativeScoring: false,
          wrongAnswerPenalty: 0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'src-belgesi',
        name: 'SRC Belgesi - Yolcu ve Yük Taşımacılığı',
        slug: 'src-belgesi',
        type: 'src',
        description: 'Yurt içi ve yurt dışı yolcu ve yük taşımacılığı için SRC belgesi sınavı.',
        icon: '🚛',
        color: '#0891b2',
        examDuration: 90,
        totalQuestions: 60,
        passingScore: '70.00',
        officialExamDates: ['2025-01-15', '2025-04-15', '2025-07-15', '2025-10-15'],
        subjects: ExamSubjects.SRC.BELGESI,
        examFormat: {
          sections: [
            { name: 'Mevzuat ve Kurallar', questions: 20, duration: 30 },
            { name: 'Yük Güvenliği', questions: 15, duration: 25 },
            { name: 'Uluslararası Taşımacılık', questions: 15, duration: 25 },
            { name: 'Güvenlik ve İlk Yardım', questions: 10, duration: 10 }
          ],
          scoringSystem: 'percentage',
          negativeScoring: false,
          wrongAnswerPenalty: 0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ales',
        name: 'ALES - Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı',
        slug: 'ales',
        type: 'ales',
        description: 'Akademik personel ve lisansüstü eğitimi giriş sınavı.',
        icon: '🎓',
        color: '#8b5cf6',
        examDuration: 150,
        totalQuestions: 80,
        passingScore: '55.00',
        officialExamDates: ['2025-04-13', '2025-05-18', '2025-10-26', '2025-11-16'],
        subjects: ExamSubjects.ALES.GENEL,
        examFormat: {
          sections: [
            { name: 'Sözel Yetenek', questions: 40, duration: 75 },
            { name: 'Sayısal Yetenek', questions: 40, duration: 75 }
          ],
          scoringSystem: 'standard_scoring',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'dgs',
        name: 'DGS - Dikey Geçiş Sınavı',
        slug: 'dgs',
        type: 'dgs',
        description: 'Önlisans mezunları için lisans programlarına geçiş sınavı.',
        icon: '📈',
        color: '#f59e0b',
        examDuration: 150,
        totalQuestions: 120,
        passingScore: '60.00',
        officialExamDates: ['2025-07-20'],
        subjects: ExamSubjects.DGS.TEMEL,
        examFormat: {
          sections: [
            { name: 'Türkçe', questions: 60, duration: 75 },
            { name: 'Matematik', questions: 60, duration: 75 }
          ],
          scoringSystem: 'net_calculation',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'msu',
        name: 'MSÜ - Milli Savunma Üniversitesi Sınavı',
        slug: 'msu',
        type: 'msu',
        description: 'Milli Savunma Üniversitesi giriş sınavı.',
        icon: '🎖️',
        color: '#dc2626',
        examDuration: 180,
        totalQuestions: 120,
        passingScore: '180.00',
        officialExamDates: ['2025-07-06'],
        subjects: ExamSubjects.MSU.TEMEL,
        examFormat: {
          sections: [
            { name: 'Türkçe', questions: 30, duration: 45 },
            { name: 'Matematik', questions: 30, duration: 45 },
            { name: 'Fen Bilimleri', questions: 30, duration: 45 },
            { name: 'Sosyal Bilimler', questions: 30, duration: 45 }
          ],
          scoringSystem: 'net_calculation',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Generate exam questions for Turkish exams using comprehensive question bank
  static generateExamQuestions(categoryId: string, count: number = 50): ExamQuestion[] {
    const category = this.getExamCategories().find(c => c.id === categoryId);
    if (!category) return [];

    // First, get questions from comprehensive question bank
    const bankQuestions = getQuestionsByCategory(categoryId, count);
    
    // If we have enough questions from bank, return them
    if (bankQuestions.length >= count) {
      return bankQuestions.slice(0, count);
    }
    
    // If not enough, generate additional questions to fill the gap
    const additionalCount = count - bankQuestions.length;
    const additionalQuestions = generateAdditionalQuestions(categoryId, category, bankQuestions.length + 1, count);
    
    return [...bankQuestions, ...additionalQuestions].slice(0, count);
  }

  // Create mock exam session
  static createMockExamSession(categoryId: string, userId: string, questionCount: number): MockExamSession {
    const category = this.getExamCategories().find(c => c.id === categoryId);
    const questions = this.generateExamQuestions(categoryId, questionCount);
    
    return {
      id: `exam-session-${Date.now()}`,
      userId,
      categoryId,
      questionIds: questions.map(q => q.id),
      startTime: new Date(),
      endTime: null,
      duration: category?.examDuration || 60,
      score: null,
      passed: null,
      answers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as MockExamSession;
  }

  // Submit exam and calculate results
  static submitExam(sessionId: string, answers: any[]): { score: number; passed: boolean; results: any } {
    // Mock calculation
    const correctCount = Math.floor(Math.random() * answers.length * 0.8) + Math.floor(answers.length * 0.2);
    const score = (correctCount / answers.length) * 100;
    const passed = score >= 70;

    return {
      score: score.toString(),
      passed: passed.toString(),
      results: {
        totalQuestions: answers.length,
        correctAnswers: correctCount,
        wrongAnswers: answers.length - correctCount,
        accuracy: score,
        timeSpent: Math.floor(Math.random() * 3600) + 1800, // 30-90 minutes
        strengths: ['Türkçe', 'Matematik'],
        weaknesses: ['Fen Bilimleri', 'Sosyal Bilimler']
      }
    };
  }

  // Get exam statistics
  static getExamStatistics(categoryId: string): any {
    return {
      totalAttempts: Math.floor(Math.random() * 10000) + 1000,
      averageScore: Math.floor(Math.random() * 30) + 60,
      passRate: Math.floor(Math.random() * 40) + 50,
      difficulty: ['Kolay', 'Orta', 'Zor'][Math.floor(Math.random() * 3)],
      recommendations: [
        'Daha fazla Türkçe çalışın',
        'Matematik problemlerini tekrarlayın',
        'Fen konularında eksiklerinizi giderin'
      ]
    };
  }

  // Calculate success prediction
  static calculateSuccessPrediction(userId: string, categoryId: string, performanceData: any): SuccessPrediction {
    const baseScore = Math.floor(Math.random() * 40) + 50;
    const improvementPotential = Math.floor(Math.random() * 30) + 10;
    
    return {
      id: `prediction-${Date.now()}`,
      userId,
      categoryId,
      currentLevel: baseScore,
      targetScore: baseScore + improvementPotential,
      successProbability: Math.floor(Math.random() * 40) + 60,
      recommendedStudyHours: Math.floor(Math.random() * 200) + 100,
      weakAreas: ['Matematik', 'Fen Bilimleri'],
      strongAreas: ['Türkçe', 'Sosyal Bilimler'],
      studyPlan: {
        dailyHours: 3,
        weeklyGoals: ['30 matematik sorusu çöz', '20 Türkçe metni oku'],
        milestones: [
          { week: 4, targetScore: baseScore + 10, description: 'İlk hedef puan' },
          { week: 8, targetScore: baseScore + 20, description: 'Orta dönem hedefi' },
          { week: 12, targetScore: baseScore + improvementPotential, description: 'Final hedefi' }
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}